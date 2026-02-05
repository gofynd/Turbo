import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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

  // Convert country object to string (uid) if it's an object
  if (
    payload.country &&
    typeof payload.country === "object" &&
    payload.country.uid
  ) {
    payload.country = payload.country.uid;
  }

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
  const userDetails = useGlobalStore(fpi.getters.USER_DATA);

  const { cart_items } = CART || {};
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [addrError, setAddrError] = useState(null);
  const [isNewAddress, setIsNewAddress] = useState(true);
  const [hasAutoAppliedAddress, setHasAutoAppliedAddress] = useState(false);
  const hasPincodeMatchedRef = useRef(false);
  const lastMatchedPincodeRef = useRef("");
  const isUserSelectingAddressRef = useRef(false);
  const {
    fetchAddresses,
    allAddress = [],
    defaultAddress,
    otherAddresses = [],
    addAddress: addAddressMutation,
    updateAddress: updateAddressMutation,
    removeAddress: removeAddressMutation,
    isLoading: isAddressLoading,
  } = useAddress({ fpi, pageName: "cart" });
  const { isServiceability } = useThemeFeature({ fpi });
  const { isHeaderMap, isCheckoutMap, mapApiKey } = useGoogleMapConfig({ fpi });
  const { showSnackbar } = useSnackbar();

  const buyNow = JSON.parse(searchParams?.get("buy_now") || "false");

  useEffect(() => {
    // Fetch addresses when logged in and addresses are not loaded
    if (isLoggedIn && !allAddress?.length && !isAddressLoading) {
      fetchAddresses().catch(() => {
        // Handle address fetch errors gracefully
        // Error is handled by the address hook, no need to show to user
      });
    }
  }, [isLoggedIn, allAddress?.length, isAddressLoading]);

  const {
    isInternational,
    countryCurrencies,
    countryDetails,
    currentCountry,
    deliveryLocation: deliveryLocationInfo,
    isServiceabilityPincodeOnly,
    fetchCountrieDetails,
    setI18nDetails,
  } = useInternational({
    fpi,
  });

  // Conditionally exclude phone from user data when international shipping is enabled
  // Must be after useInternational hook to access isInternational
  const userDataForForm = useMemo(() => {
    if (isInternational && userDetails?.phone_numbers) {
      const { phone_numbers, ...rest } = userDetails;
      return rest;
    }
    return userDetails;
  }, [userDetails, isInternational]);
  const { updatedSelectedAddress, clearSelectedAddress } = useHyperlocal(fpi);

  /**
   * Sync selectedAddressId with selectedAddress from global store
   * This ensures that when user comes back from checkout, their selected address is maintained
   *
   * This effect runs after addresses are loaded and syncs the local state with the global store.
   * It respects Google-selected addresses (which don't have an id) and only syncs saved addresses.
   * It does NOT override user's manual selection in the address modal.
   */
  useEffect(() => {
    // Wait for addresses to finish loading before syncing
    if (isAddressLoading) {
      return;
    }

    // Don't sync if user is actively selecting an address in the modal
    // This prevents overriding user's manual selection
    if (isAddressModalOpen || isUserSelectingAddressRef.current) {
      return;
    }

    // Skip Google-selected addresses (they have geo_location but no id)
    const isGoogleSelectedAddress =
      selectedAddress?.geo_location && !selectedAddress?.id;
    if (isGoogleSelectedAddress) {
      return;
    }

    // Only sync if we have a selected address in global store with an id
    if (selectedAddress?.id && allAddress?.length > 0) {
      // Verify the address exists in the address list
      const addressExists = allAddress.some(
        (addr) => addr?.id === selectedAddress.id
      );
      if (addressExists && selectedAddressId !== selectedAddress.id) {
        setSelectedAddressId(selectedAddress.id);
      }
    }
  }, [
    selectedAddress?.id,
    selectedAddress?.geo_location,
    allAddress,
    selectedAddressId,
    isAddressLoading,
    isAddressModalOpen,
  ]);

  useEffect(() => {
    // Wait for addresses to finish loading
    if (isAddressLoading) {
      return;
    }

    // Only set default address if there's no selected address in global store
    if (selectedAddress?.id) {
      return;
    }

    // Skip Google-selected addresses
    const isGoogleSelectedAddress =
      selectedAddress?.geo_location && !selectedAddress?.id;
    if (isGoogleSelectedAddress) {
      return;
    }

    if (defaultAddress?.id && !selectedAddressId) {
      setSelectedAddressId(defaultAddress.id);
    } else if (otherAddresses?.length && !selectedAddressId) {
      setSelectedAddressId(otherAddresses?.[0]?.id);
    }
  }, [
    allAddress,
    selectedAddress?.id,
    selectedAddress?.geo_location,
    selectedAddressId,
    isAddressLoading,
    defaultAddress?.id,
    otherAddresses,
  ]);

  /**
   * Validate that the selected address from global store still exists
   * This handles the case when an address is deleted in checkout page
   * and user navigates back to cart page
   */
  useEffect(() => {
    // Only run for logged-in users
    if (!isLoggedIn) {
      return;
    }

    // Wait for addresses to finish loading
    if (isAddressLoading) {
      return;
    }

    // Skip validation for Google-selected addresses (has geo_location but no id)
    // These are temporary addresses selected via Google Maps and should be preserved
    const isGoogleSelectedAddress =
      selectedAddress?.geo_location && !selectedAddress?.id;
    if (isGoogleSelectedAddress) {
      return;
    }

    // Only validate if we have a selected address with an id from global store
    if (!selectedAddress?.id) {
      return;
    }

    // Check if selectedAddress from global store exists in the address list
    if (allAddress?.length > 0) {
      const addressExists = allAddress.some(
        (addr) => addr?.id === selectedAddress.id
      );

      // If the selected address doesn't exist anymore, clear it
      if (!addressExists) {
        clearSelectedAddress?.();
        // Also clear local selectedAddressId if it matches
        if (selectedAddressId === selectedAddress.id) {
          setSelectedAddressId("");
        }
      }
    } else if (allAddress?.length === 0) {
      // If we have a selected address but no addresses in the list, clear it
      // This handles the case where all addresses were deleted
      // But preserve Google-selected addresses
      if (!isGoogleSelectedAddress) {
        clearSelectedAddress?.();
        if (selectedAddressId) {
          setSelectedAddressId("");
        }
      }
    }
  }, [
    isLoggedIn,
    isAddressLoading,
    allAddress,
    selectedAddress?.id, // Only depend on the ID, not the whole object
    selectedAddress?.geo_location, // Added for Google-selected address check
    selectedAddressId,
    clearSelectedAddress,
  ]);

  const [selectedCountry, setSelectedCountry] = useState(currentCountry);
  const [countrySearchText, setCountrySearchText] = useState("");
  // Track country details for the address being edited
  const [editingAddressCountryDetails, setEditingAddressCountryDetails] =
    useState(null);

  // Track if we're in the middle of a user-initiated country change
  const isUserChangingCountry = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Only sync selectedCountry with currentCountry if user is not actively changing country
    // This prevents the reset loop when user changes country in address form
    if (currentCountry && !isUserChangingCountry.current) {
      setSelectedCountry(currentCountry);
    }
  }, [currentCountry]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Determine which country details to use: address country when editing, header country otherwise
  const countryDetailsForSchema = useMemo(() => {
    return editingAddressCountryDetails || countryDetails;
  }, [editingAddressCountryDetails, countryDetails]);

  const { formSchema, defaultAddressItem } = useAddressFormSchema({
    fpi,
    countryCode: countryDetailsForSchema?.phone_code,
    countryIso: countryDetailsForSchema?.iso2,
    addressTemplate:
      countryDetailsForSchema?.fields?.address_template?.checkout_form,
    addressFields: countryDetailsForSchema?.fields?.address,
  });
  const pincodeInput = usePincodeInput();
  const [addressFormItem, setAddressFormItem] = useState(defaultAddressItem);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const isEditing = Boolean(editingAddressId);
  const addressFormItemRef = useRef(defaultAddressItem);

  useEffect(() => {
    if (!editingAddressId) {
      // Only update if it's actually different to prevent infinite loops
      // This is especially important when Google-selected addresses are used
      if (addressFormItemRef.current !== defaultAddressItem) {
        setAddressFormItem(defaultAddressItem);
        addressFormItemRef.current = defaultAddressItem;
      }
    }
  }, [editingAddressId]); // Removed defaultAddressItem from dependencies to break infinite loop

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
      return (
        countryCurrencies.map((country) => convertDropDownField(country)) || []
      );
    }
    return countryCurrencies?.filter(
      (country) =>
        country?.name
          ?.toLowerCase()
          ?.indexOf(countrySearchText?.toLowerCase()) !== -1 &&
        country?.uid !== selectedCountry?.uid
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
    setIsNewAddress(true);
    setEditingAddressId(null);
    setAddressFormItem(defaultAddressItem);
    // Reset country details when closing edit mode
    setEditingAddressCountryDetails(null);
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

  function handleBackFromAddAddress() {
    setIsAddAddressModalOpen(false);
    setIsAddressModalOpen(true);
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

  // Function to apply address without navigating to checkout
  const applyAddressToCart = useCallback(
    async (address, shouldNavigate = false) => {
      if (!cart_items?.id || !address?.id) {
        return false;
      }
      const cart_id = cart_items?.id;
      const addrId = address.id;
      const payload = {
        cartId: cart_id,
        buyNow,
        selectCartAddressRequestInput: {
          cart_id,
          id: addrId,
          billing_address_id: addrId,
        },
      };

      try {
        const res = await fpi.executeGQL(SELECT_ADDRESS, payload);
        if (res?.data?.selectAddress?.is_valid) {
          // Update selected address to display full address in "Deliver To"
          await updatedSelectedAddress(address);
          setSelectedAddressId(addrId);
          setAddrError(null);
          if (shouldNavigate) {
            gotoCheckout(addrId);
          }
          return true;
        } else {
          // Even if address is not serviceable, still update the selected address
          // so user can stay on cart page and select/delete items
          await updatedSelectedAddress(address);
          setSelectedAddressId(addrId);
          // Commented out error display for now
          // const errMsg =
          //   translateDynamicLabel(res?.data?.selectAddress?.message, t) ||
          //   t("resource.common.address.address_selection_failure");
          // setAddrError({ id: addrId, message: errMsg });
          // showSnackbar(translateDynamicLabel(errMsg, t), "error");
          // Don't navigate even if shouldNavigate is true - stay on cart page
          return true; // Return true to allow modal to close
        }
      } catch (error) {
        // Error handling is done above, just return false
        // User will see error message from the API response
        return false;
      }
    },
    [
      cart_items?.id,
      buyNow,
      fpi,
      updatedSelectedAddress,
      setSelectedAddressId,
      setAddrError,
      showSnackbar,
      t,
      gotoCheckout,
    ]
  );

  // Reset auto-apply flag when user logs out
  useEffect(() => {
    if (!isLoggedIn) {
      setHasAutoAppliedAddress(false);
    }
  }, [isLoggedIn]);

  /**
   * Auto-apply default/most recent address for logged-in users when no pincode is entered
   *
   * This effect automatically selects and applies a user's address when:
   * 1. User is logged in
   * 2. Addresses have finished loading
   * 3. Cart is ready
   * 4. No pincode or address is currently set
   *
   * Priority: Pincode from header > Default address > Most recently added address
   *
   * IMPORTANT: This effect should NOT run if there's a pincode in locationDetails,
   * even if it hasn't been matched to an address yet. The pincode matching effect
   * will handle that case.
   *
   * The effect includes cleanup to prevent state updates after component unmount
   * and handles errors gracefully without disrupting user experience.
   */
  useEffect(() => {
    // Only run for logged-in users
    if (!isLoggedIn) {
      return;
    }

    // Wait for addresses to finish loading
    if (isAddressLoading) {
      return;
    }

    // Only run if addresses are loaded
    if (!allAddress?.length) {
      return;
    }

    // Only run if cart is ready
    if (!cart_items?.id) {
      return;
    }

    // CRITICAL: Do NOT auto-apply address if there's a pincode in locationDetails
    // This preserves the pincode entered in the header, even if it doesn't match any saved address
    // The pincode matching effect (below) will handle matching pincode to addresses
    if (locationDetails?.pincode) {
      // If there's a pincode, reset auto-apply flag and let pincode matching effect handle it
      if (hasAutoAppliedAddress) {
        setHasAutoAppliedAddress(false);
      }
      return;
    }

    // Only run if no address is currently selected
    // If there's a selected address, don't override it
    if (selectedAddress) {
      // Reset flag if address is set (user might have selected it)
      if (hasAutoAppliedAddress) {
        setHasAutoAppliedAddress(false);
      }
      return;
    }

    // Only run if no address has been auto-applied yet
    if (hasAutoAppliedAddress) {
      return;
    }

    // Find the address to use: default first, then most recently added (last in array)
    let addressToApply = null;

    if (defaultAddress?.id) {
      // Use default address if available
      addressToApply = defaultAddress;
    } else if (allAddress?.length > 0) {
      // Fallback to most recently added address (last in array)
      // Since addresses are typically returned in order, the last one is most recent
      addressToApply = allAddress[allAddress.length - 1];
    }

    // Apply the address if found - do this immediately to avoid flash
    if (addressToApply?.id) {
      // Set flag before applying to prevent duplicate calls
      setHasAutoAppliedAddress(true);

      // Use a flag to track if component is still mounted to prevent state updates after unmount
      let isMounted = true;

      // Apply address immediately and reset flag if it fails (e.g., cart not ready)
      applyAddressToCart(addressToApply, false)
        .then((success) => {
          // Only update state if component is still mounted
          if (!isMounted) return;

          if (!success) {
            // Reset flag if application failed so it can retry
            setHasAutoAppliedAddress(false);
          }
        })
        .catch(() => {
          // Handle any unexpected errors gracefully
          if (isMounted) {
            setHasAutoAppliedAddress(false);
            // Error is non-critical, user can manually select address if needed
          }
        });

      // Cleanup function to prevent state updates after unmount
      return () => {
        isMounted = false;
      };
    }
  }, [
    isLoggedIn,
    isAddressLoading,
    allAddress,
    defaultAddress,
    locationDetails?.pincode,
    selectedAddress,
    hasAutoAppliedAddress,
    applyAddressToCart,
    cart_items?.id,
  ]);

  /**
   * Match pincode with user addresses when pincode is entered in PDP
   *
   * This effect handles the case when a pincode is entered:
   * 1. If pincode matches any address, select that address (prioritize default)
   * 2. If pincode doesn't match any address, show only pincode (no address)
   *
   * Only runs for logged-in users. Non-logged-in users continue to work as before.
   */
  useEffect(() => {
    // Only run for logged-in users
    if (!isLoggedIn) {
      hasPincodeMatchedRef.current = false;
      lastMatchedPincodeRef.current = "";
      return;
    }

    // Wait for addresses to finish loading
    if (isAddressLoading) {
      return;
    }

    // Only run if cart is ready
    if (!cart_items?.id) {
      return;
    }

    // Only run if pincode is entered (from PDP or elsewhere)
    // Also check selectedAddress?.area_code for pincode preserved via localStorage after login
    const currentPincode =
      locationDetails?.pincode || selectedAddress?.area_code;
    if (!currentPincode) {
      // Reset flags when pincode is cleared
      hasPincodeMatchedRef.current = false;
      lastMatchedPincodeRef.current = "";
      return;
    }

    // Skip if we've already processed this exact pincode
    if (
      hasPincodeMatchedRef.current &&
      lastMatchedPincodeRef.current === currentPincode
    ) {
      return;
    }

    // If no addresses available, just show pincode (no address to match)
    if (!allAddress?.length) {
      // Mark as processed to prevent re-running
      hasPincodeMatchedRef.current = true;
      lastMatchedPincodeRef.current = currentPincode;

      // Clear any selected address if pincode doesn't match
      if (selectedAddressId) {
        setSelectedAddressId("");
      }
      return;
    }

    // Find addresses that match the pincode
    const matchingAddresses = allAddress.filter(
      (addr) => addr?.area_code?.toString() === currentPincode?.toString()
    );

    // Check if currently selected address (from global store) matches the pincode
    const globalSelectedAddress = selectedAddress?.id
      ? allAddress.find((addr) => addr?.id === selectedAddress.id)
      : null;
    const globalAddressMatchesPincode =
      globalSelectedAddress?.area_code?.toString() ===
      currentPincode?.toString();

    // Check if currently selected address (from local state) matches the pincode
    const currentSelectedAddress = allAddress.find(
      (addr) => addr?.id === selectedAddressId
    );
    const currentAddressMatchesPincode =
      currentSelectedAddress?.area_code?.toString() ===
      currentPincode?.toString();

    // If no matching addresses found, clear selected address and show only pincode
    if (matchingAddresses.length === 0) {
      // Mark as processed to prevent re-running
      hasPincodeMatchedRef.current = true;
      lastMatchedPincodeRef.current = currentPincode;

      // Clear selected address if it exists and doesn't match the pincode
      if (selectedAddressId && !currentAddressMatchesPincode) {
        // Clear selected address to show only pincode
        setSelectedAddressId("");
        // Clear selected address from global store
        clearSelectedAddress?.();
      }

      // Refetch cart with the pincode to ensure items are shown with correct serviceability
      // This is important after login when pincode doesn't match any saved address
      // Run this regardless of whether there's a selectedAddressId or not
      if (cart_items?.id && currentPincode) {
        const payload = {
          buyNow,
          includeAllItems: true,
          includeCodCharges: true,
          includeBreakup: true,
          areaCode: currentPincode.toString(),
        };
        fpi.executeGQL(CART_DETAILS, payload);
      }
      return;
    }

    // If matching addresses found, prioritize:
    // 1. Currently selected address from global store (if it matches pincode)
    // 2. Default address (if it matches pincode)
    // 3. First matching address
    let addressToApply = null;

    // First, check if the address from global store matches the pincode
    if (globalAddressMatchesPincode && globalSelectedAddress?.id) {
      addressToApply = globalSelectedAddress;
    } else {
      // If global selected address doesn't match, check for default address
      const defaultMatchingAddress = matchingAddresses.find(
        (addr) => addr?.is_default_address
      );

      if (defaultMatchingAddress?.id) {
        // Use default address if it matches the pincode
        addressToApply = defaultMatchingAddress;
      } else {
        // Use first matching address if no default matches
        const [firstMatchingAddress] = matchingAddresses;
        addressToApply = firstMatchingAddress;
      }
    }

    // Apply the matching address if it's different from currently selected
    // and the currently selected address doesn't already match the pincode
    // IMPORTANT: Don't override if user has already selected an address that matches the pincode
    if (
      addressToApply?.id &&
      selectedAddressId !== addressToApply.id &&
      !currentAddressMatchesPincode &&
      !globalAddressMatchesPincode
    ) {
      // Mark that we're processing this pincode
      hasPincodeMatchedRef.current = true;
      lastMatchedPincodeRef.current = currentPincode;

      // Use a flag to track if component is still mounted
      let isMounted = true;

      applyAddressToCart(addressToApply, false)
        .then((success) => {
          if (!isMounted) return;

          if (success) {
            setSelectedAddressId(addressToApply.id);
          } else {
            // Reset flag if application failed so it can retry
            hasPincodeMatchedRef.current = false;
          }
        })
        .catch(() => {
          // Handle errors gracefully
          if (isMounted) {
            // Reset flag on error so it can retry
            hasPincodeMatchedRef.current = false;
            // Error is non-critical, user can manually select address if needed
          }
        });

      // Cleanup function to prevent state updates after unmount
      return () => {
        isMounted = false;
      };
    } else if (currentAddressMatchesPincode || globalAddressMatchesPincode) {
      // If current address (local or global) already matches, mark as processed
      // This prevents re-applying when user comes back from checkout
      hasPincodeMatchedRef.current = true;
      lastMatchedPincodeRef.current = currentPincode;

      // Sync local state with global store if they differ but both match pincode
      if (
        globalAddressMatchesPincode &&
        selectedAddressId !== selectedAddress?.id
      ) {
        setSelectedAddressId(selectedAddress.id);
      }
    }
  }, [
    isLoggedIn,
    isAddressLoading,
    allAddress,
    locationDetails?.pincode,
    selectedAddress?.area_code,
    applyAddressToCart,
    cart_items?.id,
    clearSelectedAddress,
    selectedAddressId,
  ]);

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
    const addrId = id.length ? id : findAddress?.id;
    const addressToApply =
      allAddress.find((item) => item?.id === addrId) || findAddress;

    // Safety check: ensure address exists before proceeding
    if (!addressToApply?.id) {
      showSnackbar(
        t("resource.common.address.address_selection_failure"),
        "error"
      );
      return;
    }

    // Mark that user is selecting address to prevent sync effect from interfering
    isUserSelectingAddressRef.current = true;

    // Pass true for shouldNavigate - if address is serviceable, navigate to checkout
    // If address is not serviceable, applyAddressToCart will handle it and stay on cart page
    applyAddressToCart(addressToApply, true)
      .then((success) => {
        // Close modal - if address was serviceable, navigation already happened
        // If not serviceable, user stays on cart page and can manage items
        if (success) {
          closeModal();
        }
      })
      .catch(() => {
        // Handle any unexpected errors - don't close modal on error
        // Error is already handled in applyAddressToCart
      })
      .finally(() => {
        // Reset flag after a short delay to allow state updates to complete
        setTimeout(() => {
          isUserSelectingAddressRef.current = false;
        }, 100);
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

      // Construct the newly saved address from formData and response data
      // This ensures we have the complete address object with all required fields
      const newlySavedAddress = {
        ...formData,
        id: newId,
        is_default_address: Boolean(res?.data?.addAddress?.is_default_address),
      };

      // Update global selectedAddress directly without calling SELECT_ADDRESS
      // SELECT_ADDRESS requires the address to exist in the backend, but we just created it
      // Just update the global state so checkout doesn't prompt for address again
      await updatedSelectedAddress(newlySavedAddress);

      // Fetch updated address list after updating global state
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
  const handleEditAddress = async (address = {}) => {
    if (!address?.id) return;

    // Reset country details at the start to clear any stale state from previous edits
    setEditingAddressCountryDetails(null);

    // Fetch country details for the address being edited BEFORE opening the modal
    // This ensures the form schema uses the correct country's field structure from the start
    // Extract country ISO code from address - handle both object and string formats
    let addressCountryIso = address?.country_iso_code;
    if (!addressCountryIso && address?.country) {
      // If country is an object, extract iso2; if it's a string, use it directly
      addressCountryIso =
        typeof address.country === "object"
          ? address.country.iso2 || address.country.uid
          : address.country;
    }

    // Always fetch country details if we have a country ISO, even if it matches header country
    // This ensures we have the latest country details and clears any stale state
    // IMPORTANT: We await the fetch to ensure country details are set before opening the modal
    if (addressCountryIso) {
      if (addressCountryIso !== countryDetails?.iso2) {
        // Address country is different from header country - fetch its details
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
      } else {
        // Address country matches header country - explicitly set to null to use header country details
        setEditingAddressCountryDetails(null);
      }
    } else {
      // No country ISO found - use header country details
      setEditingAddressCountryDetails(null);
    }

    // Set address item and open modal AFTER country details are fetched/set
    // This ensures formSchema is correct when the form renders
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

    // Check if the address being deleted is a default address
    const addressToDelete = allAddress?.find((addr) => addr?.id === addressId);
    if (addressToDelete?.is_default_address) {
      showSnackbar(
        t("resource.common.address.default_address_cannot_be_deleted") ||
          "Default address cannot be deleted. Please contact support team",
        "error"
      );
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
          clearSelectedAddress?.();
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

  const addressTags = useMemo(() => {
    if (!selectedAddress) return [];

    const tags = [];

    // Add "Default" tag if this is the default address
    if (selectedAddress?.is_default_address) {
      tags.push("Default");
    }

    // Add address type tag (Home, Office, etc.) if available
    if (selectedAddress?.address_type) {
      // Capitalize first letter
      const formattedType =
        selectedAddress.address_type.charAt(0).toUpperCase() +
        selectedAddress.address_type.slice(1);
      tags.push(formattedType);
    }

    return tags;
  }, [selectedAddress]);

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
    addressTags,
    btnLabel,
    pincodeInput,
    error,
    isPincodeModalOpen,
    isAddressModalOpen,
    onAddButtonClick: handleAddButtonClick,
    onChangeButtonClick: handleButtonClick,
    onPincodeSubmit: handlePincodeSubmit,
    onCloseModalClick: closeModal,
    onBackFromAddAddress: handleBackFromAddAddress,
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
    countryDetails: countryDetailsForSchema, // Use address country details when editing
    // Return country ISO for form key to force re-render when country changes
    formKey: countryDetailsForSchema?.iso2 || countryDetails?.iso2 || "default",
    updateAddress: handleEditAddress,
    removeAddress: handleRemoveAddress,
    user: userDataForForm,
  };
};

export default useCartDeliveryLocation;
