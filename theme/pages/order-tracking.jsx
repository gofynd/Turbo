import React from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import { SectionRenderer } from "fdk-core/components";

function OrderTracking({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};

  return (
    <>
      {page?.value === "order-tracking" && (
        <SectionRenderer
          sections={sections}
          fpi={fpi}
          globalConfig={globalConfig}
        />
      )}
    </>
  );
}

export const sections = JSON.stringify([
  {
    attributes: {
      page: "order-tracking",
    },
  },
]);

export default OrderTracking;
