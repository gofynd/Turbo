import React, { useState, useEffect } from "react";
import { FDKLink } from "fdk-core/components";
import { useFPI } from "fdk-core/utils";
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

  const { brands, isLoading, pageData, fetchBrands, globalConfig } =
    useBrandListing(fpi);

  const pageConfig = getConfigFromProps(props);

  const { title, description, infinite_scroll, logo_only, back_top } =
    pageConfig ?? {};

  if (!isLoading && Boolean(brands) && !brands?.length) {
    return <EmptyState title="No brand found" />;
  }

  return (
    <div className={`${styles.brands} basePageContainer margin0auto fontBody`}>
      <div className={`${styles.brands__breadcrumbs} captionNormal`}>
        <span>
          <FDKLink to="/">Home</FDKLink>&nbsp; / &nbsp;
        </span>
        <span className={styles.active}>Brands</span>
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
            />
          </InfiniteLoader>
          {pageData?.has_next && !infinite_scroll && (
            <div className={`${styles.viewMoreBtnWrapper} flex-center`}>
              <button
                onClick={() => fetchBrands()}
                className={`${styles.viewMoreBtn} btn-secondary`}
              >
                View More
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
  label: "Brands Landing",
  props: [
    {
      type: "checkbox",
      id: "infinite_scroll",
      label: "Infinity Scroll",
      default: true,
      info: "If it is enabled, view more button will not be shown, only on scroll products will be displayed",
    },
    {
      type: "checkbox",
      id: "back_top",
      label: "Back to top",
      default: true,
      info: "Enable a 'Back to Top' button to help users quickly return to the top of the page.",
    },
    {
      type: "checkbox",
      id: "logo_only",
      default: false,
      label: "Only Logo",
      info: "Display only brand logos.",
    },
    {
      type: "text",
      id: "title",
      default: "",
      label: "Heading",
      info: "Set the heading text for the brands page.",
    },
    {
      type: "textarea",
      id: "description",
      default: "",
      label: "Description",
      info: "Add a description for the brands page",
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
