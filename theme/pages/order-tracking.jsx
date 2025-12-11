import React from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import { SectionRenderer } from "fdk-core/components";
import { useGlobalTranslation } from "fdk-core/utils";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import { useMemo } from "react";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";

function OrderTracking({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};
  const { t } = useGlobalTranslation("translation");
  const { brandName, canonicalUrl, pageUrl, trimDescription, socialImage } =
    useSeoMeta({ fpi, seo: {} });

  const title = useMemo(() => {
    const base = brandName ? `Track Order | ${brandName}` : "Track Order";
    return sanitizeHTMLTag(base);
  }, [brandName]);

  const description = useMemo(() => {
    const base = t("resource.order_tracking.seo_description");
    return trimDescription(sanitizeHTMLTag(base), 160);
  }, [brandName, trimDescription]);
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
