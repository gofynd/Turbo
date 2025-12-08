import React, { useMemo } from "react";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import { HTMLContent } from "../page-layouts/marketing/HTMLContent";
import ScrollToTop from "../components/scroll-to-top/scroll-to-top";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import { sanitizeHTMLTag } from "../helper/utils";
import { getHelmet } from "../providers/global-provider";

function Policy() {
  const fpi = useFPI();
  const { policy } = useGlobalStore(fpi?.getters?.LEGAL_DATA);

  const { brandName, canonicalUrl, pageUrl, trimDescription, socialImage } =
    useSeoMeta({ fpi, seo: {} });

  const { heading, description } = useMemo(() => {
    const html = policy || "";
    const headingMatch = html.match(/<(h1|h2)[^>]*>([\s\S]*?)<\/\1>/i);
    const headingText = sanitizeHTMLTag(headingMatch?.[2] || "");

    const bodyWithoutHeading = headingMatch ? html.replace(headingMatch[0], "") : html;
    const plainText = bodyWithoutHeading.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    return {
      heading: headingText,
      description: trimDescription(sanitizeHTMLTag(plainText), 160),
    };
  }, [policy, trimDescription]);

  const title = useMemo(() => {
    const baseTitle = heading || "Policy";
    if (baseTitle && brandName) return `${baseTitle} | ${brandName}`;
    return baseTitle || brandName || "";
  }, [heading, brandName]);

  return (
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
      <div className="basePageContainer margin0auto policyPageContainer">
        <HTMLContent content={policy} />
        <ScrollToTop />
      </div>
    </>
  );
}

export const sections = JSON.stringify([]);

export default Policy;
