import React, { useMemo } from "react";

import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore } from "fdk-core/utils";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";

function Collections({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);
  const seoData = page?.seo || {};
  const { brandName, canonicalUrl, pageUrl, description: seoDescription, socialImage } =
    useSeoMeta({ fpi, seo: seoData });

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};

  const title = useMemo(() => {
    const fallbackTitle =
      sections?.find((section) => section?.props?.title?.value)?.props?.title
        ?.value || "Collections";
    const raw = sanitizeHTMLTag(
      seoData?.title || fallbackTitle || "Collections"
    );
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seoData?.title, brandName, sections]);

  const description = useMemo(() => {
    const fallbackDescription =
      sections?.find((section) => section?.props?.description?.value)?.props
        ?.description?.value || "";
    const raw = sanitizeHTMLTag(
      seoData?.description || fallbackDescription || ""
    );
    const normalized = raw.replace(/\s+/g, " ").trim();
    return normalized || seoDescription;
  }, [seoData?.description, seoDescription, sections]);

  return (
    page?.value === "collections" && (
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
      page: "collections",
    },
  },
]);

export default Collections;
