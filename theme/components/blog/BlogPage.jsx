import React, { useCallback, useMemo } from "react";
import BlogPage from "@gofynd/theme-template/components/blog-page/blog-page";
import "@gofynd/theme-template/components/blog-page/blog-page.css";
import useBlogDetails from "../../page-layouts/blog/useBlogDetails";
import { GET_BLOG } from "../../queries/blogQuery";
import EmptyState from "../../components/empty-state/empty-state";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import SocailMedia from "../socail-media/socail-media";
import { useLocation } from "react-router-dom";
import { sanitizeHTMLTag, isRunningOnClient } from "../../helper/utils";
import { useThemeConfig } from "../../helper/hooks";
import { getHelmet } from "../../providers/global-provider";

function BlogDetails({ fpi }) {
  const {
    blogDetails,
    sliderProps,
    footerProps,
    contactInfo,
    getBlog,
    isBlogDetailsLoading,
    isBlogNotFound,
  } = useBlogDetails({ fpi });
  const { t } = useGlobalTranslation("translation");
  const configuration = useGlobalStore(fpi.getters.CONFIGURATION);
  const { globalConfig } = useThemeConfig({ fpi });
  const location = useLocation();

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

  const trimDescription = (value = "", limit = 160) => {
    if (!value) return "";
    const cleanValue = value.replace(/\s+/g, " ").trim();
    return cleanValue.slice(0, limit);
  };

  const pageTitle = useMemo(() => {
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
  }, [absoluteUrl, blogDetails?.seo?.canonical_url, blogDetails?.slug, location?.pathname]);

  const pageUrl = canonicalUrl || absoluteUrl(location?.pathname);

  const cleanHTML = s => s?.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')?.replace(/<[^>]*>/g, '');

  const description = useMemo(() => {
    const value = sanitizeHTMLTag(
      blogDetails?.seo?.description || blogDetails?.summary || cleanHTML(blogDetails?.content?.[0]?.value) || ""
    );
    console.log("blogDetails",blogDetails)
    console.log("Blog Description:", value);
    console.log("logDetails?.seo?.description",blogDetails?.seo?.description)
    console.log("blogDetails?.summary",blogDetails?.summary)
    return trimDescription(value);
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
    <>
      {getHelmet({
        title: pageTitle,
        description,
        image: socialImage,
        canonicalUrl,
        url: pageUrl,
        siteName: brandName,
        ogType: "article",
      })}
      {isBlogNotFound ? (
        <EmptyState title={t("resource.blog.no_blog_found")} />
      ) : (
        <BlogPage
          contactInfo={contactInfo}
          blogDetails={blogDetails}
          sliderProps={sliderProps}
          footerProps={footerProps}
          getBlog={getBlog}
          isBlogDetailsLoading={isBlogDetailsLoading}
          SocailMedia={SocailMedia}
        ></BlogPage>
      )}
    </>
  );
}

export const settings = JSON.stringify({
  props: [
    {
      type: "image_picker",
      id: "image",
      label: "t:resource.common.image",
      default: "",
    },
    {
      type: "checkbox",
      id: "show_recent_blog",
      label: "t:resource.sections.blog.show_recently_published",
      default: true,
      info: "t:resource.sections.blog.recently_published_info",
    },
    {
      id: "recent_blogs",
      type: "blog-list",
      default: "",
      label: "t:resource.sections.blog.recently_published_blogs",
      info: "",
    },
    {
      type: "checkbox",
      id: "show_top_blog",
      label: "t:resource.sections.blog.show_top_viewed",
      default: true,
      info: "t:resource.sections.blog.top_viewed_info",
    },
    {
      id: "top_blogs",
      type: "blog-list",
      default: "",
      label: "t:resource.sections.blog.top_viewed_blogs",
      info: "",
    },
    {
      id: "title",
      type: "text",
      value: "The Unparalleled Shopping Experience",
      default: "t:resource.default_values.the_unparalleled_shopping_experience",
      label: "t:resource.common.heading",
    },
    {
      id: "description",
      type: "text",
      value:
        "Everything you need for that ultimate stylish wardrobe, Fynd has got it!",
      default: "t:resource.default_values.blog_description",
      label: "t:resource.common.description",
    },
    {
      type: "text",
      id: "button_text",
      value: "Shop Now",
      default: "t:resource.default_values.shop_now",
      label: "t:resource.sections.blog.button_label",
    },
    {
      type: "url",
      id: "button_link",
      default: "",
      label: "t:resource.common.redirect_link",
    },
    {
      type: "image_picker",
      id: "fallback_image",
      label: "t:resource.sections.blog.fallback_image",
      default: "",
    },
  ],
});

BlogDetails.serverFetch = async ({ router, fpi }) => {
  const { slug } = router?.params ?? {};
  const payload = {
    slug,
    preview: router?.filterQuery?.__preview === "blog",
  };
  const { data, errors } = await fpi.executeGQL(GET_BLOG, payload);

  if (errors) {
    fpi.custom.setValue(`isBlogNotFound`, true);
  }

  return fpi.custom.setValue(`blogDetails`, {
    [slug]: data?.blog,
  });
};

export default BlogDetails;
