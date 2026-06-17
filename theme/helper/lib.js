import { getPageSlug } from "fdk-core/utils";
import {
  GLOBAL_DATA,
  THEME_DATA,
  USER_DATA_QUERY,
  INTERNATIONAL,
} from "../queries/libQuery";

// Module-level flag to prevent redundant USER_DATA_QUERY calls across SPA navigations.
// Resets on full page reload (login/logout) since the JS module re-evaluates.
let userDataQueryFired = false;

// Prefetch flag to ensure theme page prefetching runs only once per session.
let prefetchTriggered = false;
const PREFETCH_PAGE_VALUES = ["product-listing", "collection-listing"];

// Captured from pageDataResolver so refreshCurrentPageTheme can build a valid
// THEME_DATA payload without callers having to source themeId.
let activeThemeId = null;
// Monotonic token to drop stale Theme refreshes when the user changes location
// faster than the network can respond.
let latestRefreshToken = 0;

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

function prefetchThemePages({ fpi, themeId }) {
  if (prefetchTriggered || typeof window === "undefined") return;
  prefetchTriggered = true;

  const state = fpi.store.getState();
  const company = parseInt(fpi.getters.THEME(state)?.company_id, 10);
  const isEdit = !!state.custom?.isEdit;

  if (isEdit) return;

  const allPages = state.theme?.allPages || {};
  const pagesToFetch = PREFETCH_PAGE_VALUES.filter((pv) => !allPages[pv]);

  if (!pagesToFetch.length) return;

  const schedule =
    typeof requestIdleCallback === "function"
      ? requestIdleCallback
      : (cb) => setTimeout(cb, 2000);

  schedule(() => {
    // Fetch all pages concurrently using fpi.executeGQL with skipStoreUpdate
    // to reuse auth headers without overwriting the active page (state.page).
    Promise.all(
      pagesToFetch.map((pageValue) =>
        fpi
          .executeGQL(
            THEME_DATA,
            {
              themeId,
              pageValue,
              filters: true,
              sectionPreviewHash: "",
              company,
              urlParams: "{}",
            },
            { skipStoreUpdate: true }
          )
          .then((res) => ({
            pageValue,
            pageDetail: res?.data?.theme?.theme_page_detail,
          }))
          .catch(() => null)
      )
    ).then((results) => {
      const merged = {};
      results.forEach((r) => {
        if (r?.pageDetail) merged[r.pageValue] = r.pageDetail;
      });
      if (Object.keys(merged).length) {
        // Re-read allPages at dispatch time to avoid overwriting entries
        // that were added by real navigations during the prefetch window.
        const latestAllPages = fpi.store.getState().theme?.allPages || {};
        const newAllPages = { ...latestAllPages };
        Object.keys(merged).forEach((pv) => {
          if (!latestAllPages[pv]) {
            newAllPages[pv] = merged[pv];
          }
        });
        fpi.store.dispatch({
          type: "theme/setData",
          payload: { allPages: newAllPages },
        });
      }
    });
  });
}

export async function pageDataResolver({ fpi, router, themeId }) {
  activeThemeId = themeId;
  const state = fpi.store.getState();
  const pageValue = getPageSlug(router);
  if (!state?.auth?.user_data?.user_id && !userDataQueryFired) {
    if (typeof window !== "undefined") {
      userDataQueryFired = true;
    }
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

    // Try to use cached page data from allPages to avoid redundant API calls
    let usedCache = false;
    try {
      const allPages = state.theme?.allPages || {};
      const cachedPage = allPages[pageValue];
      if (cachedPage && filters && !sectionPreviewHash) {
        const clonedPage = structuredClone(cachedPage);
        fpi.store.dispatch({
          type: "theme/setthemePageDetail",
          payload: clonedPage,
        });
        usedCache = true;
      }
    } catch {
      // Fallback: ignore cache errors, proceed with API call
    }

    if (!usedCache) {
      APIs.push(fpi.executeGQL(THEME_DATA, values));
    }
  }
  // Prefetch frequently visited pages in the background after initial page load
  prefetchThemePages({ fpi, themeId });

  return Promise.all(APIs);
}

export async function refreshCurrentPageTheme({ fpi, router }) {
  if (typeof window === "undefined") return;
  if (!fpi || !router) return;
  if (!activeThemeId) return;

  try {
    const state = fpi.store.getState();
    // Source of truth for current page is the FPI store (matches what
    // pageDataResolver reads as currentPageInStore). getPageSlug(router) is a
    // fallback for router shapes we cannot construct from react-router alone.
    const pageValue =
      fpi.getters.PAGE(state)?.value || getPageSlug(router) || null;
    if (!pageValue) return;
    const isEdit = state?.custom?.isEdit;
    const filters = !isEdit;
    const sectionPreviewHash = router?.filterQuery?.sectionPreviewHash || "";
    const company = parseInt(fpi.getters.THEME(state)?.company_id, 10);

    const urlParamsObj = {};
    if (router?.params && typeof router.params === "object") {
      Object.keys(router.params).forEach((key) => {
        urlParamsObj[key] = router.params[key];
      });
    }
    if (router?.filterQuery && typeof router.filterQuery === "object") {
      Object.keys(router.filterQuery).forEach((key) => {
        if (
          !key.startsWith("__") &&
          key !== "isEdit" &&
          key !== "sectionPreviewHash" &&
          key !== "urlParams"
        ) {
          urlParamsObj[key] = router.filterQuery[key];
        }
      });
    }
    const urlParams = JSON.stringify(urlParamsObj);

    latestRefreshToken += 1;
    const myToken = latestRefreshToken;

    const response = await fpi.executeGQL(THEME_DATA, {
      themeId: activeThemeId,
      pageValue,
      filters,
      sectionPreviewHash,
      company,
      urlParams,
    });

    if (myToken !== latestRefreshToken) return;

    const pageDetail = response?.data?.theme?.theme_page_detail;
    if (pageDetail) {
      const currentAllPages = fpi.store.getState().theme?.allPages || {};
      fpi.store.dispatch({
        type: "theme/setData",
        payload: {
          allPages: { ...currentAllPages, [pageValue]: pageDetail },
        },
      });
    }
  } catch (error) {
    try {
      fpi.custom?.setValue?.("refreshCurrentPageThemeError", error);
    } catch (_) {
      // ignore secondary failures from the error reporter itself
    }
    // eslint-disable-next-line no-console
    console.error("refreshCurrentPageTheme failed", error);
  }
}
