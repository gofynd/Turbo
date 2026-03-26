import React from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";

function PageNotFound({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const seoData = page?.seo || {};
  const title = sanitizeHTMLTag(seoData?.title || "Page Not Found");
  const description = sanitizeHTMLTag(
    seoData?.description || "The page you are looking for does not exist."
  );
  const mergedSeo = { ...seoData, title, description };
  const { sections = [] } = page || {};

  return (
    page?.value === "not-found-page" && (
      <>
        {getHelmet({ seo: mergedSeo })}
        <div className="margin0auto basePageContainer">
          <h1 className="visually-hidden">{title}</h1>
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
      page: "not-found-page",
    },
  },
]);

export default PageNotFound;
