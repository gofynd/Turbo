import React, { useState, useEffect } from "react";
import { FDKLink } from "fdk-core/components";
import { useFPI, useGlobalTranslation } from "fdk-core/utils";
import styles from "../styles/brands.less";
import useBrandListing from "../page-layouts/brands/useBrandListing";
import CardList from "../components/card-list/card-list";
import InfiniteLoader from "../components/infinite-loader/infinite-loader";
import ScrollToTop from "../components/scroll-to-top/scroll-to-top";
import { getConfigFromProps } from "../helper/utils";
import EmptyState from "../components/empty-state/empty-state";
import { BRAND_LISTING } from "../queries/brandsQuery";

export function Component({ props }) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");

  const { brands, isLoading, pageData, fetchBrands, globalConfig } =
    useBrandListing(fpi);

  const pageConfig = getConfigFromProps(props);

  const { title, description, infinite_scroll, logo_only, back_top, img_fill } =
    pageConfig ?? {};

  if (!isLoading && Boolean(brands) && !brands?.length) {
    return <EmptyState title={t("resource.brand.no_brand_found")} />;
  }
  return (
    <div className={`${styles.brands} basePageContainer margin0auto fontBody`}>
      <div className={`${styles.brands__breadcrumbs} captionNormal`}>
        <span>
          <FDKLink to="/">{t("resource.common.breadcrumb.home")}</FDKLink>&nbsp;
          / &nbsp;
        </span>
        <span className={styles.active}>
          {t("resource.common.breadcrumb.brands")}
        </span>
      </div>
      <div>
        {title && (
          <h1 className={`${styles.brands__title} fontHeader`}>{title}</h1>
        )}
        {description && (
          <div className={styles.brands__description}>
            <p>{description}</p>
          </div>
        )}
        <div className={styles.brands__cards}>
          <InfiniteLoader
            isLoading={isLoading}
            infiniteLoaderEnabled={infinite_scroll}
            hasNext={pageData?.has_next}
            loadMore={fetchBrands}
          >
            <CardList
              cardList={brands || []}
              cardType="BRANDS"
              showOnlyLogo={!!logo_only}
              globalConfig={globalConfig}
              isImageFill={img_fill}
            />
          </InfiniteLoader>
          {pageData?.has_next && !infinite_scroll && (
            <div className={`${styles.viewMoreBtnWrapper} flex-center`}>
              <button
                onClick={() => fetchBrands()}
                className={`${styles.viewMoreBtn} btn-secondary`}
              >
                {t("resource.facets.view_more")}
              </button>
            </div>
          )}
        </div>
      </div>
      {!!back_top && <ScrollToTop />}
    </div>
  );
}

export const settings = {
  label: "t:resource.sections.brand_landing.brands_landing",
  props: [
    {
      type: "checkbox",
      id: "infinite_scroll",
      label: "t:resource.common.infinity_scroll",
      default: true,
      info: "t:resource.common.infinite_scroll_info",
    },
    {
      type: "checkbox",
      id: "back_top",
      label: "t:resource.common.back_to_top",
      default: true,
      info: "t:resource.sections.brand_landing.back_to_top_info",
    },
    {
      type: "checkbox",
      id: "logo_only",
      default: false,
      label: "t:resource.sections.brand_listing.only_logo",
      info: "t:resource.sections.brand_landing.only_logo_info",
    },
    {
      type: "checkbox",
      id: "img_fill",
      default: false,
      label: "t:resource.common.fit_image_to_container",
      info: "t:resource.common.clip_image_to_fit_container",
    },
    {
      type: "text",
      id: "title",
      default: "",
      label: "t:resource.common.heading",
      info: "t:resource.sections.brand_landing.heading_info",
    },
    {
      type: "textarea",
      id: "description",
      default: "",
      label: "t:resource.common.description",
      info: "t:resource.sections.brand_landing.description_info",
    },
  ],
};

Component.serverFetch = async ({ fpi }) => {
  try {
    const values = {
      pageNo: 1,
      pageSize: 20,
    };
    await fpi.executeGQL(BRAND_LISTING, values).then((res) => {
      return res;
    });
  } catch (error) {
    console.log(error);
  }
};

export default Component;
