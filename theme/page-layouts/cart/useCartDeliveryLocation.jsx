import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useGlobalStore,
  useNavigate,
  useGlobalTranslation,
} from "fdk-core/utils";
import { CART_DETAILS } from "../../queries/cartQuery";
import { LOCALITY } from "../../queries/localityQuery";
import { SELECT_ADDRESS } from "../../queries/checkoutQuery";
import {
  useAddress,
  useSnackbar,
  useAddressFormSchema,
  usePincodeInput,
  useGoogleMapConfig,
  useThemeFeature,
} from "../../helper/hooks";
import useInternational from "../../components/header/useInternational";
import useHyperlocal from "../../components/header/location-modal/useHyperlocal";
import {
  capitalize,
  getAddressStr,
  translateDynamicLabel,
} from "../../helper/utils";

function sanitizeAddressPayload(formValues = {}) {
  const payload = { ...formValues };

  
  if (
    payload?.geo_location?.latitude === "" &&
    payload?.geo_location?.longitude === ""
  ) {
    delete payload.geo_location;
  }

  // drop undefined fields
  Object.keys(payload).forEach((k) => {
    if (payload[k] === undefined) delete payload[k];
  });

  
  if (
    typeof payload?.phone === "object" &&
    payload?.phone?.mobile &&
    payload?.phone?.countryCode
  ) {
    payload.country_phone_code = `+${payload.phone.countryCode}`;
    payload.phone = payload.phone.mobile;
  }

  return payload;
}

