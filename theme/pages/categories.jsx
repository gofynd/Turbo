import React, { useCallback, useMemo } from "react";

import { SectionRenderer } from "fdk-core/components";
import { useGlobalStore } from "fdk-core/utils";
import { useLocation } from "react-router-dom";
import { sanitizeHTMLTag, isRunningOnClient } from "../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import { useThemeConfig } from "../helper/hooks";
import { getHelmet } from "../providers/global-provider";

function Categories({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { t } = useGlobalTranslation("translation");
  const THEME = useGlobalStore(fpi.getters.THEME);
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const location = useLocation();
  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};
  const seoData = page?.seo || {};
  const { globalConfig: themeGlobalConfig } = useThemeConfig({ fpi });

  const brandName = sanitizeHTMLTag(
    themeGlobalConfig?.brand_name ||
      themeGlobalConfig?.site_name ||
      CONFIGURATION?.application?.name ||
      CONFIGURATION?.app?.name ||
      CONFIGURATION?.application?.meta?.name
  );

  const domainUrl = useMemo(() => {
    const domain =
      CONFIGURATION?.application?.domains?.find((d) => d.is_primary)?.name ||
      "";
    const sanitizedDomain = sanitizeHTMLTag(domain);

    if (sanitizedDomain) {
      return /^https?:\/\//i.test(sanitizedDomain)
        ? sanitizedDomain
        : `https://${sanitizedDomain}`;
    }

    if (isRunningOnClient()) {
      return window.location.origin;
    }

    return "";
  }, [CONFIGURATION?.application?.domains]);

  const absoluteUrl = useCallback(
    (url = "") => {
      if (!url) return "";
      const sanitizedUrl = sanitizeHTMLTag(url);
      if (/^https?:\/\//i.test(sanitizedUrl)) return sanitizedUrl;
      if (!domainUrl) return sanitizedUrl;
      const normalizedPath = sanitizedUrl.startsWith("/")
        ? sanitizedUrl
        : `/${sanitizedUrl}`;
      return `${domainUrl}${normalizedPath}`;
    },
    [domainUrl]
  );

  const categoriesSection = useMemo(() => {
    return (
      sections?.find((section) => section?.name === "categories") ||
      sections?.[0] ||
      {}
    );
  }, [sections]);

  const sectionHeading = sanitizeHTMLTag(
    categoriesSection?.props?.heading?.value || ""
  );
  const sectionDescription = sanitizeHTMLTag(
    categoriesSection?.props?.description?.value || ""
  );

  const pageTitle = useMemo(() => {
    const rawTitle = sanitizeHTMLTag(
      seoData?.title ||
        sectionHeading ||
        t("resource.common.page_titles.categories")
    );
    if (rawTitle && brandName) return `${rawTitle} | ${brandName}`;
    return rawTitle || brandName || "";
  }, [seoData?.title, brandName, sectionHeading, t]);

  const canonicalUrl = useMemo(() => {
    const preferredPath = seoData?.canonical_url || location?.pathname || "";
    return absoluteUrl(preferredPath);
  }, [absoluteUrl, seoData?.canonical_url, location?.pathname]);

  const pageUrl = canonicalUrl || absoluteUrl(location?.pathname);
  const description = useMemo(() => {
    const value = sanitizeHTMLTag(
      seoData?.description ||
        sectionDescription ||
        t("resource.categories.categories_description")
    );
    return value.replace(/\s+/g, " ").trim();
  }, [seoData?.description, sectionDescription, t]);

  const socialImage = useMemo(() => {
    const rawImage =
      seoData?.image ||
      seoData?.image_url ||
      CONFIGURATION?.application?.logo?.secure_url ||
      "";
    return absoluteUrl(rawImage);
  }, [
    absoluteUrl,
    seoData?.image,
    seoData?.image_url,
    CONFIGURATION?.application?.logo?.secure_url,
  ]);

  return (
    page?.value === "categories" && (
      <>
        {getHelmet({
          title: pageTitle,
          description,
          image: socialImage,
          canonicalUrl,
          url: pageUrl,
          siteName: brandName,
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
      page: "categories",
    },
  },
]);

export default Categories;
