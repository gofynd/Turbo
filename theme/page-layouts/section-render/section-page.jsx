import React from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore } from "fdk-core/utils";
import { useThemeConfig } from "../../helper/hooks";

function SectionPage({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [], error } = page || {};

  return (
    <div className="basePageContainer margin0auto">
      <SectionRenderer
        fpi={fpi}
        sections={sections}
        globalConfig={globalConfig}
      />
    </div>
  );
}

export default SectionPage;
