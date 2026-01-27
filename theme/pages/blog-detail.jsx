import React from "react";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import { SectionRenderer } from "fdk-core/components";

function BlogDetails({}) {
  const fpi = useFPI();
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};

  return (
    page?.value === "blog-detail" && (
      <>
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
      page: "blog-detail",
    },
  },
]);

export default BlogDetails;
