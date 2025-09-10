import { useEffect, useState } from "react";
import {
  useGlobalStore,
  useNavigate,
  useGlobalTranslation,
} from "fdk-core/utils";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  CHECKOUT_LANDING,
  FETCH_SHIPMENTS,
  SELECT_ADDRESS,
} from "../../../queries/checkoutQuery";
import { LOCALITY } from "../../../queries/logisticsQuery";
import { capitalize, translateDynamicLabel } from "../../../helper/utils";
import useInternational from "../../../components/header/useInternational";
import useHyperlocal from "../../../components/header/location-modal/useHyperlocal";
import {
  useAddressFormSchema,
  useSnackbar,
  useThemeFeature,
} from "../../../helper/hooks";

const useAddress = (setShowShipment, setShowPayment, fpi) => {
  const { t } = useGlobalTranslation("translation");
  const allAddresses =
    useGlobalStore(fpi.getters.ADDRESS)?.address || undefined;
  const isAddressLoading =
    useGlobalStore(fpi.getters.ADDRESS)?.loading || false;

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const cart_id = searchParams.get("id");
  const address_id = searchParams.get("address_id");
  const buyNow = JSON.parse(searchParams?.get("buy_now") || "false");
  const [selectedAddressId, setSelectedAddressId] = useState(address_id || "");
  const [invalidAddressError, setInvalidAddressError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isNewAddress, setIssNewAddress] = useState(true);
  const [addressItem, setAddressItem] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [addressLoader, setAddressLoader] = useState(false);
  const [hideAddress, setHideAddress] = useState(false);
  const [isShipmentLoading, setIsShipmentLoading] = useState(false);
  const [isCartValid, setIsCartValid] = useState(true);

  const getDefaultAddress =
    allAddresses?.filter((item) => item?.is_default_address) || [];
  const getOtherAddress =
    allAddresses?.filter((item) => !item?.is_default_address) || [];
  const { selectedAddress } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const CART = useGlobalStore(fpi.getters.CART);
  const { cart_items } = CART || {};
  const { showSnackbar } = useSnackbar();
  const { isServiceability } = useThemeFeature({ fpi });

  const {
    isInternational,
    countries,
    countryDetails,
    currentCountry,
    fetchCountrieDetails,
    setI18nDetails,
  } = useInternational({
    fpi,
  });
  const { updatedSelectedAddress } = useHyperlocal(fpi);
  const [selectedCountry, setSelectedCountry] = useState(currentCountry);
  const [countrySearchText, setCountrySearchText] = useState("");

  useEffect(() => {
    if (
      (cart_items?.checkout_mode === "other" && !hideAddress) ||
      (allAddresses && !allAddresses.length)
    ) {
      showAddNewAddressModal();
    }
  }, [allAddresses]);

  useEffect(() => {
    if (isServiceability && selectedAddress && !selectedAddress.id) {
      showAddNewAddressModal();
    }
  }, [selectedAddress, isServiceability]);

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
      return countries?.map((country) => convertDropDownField(country)) || [];
    }
    return countries?.filter(
      (country) =>
        country?.display_name
          ?.toLowerCase()
          ?.indexOf(countrySearchText?.toLowerCase()) !== -1 &&
        country?.id !== selectedCountry?.id
    );
  };

  useEffect(() => {
    if (address_id) {
      setSelectedAddressId(address_id);
    }
  }, [address_id]);

  useEffect(() => {
    if (address_id) {
      // setSelectedAddressId(id);
      return;
    }
    if (getDefaultAddress.length && !selectedAddressId) {
      setSelectedAddressId(getDefaultAddress?.[0].id);
    } else if (getOtherAddress.length && !selectedAddressId) {
      setSelectedAddressId(getOtherAddress?.[0]?.id);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [allAddresses, address_id]);

  useEffect(() => {
    const { autoNaviagtedFromCart, addrId } = location?.state ?? {};
    if (autoNaviagtedFromCart && addrId) {
      setIsShipmentLoading(true);
      fpi
        .executeGQL(FETCH_SHIPMENTS, {
          addressId: `${addrId.length ? addrId : selectedAddressId}`,
          id: `${cart_id}`,
          buyNow,
        })
        .then(() => {
          setShowShipment(true);
          navigate(location.pathname, { replace: true, state: null });
        })
        .finally(() => {
          setIsShipmentLoading(false);
        });
    }
  }, [location.state, navigate]);

  const resetAddressState = () => {
    setOpenModal(false);
    setIssNewAddress(true);
    setAddressItem(false);
    setModalTitle("");
  };

  const editAddress = (item) => {
    setModalTitle(t("resource.common.address.edit_address"));
    setI18nDetails({
      iso: item.country_iso_code,
      phoneCode: item.country_code,
      name: item.country,
    });
    setAddressItem({
      ...item,
      phone: {
        mobile: item?.phone,
        countryCode: item?.country_code?.replace("+", ""),
        isValidNumber: true,
      },
    });
    setIssNewAddress(false);
    setOpenModal(true);
  };

  const addAddress = (obj) => {
    if (
      obj?.geo_location?.latitude === "" &&
      obj?.geo_location?.longitude === ""
    ) {
      delete obj.geo_location;
    }
    for (const key in obj) {
      if (obj[key] === undefined) {
        delete obj[key]; // Removes undefined values directly from the original object
      }
    }
    obj.country_phone_code = `+${obj.phone.countryCode}`;
    obj.phone = obj.phone.mobile;
    setAddressLoader(true);
    const payload = {
      address2Input: {
        ...obj,
      },
    };
    fpi
      .executeGQL(
        `mutation AddAddress($address2Input: Address2Input) {
          addAddress(address2Input: $address2Input) {
          id
          is_default_address
          success
        }
    }`,
        payload
      )
      .then((res) => {
        setAddressLoader(false);
        if (res?.data?.addAddress?.success) {
          if (cart_items?.checkout_mode === "other") {
            setHideAddress(true);
          }
          showSnackbar(
            t("resource.common.address.address_addition_success"),
            "success"
          );
          resetAddressState();
          fpi
            .executeGQL(CHECKOUT_LANDING, { includeBreakup: true, buyNow })
            .then((data) => {
              selectAddress(
                res?.data?.addAddress?.id,
                data?.data?.addresses?.address
              );
            });
          setAddressLoader(false);
        } else {
          fpi.executeGQL(CHECKOUT_LANDING, { includeBreakup: true, buyNow });
          showSnackbar(
            res?.errors?.[0]?.message ??
              t("resource.common.address.new_address_creation_failure"),
            "error"
          );
          setAddressLoader(false);
        }
      });
  };

  const updateAddress = (obj) => {
    if (
      obj?.geo_location?.latitude === "" &&
      obj?.geo_location?.longitude === ""
    ) {
      delete obj.geo_location;
    }
    for (const key in obj) {
      if (obj[key] === undefined) {
        delete obj[key]; // Removes undefined values directly from the original object
      }
    }
    obj.country_phone_code = `+${obj?.phone?.countryCode}`;
    obj.phone = obj?.phone?.mobile;

    const add = obj;
    delete add?.custom_json;
    delete add?.otherAddressType;
    /* eslint-disable no-underscore-dangle */
    delete add?.__typename;

    const payload = {
      id: selectedAddressId,
      address2Input: {
        ...add,
      },
    };

    fpi
      .executeGQL(
        `mutation UpdateAddress($address2Input: Address2Input, $id: String) {
        updateAddress(address2Input: $address2Input, id: $id) {
        id
        is_default_address
        success
        is_updated
        }
    }`,
        payload
      )
      .then((res) => {
        if (res?.data?.updateAddress?.success) {
          fpi
            .executeGQL(CHECKOUT_LANDING, { includeBreakup: true, buyNow })
            .then((data) => {
              selectAddress(
                res?.data?.updateAddress?.id,
                data?.data?.addresses?.address
              );
            });
          showSnackbar(
            t("resource.common.address.address_update_success"),
            "success"
          );
          resetAddressState();
        } else {
          fpi.executeGQL(CHECKOUT_LANDING, { includeBreakup: true, buyNow });
          showSnackbar(
            res?.errors?.[0]?.message ||
              t("resource.common.address.address_update_failure"),
            "error"
          );
        }
      });
  };

  const removeAddress = () => {
    fpi
      .executeGQL(
        `
    mutation RemoveAddress($id: String) {
        removeAddress(id: $id){
            id
            is_deleted
        }
    }`,
        { id: selectedAddressId }
      )
      .then((res) => {
        const { is_deleted } = res?.data?.removeAddress ?? {};

        fpi.executeGQL(CHECKOUT_LANDING, { includeBreakup: true, buyNow });

        if (is_deleted) {
          showSnackbar(
            t("resource.common.address.address_deletion_success"),
            "success"
          );
        } else {
          showSnackbar(
            t("resource.common.address.address_deletion_failure"),
            "error"
          );
          resetAddressState();
        }
      });
  };

  const updateQuery = (key, value) => {
    const queryParamKey = key; // Replace with your desired query parameter key
    const queryParamValue = value; // Replace with your desired query parameter value

    const searchParameter = new URLSearchParams(location.search);
    const existingValue = searchParameter.get(queryParamKey);

    if (existingValue !== null) {
      // Key already exists, update the value
      searchParameter.set(queryParamKey, queryParamValue);
    } else {
      // Key doesn't exist, add the new query parameter
      searchParameter.append(queryParamKey, queryParamValue);
    }

    const updatedSearch = searchParameter.toString();
    navigate(`${location.pathname}?${updatedSearch}`);
  };

  const selectAddress = (id = "", addresses) => {
    const addressList = addresses?.length > 0 ? addresses : allAddresses;
    const targetId = id || selectedAddressId;
    const findAddress = addressList?.find((item) => item?.id === targetId);
    const payload = {
      cartId: cart_id,
      buyNow,
      selectCartAddressRequestInput: {
        cart_id,
        id: id.length ? id : findAddress?.id,
        billing_address_id: id.length ? id : findAddress?.id,
      },
    };

    fpi.executeGQL(SELECT_ADDRESS, payload).then((res) => {
      if (res?.data?.selectAddress?.is_valid) {
        setIsShipmentLoading(true);
        updateQuery("address_id", id.length ? id : selectedAddressId);
        updatedSelectedAddress(findAddress)
          .then(() => {
            fpi
              .executeGQL(FETCH_SHIPMENTS, {
                addressId: `${id.length ? id : selectedAddressId}`,
                id: `${cart_id}`,
                buyNow,
              })
              .then((res) => {
                if (!res?.data?.cartShipmentDetails?.is_valid) {
                  showSnackbar(res?.data?.cartShipmentDetails?.message);
                  setIsCartValid(false);
                }
              })
              .finally(() => {
                setIsShipmentLoading(false);
              });
          })
          .catch(() => {});
        setShowShipment(true);
        setAddressLoader(false);
        setInvalidAddressError(null);
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        setInvalidAddressError({
          id: id.length ? id : findAddress?.id,
          message:
            translateDynamicLabel(res?.data?.selectAddress?.message, t) ||
            res?.errors?.[0]?.message,
        });
      }
    });
  };

  const onFailedGetCartShipmentDetails = async () => {
    setIsShipmentLoading(true);
    await fpi
      .executeGQL(FETCH_SHIPMENTS, {
        addressId: `${selectedAddressId}`,
        id: `${cart_id}`,
        buyNow,
      })
      .finally(() => {
        setIsShipmentLoading(false);
      });
  };

  const removeQuery = (key) => {
    const queryParamKeyToRemove = key; // Replace with the query parameter key to remove

    const searchParam = new URLSearchParams(location.search);
    searchParam.delete(queryParamKeyToRemove);

    const updatedSearch = searchParam.toString();

    navigate(updatedSearch ? `?${updatedSearch}` : "");
  };

  function backToEdit() {
    removeQuery("address_id");
    setShowShipment(false);
    setShowPayment(false);
  }

  function showAddNewAddressModal() {
    setIssNewAddress(true);
    setAddressItem(false);
    setModalTitle(t("resource.common.address.add_new_address"));
    setOpenModal(true);
  }

  function getLocality(posttype, postcode) {
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
  }

  return {
    allAddresses,
    addressItem: addressItem || defaultAddressItem,
    selectedAddressId,
    invalidAddressError,
    getDefaultAddress,
    getOtherAddress,
    isAddressLoading,
    addressLoader,
    modalTitle,
    openModal,
    isNewAddress,
    setOpenModal,
    setModalTitle,
    setAddressItem,
    setIssNewAddress,
    resetAddressState,
    editAddress,
    addAddress,
    removeAddress,
    updateAddress,
    selectAddress,
    backToEdit,
    showAddNewAddressModal,
    setSelectedAddressId,
    getLocality,
    isInternationalShippingEnabled: isInternational,
    defaultFormSchema: formSchema,
    setI18nDetails: handleCountryChange,
    handleCountrySearch,
    getFilteredCountries,
    selectedCountry: selectedCountry || countryDetails,
    countryDetails,
    onFailedGetCartShipmentDetails,
    isShipmentLoading,
    isCartValid,
  };
};

export default useAddress;
