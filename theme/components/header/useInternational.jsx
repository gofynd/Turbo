import { useMemo } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { COUNTRY_DETAILS, FETCH_LOCALITIES } from "../../queries/internationlQuery";
import { useThemeFeature } from "../../helper/hooks";
import { isRunningOnClient } from "../../helper/utils";


const useInternational = ({ fpi }) => {
  const customValues = isRunningOnClient() ? useGlobalStore(fpi?.getters?.CUSTOM_VALUE) : {};
  const locationDetails = isRunningOnClient() ? useGlobalStore(fpi?.getters?.LOCATION_DETAILS) : {};
  const i18nDetails = isRunningOnClient() ? useGlobalStore(fpi?.getters?.i18N_DETAILS) : {};

  const {
    countries,
    currencies,
    defaultCurrency: defaultCurrencyCode,
    countryDetails,
  } = customValues ?? {};

  const { isInternational } = useThemeFeature({ fpi });

  const currentCountry = useMemo(() => {
    return countries?.find(
      (country) => country.meta.country_code === i18nDetails?.countryCode
    );
  }, [countries, i18nDetails?.countryCode]);

  const currentCurrency = useMemo(() => {
    if (!i18nDetails?.currency?.code) {
      return currencies?.find((data) => data?.code === defaultCurrencyCode);
    }
    return currencies?.find(
      (data) => data?.code === i18nDetails?.currency?.code
    );
  }, [currencies, i18nDetails?.currency?.code, defaultCurrencyCode]);

  const defaultCurrency = useMemo(() => {
    return currencies?.find((data) => data?.code === defaultCurrencyCode);
  }, [currencies, defaultCurrencyCode]);

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

  function setI18nDetails({ iso, phoneCode, name, currency }, currencyCode) {
    let newCurrency = currencyCode;
    if (!newCurrency) {
      const countryCurrency = currencies?.find(
        (data) => data?.code === currency
      );
      newCurrency = countryCurrency?.code ?? defaultCurrencyCode;
    }
    const cookiesData = {
      ...i18nDetails,
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
        return res?.data?.localities.items;
      }
    });
  }

  return {
    isInternational,
    i18nDetails,
    countries,
    currencies,
    defaultCurrency,
    countryDetails,
    currentCountry,
    currentCurrency,
    countryAddressFieldMap,
    isValidDeliveryLocation,
    deliveryLocation,
    isServiceabilityPincodeOnly,
    fetchCountrieDetails,
    fetchLocalities,
    setI18nDetails,
  };
};

export default useInternational;
