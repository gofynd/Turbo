import React, { useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import { sanitizeHTMLTag } from "../helper/utils";

function ForgetPassword({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};

  const { brandName, canonicalUrl, pageUrl, description: seoDescription, socialImage } =
    useSeoMeta({ fpi, seo: {} });
  const { t } = useGlobalTranslation("translation");

  const title = useMemo(() => {
    const base = brandName
      ? `Forgot Password | ${brandName}`
      : "Forgot Password";
    return sanitizeHTMLTag(base);
  }, [brandName]);

  const description = useMemo(() => {
    const base = t("resource.forgot_password.seo_description");
    return (
      sanitizeHTMLTag(base).replace(/\s+/g, " ").trim() || seoDescription
    );
  }, [t, seoDescription]);
  return (
    page?.value === "forgot-password" && (
      <>
        {getHelmet({
          title,
          description,
          image: socialImage,
          canonicalUrl,
          url: pageUrl,
          siteName: brandName,
          robots: "noindex, nofollow",
          ogType: "website",
        })}
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
      page: "forgot-password",
    },
  },
]);

export default ForgetPassword;
