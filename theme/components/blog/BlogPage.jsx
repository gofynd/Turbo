import React from "react";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import { useThemeConfig } from "../../helper/hooks";
import { SectionRenderer } from "fdk-core/components";
import useBlogDetails from "../../page-layouts/blog/useBlogDetails";
import { sanitizeHTMLTag } from "../../helper/utils";
import { useLocation } from "react-router-dom";
import { isRunningOnClient } from "../../helper/utils";
import { getHelmet } from "../../providers/global-provider";

function BlogDetails({}) {
  const fpi = useFPI();
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const location = useLocation();

  const { blogDetails, sliderProps } = useBlogDetails({ fpi });
  const configuration = useGlobalStore(fpi.getters.CONFIGURATION);
  const brandName = sanitizeHTMLTag(
    globalConfig?.brand_name ||
      globalConfig?.site_name ||
      configuration?.application?.name ||
      configuration?.app?.name ||
      configuration?.application?.meta?.name
  );
  const domainUrl = useMemo(() => {
    const domain =
      configuration?.application?.domains?.find((d) => d.is_primary)?.name ||
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
  }, [configuration?.application?.domains]);

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

  const title = useMemo(() => {
    const rawTitle = sanitizeHTMLTag(
      blogDetails?.seo?.title || blogDetails?.title
    );
    if (rawTitle && brandName) return `${rawTitle} | ${brandName}`;
    return rawTitle || brandName || "";
  }, [blogDetails?.seo?.title, blogDetails?.title, brandName]);

  const canonicalUrl = useMemo(() => {
    const preferredPath =
      blogDetails?.seo?.canonical_url ||
      location?.pathname ||
      (blogDetails?.slug ? `/blog/${blogDetails.slug}` : "");
    return absoluteUrl(preferredPath);
  }, [
    absoluteUrl,
    blogDetails?.seo?.canonical_url,
    blogDetails?.slug,
    location?.pathname,
  ]);

  const url = canonicalUrl || absoluteUrl(location?.pathname);

  const cleanHTML = (s) =>
    s?.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")?.replace(/<[^>]*>/g, "");

  const description = useMemo(() => {
    const value = sanitizeHTMLTag(
      blogDetails?.seo?.description ||
        blogDetails?.summary ||
        cleanHTML(blogDetails?.content?.[0]?.value) ||
        ""
    );

    return value.replace(/\s+/g, " ").trim();
  }, [blogDetails?.seo?.description, blogDetails?.summary]);

  const socialImage = useMemo(() => {
    const rawImage =
      blogDetails?.feature_image?.secure_url ||
      blogDetails?.seo?.image ||
      sliderProps?.fallback_image ||
      configuration?.application?.logo?.secure_url ||
      "";
    return absoluteUrl(rawImage);
  }, [
    absoluteUrl,
    blogDetails?.feature_image?.secure_url,
    blogDetails?.seo?.image,
    configuration?.application?.logo?.secure_url,
    sliderProps?.fallback_image,
  ]);

  return (
    page?.value === "blog-detail" && (
      <>
        {getHelmet({
          title,
          description,
          image: socialImage,
          canonicalUrl,
          url,
          siteName: brandName,
          ogType: "article",
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
      page: "blog-detail",
    },
  },
]);

export default BlogDetails;
