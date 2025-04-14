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
import { useFPI } from "fdk-core/utils";

export function Component({ props = {}, globalConfig = {}, blocks = [] }) {
  const fpi = useFPI();

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
    return <EmptyState title="No collection found" />;
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
              <FDKLink to="/">Home</FDKLink>&nbsp; / &nbsp;
            </span>
            <span className={styles.active}>Collections</span>
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
  label: "All Collections",
  props: [
    {
      type: "text",
      id: "title",
      default: "",
      info: "Set the heading text for the collections page",
      label: "Heading",
    },
    {
      type: "textarea",
      id: "description",
      default: "",
      info: "Add a description for the collections page",
      label: "Description",
    },
    {
      type: "checkbox",
      id: "back_top",
      label: "Back to Top button",
      info: "Enable a 'Back to Top' button to help users quickly return to the top of the page",
      default: true,
    },
    {
      type: "checkbox",
      id: "img_fill",
      default: false,
      label: "Fit image to the container",
      info: "If the image aspect ratio is different from the container, the image will be clipped to fit the container. The aspect ratio of the image will be maintained",
    },
  ],
};

Component.serverFetch = async ({ fpi, props }) => {
  try {
    const payload = {
      pageNo: 1,
      pageSize: 12,
    };
    await fpi.executeGQL(COLLECTIONS, payload).then((res) => {
      return res;
    });
  } catch (err) {
    console.log(err);
  }
};

export default Component;
