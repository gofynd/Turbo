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
  const { brandName, canonicalUrl, pageUrl, description: seoDescription, socialImage } =
    useSeoMeta({ fpi, seo: {} });

  const title = useMemo(() => {
    const base = brandName ? `Track Order | ${brandName}` : "Track Order";
    return sanitizeHTMLTag(base);
  }, [brandName]);

  const description = useMemo(() => {
    const base = t("resource.order_tracking.seo_description");
    return (
      sanitizeHTMLTag(base).replace(/\s+/g, " ").trim() || seoDescription
    );
  }, [t, seoDescription]);
  return (
    <>
      {page?.value === "order-tracking" && (
        <>
          {getHelmet({
            title,
            description,
            image: socialImage,
            canonicalUrl,
            url: pageUrl,
            siteName: brandName,
            ogType: "website",
          })}
          <h1 className="visually-hidden">{title}</h1>
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
      page: "order-tracking",
    },
  },
]);

export default OrderTracking;
