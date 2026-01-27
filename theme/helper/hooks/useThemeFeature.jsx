import { useMemo } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useThemeConfig } from "./useThemeConfig";

export const useThemeFeature = ({ fpi }) => {
  const { globalConfig } = useThemeConfig({ fpi });
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS) || {};
  const { selectedAddress } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE) || {};
  const sellerDetailsRaw = useGlobalStore(fpi.getters.SELLER_DETAILS);

  const sellerDetails = useMemo(() => {
    if (!sellerDetailsRaw) return {};
    try {
      return typeof sellerDetailsRaw === "string"
        ? JSON.parse(sellerDetailsRaw || "{}")
        : sellerDetailsRaw;
    } catch {
      return {};
    }
  }, [sellerDetailsRaw]);

  const isInternational =
    CONFIGURATION?.app_features?.common?.international_shipping?.enabled ??
    false;

  // Check if order is cross-border (seller country != delivery country)
  const isCrossBorderOrder = useMemo(() => {
    if (!isInternational) return false;

    // Get seller country (origin country)
    const sellerCountry = sellerDetails?.country_code;

    // Get delivery country from location details or selected address
    const deliveryCountry =
      locationDetails?.country_iso_code || selectedAddress?.country_iso_code;

    // If either is missing, we can't determine if it's cross-border
    if (!sellerCountry || !deliveryCountry) {
      return false;
    }

    // Normalize country codes to uppercase for comparison
    const normalizedSellerCountry = String(sellerCountry).toUpperCase();
    const normalizedDeliveryCountry = String(deliveryCountry).toUpperCase();

    // It's cross-border if seller country is different from delivery country
    return normalizedSellerCountry !== normalizedDeliveryCountry;
  }, [
    isInternational,
    sellerDetails?.country_code,
    locationDetails?.country_iso_code,
    selectedAddress?.country_iso_code,
  ]);

  const {
    is_serviceability: isServiceability,
    is_serviceability_mandatory: isServiceabilityMandatory,
    is_delivery_promise: isServiceabilityPromise,
  } = globalConfig;

  return {
    isInternational,
    isCrossBorderOrder,
    isServiceability,
    isServiceabilityMandatory,
    isServiceabilityPromise,
  };
};
