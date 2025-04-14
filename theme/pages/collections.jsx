import React from "react";

import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore } from "fdk-core/utils";

function Collections({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};

  return (
    page?.value === "collections" && (
      <SectionRenderer
        sections={sections}
        fpi={fpi}
        globalConfig={globalConfig}
      />
    )
  );
}

export const sections = JSON.stringify([
  {
    attributes: {
      page: "collections",
    },
  },
]);

export default Collections;
