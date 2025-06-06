import { useEffect, useRef, useState } from "react";
import { BRAND_LISTING } from "../../queries/brandsQuery";
import { useGlobalStore } from "fdk-core/utils";

const useBrandListing = (fpi) => {
  const THEME = useGlobalStore(fpi.getters.THEME);
  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;

  const BRANDLIST = useGlobalStore(fpi.getters.BRANDS);
  const { items: brands, page: pageData } = BRANDLIST;

  const [brandList, setBrandList] = useState(brands);
  const [isLoading, setIsLoading] = useState(false);
  const fetchBrands = (reset = false) => {
    try {
      setIsLoading(true);
      const values = {
        pageNo: pageData?.current + 1 ?? 1,
        pageSize: 12,
      };
      if (reset) values.pageNo = 1;
      fpi.executeGQL(BRAND_LISTING, values).then(({ data }) => {
        setIsLoading(false);
        setBrandList((preVal) => {
          return [
            ...(reset ? [] : (preVal ?? [])),
            ...(data?.brands?.items ?? []),
          ];
        });
      });
    } catch (error) {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (pageData?.current !== 1) {
      fetchBrands(true);
    }
  }, []);

  return {
    brands: brandList,
    isLoading,
    pageData,
    globalConfig,
    fetchBrands,
  };
};

export default useBrandListing;
