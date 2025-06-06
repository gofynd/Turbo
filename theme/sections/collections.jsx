import React, { useEffect, useState } from "react";

import { FDKLink } from "fdk-core/components";
import Loader from "../components/loader/loader";
import styles from "../styles/collections.less";
import CardList from "../components/card-list/card-list";
import useCollections from "../page-layouts/collections/useCollections";
import { detectMobileWidth } from "../helper/utils";
import EmptyState from "../components/empty-state/empty-state";
import InfiniteLoader from "../components/infinite-loader/infinite-loader";
import ScrollToTop from "../components/scroll-to-top/scroll-to-top";
import { COLLECTIONS } from "../queries/collectionsQuery";
import { useFPI, useGlobalTranslation } from "fdk-core/utils";

export function Component({ props = {}, globalConfig = {}, blocks = [] }) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");

  const { collections, isLoading, pageData, fetchCollection } =
    useCollections(fpi);

  const { title, description, back_top, img_fill } = Object.fromEntries(
    Object.entries(props).map(([key, obj]) => [key, obj.value])
  );

  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(detectMobileWidth());
  }, []);

  if (!isLoading && !collections?.length) {
    return <EmptyState title={t("resource.collections.empty_state")} />;
  }

  const showBackToTop = typeof back_top === "boolean" ? back_top : true;

  return (
    <div
      className={`${styles.collections} basePageContainer margin0auto fontBody`}
    >
      {isLoading && !collections?.length ? (
        <Loader />
      ) : (
        <>
          <div className={`${styles.collections__breadcrumbs} captionNormal`}>
            <span>
              <FDKLink to="/">{t("resource.common.breadcrumb.home")}</FDKLink>&nbsp; / &nbsp;
            </span>
            <span className={styles.active}>{t("resource.common.breadcrumb.collections")}</span>
          </div>
          <div>
            {title && (
              <h1 className={`${styles.collections__title} fontHeader`}>
                {title}
              </h1>
            )}
            {description && (
              <div
                className={`${styles.collections__description} ${isMobile ? styles.b2 : styles.b1}`}
              >
                <p>{description}</p>
              </div>
            )}
            <div className={styles.collections__cards}>
              <InfiniteLoader
                isLoading={isLoading}
                infiniteLoaderEnabled={true}
                hasNext={pageData?.has_next}
                loadMore={fetchCollection}
              >
                <CardList
                  cardList={collections}
                  cardType="COLLECTIONS"
                  showOnlyLogo={false}
                  isImageFill={img_fill}
                  globalConfig={globalConfig}
                />
              </InfiniteLoader>
            </div>
          </div>
          {showBackToTop && <ScrollToTop />}
        </>
      )}
    </div>
  );
}

export const settings = {
  label: "t:resource.sections.collections_listing.all_collections",
  props: [
    {
      type: "text",
      id: "title",
      default: "",
      info: "t:resource.sections.collections_listing.heading_info",
      label: "t:resource.common.heading",
    },
    {
      type: "textarea",
      id: "description",
      default: "",
      info: "t:resource.sections.collections_listing.description_info",
      label: "t:resource.common.description",
    },
    {
      type: "checkbox",
      id: "back_top",
      label: "t:resource.sections.categories.back_top",
      info: "t:resource.sections.brand_landing.back_to_top_info",
      default: true,
    },
    {
      type: "checkbox",
      id: "img_fill",
      default: false,
      label: "t:resource.common.fit_image_to_container",
      info: "t:resource.common.clip_image_to_fit_container",
    },
  ],
};

Component.serverFetch = async ({ fpi, props }) => {
  try {
    const payload = {
      pageNo: 1,
      pageSize: 20,
    };
    await fpi.executeGQL(COLLECTIONS, payload).then((res) => {
      return res;
    });
  } catch (err) {
    console.log(err);
  }
};

export default Component;
