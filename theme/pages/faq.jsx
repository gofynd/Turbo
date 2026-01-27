import React, { useMemo } from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore } from "fdk-core/utils";
import { getHelmet } from "../providers/global-provider";
import getSeoMeta from "../helper/hooks/useSeoMeta";
import { sanitizeHTMLTag } from "../helper/utils";

function FaqPage({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;

  const { sections = [] } = page || {};
  const seoData = page?.seo || {};
  const { brandName, canonicalUrl, pageUrl, description: seoDescription, socialImage } =
    getSeoMeta({ fpi, seo: seoData });

  const title = useMemo(() => {
    const raw = sanitizeHTMLTag(seoData?.title || "FAQ");
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seoData?.title, brandName]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description || "Frequently asked questions"
    );
    const normalized = raw.replace(/\s+/g, " ").trim();
    return normalized || seoDescription;
  }, [seoData?.description, seoDescription]);

  return (
    page?.value === "faq" && (
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
        <SectionRenderer
          sections={sections}
          fpi={fpi}
          globalConfig={globalConfig}
        />
      </>
    )
  );
}

export const sections = JSON.stringify([
  {
    attributes: {
      page: "faq",
    },
  },
]);

export default FaqPage;
