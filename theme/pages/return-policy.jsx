import React, { useMemo } from "react";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import ScrollToTop from "../components/scroll-to-top/scroll-to-top";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";
import LegalPagesTemplate from "../components/legal-doc-templates/legal-pages-template";
import { useThemeConfig } from "../helper/hooks";
import { SectionRenderer } from "fdk-core/components";

function ReturnPolicy({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};
  const { returns } = useGlobalStore(fpi?.getters?.LEGAL_DATA);

  const { brandName, canonicalUrl, pageUrl, description: seoDescription, socialImage } =
    useSeoMeta({ fpi, seo: {} });

  const { heading, description } = useMemo(() => {
    const html = returns || "";
    const headingMatch = html.match(/<(h1|h2)[^>]*>([\s\S]*?)<\/\1>/i);
    const headingText = sanitizeHTMLTag(headingMatch?.[2] || "");

    const bodyWithoutHeading = headingMatch
      ? html.replace(headingMatch[0], "")
      : html;
    const plainText = bodyWithoutHeading
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      heading: headingText,
      description:
        sanitizeHTMLTag(plainText).replace(/\s+/g, " ").trim() ||
        seoDescription,
    };
  }, [returns, seoDescription]);

  const title = useMemo(() => {
    const baseTitle = heading || "Return Policy";
    if (baseTitle && brandName) return `${baseTitle} | ${brandName}`;
    return baseTitle || brandName || "";
  }, [heading, brandName]);

  return (
    <>
      {page?.value === "return-policy" && (
        <SectionRenderer
          sections={sections}
          fpi={fpi}
          globalConfig={globalConfig}
        />
      )}
      {getHelmet({
        title,
        description,
        image: socialImage,
        canonicalUrl,
        url: pageUrl,
        siteName: brandName,
        ogType: "website",
      })}
    </>
  );
}

export const sections = JSON.stringify([
  {
    attributes: {
      page: "return-policy",
    },
  },
]);
export default ReturnPolicy;
