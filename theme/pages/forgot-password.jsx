import React, { useMemo } from "react";
import { useGlobalStore } from "fdk-core/utils";
import ForgetPasswordPage from "../page-layouts/forgot-password/forget-password-page";
import { getHelmet } from "../providers/global-provider";
import useSeoMeta from "../helper/hooks/useSeoMeta";
import { sanitizeHTMLTag } from "../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";

function ForgetPassword({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const seoData = page?.seo || {};
  const { brandName, canonicalUrl, pageUrl, trimDescription, socialImage } =
    useSeoMeta({ fpi, seo: seoData });

  const title = useMemo(() => {
    const raw = sanitizeHTMLTag(seoData?.title || "Forgot Password");
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seoData?.title, brandName]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seoData?.description ||
        t("resource.forgot_password.seo_description")
    );
    return trimDescription(raw, 160);
  }, [seoData?.description, trimDescription]);

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
      <ForgetPasswordPage fpi={fpi} />
    </>
  );
}

export const sections = JSON.stringify([]);

export default ForgetPassword;
