import React from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import { getHelmet } from "../providers/global-provider";
import { sanitizeHTMLTag } from "../helper/utils";

const ProductListing = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};
  const seoData = page?.seo || {};

  const title = sanitizeHTMLTag(seoData?.title || "Product Listing");
  const description = sanitizeHTMLTag(
    seoData?.description || t("resource.product.seo_description")
  );

  const mergedSeo = { ...seoData, title, description };

  return (
    page?.value === "product-listing" && (
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
};

export const sections = JSON.stringify([
  {
    attributes: {
      page: "product-listing",
    },
  },
]);

export default ProductListing;
