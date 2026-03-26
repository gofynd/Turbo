import React, { useMemo } from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useSearchParams } from "react-router-dom";
import { useThemeConfig } from "../helper/hooks";
import { getHelmet } from "../providers/global-provider";
import { sanitizeHTMLTag } from "../helper/utils";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import { PLPShimmer } from "../components/core/skeletons";

const ProductListing = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};
  const customValues = useGlobalStore(fpi.getters.CUSTOM_VALUE) || {};
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

  const isPageReady = page?.value === "product-listing";
  const isSectionMounted = customValues?.plpSectionMounted;
  const isClient = typeof window !== "undefined";
  const showShimmer = isClient && (!isPageReady || !isSectionMounted);

  if (!isPageReady) {
    return isClient ? (
      <div className="margin0auto basePageContainer">
        <PLPShimmer
          gridDesktop={4}
          gridTablet={3}
          gridMobile={1}
          showFilters={true}
          showSortBy={true}
          showPagination={true}
          productCount={12}
        />
      </div>
    ) : null;
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
      {showShimmer && (
        <div className="margin0auto basePageContainer">
          <PLPShimmer
            gridDesktop={4}
            gridTablet={3}
            gridMobile={1}
            showFilters={true}
            showSortBy={true}
            showPagination={true}
            productCount={12}
          />
        </div>
      )}
      <div
        style={
          showShimmer
            ? { visibility: "hidden", height: 0, overflow: "hidden" }
            : undefined
        }
      >
        <SectionRenderer
          sections={sections}
          fpi={fpi}
          globalConfig={globalConfig}
        />
      </div>
    </>
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
