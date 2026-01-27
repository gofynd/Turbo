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

  const { countryCurrencies, countryDetails } = customValues ?? {};

  const { isInternational } = useThemeFeature({ fpi });

  const currentCountry = useMemo(() => {
    return countryCurrencies?.find(
      (country) => country.iso2 === i18nDetails?.countryCode
    );
  }, [countryCurrencies, i18nDetails?.countryCode]);

  const currentCurrency = useMemo(() => {
    if (!currentCountry?.currencies?.length) return null;
    return currentCountry.currencies?.find(
      (data) => data?.code === i18nDetails?.currency?.code
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
