import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import {
  useThemeConfig,
  useThemeFeature,
  useLocalStorage,
  useDeliverPromise,
} from "../../../helper/hooks";
import qs from "qs";
import { ADDRESS_LIST } from "../../../queries/addressQuery";
import { LOCALITY, DELIVERY_PROMISE } from "../../../queries/logisticsQuery";
import { getAddressStr, isRunningOnClient } from "../../../helper/utils";
import { refreshCurrentPageTheme } from "../../../helper/lib";

const PINCODE_STORAGE_KEY = "fynd_guest_pincode";

// Module-level tracking to prevent duplicate API calls across multiple hook instances
const fetchingDeliveryPromiseMap = new Map();
const lastFetchedPincodeMap = new Map();

const useHyperlocal = (fpi) => {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const params = useParams();
  const {
    isServiceabilityModalOpen = false,
    selectedAddress,
    serviceabilityInfo = {},
    countryDetails,
  } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE) || {};
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS) || {};
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const hasPincodeRestoredRef = useRef(false);
  const isRestoringAddressRef = useRef(false);
  // Tracks whether the initial page-load LOCALITY call is in-flight.
  // Blocks fetchDeliveryPromise until the backend has the user's location context.
  const localityPendingRef = useRef(false);
  // Ensures the initial LOCALITY setup only fires once per page load.
  const localityCalledOnLoadRef = useRef(false);

  // Get unique key for this fpi instance to track fetching state
  const fpiKey = fpi?.store?.getState
    ? String(fpi.store.getState())
    : "default";
  const [_, setPersistedAddress] = useLocalStorage(
    "selectedAddress",
    null,
    (value) => {
      // After logout: do not restore location from localStorage so user starts fresh
      if (
        value &&
        isRunningOnClient() &&
        sessionStorage.getItem("fdk_post_logout")
      ) {
        fpi.custom.setValue("selectedAddress", null);
        setPersistedAddress(null);
        setIsAddressLoading(false);
        return;
      }
      // Always restore full addresses (with id) from localStorage, even if a pincode-only address is already set
      // This ensures that when page refreshes, full addresses are preserved
      if (value && value.id) {
        // Mark that we're restoring an address to prevent pincode persistence from interfering
        isRestoringAddressRef.current = true;

        // Always set the full address from localStorage to global store
        // This is the source of truth for page refresh scenarios
        fpi.custom.setValue("selectedAddress", value);

        // Reset flag after a short delay to allow state to settle
        setTimeout(() => {
          isRestoringAddressRef.current = false;
        }, 100);
      } else if (value && !value.id) {
        // If localStorage has a pincode-only address, still mark as restoring
        // to prevent the pincode restore effect from interfering
        isRestoringAddressRef.current = true;
        fpi.custom.setValue("selectedAddress", value);
        setTimeout(() => {
          isRestoringAddressRef.current = false;
        }, 100);
      }
      setIsAddressLoading(false);
    }
  );

  /**
   * Persist pincode to localStorage before login redirect
   * This ensures the pincode entered in header is preserved across page reload
   */
  const persistPincode = (pincode) => {
    if (!isRunningOnClient() || !pincode) return;
    try {
      localStorage.setItem(PINCODE_STORAGE_KEY, pincode);
    } catch (e) {
      // Ignore storage errors
    }
  };

  /**
   * Clear persisted pincode after it's been restored
   */
  const clearPersistedPincode = () => {
    if (!isRunningOnClient()) return;
    try {
      localStorage.removeItem(PINCODE_STORAGE_KEY);
    } catch (e) {
      // Ignore storage errors
    }
  };

  /**
   * Get persisted pincode from localStorage
   */
  const getPersistedPincode = () => {
    if (!isRunningOnClient()) return null;
    try {
      return localStorage.getItem(PINCODE_STORAGE_KEY);
    } catch (e) {
      return null;
    }
  };

  const { globalConfig } = useThemeConfig({ fpi });
  const { getFormattedPromise } = useDeliverPromise({ fpi });

  const { isServiceability, isServiceabilityMandatory } = useThemeFeature({
    fpi,
  });

  const isLoggedIn = useGlobalStore(fpi?.getters?.LOGGED_IN);
  const { address = [] } = useGlobalStore(fpi?.getters?.ADDRESS) || {};

  const { is_delivery_promise: isDeliveryPromise } = globalConfig;
  const { deliveryTat, isServicibilityError } = serviceabilityInfo;

  /**
   * fetchDeliveryPromise - stable wrapped in useCallback to avoid recreations
   * Note: Does NOT depend on serviceabilityInfo to prevent infinite loops
   * Uses module-level Map to prevent concurrent duplicate calls across all hook instances
   */
  const fetchDeliveryPromise = useCallback(async () => {
    // Prevent duplicate concurrent calls across all hook instances
    if (fetchingDeliveryPromiseMap.get(fpiKey)) {
      return;
    }

    fetchingDeliveryPromiseMap.set(fpiKey, true);

    try {
      const { data, errors } = await fpi.executeGQL(DELIVERY_PROMISE);

      // ✅ True not-serviceable case (explicit backend error)
      const notServiceableErr = errors?.find((e) => {
        const msg = (e?.message || e?.details?.message || "")?.toLowerCase();
        const statusCode =
          e?.status_code || e?.statusCode || e?.extensions?.status_code;
        return (
          statusCode === 400 &&
          (msg.includes("not serviceable") ||
            msg.includes("not_serviceable") ||
            msg.includes("location not serviceable"))
        );
      });

      if (notServiceableErr) {
        fpi.custom.setValue("is_serviceable", false);
        fpi.custom.setValue("serviceabilityInfo", {
          deliveryTat: null,
          isServicibilityError: false,
        });
        return;
      }

      // ✅ Other errors = transient failure (don't mark not serviceable)
      if (errors?.length) {
        throw errors[0];
      }

      const promise = data?.deliveryPromise?.promise;

      if (!promise) {
        // No promise and no explicit not-serviceable error => treat as transient failure
        // Read current serviceabilityInfo from store to preserve existing values
        const currentState = fpi.store?.getState();
        const currentServiceabilityInfo =
          fpi.getters?.CUSTOM_VALUE(currentState)?.serviceabilityInfo || {};
        fpi.custom.setValue("serviceabilityInfo", {
          ...currentServiceabilityInfo,
          isServicibilityError: true,
        });
        return;
      }

      fpi.custom.setValue("is_serviceable", true);
      fpi.custom.setValue("serviceabilityInfo", {
        deliveryTat: promise,
        isServicibilityError: false,
      });
    } catch (error) {
      // IMPORTANT:
      // Do NOT mark as not serviceable on network/session failure
      // Only set error state, but keep previous serviceability status
      // Read current serviceabilityInfo from store to preserve existing values
      const currentState = fpi.store?.getState();
      const currentServiceabilityInfo =
        fpi.getters?.CUSTOM_VALUE(currentState)?.serviceabilityInfo || {};
      fpi.custom.setValue("serviceabilityInfo", {
        ...currentServiceabilityInfo,
        isServicibilityError: true,
      });

      // DO NOT change is_serviceable here - let it keep previous state
    } finally {
      fetchingDeliveryPromiseMap.delete(fpiKey);
    }
  }, [fpi, fpiKey]);

  /**
   * Restore pincode from localStorage after login/page reload
   * This runs once on mount to restore the pincode that was set before login
   *
   * IMPORTANT: Only restore pincode if there's no full address (with id) already selected.
   * This prevents overwriting a full address that was restored from localStorage.
   */
  useEffect(() => {
    // Wait for address loading to complete first
    if (isAddressLoading) {
      return;
    }

    if (hasPincodeRestoredRef.current) {
      return;
    }

    // Don't run while an address is being restored from localStorage
    // This prevents race conditions where pincode would overwrite the full address
    // Also mark as done to prevent future runs after the restore flag is cleared
    if (isRestoringAddressRef.current) {
      hasPincodeRestoredRef.current = true;
      return;
    }

    const persistedPincode = getPersistedPincode();

    // Check localStorage for full address FIRST, before any restoration
    const storedAddress = isRunningOnClient()
      ? (() => {
          try {
            const item = localStorage.getItem("selectedAddress");
            if (item) {
              return JSON.parse(item);
            }
            return null;
          } catch {
            return null;
          }
        })()
      : null;

    // wait until countryDetails is available (needed for LOCALITY)
    // Check if we already have a full address (with id) - if so, don't overwrite with pincode-only
    // Only restore pincode if selectedAddress is null or is pincode-only (no id)
    // CRITICAL: Also check if localStorage has a full address - if so, don't restore pincode
    if (
      !persistedPincode ||
      !countryDetails?.iso2 ||
      // Don't restore pincode if we already have a full address (has id)
      // This prevents overwriting a full address that was restored from localStorage
      selectedAddress?.id ||
      // Don't restore pincode if localStorage has a full address (will be restored by useLocalStorage)
      // CRITICAL: Check this FIRST before doing anything else
      (storedAddress && storedAddress.id)
    ) {
      // Mark as done even if we're skipping, to prevent re-runs
      hasPincodeRestoredRef.current = true;
      return;
    }

    hasPincodeRestoredRef.current = true;

    // Double-check localStorage right before writing to prevent race conditions
    // This is a final safeguard against any timing issues
    const finalCheck = isRunningOnClient()
      ? (() => {
          try {
            const item = localStorage.getItem("selectedAddress");
            if (item && item !== "null") {
              const parsed = JSON.parse(item);
              return parsed && parsed.id;
            }
            return false;
          } catch {
            return false;
          }
        })()
      : false;

    if (finalCheck) {
      return;
    }

    const pincodeAddress = {
      area_code: persistedPincode,
      pincode: persistedPincode,
    };

    fpi.custom.setValue("selectedAddress", pincodeAddress);
    setPersistedAddress(pincodeAddress);

    // Mark as handled so the initial-load effect below does not double-call LOCALITY.
    localityCalledOnLoadRef.current = true;
    // Block fetchDeliveryPromise until LOCALITY establishes the backend location context.
    localityPendingRef.current = true;

    // rebuild backend cookie/context so deliveryPromise works
    fpi
      .executeGQL(LOCALITY, {
        locality: "pincode",
        localityValue: persistedPincode,
        country: countryDetails.iso2,
      })
      .then(() => {
        // clear only after successful locality (so we can retry next time if it fails)
        clearPersistedPincode();
      })
      .catch(() => {
        // keep persisted pincode so next reload can retry
      })
      .finally(() => {
        // Unblock and explicitly trigger the delivery promise now that the backend
        // location context is established. Reset the dedup key so the call goes through.
        localityPendingRef.current = false;
        lastFetchedPincodeMap.delete(fpiKey);
        fetchDeliveryPromise();
      });
  }, [
    // ensure effect runs when country details ready and address loading is complete
    // Don't depend on selectedAddress as it causes re-runs when address is restored
    countryDetails?.iso2,
    isAddressLoading,
    // Only run once - don't depend on selectedAddress to prevent re-runs
  ]);

  /**
   * Persist current pincode to localStorage whenever it changes
   * This ensures pincode is saved before any page redirect (like login)
   *
   * IMPORTANT: Only persist pincode if selectedAddress is pincode-only (no id).
   * If we have a full address, don't persist the pincode separately as it will
   * overwrite the full address on refresh.
   *
   * CRITICAL: Also check localStorage to see if there's already a full address stored.
   * Don't persist pincode if localStorage has a full address, even if selectedAddress
   * doesn't have an id yet (might be in the process of being restored).
   *
   * CRITICAL: Don't persist pincode if we're currently restoring an address from localStorage.
   */
  useEffect(() => {
    // Wait for address loading to complete first
    if (isAddressLoading) {
      return;
    }

    // Don't persist pincode if we're currently restoring an address
    if (isRestoringAddressRef.current) {
      return;
    }

    // Check localStorage for full address - don't persist pincode if full address exists
    // Do this FIRST before any other operations
    const storedAddress = isRunningOnClient()
      ? (() => {
          try {
            const item = localStorage.getItem("selectedAddress");
            if (!item || item === "null") {
              return null;
            }
            const parsed = JSON.parse(item);
            return parsed;
          } catch {
            return null;
          }
        })()
      : null;

    const hasFullAddressInStorage = storedAddress && storedAddress.id;

    // If there's a full address in localStorage, just clear pincode and return
    // Don't do anything else - the full address will be restored by useLocalStorage
    if (hasFullAddressInStorage) {
      clearPersistedPincode();
      return;
    }

    const currentPincode =
      locationDetails?.pincode || selectedAddress?.area_code;
    const hasFullAddressInState = selectedAddress && selectedAddress.id;

    // Only persist pincode if:
    // 1. We have a pincode
    // 2. We don't have a full address in state
    // 3. We don't have a full address in localStorage (already checked above)
    // 4. We're not currently restoring an address
    if (
      currentPincode &&
      !hasFullAddressInState &&
      !isRestoringAddressRef.current
    ) {
      persistPincode(currentPincode);
    } else if (hasFullAddressInState) {
      clearPersistedPincode();
    }
  }, [
    locationDetails?.pincode,
    selectedAddress?.area_code,
    selectedAddress?.id,
    isAddressLoading,
  ]);

  /**
   * Initial page-load LOCALITY setup.
   *
   * When selectedAddress is restored from localStorage the useLocalStorage callback
   * sets isRestoringAddressRef=true, which causes the pincode-restore effect above to
   * skip entirely — meaning LOCALITY is never called and the backend has no location
   * context. After a few days the backend session expires, so fetchDeliveryPromise
   * gets a stale/empty context and returns "not serviceable" even for valid pincodes.
   *
   * This effect re-establishes the backend context once on every page load by calling
   * LOCALITY with the restored address, then explicitly triggers fetchDeliveryPromise
   * only after that call completes.
   *
   * localityCalledOnLoadRef prevents a double-call when the pincode-restore effect
   * above already handled LOCALITY (i.e. no address was in localStorage).
   */
  useEffect(() => {
    if (isAddressLoading || !countryDetails?.iso2) return;
    if (localityCalledOnLoadRef.current) return;

    const pincode = selectedAddress?.area_code || selectedAddress?.pincode;
    if (!pincode) return;

    localityCalledOnLoadRef.current = true;
    localityPendingRef.current = true;

    fpi
      .executeGQL(LOCALITY, {
        locality: "pincode",
        localityValue: pincode,
        country: countryDetails.iso2,
      })
      .then(() => {
        clearPersistedPincode();
      })
      .catch(() => {
        // Keep persisted pincode for retry on next load
      })
      .finally(() => {
        localityPendingRef.current = false;
        lastFetchedPincodeMap.delete(fpiKey);
        fetchDeliveryPromise();
      });
  }, [
    isAddressLoading,
    countryDetails?.iso2,
    selectedAddress?.area_code,
    selectedAddress?.pincode,
  ]);

  const handleLocationUpdate = async (address) => {
    if (!address) return;
    await updatedSelectedAddress(address);
    fpi.custom.setValue("isServiceabilityModalOpen", false);
  };

  const updatedSelectedAddress = async (address) => {
    const response = await fetchLocality(address, {
      meta: address?.geo_location
        ? {
            latitude: address.geo_location.latitude,
            longitude: address.geo_location.longitude,
          }
        : {},
    });

    fpi.custom.setValue(`selectedAddress`, address);
    setPersistedAddress(address);

    // If this is a full address, clear the persisted pincode to prevent overwriting
    if (address?.id) {
      clearPersistedPincode();
    }

    if (response?.data?.locality) {
      const filterQuery = qs.parse(location?.search || "", {
        ignoreQueryPrefix: true,
      });
      refreshCurrentPageTheme({
        fpi,
        router: {
          params,
          filterQuery,
          pathname: location?.pathname,
          path: location?.pathname,
          search: location?.search,
        },
      });
    }

    return response;
  };

  const fetchLocality = (address, options) => {
    const payload = countryDetails?.fields?.serviceability_fields.reduce(
      (acc, field, index, fields) => {
        if (index === fields.length - 1) {
          const fieldKey = field === "pincode" ? "area_code" : field;
          acc.localityValue =
            address[fieldKey] || address.pincode || address.area_code || "";
          acc.locality = field;
          return acc;
        }
        acc[field] = address[field];
        return acc;
      },
      {
        country: countryDetails.iso2,
      }
    );

    return fpi
      .executeGQL(LOCALITY, payload, options)
      .then((response) => {
        if (response?.errors) {
          throw response?.errors?.[0];
        }
        return response;
      })
      .catch((error) => {});
  };

  const openServiceabilityModal = () => {
    fpi.custom.setValue("isServiceabilityModalOpen", true);
  };

  const closeServiceabilityModal = () => {
    // Check if user has selected any address/pincode
    // selectedAddress can be:
    // 1. null/undefined - no selection
    // 2. Object with id - full address selected
    // 3. Object without id but with area_code/pincode - pincode-only selected (valid selection)
    const hasAnySelection =
      selectedAddress &&
      (selectedAddress.id ||
        selectedAddress.area_code ||
        selectedAddress.pincode);

    // Don't allow closing if serviceability is mandatory and no selection exists
    if (isServiceabilityMandatory && !hasAnySelection) {
      return;
    }
    fpi.custom.setValue("isServiceabilityModalOpen", false);
  };

  /**
   * Clear the selected address from both global store and localStorage
   * Also clears the persisted pincode
   */
  const clearSelectedAddress = () => {
    fpi.custom.setValue("selectedAddress", null);
    setPersistedAddress(null);
    clearPersistedPincode();
  };

  const isHeaderServiceability = useMemo(() => {
    const regexPattern =
      /^(\/cart\/bag\/?|\/cart\/checkout|\/profile\/orders(\/shipment\/\w+)?)$/;
    if (regexPattern.test(location.pathname)) {
      return false;
    }
    return isServiceability;
  }, [location.pathname, isServiceability]);

  const deliveryPromise = useMemo(() => {
    if (!isDeliveryPromise || !isServiceability) return null;

    // true not serviceable: server responded but promise missing (you set deliveryTat=null)
    if (deliveryTat === null) {
      return t("resource.header.not_serviceable");
    }

    // request failed: don't lie to user
    if (isServicibilityError) {
      return null; // or t("resource.header.delivery_check_failed")
    }

    return getFormattedPromise(deliveryTat);
  }, [deliveryTat, isServicibilityError]);

  useEffect(() => {
    if (!isServiceability || !isDeliveryPromise || !selectedAddress) {
      return;
    }

    // Wait for the initial LOCALITY call to complete so the backend has the
    // correct location context before we run the serviceability check.
    if (localityPendingRef.current) {
      return;
    }

    // Get current pincode from selectedAddress or locationDetails
    const currentPincode =
      selectedAddress?.area_code ||
      selectedAddress?.pincode ||
      locationDetails?.pincode;

    // Skip if we already fetched for this pincode (across all hook instances)
    if (lastFetchedPincodeMap.get(fpiKey) === currentPincode) {
      return;
    }

    // Update map and fetch
    lastFetchedPincodeMap.set(fpiKey, currentPincode);
    fetchDeliveryPromise();
  }, [
    isServiceability,
    isDeliveryPromise,
    selectedAddress?.area_code,
    selectedAddress?.pincode,
    locationDetails?.pincode,
    fetchDeliveryPromise,
  ]);

  useEffect(() => {
    if (isServiceability && isLoggedIn && !address.length) {
      fpi.executeGQL(ADDRESS_LIST);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Don't auto-select default address if there's a persisted pincode
    // This preserves the pincode entered before login
    const persistedPincode = getPersistedPincode();
    if (persistedPincode) {
      return;
    }

    if (isServiceability && !!address?.length && !selectedAddress) {
      const defaultAddress = address.find(
        (address) => address.is_default_address
      );
      if (defaultAddress && defaultAddress.geo_location) {
        handleLocationUpdate(defaultAddress);
      }
    }
  }, [isServiceability, address, selectedAddress]);

  return {
    isHeaderServiceability,
    isServiceability,
    isServiceabilityMandatory,
    isDeliveryPromise,
    deliveryPromise,
    isLoading: isAddressLoading,
    isServiceabilityModalOpen,
    selectedAddress,
    deliveryAddress: useMemo(
      () => getAddressStr(selectedAddress),
      [selectedAddress]
    ),
    openServiceabilityModal,
    closeServiceabilityModal,
    handleLocationUpdate,
    updatedSelectedAddress,
    clearSelectedAddress,
  };
};

export default useHyperlocal;