const useCartDeliveryLocation = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const CART = useGlobalStore(fpi.getters.CART);
  const { selectedAddress } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const { cart_items } = CART || {};
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [addrError, setAddrError] = useState(null);
  const [isNewAddress, setIsNewAddress] = useState(true);
  const {
    fetchAddresses,
    allAddress = [],
    defaultAddress,
    otherAddresses = [],
    addAddress: addAddressMutation,
    updateAddress: updateAddressMutation,
    removeAddress: removeAddressMutation,
  } = useAddress({ fpi, pageName: "cart" });
  const { isServiceability } = useThemeFeature({ fpi });
  const { isHeaderMap, isCheckoutMap, mapApiKey } = useGoogleMapConfig({ fpi });
  const { showSnackbar } = useSnackbar();

  const buyNow = JSON.parse(searchParams?.get("buy_now") || "false");

  useEffect(() => {
    if (!allAddress?.length) {
      fetchAddresses();
    }
  }, []);

  useEffect(() => {
    if (defaultAddress?.id && !selectedAddressId) {
      setSelectedAddressId(defaultAddress.id);
    } else if (otherAddresses?.length && !selectedAddressId) {
      setSelectedAddressId(otherAddresses?.[0]?.id);
    }
  }, [allAddress]);

  const {
    isInternational,
    countries,
    countryDetails,
    currentCountry,
    deliveryLocation: deliveryLocationInfo,
    isServiceabilityPincodeOnly,
    fetchCountrieDetails,
    setI18nDetails,
  } = useInternational({
    fpi,
  });
  const { updatedSelectedAddress } = useHyperlocal(fpi);

  const [selectedCountry, setSelectedCountry] = useState(currentCountry);
  const [countrySearchText, setCountrySearchText] = useState("");

  useEffect(() => {
    if (currentCountry) {
      setSelectedCountry(currentCountry);
    }
  }, [currentCountry]);

  const { formSchema, defaultAddressItem } = useAddressFormSchema({
    fpi,
    countryCode: countryDetails?.phone_code,
    countryIso: countryDetails?.iso2,
    addressTemplate: countryDetails?.fields?.address_template?.checkout_form,
    addressFields: countryDetails?.fields?.address,
  });
  const pincodeInput = usePincodeInput();
  const [addressFormItem, setAddressFormItem] = useState(defaultAddressItem);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const isEditing = Boolean(editingAddressId);

  useEffect(() => {
    if (!editingAddressId) {
      setAddressFormItem(defaultAddressItem);
    }
  }, [defaultAddressItem, editingAddressId]);

  function convertDropDownField(inputField) {
    return {
      key: inputField.display_name,
      display: inputField.display_name,
    };
  }

  const handleCountryChange = async (e) => {
    const selectedCountry = countries.find(
      (country) => country.display_name === e
    );
    setSelectedCountry(selectedCountry);
    try {
      const response = await fetchCountrieDetails({
        countryIsoCode: selectedCountry?.meta?.country_code,
      });
      if (response?.data?.country) {
        const countryInfo = response.data.country;
        setI18nDetails({
          iso: countryInfo.iso2,
          phoneCode: countryInfo.phone_code,
          name: countryInfo.display_name,
          currency: countryInfo.currency.code,
        });
      }
    } catch (error) {}
  };

  const handleCountrySearch = (event) => {
    setCountrySearchText(event);
  };

  const getFilteredCountries = (selectedCountry) => {
    if (!countrySearchText) {
      return countries.map((country) => convertDropDownField(country)) || [];
    }
    return countries?.filter(
      (country) =>
        country?.display_name
          ?.toLowerCase()
          ?.indexOf(countrySearchText?.toLowerCase()) !== -1 &&
        country?.id !== selectedCountry?.id
    );
  };

  const getLocality = (posttype, postcode) => {
    return fpi
      .executeGQL(LOCALITY, {
        locality: posttype,
        localityValue: `${postcode}`,
        country: selectedCountry?.meta?.country_code,
      })
      .then((res) => {
        const data = { showError: false, errorMsg: "" };
        const localityObj = res?.data?.locality || false;
        if (localityObj) {
          localityObj?.localities.forEach((locality) => {
            switch (locality.type) {
              case "city":
                data.city = capitalize(locality.display_name);
                break;
              case "state":
                data.state = capitalize(locality.display_name);
                break;
              case "country":
                data.country = capitalize(locality.display_name);
                break;
              default:
                break;
            }
          });

          return data;
        } else {
          showSnackbar(
            res?.errors?.[0]?.message ||
              t("resource.common.address.pincode_verification_failure")
          );
          data.showError = true;
          data.errorMsg =
            res?.errors?.[0]?.message ||
            t("resource.common.address.pincode_verification_failure");
          return data;
        }
      });
  };

  const resetAddressFlowState = () => {
    setIsNewAddress(true)
    setEditingAddressId(null);
    setAddressFormItem(defaultAddressItem);
  };

  function handleButtonClick() {
    if (isLoggedIn) {
      setIsAddressModalOpen(true);
    } else if (!isServiceabilityPincodeOnly) {
      fpi.custom.setValue("isI18ModalOpen", true);
    } else {
      fpi.custom.setValue("isServiceabilityModalOpen", true);
    }
    // else {
    //   setIsPincodeModalOpen(true);
    // }
  }
  function handleAddButtonClick() {
    resetAddressFlowState();
    setIsAddressModalOpen(false);
    setIsAddAddressModalOpen(true);
  }

  function closeModal() {
    setIsAddressModalOpen(false);
    setIsPincodeModalOpen(false);
    setIsAddAddressModalOpen(false);
    setError(null);
    resetAddressFlowState();
  }
  function gotoCheckout(id) {
    if (cart_items?.id && id) {
      navigate(
        `/cart/checkout?id=${cart_items?.id ?? ""}&address_id=${id ?? ""}`
      );
    } else {
      navigate("/cart/bag");
    }
  }

  const handlePincodeSubmit = ({ posttype, pincode }) => {
    const deliveryPayload = {
      locality: "pincode",
      localityValue: pincode?.toString(),
    };
    fpi
      .executeGQL(LOCALITY, deliveryPayload)
      .then((res) => {
        if (res.errors) {
          throw res?.errors?.[0];
        }
        const payload = {
          buyNow,
          includeAllItems: true,
          includeCodCharges: true,
          includeBreakup: true,
          areaCode: pincode.toString(),
        };
        fpi.executeGQL(CART_DETAILS, payload);
        closeModal();
        return res?.data?.locality;
      })
      .catch((err) => {
        setError({ message: err.message });
      });
  };

  function getFormattedAddress(addrs) {
    const addressParts = [
      addrs.address,
      addrs.area,
      addrs.landmark,
      addrs.sector,
      addrs.city,
      addrs.area_code ? `- ${addrs.area_code}` : "",
    ];

    return addressParts.filter(Boolean).join(", ");
  }

  const selectAddress = (id = "") => {
    const findAddress = allAddress.find(
      (item) => item?.id === selectedAddressId
    );
    if (!cart_items?.id) {
      showSnackbar(
        t("resource.common.address.address_selection_failure"),
        "error"
      );
      return;
    }
    const cart_id = cart_items?.id;
    const addrId = id.length ? id : findAddress?.id;
    const payload = {
      cartId: cart_id,
      buyNow,
      selectCartAddressRequestInput: {
        cart_id,
        id: addrId,
        billing_address_id: addrId,
      },
    };

    fpi.executeGQL(SELECT_ADDRESS, payload).then((res) => {
      if (res?.data?.selectAddress?.is_valid) {
        const selectedAddPincode = findAddress?.area_code;
        updatedSelectedAddress(findAddress);
        // setPincode(selectedAddPincode);
        closeModal();
        gotoCheckout(addrId);
        setAddrError(null);
      } else {
        const errMsg =
          translateDynamicLabel(res?.data?.selectAddress?.message, t) ||
          t("resource.common.address.address_selection_failure");
        setAddrError({ id: addrId, message: errMsg });
        showSnackbar(translateDynamicLabel(errMsg, t), "error");
      }
    });
  };

  const addAddressCaller = async (formData) => {
    const payload = sanitizeAddressPayload(formData);

    // choose the right mutation
    const runMutation = isEditing
      ? updateAddressMutation?.(payload, editingAddressId)
      : addAddressMutation?.(payload);

    if (!runMutation) return; 

    try {
      const res = await runMutation;

      // EDIT FLOW
      if (isEditing) {
        const success = res?.data?.updateAddress?.success;
        if (!success) {
          showSnackbar(
            res?.errors?.[0]?.message ??
              t("resource.common.address.address_update_failure"),
            "error"
          );
          return;
        }

        const updatedId = res?.data?.updateAddress?.id || editingAddressId;

        showSnackbar(
          t("resource.common.address.address_update_success"),
          "success"
        );

        await fetchAddresses();
        setSelectedAddressId(updatedId);
        setIsAddAddressModalOpen(false);
        setIsAddressModalOpen(true);
        setAddrError(null);
        resetAddressFlowState();
        return;
      }

      // ADD FLOW
      const success = res?.data?.addAddress?.success;
      if (!success) {
        showSnackbar(
          res?.errors?.[0]?.message ??
            t("resource.common.address.address_addition_failure"),
          "error"
        );
        return;
      }

      const newId = res?.data?.addAddress?.id;
      await fetchAddresses();
      setSelectedAddressId(newId);
      gotoCheckout(newId);
      setAddrError(null);
    } catch (e) {
      // network/unknown error for both add & update
      showSnackbar(
        t("resource.common.address.address_addition_failure"),
        "error"
      );
    }
  };

  // simplified: just set state when an id exists
  const handleEditAddress = (address = {}) => {
    if (!address?.id) return;
    setIsNewAddress(false);
    setEditingAddressId(address.id);
    setAddressFormItem(address);
    setIsAddressModalOpen(true);
    setIsAddAddressModalOpen(true);
  };

  const getFallbackAddressId = (removedId) => {
    const availableAddresses = (allAddress || []).filter(
      (item) => item?.id && item.id !== removedId
    );
    if (!availableAddresses.length) {
      return "";
    }
    const fallbackDefault = availableAddresses.find(
      (item) => item?.is_default_address
    );
    return fallbackDefault?.id || availableAddresses?.[0]?.id || "";
  };

  const handleRemoveAddress = (addressId) => {
    if (!addressId) {
      return;
    }
    removeAddressMutation?.(addressId)?.then((res) => {
      if (res?.data?.removeAddress?.is_deleted) {
        const fallbackId = getFallbackAddressId(addressId);
        setSelectedAddressId(fallbackId);
        setAddrError(null);
        showSnackbar(
          t("resource.common.address.address_deletion_success"),
          "success"
        );
        fetchAddresses();
        if (!fallbackId) {
          setIsAddressModalOpen(false);
        }
      } else {
        showSnackbar(
          t("resource.common.address.address_deletion_failure"),
          "error"
        );
      }
    });
  };

  const deliveryLocation = useMemo(() => {
    if (selectedAddress) {
      return getAddressStr(selectedAddress);
    }
    return deliveryLocationInfo.join(", ");
  }, [isServiceability, selectedAddress, deliveryLocationInfo]);

  const btnLabel =
    !isServiceabilityPincodeOnly || (isServiceability && isHeaderMap)
      ? t("resource.cart.select_location")
      : t("resource.cart.enter_pin_code");

  return {
    pincode: locationDetails?.pincode || "",
    deliveryLocation,
    btnLabel,
    pincodeInput,
    error,
    isPincodeModalOpen,
    isAddressModalOpen,
    onAddButtonClick: handleAddButtonClick,
    onChangeButtonClick: handleButtonClick,
    onPincodeSubmit: handlePincodeSubmit,
    onCloseModalClick: closeModal,
    defaultAddress: defaultAddress ? [defaultAddress] : [],
    otherAddresses,
    selectedAddressId,
    setSelectedAddressId,
    addAddress: addAddressCaller,
    showGoogleMap: isCheckoutMap,
    mapApiKey,
    getLocality,
    isAddAddressModalOpen,
    isNewAddress,
    selectAddress,
    addrError,
    isInternationalShippingEnabled: isInternational,
    addressFormSchema: formSchema,
    addressItem: addressFormItem,
    onCountryChange: handleCountryChange,
    handleCountrySearch,
    getFilteredCountries,
    selectedCountry,
    countryDetails,
    updateAddress: handleEditAddress,
    removeAddress: handleRemoveAddress,
  };
};

export default useCartDeliveryLocation;
