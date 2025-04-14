import React from "react";
import { FDKLink } from "fdk-core/components";
import { convertActionToUrl } from "@gofynd/fdk-client-javascript/sdk/common/Utility";
import styles from "./breadcrumb.less";

function BreadCrumb({ productData, config, customClass }) {
  const getBrand = () => productData?.brand || {};

  const getCategory = () => {
    const category = productData?.categories?.[0] || {};
    const updatedCategory = {};
    const categorySlug = category?.action?.page?.query?.category?.[0] || "";
    updatedCategory.name = category.name || "";
    updatedCategory.url = categorySlug && `/products/?category=${categorySlug}`;

    return updatedCategory;
  };

  return (
    <div className={`${styles.breadcrumbs} captionNormal ${customClass}`}>
      <span>
        <FDKLink to="/">Home</FDKLink>&nbsp;/&nbsp;
      </span>
      {config?.show_products_breadcrumb?.value && (
        <span>
          <FDKLink to="/products">Products</FDKLink>&nbsp;/&nbsp;
        </span>
      )}
      {config?.show_category_breadcrumb?.value && getCategory().name && (
        <span>
          <FDKLink to={getCategory().url}>{getCategory().name}</FDKLink>
          &nbsp;/&nbsp;
        </span>
      )}
      {config?.show_brand_breadcrumb?.value && getBrand().name && (
        <span>
          <FDKLink to={convertActionToUrl(getBrand().action)}>
            {getBrand().name}
          </FDKLink>
          &nbsp;/&nbsp;
        </span>
      )}
      {productData?.name && (
        <span className={styles.active}>{productData?.name}</span>
      )}
    </div>
  );
}

export default BreadCrumb;
