import React from "react";
import BlogPage from "@gofynd/theme-template/components/blog-page/blog-page";
import "@gofynd/theme-template/components/blog-page/blog-page.css";
import useBlogDetails from "../../page-layouts/blog/useBlogDetails";
import { GET_BLOG } from "../../queries/blogQuery";
import { getHelmet } from "../../providers/global-provider";
import EmptyState from "../../components/empty-state/empty-state";
import { useGlobalTranslation } from "fdk-core/utils";
import SocailMedia from "../socail-media/socail-media";

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
  return (
    <>
      {getHelmet({ seo: blogDetails?.seo })}
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
