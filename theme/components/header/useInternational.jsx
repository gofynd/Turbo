import { useMemo } from "react";
import { useGlobalStore } from "fdk-core/utils";
import {
  COUNTRY_DETAILS,
  FETCH_LOCALITIES,
} from "../../queries/internationlQuery";
import { useThemeFeature } from "../../helper/hooks";
import { isRunningOnClient } from "../../helper/utils";

const useInternational = ({ fpi }) => {
  // Always call hooks unconditionally - React requires this
  const customValues = useGlobalStore(fpi?.getters?.CUSTOM_VALUE) || {};
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS) || {};
  const i18nDetails = useGlobalStore(fpi?.getters?.i18N_DETAILS) || {};
  const globalData = customValues?.globalData;

  const { countryCurrencies, countryDetails } = customValues ?? {};

  // Get countryCurrencies from multiple sources as fallback
  // 1. From customValues (set by globalDataResolver)
  // 2. From globalData directly (fallback if customValues not set yet)
  const countryCurrenciesWithFallback = useMemo(() => {
    if (countryCurrencies && countryCurrencies.length > 0) {
      return countryCurrencies;
    }
    // Fallback to globalData if countryCurrencies not in customValues yet
    const fromGlobalData =
      globalData?.applicationConfiguration?.country_currencies;
    if (fromGlobalData && fromGlobalData.length > 0) {
      return fromGlobalData;
    }
    return countryCurrencies; // Return undefined if neither available
  }, [countryCurrencies, globalData]);

  const { isInternational } = useThemeFeature({ fpi });

  const currentCountry = useMemo(() => {
    // Use countryCurrenciesWithFallback instead of countryCurrencies
    const availableCountries =
      countryCurrenciesWithFallback || countryCurrencies;

    // First try to find country matching i18nDetails.countryCode
    const matchedCountry = availableCountries?.find(
      (country) => country.iso2 === i18nDetails?.countryCode
    );

    // If found, return it
    if (matchedCountry) {
      return matchedCountry;
    }

    // If not found and international is enabled, return default country or first country
    // This ensures header shows default country on first load
    if (isInternational && availableCountries?.length > 0) {
      return (
        availableCountries.find((country) => country.is_default) ||
        availableCountries[0]
      );
    }

    return matchedCountry; // Return undefined if no match and not international
  }, [
    countryCurrenciesWithFallback,
    countryCurrencies,
    i18nDetails?.countryCode,
    isInternational,
  ]);

  const currentCurrency = useMemo(() => {
    if (!currentCountry?.currencies?.length) {
      return null;
    }

    // First try to find currency matching i18nDetails.currency.code
    const matchedCurrency = currentCountry.currencies?.find(
      (data) => data?.code === i18nDetails?.currency?.code
    );

    // If found, return it
    if (matchedCurrency) {
      return matchedCurrency;
    }

    // If not found, return default currency or first currency
    // This ensures header shows default currency on first load
    return (
      currentCountry.currencies.find((c) => c.is_default) ||
      currentCountry.currencies[0]
    );
  }, [currentCountry, i18nDetails?.currency?.code]);

  const countryAddressFieldMap = useMemo(() => {
    const addressFields = countryDetails?.fields?.address;
    if (!addressFields) return {};
    const prevFieldMap = addressFields.reduce((acc, field) => {
      if (field.next) {
        acc[field.next] = field.slug;
      }
      return acc;
    }, {});
    return addressFields.reduce((acc, field) => {
      acc[field.slug] = prevFieldMap[field.slug]
        ? { ...field, prev: prevFieldMap[field.slug] }
        : field;
      return acc;
    }, {});
  }, [countryDetails?.fields?.address]);

  const isValidDeliveryLocation = useMemo(() => {
    if (!countryDetails) return false;
    if (locationDetails?.country_iso_code === countryDetails?.iso2) {
      const requiredFields =
        countryDetails?.fields?.serviceability_fields || [];
      return requiredFields.every((field) => field in locationDetails);
    }

    return false;
  }, [locationDetails, countryDetails]);

  const deliveryLocation = useMemo(() => {
    if (!countryDetails || !locationDetails) return [];
    return (
      countryDetails?.fields?.serviceability_fields?.reduce((acc, field) => {
        if (
          locationDetails?.country_iso_code === countryDetails?.iso2 &&
          locationDetails?.[field]
        ) {
          acc.push(locationDetails[field]);
        }
        return acc;
      }, []) || []
    );
  }, [locationDetails, countryDetails]);

  const deliveryLocationStr = useMemo(() => {
    return deliveryLocation.join(", ");
  }, [deliveryLocation]);

  const isServiceabilityPincodeOnly = useMemo(
    () =>
      countryDetails?.fields?.serviceability_fields?.length === 1 &&
      countryDetails?.fields?.serviceability_fields?.[0] === "pincode",
    [countryDetails]
  );

  function fetchCountrieDetails(payload, options = {}) {
    if (!payload.countryIsoCode) return;
    const { skipStoreUpdate = false } = options;
    return fpi.executeGQL(COUNTRY_DETAILS, payload).then((res) => {
      if (res?.data?.country && !skipStoreUpdate) {
        fpi.custom.setValue("countryDetails", res.data.country);
      }
      return res;
    });
  }

  function setI18nDetails({ iso, phoneCode, name }, currencyCode) {
    const newCurrency = currencyCode;

    const cookiesData = {
      currency: { code: newCurrency },
      country: {
        iso_code: iso,
        isd_code: phoneCode,
      },
      display_name: name,
      countryCode: iso,
    };
    fpi.setI18nDetails(cookiesData);
  }

  function fetchLocalities(payload) {
    return fpi.executeGQL(FETCH_LOCALITIES, payload).then((res) => {
      if (res?.data?.localities) {
        const data = res?.data?.localities;
        return data.items;
      }
    });
  }

  return {
    isLoading: !countryDetails,
    isInternational,
    i18nDetails,
    countryCurrencies,
    countryDetails,
    currentCountry,
    currentCurrency,
    countryAddressFieldMap,
    isValidDeliveryLocation,
    deliveryLocation,
    deliveryLocationStr,
    isServiceabilityPincodeOnly,
    fetchCountrieDetails,
    fetchLocalities,
    setI18nDetails,
  };
};

export default useInternational;
