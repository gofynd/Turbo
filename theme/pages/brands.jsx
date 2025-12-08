import React, { useMemo } from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";

function Brands({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);
  const { t } = useGlobalTranslation("translation");
  const seoData = page?.seo || {};
  const { brandName, canonicalUrl, pageUrl, trimDescription, socialImage } =
    useSeoMeta({ fpi, seo: seoData });

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};
  const title = useMemo(() => {
    const fallbackTitle =
      sections?.find((section) => section?.props?.title?.value)?.props?.title
        ?.value || t("resource.sections.brand_landing.brands");
    const raw = sanitizeHTMLTag(
      seoData?.title ||
        fallbackTitle ||
        t("resource.sections.brand_landing.brands")
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
    return trimDescription(raw, 160);
  }, [seoData?.description, trimDescription, sections]);

  return (
    page?.value === "brands" && (
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
      page: "brands",
    },
  },
]);

export default Brands;
