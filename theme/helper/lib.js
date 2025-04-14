import { getPageSlug } from "fdk-core/utils";
import {
  GLOBAL_DATA,
  THEME_DATA,
  USER_DATA_QUERY,
  INTERNATIONAL,
} from "../queries/libQuery";

export async function globalDataResolver({ fpi, applicationID }) {
  // TODO
  try{
    const response = await fpi.executeGQL(GLOBAL_DATA);
  const defaultCurrency =
    response?.data?.applicationConfiguration?.app_currencies?.default_currency;
  const isInternational =
    !!response?.data?.applicationConfiguration?.features?.common
      ?.international_shipping?.enabled;
  if (defaultCurrency?.code) {
    fpi.custom.setValue("defaultCurrency", defaultCurrency.code);
  }
  if (isInternational) {
    const { data } = await fpi.executeGQL(INTERNATIONAL);
    fpi.custom.setValue("countries", data?.allCountries?.results || []);
    fpi.custom.setValue(
      "currencies",
      data?.applicationConfiguration?.app_currencies?.supported_currency || []
    );
  }
  return response;
  }
  catch(error){
    fpi.custom.setValue("globalDataResolverError", error);
    console.error("globalDataResolverError:", error);
    return null;
  }
  
}

export async function pageDataResolver({ fpi, router, themeId }) {
  const state = fpi.store.getState();
  const pageValue = getPageSlug(router);
  fpi.executeGQL(USER_DATA_QUERY);
  const APIs = [];
  const currentPageInStore = fpi.getters.PAGE(state)?.value ?? null;
  const query = router?.filterQuery;
  const filters = !query.isEdit || query.isEdit.toString() !== "true";
  const sectionPreviewHash = router.filterQuery?.sectionPreviewHash || "";
  const company = fpi.getters.THEME(state)?.company_id;
  if (pageValue && pageValue !== currentPageInStore) {
    const values = {
      themeId,
      pageValue,
      filters,
      sectionPreviewHash,
      company,
    };

    APIs.push(fpi.executeGQL(THEME_DATA, values));
  }
  return Promise.all(APIs);
}
