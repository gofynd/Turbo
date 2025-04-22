import React from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";

const ProductListing = ({ fpi }) => {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};

  return (
    page?.value === "product-listing" && (
      <SectionRenderer
        sections={sections}
        fpi={fpi}
        globalConfig={globalConfig}
      />
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
