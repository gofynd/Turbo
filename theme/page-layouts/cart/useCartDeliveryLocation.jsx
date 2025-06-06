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
} from "../../helper/hooks";
import useInternational from "../../components/header/useInternational";
import { capitalize } from "../../helper/utils";

const useCartDeliveryLocation = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const CART = useGlobalStore(fpi.getters.CART);
  const { cart_items } = CART || {};
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [error, setError] = useState(null);
  const [addrError, setAddrError] = useState(null);
  const {
    fetchAddresses,
    allAddress = [],
    defaultAddress,
    otherAddresses = [],
    addAddress,
    mapApiKey,
    showGoogleMap,
  } = useAddress({ fpi, pageName: "cart" });
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
    deliveryLocation,
    isServiceabilityPincodeOnly,
    fetchCountrieDetails,
    setI18nDetails,
  } = useInternational({
    fpi,
  });

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
    } catch (error) { }
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
            res?.errors?.[0]?.message || t("resource.common.address.pincode_verification_failure")
          );
          data.showError = true;
          data.errorMsg =
            res?.errors?.[0]?.message || t("resource.common.address.pincode_verification_failure");
          return data;
        }
      });
  };

  function handleButtonClick() {
    if (!isServiceabilityPincodeOnly) {
      fpi.custom.setValue("isI18ModalOpen", true);
    } else if (isLoggedIn) {
      setIsAddressModalOpen(true);
    } else {
      setIsPincodeModalOpen(true);
    }
  }
  function handleAddButtonClick() {
    setIsAddressModalOpen(false);
    setIsAddAddressModalOpen(true);
  }

  function closeModal() {
    setIsAddressModalOpen(false);
    setIsPincodeModalOpen(false);
    setIsAddAddressModalOpen(false);
    setError(null);
  }
  function gotoCheckout(id) {
    if (cart_items?.id && id) {
      navigate(`/cart/checkout?id=${cart_items?.id ?? ""}&address_id=${id ?? ""}`);
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

  const selectedAddressString = useMemo(() => {
    if (selectedAddress) {
      return getFormattedAddress(selectedAddress);
    } else if (defaultAddress?.id) {
      return getFormattedAddress(defaultAddress);
    } else {
      return "";
    }
  }, [selectedAddress, defaultAddress]);

  const personName = useMemo(() => {
    if (selectedAddress) {
      return selectedAddress.name;
    } else if (defaultAddress?.id) {
      return defaultAddress.name;
    } else {
      return "";
    }
  }, [selectedAddress, defaultAddress]);

  const selectAddress = (id = "") => {
    const findAddress = allAddress.find(
      (item) => item?.id === selectedAddressId
    );
    if (!cart_items?.id) {
      showSnackbar(t("resource.common.address.address_selection_failure"), "error");
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
        // setPincode(selectedAddPincode);
        closeModal();
        gotoCheckout(addrId);
        setAddrError(null);
      } else {
        const errMsg =
          res?.data?.selectAddress?.message || t("resource.common.address.address_selection_failure");
        setAddrError({ id: addrId, message: errMsg });
        showSnackbar(errMsg, "error");
      }
    });
  };

  function addAddressCaller(data) {
    if (
      data?.geo_location?.latitude === "" &&
      data?.geo_location?.longitude === ""
    ) {
      delete data.geo_location;
    }
    for (const key in data) {
      if (data[key] === undefined) {
        delete data[key]; // Removes undefined values directly from the original object
      }
    }
    data.country_phone_code = `+${data.phone.countryCode}`;
    data.phone = data.phone.mobile;
    addAddress?.(data)?.then((res) => {
      if (res?.data?.addAddress?.success) {
        fetchAddresses().then(() => {
          gotoCheckout(res?.data?.addAddress?.id);
        });
      } else {
        showSnackbar(
          res?.errors?.[0]?.message ?? t("resource.common.address.address_addition_failure"),
          "error"
        );
      }
    });
  }

  return {
    pincode: locationDetails?.pincode || "",
    deliveryLocation: deliveryLocation.join(", "),
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
    mapApiKey,
    showGoogleMap,
    getLocality,
    isAddAddressModalOpen,
    selectAddress,
    addrError,
    isInternationalShippingEnabled: isInternational,
    addressFormSchema: formSchema,
    addressItem: defaultAddressItem,
    onCountryChange: handleCountryChange,
    handleCountrySearch,
    getFilteredCountries,
    selectedCountry,
    countryDetails,
  };
};

export default useCartDeliveryLocation;
