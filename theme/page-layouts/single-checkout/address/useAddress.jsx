import { useEffect, useState, useRef, useMemo } from "react";
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
  const [searchParams, setSearchParams] = useSearchParams();
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
    countryCurrencies,
    countryDetails,
    currentCountry,
    fetchCountrieDetails,
    setI18nDetails,
  } = useInternational({
    fpi,
  });
  const { updatedSelectedAddress, clearSelectedAddress } = useHyperlocal(fpi);
  const [selectedCountry, setSelectedCountry] = useState(currentCountry);
  const [countrySearchText, setCountrySearchText] = useState("");
  // Track country details for the address being edited
  const [editingAddressCountryDetails, setEditingAddressCountryDetails] = useState(null);

  useEffect(() => {
    // Don't open modal if:
    // 1. Address has been successfully added (address_id exists in URL)
    // 2. We're on order-status or order-tracking page
    // 3. Addresses are still loading
    const isOrderStatusPage =
      location.pathname.includes("/order-status") ||
      location.pathname.includes("/order-tracking");

    if (address_id || isOrderStatusPage) {
      return;
    }

    // Don't open modal if addresses are still loading
    if (isAddressLoading) {
      return;
    }

    // For guest users or logged-in users with no addresses:
    // allAddresses will be empty array [] or undefined
    // allAddresses && !allAddresses.length will be true for empty array
    // (!allAddresses || !allAddresses.length) handles both undefined and empty array cases
    // This ensures the "Add New Address" modal opens for users with no addresses
    const shouldOpenForGuest =
      !allAddresses || !allAddresses.length; // No addresses = empty array or undefined
    const shouldOpenForOtherMode =
      cart_items?.checkout_mode === "other" && !hideAddress;

    if (shouldOpenForGuest || shouldOpenForOtherMode) {
      showAddNewAddressModal();
    }
  }, [allAddresses, address_id, isAddressLoading]);

  useEffect(() => {
    // CRITICAL CHECKS FIRST - Don't open modal if:
    // 1. Address_id exists in URL (user navigated with an address selected)
    // 2. selectedAddressId is set in state (address is already selected)
    // 3. We're on order-status or order-tracking page
    // 4. Address exists in allAddresses matching address_id or selectedAddressId
    // These checks must happen FIRST before any other logic
    const isOrderStatusPage =
      location.pathname.includes("/order-status") ||
      location.pathname.includes("/order-tracking");

    // PRIMARY CHECK: If address_id exists in URL, NEVER open modal
    // Also close modal if it's already open (shouldn't happen, but safety check)
    // This handles the case when user navigates to checkout with an address
    if (address_id) {
      if (openModal) {
        setOpenModal(false);
      }
      return;
    }

    // SECONDARY CHECK: If selectedAddressId is set, don't open modal
    // Also close modal if it's already open
    // This prevents opening when address is selected but URL hasn't updated yet
    if (selectedAddressId) {
      if (openModal) {
        setOpenModal(false);
      }
      return;
    }

    // Don't open modal on order-status pages
    if (isOrderStatusPage) {
      return;
    }

    // Don't open modal if addresses are still loading
    if (isAddressLoading) {
      return;
    }

    // TERTIARY CHECK: Verify if address_id or selectedAddressId exists in allAddresses
    // This is an additional safety check to prevent opening modal when address is selected
    const targetAddressId = address_id || selectedAddressId;
    if (targetAddressId && allAddresses && allAddresses.length > 0) {
      const addressExists = allAddresses.some(
        (addr) => addr?.id === targetAddressId
      );
      if (addressExists) {
        if (openModal) {
          setOpenModal(false);
        }
        return;
      }
    }

    // Don't open modal if we have addresses and one is already selected
    // This handles the case where user logged in with existing addresses
    // and a pincode-only selectedAddress from guest session
    const hasAddresses = allAddresses && allAddresses.length > 0;
    const hasSelectedAddress = selectedAddressId || address_id;

    // If we have addresses and an address is selected (even if selectedAddress is pincode-only),
    // don't open the modal - the address selection is already handled
    if (hasAddresses && hasSelectedAddress) {
      if (openModal) {
        setOpenModal(false);
      }
      return;
    }

    // Only open modal if:
    // 1. Serviceability is enabled
    // 2. selectedAddress is pincode-only (no id)
    // 3. No addresses available OR no address is selected
    // 4. No address_id in URL and no selectedAddressId in state
    if (isServiceability && selectedAddress && !selectedAddress.id) {
      showAddNewAddressModal();
    }
  }, [
    selectedAddress,
    isServiceability,
    address_id,
    isAddressLoading,
    allAddresses,
    selectedAddressId,
    openModal,
    setOpenModal,
  ]);

  // Track if we're in the middle of a user-initiated country change
  const isUserChangingCountry = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Only sync selectedCountry with currentCountry if:
    // 1. Modal is closed (user not actively editing) - always sync when modal closes
    // 2. OR modal just opened (initial sync) - only if selectedCountry is not set
    // 3. AND user is not actively changing the country
    if (currentCountry && !openModal && !isUserChangingCountry.current) {
      // Modal is closed - sync with header country
      setSelectedCountry(currentCountry);
    } else if (
      currentCountry &&
      openModal &&
      !isUserChangingCountry.current &&
      !selectedCountry
    ) {
      // Modal just opened and no country selected yet - initial sync
      setSelectedCountry(currentCountry);
    }
    // IMPORTANT: When modal is open AND selectedCountry is already set,
    // DO NOT sync even if currentCountry changes. This prevents the reset loop
    // when user changes country in address modal dropdown.
  }, [currentCountry, openModal, selectedCountry]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Fetch country details for the selected address when it's loaded
  // This ensures the form schema is ready when user edits the address for the first time
  useEffect(() => {
    // Only run if we have a selected address ID and addresses are loaded
    // Don't run if modal is open (user is actively editing)
    if (!selectedAddressId || !allAddresses?.length || openModal) {
      return;
    }

    // Find the selected address
    const selectedAddress = allAddresses.find(
      (addr) => addr?.id === selectedAddressId
    );

    if (!selectedAddress) {
      return;
    }

    // Extract country ISO code from the selected address
    let addressCountryIso = selectedAddress?.country_iso_code;
    if (!addressCountryIso && selectedAddress?.country) {
      addressCountryIso =
        typeof selectedAddress.country === "object"
          ? selectedAddress.country.iso2 || selectedAddress.country.uid
          : selectedAddress.country;
    }

    // If address country is different from header country, fetch its details
    // This pre-loads the country details so editing works correctly on first attempt
    let isMounted = true;
    
    if (
      addressCountryIso &&
      addressCountryIso !== countryDetails?.iso2 &&
      addressCountryIso !== editingAddressCountryDetails?.iso2
    ) {
      fetchCountrieDetails(
        {
          countryIsoCode: addressCountryIso,
        },
        { skipStoreUpdate: true }
      )
        .then((response) => {
          // Only update state if component is still mounted and modal is still closed
          if (isMounted && !openModal && response?.data?.country) {
            setEditingAddressCountryDetails(response.data.country);
          }
        })
        .catch(() => {
          // Silently fail - will fetch again when editing
        });
    } else if (
      addressCountryIso &&
      addressCountryIso === countryDetails?.iso2
    ) {
      // Address country matches header country - ensure we're using header country details
      setEditingAddressCountryDetails(null);
    }
    
    // Cleanup function to prevent state updates after unmount or when modal opens
    return () => {
      isMounted = false;
    };
  }, [
    selectedAddressId,
    allAddresses,
    countryDetails?.iso2,
    editingAddressCountryDetails?.iso2,
    openModal,
    fetchCountrieDetails,
  ]);

  // Determine which country details to use: address country when editing, header country otherwise
  const countryDetailsForSchema = useMemo(() => {
    return editingAddressCountryDetails || countryDetails;
  }, [editingAddressCountryDetails, countryDetails]);

  const { formSchema, defaultAddressItem } = useAddressFormSchema({
    fpi,
    countryCode: countryDetailsForSchema?.phone_code,
    countryIso: countryDetailsForSchema?.iso2,
    addressTemplate: countryDetailsForSchema?.fields?.address_template?.checkout_form,
    addressFields: countryDetailsForSchema?.fields?.address,
    addressItem: isNewAddress ? null : addressItem, // Pass addressItem when editing
  });

  function convertDropDownField(inputField) {
    return {
      key: inputField.name,
      display: inputField.name,
    };
  }

  const handleCountryChange = async (e) => {
    // Set flag to prevent useEffect from resetting our selection
    isUserChangingCountry.current = true;
    
    const newSelectedCountry = countryCurrencies.find(
      (country) => country.name === e
    );
    
    if (!newSelectedCountry) {
      isUserChangingCountry.current = false;
      return;
    }
    
    setSelectedCountry(newSelectedCountry);
    
    try {
      // Fetch country details and update store (this updates form schema)
      const response = await fetchCountrieDetails({
        countryIsoCode: newSelectedCountry?.iso2,
      });
      
      if (response?.data?.country) {
        const countryInfo = response.data.country;
        
        // Get the default currency from the selected country object
        // This ensures we use the correct currency structure
        const defaultCurrency =
          newSelectedCountry?.currencies?.find((c) => c.is_default) ||
          newSelectedCountry?.currencies?.[0] ||
          countryInfo.currency;
        
        // Update global i18n details to sync header country
        // This ensures the header shows the selected country
        setI18nDetails(
          {
            iso: countryInfo.iso2,
            phoneCode: countryInfo.phone_code,
            name: countryInfo.display_name,
          },
          defaultCurrency?.code || countryInfo.currency?.code
        );
        
        // Reset flag after a delay to allow all state updates to complete
        // This prevents the useEffect from resetting the country back
        // Clear any existing timeout before setting a new one
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          isUserChangingCountry.current = false;
          timeoutRef.current = null;
        }, 1500);
      } else {
        // Reset flag even if fetch fails
        isUserChangingCountry.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    } catch (error) {
      // Reset flag on error
      isUserChangingCountry.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  const handleCountrySearch = (event) => {
    setCountrySearchText(event);
  };

  const getFilteredCountries = (selectedCountry) => {
    if (!countrySearchText) {
      return countryCurrencies?.map((country) => convertDropDownField(country)) || [];
    }
    return countryCurrencies?.filter(
      (country) =>
        country?.name
          ?.toLowerCase()
          ?.indexOf(countrySearchText?.toLowerCase()) !== -1 &&
        country?.uid !== selectedCountry?.uid
    );
  };

  useEffect(() => {
    if (address_id) {
      setSelectedAddressId(address_id);
    }
  }, [address_id]);

  useEffect(() => {
    // Only set default address if there's no address_id in URL and no selectedAddressId
    // This prevents overriding user's manual selection
    if (address_id) {
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
    // Reset the flag when modal closes
    isUserChangingCountry.current = false;
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Reset country details when closing edit mode
    setEditingAddressCountryDetails(null);
  };

  const editAddress = async (item) => {
    setModalTitle(t("resource.common.address.edit_address"));
    
    // DO NOT call setI18nDetails here - it would change the header country
    // The header country should remain as the user's preference
    // We only use the address's country for the form schema, not for the header

    // Extract country ISO code from address - handle both object and string formats
    let addressCountryIso = item?.country_iso_code;
    if (!addressCountryIso && item?.country) {
      // If country is an object, extract iso2; if it's a string, use it directly
      addressCountryIso =
        typeof item.country === "object"
          ? item.country.iso2 || item.country.uid
          : item.country;
    }

    // Check if we already have the correct country details loaded
    // Only reset and fetch if we're editing a different country or don't have country details yet
    const needsCountryFetch =
      addressCountryIso &&
      addressCountryIso !== countryDetails?.iso2 &&
      addressCountryIso !== editingAddressCountryDetails?.iso2;

    if (needsCountryFetch) {
      // Address country is different from header country and we don't have it loaded - fetch its details
      try {
        const response = await fetchCountrieDetails(
          {
            countryIsoCode: addressCountryIso,
          },
          { skipStoreUpdate: true }
        ); // Don't update global store, only use for form schema

        if (response?.data?.country) {
          setEditingAddressCountryDetails(response.data.country);
        } else {
          // If fetch fails, fall back to header country details
          setEditingAddressCountryDetails(null);
        }
      } catch (error) {
        // If fetch fails, fall back to header country details
        setEditingAddressCountryDetails(null);
      }
    } else if (
      addressCountryIso &&
      addressCountryIso === countryDetails?.iso2
    ) {
      // Address country matches header country - explicitly set to null to use header country details
      setEditingAddressCountryDetails(null);
    } else if (!addressCountryIso) {
      // No country ISO found - use header country details
      setEditingAddressCountryDetails(null);
    }
    // If addressCountryIso matches editingAddressCountryDetails?.iso2, keep the existing value

    // Set address item and open modal
    // If country details were already pre-loaded, formSchema will be correct immediately
    // If we just fetched them, they'll update and formSchema will regenerate
    setAddressItem({
      ...item,
      phone: {
        mobile: item?.phone,
        countryCode: item?.country_code?.replace(/\+/g, ""),
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
    // Convert country object to string (uid/id/iso2) if it's an object
    // Handles: API country objects (with id), countryCurrencies objects (with uid/iso2), and string values
    if (obj.country && typeof obj.country === "object" && obj.country !== null) {
      obj.country = obj.country.uid || obj.country.id || obj.country.iso2 || String(obj.country);
    }
    // Remove any existing country_phone_code to prevent accumulation of plus signs
    delete obj.country_phone_code;
    // Clean countryCode by removing all plus signs, then add a single plus
    const cleanCountryCode = obj.phone.countryCode?.replace(/\+/g, "") || "";
    obj.country_phone_code = cleanCountryCode ? `+${cleanCountryCode}` : "";
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
            .executeGQL(CHECKOUT_LANDING, { includeBreakup: true, buyNow, id: cart_id })
            .then((data) => {
              selectAddress(
                res?.data?.addAddress?.id,
                data?.data?.addresses?.address
              );
            });
          setAddressLoader(false);
        } else {
          fpi.executeGQL(CHECKOUT_LANDING, { includeBreakup: true, buyNow, id: cart_id });
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
    // Convert country object to string (uid/id/iso2) if it's an object
    // Handles: API country objects (with id), countryCurrencies objects (with uid/iso2), and string values
    if (obj.country && typeof obj.country === "object" && obj.country !== null) {
      obj.country = obj.country.uid || obj.country.id || obj.country.iso2 || String(obj.country);
    }
    // Remove any existing country_phone_code to prevent accumulation of plus signs
    delete obj.country_phone_code;
    // Clean countryCode by removing all plus signs, then add a single plus
    const cleanCountryCode = obj?.phone?.countryCode?.replace(/\+/g, "") || "";
    obj.country_phone_code = cleanCountryCode ? `+${cleanCountryCode}` : "";
    obj.phone = obj?.phone?.mobile;
    // Also clean country_code if it exists to prevent issues
    if (obj.country_code) {
      obj.country_code = obj.country_code.replace(/\+/g, "");
      if (obj.country_code) {
        obj.country_code = `+${obj.country_code}`;
      }
    }

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
            .executeGQL(CHECKOUT_LANDING, { includeBreakup: true, buyNow, id: cart_id })
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
          fpi.executeGQL(CHECKOUT_LANDING, { includeBreakup: true, buyNow, id: cart_id });
          showSnackbar(
            res?.errors?.[0]?.message ||
              t("resource.common.address.address_update_failure"),
            "error"
          );
        }
      });
  };

  const removeAddress = () => {
    const deletedAddressId = selectedAddressId;

    // Check if the address being deleted is a default address
    const addressToDelete = allAddresses?.find(
      (addr) => addr?.id === deletedAddressId
    );
    if (addressToDelete?.is_default_address) {
      showSnackbar(
        t("resource.common.address.default_address_cannot_be_deleted") ||
          "Default address cannot be deleted. Please contact support team",
        "error"
      );
      return;
    }

    fpi
      .executeGQL(
        `
    mutation RemoveAddress($id: String) {
        removeAddress(id: $id){
            id
            is_deleted
        }
    }`,
        { id: deletedAddressId }
      )
      .then((res) => {
        const { is_deleted } = res?.data?.removeAddress ?? {};

        if (is_deleted) {
          // Clear selected address from global store if the deleted address was selected
          if (selectedAddress?.id === deletedAddressId) {
            clearSelectedAddress?.();
          }
          
          // Fetch updated addresses and select the next appropriate address
          fpi
            .executeGQL(CHECKOUT_LANDING, { includeBreakup: true, buyNow, id: cart_id })
            .then((data) => {
              const updatedAddresses = data?.data?.addresses?.address || [];
              
              // Find default address first, if no default then find first address
              const defaultAddress = updatedAddresses.find(
                (addr) => addr?.is_default_address
              );
              const addressToSelect = defaultAddress || updatedAddresses[0];
              
              if (addressToSelect?.id && typeof addressToSelect.id === "string") {
                // Select the next appropriate address without navigating to order summary
                const addressIdString = addressToSelect.id;
                const payload = {
                  cartId: cart_id,
                  buyNow,
                  selectCartAddressRequestInput: {
                    cart_id,
                    id: addressIdString,
                    billing_address_id: addressIdString,
                  },
                };
                
                fpi
                  .executeGQL(SELECT_ADDRESS, payload)
                  .then((res) => {
                    if (res?.data?.selectAddress?.is_valid) {
                      // Update selectedAddressId state
                      setSelectedAddressId(addressIdString);
                      // Update query parameter without navigation
                      try {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set("address_id", addressIdString);
                        setSearchParams(newParams, { replace: true });
                      } catch (error) {
                        // Silently handle URL update errors
                        // Error is non-critical, user can continue
                      }
                      // Update selected address in global store
                      updatedSelectedAddress(addressToSelect).catch(() => {
                        // Silently handle global store update errors
                        // Error is non-critical, address is still selected
                      });
                    }
                  })
                  .catch(() => {
                    // Silently handle address selection errors
                    // User can manually select address if needed
                  });
              } else {
                // No addresses remaining, clear selection and remove address_id from URL
                setSelectedAddressId("");
                try {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete("address_id");
                  setSearchParams(newParams, { replace: true });
                } catch (error) {
                  // Silently handle URL update errors
                  // Error is non-critical, selection is still cleared
                }
              }
            })
            .catch(() => {
              // If fetching addresses fails, just clear selection
              setSelectedAddressId("");
              try {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("address_id");
                setSearchParams(newParams, { replace: true });
              } catch (urlError) {
                // Silently handle URL update errors
                // Error is non-critical, selection is still cleared
              }
            });
          
          showSnackbar(
            t("resource.common.address.address_deletion_success"),
            "success"
          );
        } else {
          fpi.executeGQL(CHECKOUT_LANDING, { includeBreakup: true, buyNow, id: cart_id });
          showSnackbar(
            t("resource.common.address.address_deletion_failure"),
            "error"
          );
          resetAddressState();
        }
      })
      .catch(() => {
        // Handle error gracefully
        showSnackbar(
          t("resource.common.address.address_deletion_failure"),
          "error"
        );
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

  const selectAddress = (id = "", addresses = null, shouldOpenShipment = true) => {
    const addressList = addresses?.length > 0 ? addresses : allAddresses || [];

    // Ensure we extract ID string from id parameter (handle case where object might be passed)
    let idString = "";
    if (id) {
      idString = typeof id === "string" ? id : id?.id || "";
    }

    // Ensure selectedAddressId is a string, not an object
    const currentSelectedId =
      typeof selectedAddressId === "string"
        ? selectedAddressId
        : selectedAddressId?.id || "";

    const targetId = idString || currentSelectedId;
    const findAddress = addressList?.find((item) => item?.id === targetId);
    const finalAddressId = idString || findAddress?.id || targetId;

    // Final validation: ensure finalAddressId is a string
    const addressIdString =
      typeof finalAddressId === "string"
        ? finalAddressId
        : finalAddressId?.id || "";

    // Validate address ID before proceeding
    if (!addressIdString || typeof addressIdString !== "string") {
      showSnackbar(
        t("resource.common.address.address_selection_failure"),
        "error"
      );
      return;
    }

    const payload = {
      cartId: cart_id,
      buyNow,
      selectCartAddressRequestInput: {
        cart_id,
        id: addressIdString,
        billing_address_id: addressIdString,
      },
    };

    fpi.executeGQL(SELECT_ADDRESS, payload).then((res) => {
      if (res?.data?.selectAddress?.is_valid) {
        // Update selectedAddressId state to keep it in sync (ensure it's a string)
        setSelectedAddressId(addressIdString);
        setIsShipmentLoading(true);
        updateQuery("address_id", addressIdString);
        updatedSelectedAddress(findAddress)
          .then(() => {
            fpi
              .executeGQL(FETCH_SHIPMENTS, {
                addressId: addressIdString,
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
        // Only open shipment accordion if shouldOpenShipment is true
        if (shouldOpenShipment) {
          setShowShipment(true);
        }
        setAddressLoader(false);
        setInvalidAddressError(null);
        if (shouldOpenShipment) {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      } else {
        setInvalidAddressError({
          id: addressIdString,
          message:
            translateDynamicLabel(res?.data?.selectAddress?.message, t) ||
            res?.errors?.[0]?.message,
        });
      }
    });
  };

  const onFailedGetCartShipmentDetails = async () => {
    // Ensure selectedAddressId is a string before using it
    const addressId =
      typeof selectedAddressId === "string"
        ? selectedAddressId
        : selectedAddressId?.id || "";

    if (!addressId) {
      return;
    }

    setIsShipmentLoading(true);
    await fpi
      .executeGQL(FETCH_SHIPMENTS, {
        addressId,
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
        country: selectedCountry?.meta?.country_code || selectedCountry?.iso2,
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
    countryDetails: countryDetailsForSchema, // Use address country details when editing
    // Return country ISO for form key to force re-render when country changes
    formKey: countryDetailsForSchema?.iso2 || countryDetails?.iso2 || "default",
    onFailedGetCartShipmentDetails,
    isShipmentLoading,
    isCartValid,
  };
};

export default useAddress;
