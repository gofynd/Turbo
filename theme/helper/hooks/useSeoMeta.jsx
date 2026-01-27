import { useCallback, useMemo } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useLocation } from "react-router-dom";
import { sanitizeHTMLTag, isRunningOnClient } from "../utils";
import { useThemeConfig } from "./useThemeConfig";

export const useSeoMeta = ({ fpi, seo = {}, fallbackImage = "" }) => {
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const location = useLocation();
  const { globalConfig } = useThemeConfig({ fpi });

  const brandName = sanitizeHTMLTag(
    globalConfig?.brand_name ||
      globalConfig?.site_name ||
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

  const canonicalUrl = useMemo(() => {
    const preferredPath = seo?.canonical_url || location?.pathname || "";
    return absoluteUrl(preferredPath);
  }, [absoluteUrl, seo?.canonical_url, location?.pathname]);

  const pageUrl = canonicalUrl || absoluteUrl(location?.pathname);

  const description = useMemo(() => {
    return sanitizeHTMLTag(seo?.description || "")
      .replace(/\s+/g, " ")
      .trim();
  }, [seo?.description]);

  const socialImage = useMemo(() => {
    const rawImage =
      seo?.image ||
      seo?.image_url ||
      fallbackImage ||
      CONFIGURATION?.application?.logo?.secure_url ||
      "";
    return absoluteUrl(rawImage);
  }, [
    absoluteUrl,
    seo?.image,
    seo?.image_url,
    fallbackImage,
    CONFIGURATION?.application?.logo?.secure_url,
  ]);

  return {
    brandName,
    domainUrl,
    absoluteUrl,
    canonicalUrl,
    pageUrl,
    description,
    socialImage,
    seoData: seo,
  };
};

export default useSeoMeta;
