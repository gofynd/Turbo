import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { HTMLContent } from "./marketingHTMLContent";
import { GET_PAGE } from "../../queries/marketingQuery";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { getHelmet } from "../../providers/global-provider";
import EmptyState from "../../components/empty-state/empty-state";
import styles from "./marketing-page.less";

function MarketingPage({ fpi, defaultSlug }) {
  const { t } = useGlobalTranslation("translation");
  let { slug } = useParams();
  if (defaultSlug) slug = defaultSlug;
  const containerRef = useRef(null);
  const customPage = useGlobalStore(fpi.getters.CUSTOM_PAGE) || {};
  const [pageNotFound, setPageNotFound] = useState(false);
  const {
    content = [],
    type,
    seo = {},
    published,
    slug: pageSlug,
  } = customPage || {};

  useEffect(() => {
    if (!slug || slug === pageSlug) return;
    fpi
      .executeGQL(GET_PAGE, { slug })
      .then(({ errors }) => {
        if (errors) {
          setPageNotFound(true);
          return;
        }
      })
      .catch(() => {
        setPageNotFound(true);
      });
  }, [slug]);

  const renderContent = useMemo(() => {
    const renderData = content?.find((item) => item?.type === type);
    if (!!renderData?.value && ["html", "rawhtml", "markdown"].includes(type)) {
      return (
        <HTMLContent ref={containerRef} key={type} content={renderData.value} />
      );
    }

    if (!!renderData?.value && type === "css") {
      return (
        <style data-testid="cssStyle" key={type}>
          {renderData.value}
        </style>
      );
    }
    return null;
  }, [content, type]);

  if (pageNotFound || !published) {
    return <EmptyState title={t("resource.common.page_not_found")} />;
  }

  return (
    <>
      {getHelmet({ seo })}
      <div
        id={`custom-page-${slug}`}
        className={`${styles.marketingPage} basePageContainer margin0auto`}
      >
        {renderContent}
      </div>
    </>
  );
}

MarketingPage.serverFetch = async ({ router, fpi, id }) => {
  const { slug } = router?.params ?? {};
  const pageResponse = await fpi.executeGQL(GET_PAGE, { slug });
  return pageResponse;
};
export default MarketingPage;
