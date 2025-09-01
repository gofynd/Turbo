import React from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { getHelmet } from "../providers/global-provider";
import { sanitizeHTMLTag } from "../helper/utils";

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
  const title = sanitizeHTMLTag(seoData?.title || t("resource.common.page_titles.blog"));
  const description = sanitizeHTMLTag(
    seoData?.description || t("resource.blog.seo_description")
  );
  const mergedSeo = { ...seoData, title, description };

  console.log({ mergedSeo });

 return (
   <>
     {page?.value === "blog" && (
       <>
         {getHelmet({ seo: mergedSeo })}
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
