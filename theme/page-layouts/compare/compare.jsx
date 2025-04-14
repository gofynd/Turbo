import React from "react";
import useCompare from "./useCompare";
import styles from "./compare.less";
import Compare from "@gofynd/theme-template/page-layouts/compare/compare";
import "@gofynd/theme-template/page-layouts/compare/compare.css";
import { PRODUCT_COMPARISON } from "../../queries/compareQuery";

function CompareProducts({ fpi }) {
  const compareProps = useCompare(fpi);

  return (
    <div
      className={`${styles.compare} basePageContainer margin0auto ${styles.fontBody}`}
    >
      <Compare {...compareProps} />
    </div>
  );
}

 const getCategoryUrl = (action) => {
    let url = `/${action?.page?.type}`;
    const { key, value } = getCategoryKeyValue(action);
    url = `${url}?${key}=${value?.join?.(`&${key}=`)}`;
    return url;
  };

 const getCategoryKeyValue = (action) => {
    const key = Object.keys(action?.page?.query)?.[0];
    const value = action?.page?.query[key];
    return { key, value, firstValue: value?.[0] ?? "" };
  };
CompareProducts.serverFetch = async ({ router, fpi }) => {
  try {
    if (router?.filterQuery?.id?.length !== 0) {
      const res = await fpi.executeGQL(PRODUCT_COMPARISON, {
        slug: router?.filterQuery?.id,
      });

      const items = res?.data?.productComparison?.items;
      const productItems = items ?? [];
      if (res?.data?.productComparison) {
          let items = res?.data?.productComparison?.items;
          const firstCategory = items[0]?.categories?.[0];
          let categoryDetails = {};

          if (Object.keys(firstCategory || {}).length) {
            categoryDetails = {
              url: getCategoryUrl(firstCategory?.action),
              name: firstCategory?.name,
              keyValue: getCategoryKeyValue(firstCategory?.action),
            };
          }
          fpi.custom.setValue("compare_category_details", categoryDetails);
        }
    
      fpi.custom.setValue("compare_product_data", productItems);
      fpi.custom.setValue(
        "compare_product_attribute",
        res?.data?.productComparison?.attributes_metadata
      );
      if (productItems?.length !== 0) {
        fpi.custom.setValue("isCompareSsrFetched", true);
      }
    }
  } catch (error) {
    fpi.custom.setValue("error_compare", error);
  }
};

export default CompareProducts;
