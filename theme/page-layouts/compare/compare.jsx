import React, { useState, useEffect, Suspense } from "react";
import useCompare from "./useCompare";
import styles from "./compare.less";
import Compare from "@gofynd/theme-template/page-layouts/compare/compare";
import "@gofynd/theme-template/page-layouts/compare/compare.css";
import { PRODUCT_COMPARISON } from "../../queries/compareQuery";
import ScrollToTop from "../../components/scroll-to-top/scroll-to-top";
import useAddToCartModal from "../plp/useAddToCartModal";
import { useThemeConfig } from "../../helper/hooks";
const AddToCart = React.lazy(
  () =>
    import(
      "@gofynd/theme-template/page-layouts/plp/Components/add-to-cart/add-to-cart"
    )
);
const Modal = React.lazy(
  () => import("@gofynd/theme-template/components/core/modal/modal")
);

function CompareProducts({ fpi }) {
  const compareProps = useCompare(fpi);
  const { globalConfig } = useThemeConfig({ fpi });
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window?.innerWidth;
      setIsTablet(width >= 768 && width <= 1024);
    };
    handleResize();
    window?.addEventListener("resize", handleResize);
    return () => {
      window?.removeEventListener("resize", handleResize);
    };
  }, []);

  const addToCartConfigs = {
    mandatory_pincode: false,
    hide_single_size: false,
    preselect_size: false,
  };

  const addToCartModalProps = useAddToCartModal({
    fpi,
    pageConfig: addToCartConfigs,
  });

  const {
    handleAddToCart,
    isOpen: isAddToCartOpen,
    showSizeGuide,
    handleCloseSizeGuide,
    ...restAddToModalProps
  } = addToCartModalProps;

  return (
    <div
      className={`${styles.compare} basePageContainer margin0auto ${styles.fontBody}`}
    >
      <Compare {...compareProps} handleAddToCart={handleAddToCart} />
      <ScrollToTop />
      {isAddToCartOpen && (
        <Suspense fallback={<div />}>
          <Modal
            isOpen={isAddToCartOpen}
            hideHeader={!isTablet}
            bodyClassName={styles.addToCartBody}
            closeDialog={restAddToModalProps?.handleClose}
            containerClassName={styles.addToCartContainer}
          >
            <AddToCart {...restAddToModalProps} globalConfig={globalConfig} />
          </Modal>
        </Suspense>
      )}
      {showSizeGuide && (
        <Suspense fallback={<div />}>
          <SizeGuide
            isOpen={showSizeGuide}
            onCloseDialog={handleCloseSizeGuide}
            productMeta={restAddToModalProps?.productData?.product?.sizes}
          />
        </Suspense>
      )}
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
