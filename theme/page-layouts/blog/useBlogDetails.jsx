import { useEffect, useState, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useGlobalStore } from "fdk-core/utils";
import placeholderImage from "../../assets/images/blog-placeholder.png";
import { GET_BLOG } from "../../queries/blogQuery";

const useBlogDetails = ({ fpi }) => {
  const location = useLocation();
  const { slug = "" } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const THEME = useGlobalStore(fpi?.getters?.THEME);
  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const pageConfig =
    mode?.page?.find((f) => f.page === "blog")?.settings?.props || {};

  const footerProps = useMemo(
    () => ({
      button_link: pageConfig.button_link,
      button_text: pageConfig.button_text,
      description: pageConfig.description,
      title: pageConfig.title,
    }),
    [pageConfig]
  );

  const sliderProps = useMemo(
    () => ({
      show_filters: pageConfig?.show_filters || "",
      show_recent_blog: pageConfig?.show_recent_blog || "",
      show_search: pageConfig?.show_search || "",
      show_tags: pageConfig?.show_tags || "",
      show_top_blog: pageConfig?.show_top_blog || "",
      fallback_image: pageConfig?.fallback_image || placeholderImage,
      button_text: pageConfig?.button_text || "",
      autoplay: pageConfig?.autoplay || false,
      slide_interval: pageConfig?.slide_interval || 3,
      btn_text: pageConfig?.btn_text || "",
      loadingOption: pageConfig?.loading_options || "",
      show_blog_slide_show: pageConfig?.show_blog_slide_show || "",
      recentBlogs: pageConfig.recent_blogs || [],
      topViewedBlogs: pageConfig.top_blogs || [],
    }),
    [pageConfig]
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
