import React from "react";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore } from "fdk-core/utils";
import { getThemeGlobalConfig } from "../../helper/theme";

function SectionPage({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);
  const globalConfig = getThemeGlobalConfig(THEME?.config);
  const { sections = [], error } = page || {};

  return (
    <div className="basePageContainer margin0auto">
      <SectionRenderer
        sections={sections}
        fpi={fpi}
        globalConfig={globalConfig}
      />
    </div>
  );
}

export default SectionPage;
