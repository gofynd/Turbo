import { getPageSlug } from "fdk-core/utils";
import {
  GLOBAL_DATA,
  THEME_DATA,
  USER_DATA_QUERY,
  INTERNATIONAL,
} from "../queries/libQuery";

export async function globalDataResolver({ fpi, applicationID }) {
  try {
    const response = await fpi.executeGQL(GLOBAL_DATA);
    const defaultCurrency =
      response?.data?.applicationConfiguration?.app_currencies
        ?.default_currency;
    const isInternational =
      !!response?.data?.applicationConfiguration?.features?.common
        ?.international_shipping?.enabled;

    let countryCurrencies =
      response?.data?.applicationConfiguration?.country_currencies || [];

    if (defaultCurrency?.code) {
      fpi.custom.setValue("defaultCurrency", defaultCurrency.code);
    }
    if (isInternational) {
      const { data } = await fpi.executeGQL(INTERNATIONAL);

      const countries = data?.allCountries?.results || [];
      fpi.custom.setValue("countries", countries);

      fpi.custom.setValue(
        "currencies",
        data?.applicationConfiguration?.app_currencies?.supported_currency || []
      );

      if (!countries.length) {
        response.data.applicationConfiguration.country_currencies =
          countryCurrencies;
      } else {
        const countrySet = new Set(
          countries.map((c) => c?.meta?.country_code).filter(Boolean)
        );

        countryCurrencies = countryCurrencies.filter((cc) =>
          countrySet.has(cc?.iso2)
        );

        response.data.applicationConfiguration.country_currencies =
          countryCurrencies;
      }
    }

    fpi.custom.setValue("countryCurrencies", countryCurrencies);
    return response;
  } catch (error) {
    fpi.custom.setValue("globalDataResolverError", error);
    return null;
  }
}

export async function pageDataResolver({ fpi, router, themeId }) {
  const state = fpi.store.getState();
  const pageValue = getPageSlug(router);
  if (!state?.auth?.user_data?.user_id) {
    fpi.executeGQL(USER_DATA_QUERY);
  }
  const APIs = [];
  const currentPageInStore = fpi.getters.PAGE(state)?.value ?? null;
  const query = router?.filterQuery;
  const isEdit = query?.isEdit;
  const filters = !(isEdit === true || isEdit === "true"); //filters will be off (false) for blitz if isEdit = true

  if (typeof state.custom?.isEdit === "undefined" || filters === false) {
    fpi.custom.setValue("isEdit", !filters); //store will save opposite of filter means orignal value of isEdit
  }
  const sectionPreviewHash = query?.sectionPreviewHash || "";
  const company = parseInt(fpi.getters.THEME(state)?.company_id, 10);
  const updatedState = fpi.store.getState();
  if (pageValue && pageValue !== currentPageInStore) {
    // Extract URL parameters for dynamic variables
    let urlParams = {};

    // Add path parameters (from router.params)
    if (router?.params && typeof router.params === "object") {
      Object.keys(router.params).forEach((key) => {
        urlParams[key] = router.params[key];
      });
    }
    // Add query parameters (from router.filterQuery)
    if (router?.filterQuery && typeof router.filterQuery === "object") {
      Object.keys(router.filterQuery).forEach((key) => {
        // Skip internal query params
        if (
          !key.startsWith("__") &&
          key !== "isEdit" &&
          key !== "sectionPreviewHash" &&
          key !== "urlParams"
        ) {
          urlParams[key] = router.filterQuery[key];
        }
      });
    }
    urlParams = JSON.stringify(urlParams);
    const values = {
      themeId,
      pageValue,
      filters: !updatedState.custom?.isEdit, //filters will be propogated with opposite of stored value od
      sectionPreviewHash,
      company,
      urlParams, // Pass URL parameters to GraphQL query
    };

    APIs.push(fpi.executeGQL(THEME_DATA, values));
  }
  return Promise.all(APIs);
}
