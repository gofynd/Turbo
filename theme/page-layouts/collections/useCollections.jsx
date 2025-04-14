import { useEffect, useState } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { COLLECTIONS } from "../../queries/collectionsQuery";
// import { useLocation, useNavigate, createSearchParams } from "react-router-dom";

// let isProductListingMounted = false;

const useCollections = (fpi) => {
  const THEME = useGlobalStore(fpi.getters.THEME);
  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const pageConfig =
    mode?.page?.find((f) => f.page === "collections")?.settings?.props || {};
  // TODO need to confirm the collection list getters
  const COLLECTIONLIST = useGlobalStore(fpi.getters.COLLECTIONS);
  const { items: collections } = COLLECTIONLIST;
  const [collectionList, setCollections] = useState(collections);
  const [pageData, setPageData] = useState(COLLECTIONLIST?.page ?? {});
  const [isLoading, setIsLoading] = useState(false);

  const fetchCollection = (reset) => {
    try {
      setIsLoading(true);
      const values = {
        pageNo: pageData?.current + 1 ?? 1,
        pageSize: 12,
      };
      if (reset) values.pageNo = 1;
      fpi.executeGQL(COLLECTIONS, values).then(({ data }) => {
        setIsLoading(false);
        setPageData(data?.collections?.page);
        const activeCollections =
          data?.collections?.items?.filter((m) => m.is_active) ?? [];
        setCollections((preVal) => {
          return [...(reset ? [] : (preVal ?? [])), ...activeCollections];
        });
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pageData?.current !== 1) {
      fetchCollection(true);
    }
  }, []);

  return {
    collections: collectionList || collections,
    pageData,
    pageConfig,
    globalConfig,
    isLoading,
    fetchCollection,
  };
};

export default useCollections;
