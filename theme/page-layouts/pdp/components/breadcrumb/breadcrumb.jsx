import React from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./breadcrumb.less";
import { useParams } from "react-router-dom";
import { useGlobalTranslation } from "fdk-core/utils";

function BreadCrumb({ productData, config, customClass }) {
  const { t } = useGlobalTranslation("translation");
  const { locale } = useParams();
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
    <div
      className={`${styles.breadcrumbs} captionNormal ${styles.breadcrumbWrap} ${customClass}`}
    >
      <span>
        <FDKLink to={"/"}>{t("resource.common.breadcrumb.home")}</FDKLink>&nbsp;/&nbsp;
      </span>
      {config?.show_products_breadcrumb?.value && (
        <span>
          <FDKLink to={"/products"}>
            {t("resource.common.breadcrumb.products")}
          </FDKLink>
          &nbsp;/&nbsp;
        </span>
      )}
      {config?.show_category_breadcrumb?.value && getCategory().name && (
        <span>
          <FDKLink
            to={getCategory().url}
          >
            {getCategory().name}
          </FDKLink>
          &nbsp;/&nbsp;
        </span>
      )}
      {config?.show_brand_breadcrumb?.value && getBrand().name && (
        <span>
          <FDKLink action={getBrand().action}>
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
