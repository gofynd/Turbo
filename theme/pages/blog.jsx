import React, { useMemo } from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { getHelmet } from "../providers/global-provider";
import { sanitizeHTMLTag } from "../helper/utils";
import useSeoMeta from "../helper/hooks/useSeoMeta";

function Blog({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};
  const seoData = page?.seo || {};
  const { brandName, canonicalUrl, pageUrl, trimDescription, socialImage } =
    useSeoMeta({ fpi, seo: seoData });

  const title = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.title || t("resource.common.page_titles.blogs_and_resources")
    );
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seoData?.title, brandName, t]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description || t("resource.blog.blog_seo_description")
    );
    return trimDescription(raw, 160);
  }, [seoData?.description, t, trimDescription]);

  console.log("Blog Page Rendered", sections);
  return (
    <>
      {page?.value === "blog" && (
        <>
          {getHelmet({
            title,
            description,
            image: socialImage,
            canonicalUrl,
            url: pageUrl,
            siteName: brandName,
            ogType: "article",
          })}
          <SectionRenderer
            sections={sections}
            fpi={fpi}
            globalConfig={globalConfig}
          />
        </>
      )}
    </>
  );
}
export const sections = JSON.stringify([
  {
    attributes: {
      page: "blog",
    },
  },
]);
export default Blog;
