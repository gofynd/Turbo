import React from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import { SectionRenderer } from "fdk-core/components";

function OrderTrackingDetails({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};

  return (
    page?.value === "order-tracking-details" && (
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
      page: "order-tracking-details",
    },
  },
]);

export default OrderTrackingDetails;
