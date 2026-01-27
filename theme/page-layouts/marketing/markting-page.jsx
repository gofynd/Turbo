import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { HTMLContent } from "./marketingHTMLContent";
import { GET_PAGE } from "../../queries/marketingQuery";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { getHelmet } from "../../providers/global-provider";
import EmptyState from "../../components/empty-state/empty-state";
import styles from "./marketing-page.less";
import useSeoMeta from "../../helper/hooks/useSeoMeta";
import { sanitizeHTMLTag } from "../../helper/utils";

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
  const { brandName, canonicalUrl, pageUrl, description: seoDescription, socialImage } =
    useSeoMeta({ fpi, seo });

  const title = useMemo(() => {
    const raw = sanitizeHTMLTag(seo?.title || slug || pageSlug || "");
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seo?.title, slug, pageSlug, brandName]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(seo?.description || "");
    const normalized = raw.replace(/\s+/g, " ").trim();
    return normalized || seoDescription;
  }, [seo?.description, seoDescription]);

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
      {getHelmet({
        title,
        description,
        image: socialImage,
        canonicalUrl,
        url: pageUrl,
        siteName: brandName,
        ogType: "website",
      })}
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
