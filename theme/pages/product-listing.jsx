import React, { useMemo } from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useSearchParams } from "react-router-dom";
import { useThemeConfig } from "../helper/hooks";
import { getHelmet } from "../providers/global-provider";
import { sanitizeHTMLTag } from "../helper/utils";
import useSeoMeta from "../helper/hooks/useSeoMeta";

const ProductListing = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};
  const seoData = page?.seo || {};
  const [searchParams] = useSearchParams();
  const department = searchParams.get("department") || "";
  const brand = searchParams.get("brand") || "";
  const category = searchParams.get("category") || "";
  const { brandName, canonicalUrl, pageUrl, description: seoDescription, socialImage } =
    useSeoMeta({ fpi, seo: seoData });
  console.log("brand", brand);
  const title = useMemo(() => {
    const seoTitle = sanitizeHTMLTag(seoData?.title);

    if (category && department) {
      return `${sanitizeHTMLTag(category)} | ${sanitizeHTMLTag(department)}`;
    }

    if (brand) {
      const base = sanitizeHTMLTag(brand);
      const suffix = brandName ? ` | ${brandName}` : "";
      return `${base}${suffix}`;
    }

    const fallback =
      seoTitle || t("resource.common.page_titles.product_listing");

    if (fallback && brandName) {
      return `${fallback} | ${brandName}`;
    }

    return fallback || brandName || "";
  }, [seoData?.title, category, department, brand, brandName, t]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description || t("resource.product.seo_description")
    );
    const normalized = raw.replace(/\s+/g, " ").trim();
    return normalized || seoDescription;
  }, [seoData?.description, t, seoDescription]);

  return (
    page?.value === "product-listing" && (
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
};

export const sections = JSON.stringify([
  {
    attributes: {
      page: "product-listing",
    },
  },
]);

export default ProductListing;
