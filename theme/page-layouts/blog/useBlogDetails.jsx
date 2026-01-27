import { useEffect, useState, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useGlobalStore } from "fdk-core/utils";
import { GET_BLOG } from "../../queries/blogQuery";
import { useThemeConfig } from "../../helper/hooks";

const useBlogDetails = ({ fpi, props }) => {
  const location = useLocation();
  const { slug = "" } = useParams();

  const footerProps = useMemo(
    () => ({
      button_link: props.button_link?.value,
      button_text: props.button_text?.value,
      description: props.description?.value,
      title: props.title?.value,
    }),
    [props]
  );

  const sliderProps = useMemo(
    () => ({
      show_filters: props?.show_filters?.value || "",
      show_recent_blog: props?.show_recent_blog?.value || "",
      show_search: props?.show_search?.value || "",
      show_tags: props?.show_tags?.value || "",
      show_top_blog: props?.show_top_blog?.value || "",
      fallback_image: props?.fallback_image?.value,
      button_text: props?.button_text?.value || "",
      autoplay: props?.autoplay?.value || false,
      slide_interval: props?.slide_interval?.value || 3,
      btn_text: props?.btn_text?.value || "",
      loadingOption: props?.loading_options?.value || "",
      show_blog_slide_show: props?.show_blog_slide_show?.value || "",
      recentBlogs: props.recent_blogs?.value || [],
      topViewedBlogs: props.top_blogs?.value || [],
    }),
    [props]
  );

  const contactInfo = useGlobalStore(fpi.getters.CONTACT_INFO);
  const { blogDetails, isBlogNotFound } = useGlobalStore(
    fpi?.getters?.CUSTOM_VALUE
  );

  const [isBlogDetailsLoading, setIsBlogDetailsLoading] = useState(
    !blogDetails?.[slug]
  );

  useEffect(() => {
    fpi.custom.setValue("isBlogSsrFetched", false);
  }, []);

  useEffect(() => {
    fpi.custom.setValue("isBlogNotFound", false);
  }, [location.pathname]);

  function getBlog(slug, preview) {
    try {
      setIsBlogDetailsLoading(true);
      const values = {
        slug: slug || "",
        preview: preview || false,
      };
      return fpi
        .executeGQL(GET_BLOG, values)
        .then((res) => {
          if (res?.errors) {
            fpi.custom.setValue(`isBlogNotFound`, true);
          }
          if (res?.data?.blog) {
            const data = res?.data?.blog;
            fpi.custom.setValue("blogDetails", {
              ...blogDetails,
              [slug]: data,
            });
          }
        })
        .finally(() => {
          setIsBlogDetailsLoading(false);
        });
    } catch (error) {
      console.log({ error });
    }
  }

  return {
    blogDetails: blogDetails?.[slug],
    sliderProps,
    footerProps,
    contactInfo,
    isBlogNotFound,
    getBlog,
    isBlogDetailsLoading,
  };
};

export default useBlogDetails;
