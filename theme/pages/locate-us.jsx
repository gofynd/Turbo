import React, { useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";
import { getHelmet } from "../providers/global-provider";
import { sanitizeHTMLTag } from "../helper/utils";
import useSeoMeta from "../helper/hooks/useSeoMeta";

function LocateUsPage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);
  const seoData = page?.seo || {};
  const { brandName, canonicalUrl, pageUrl, trimDescription, socialImage } =
    useSeoMeta({ fpi, seo: seoData });
  const title = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.title || t("resource.common.page_titles.locate_us")
    );
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seoData?.title, brandName, t]);
  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description || t("resource.common.locate_us_seo_description")
    );
    return trimDescription(raw, 160);
  }, [seoData?.description, t, trimDescription]);

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};

  return (
    page?.value === "locate-us" && (
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
        <div className="basePageContainer margin0auto">
          <SectionRenderer
            sections={sections}
            fpi={fpi}
            globalConfig={globalConfig}
          />
        </div>
      </>
    )
  );
}

export const sections = JSON.stringify([
  {
    attributes: {
      page: "locate-us",
    },
  },
]);

export default LocateUsPage;
