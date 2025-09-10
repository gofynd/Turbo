import React from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";
import { getHelmet } from "../providers/global-provider";
import { sanitizeHTMLTag } from "../helper/utils";

function AboutUsPage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};

  const seoData = page?.seo || {};
  const title = sanitizeHTMLTag(
    seoData?.title || t("resource.common.page_titles.about_us")
  );
  const description = sanitizeHTMLTag(
    seoData?.description || t("resource.about.seo_description")
  );

  const mergedSeo = { ...seoData, title, description };

  return (
    page?.value === "about-us" && (
      <>
        {getHelmet({ seo: mergedSeo })}
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
      page: "about-us",
    },
  },
]);

export default AboutUsPage;
