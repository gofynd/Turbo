import React, { useMemo } from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore,useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";

const CollectionListing = ({ fpi }) => {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { t } = useGlobalTranslation("translation");

  const customValues = useGlobalStore(fpi.getters.CUSTOM_VALUE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};
  const seoData = customValues?.customCollection?.seo || page?.seo || {};

  const fallbackImage = useMemo(() => {
    const getSectionProp = (key) =>
      sections?.find((section) => section?.props?.[key]?.value)?.props?.[key]
        ?.value;

    return (
      getSectionProp("desktop_banner") || getSectionProp("mobile_banner") || ""
    );
  }, [sections]);

  const { brandName, canonicalUrl, pageUrl, trimDescription, socialImage } =
    useSeoMeta({
      fpi,
      seo: seoData,
      fallbackImage,
    });

  const title = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.title || customValues?.customCollection?.name || "Collection"
    );
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seoData?.title, brandName, customValues?.customCollection?.name]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description || customValues?.customCollection?.description || t("resource.categories.collection_listing_description") ||""
    );
    return trimDescription(raw, 160);
  }, [
    seoData?.description,
    customValues?.customCollection?.description,
    trimDescription,
  ]);

  return (
    page?.value === "collection-listing" && (
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
      page: "collection-listing",
    },
  },
]);

export default CollectionListing;
