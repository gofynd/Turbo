import { useEffect, useState, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useGlobalStore } from "fdk-core/utils";
import { FETCH_BLOGS_LIST, GET_BLOG } from "../../queries/blogQuery";
import { isRunningOnClient } from "../../helper/utils";
import placeholderImage from "../../assets/images/blog-placeholder.png";

const PAGE_SIZE = 12;
const PAGES_TO_SHOW = 5;
const PAGE_OFFSET = 2;

const useBlog = ({ fpi, props }) => {
  const location = useLocation();
  const { slug = "" } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const THEME = useGlobalStore(fpi?.getters?.THEME);
  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const pageConfig = props || {};

  const isClient = useMemo(() => isRunningOnClient(), []);

  const { blogProps = {}, isBlogSsrFetched } = useGlobalStore(
    fpi?.getters?.CUSTOM_VALUE
  ) || { blogProps: {} };
  const { sliderBlogsData, filterQuery, totalBlogsListData } = blogProps;
  const blogsData = useGlobalStore(fpi?.getters?.BLOGS);

  const [isBlogPageLoading, setIsBlogPageLoading] = useState(!isBlogSsrFetched);
  const [blogs, setBlogs] = useState(blogsData || undefined);
  const [sliderBlogs, setSliderBlogs] = useState(sliderBlogsData || undefined);
  const [totalBlogsList, setTotalBlogsList] = useState(
    totalBlogsListData || undefined
  );

  const footerProps = useMemo(
    () => ({
      button_link: pageConfig.button_link?.value,
      button_text: pageConfig.button_text?.value,
      description: pageConfig.description?.value,
      title: pageConfig.title?.value,
    }),
    [pageConfig]
  );

  const sliderProps = useMemo(
    () => ({
      show_filters: pageConfig?.show_filters?.value || "",
      show_recent_blog: pageConfig?.show_recent_blog?.value || "",
      show_search: pageConfig?.show_search?.value || "",
      show_tags: pageConfig?.show_tags?.value || "",
      show_top_blog: pageConfig?.show_top_blog?.value || "",
      fallback_image: pageConfig?.fallback_image?.value || placeholderImage,
      button_text: pageConfig?.button_text?.value || "",
      autoplay: pageConfig?.autoplay?.value || false,
      slide_interval: pageConfig?.slide_interval?.value || 3,
      btn_text: pageConfig?.btn_text?.value || "",
      loadingOption: pageConfig?.loading_options?.value || "",
      show_blog_slide_show: pageConfig?.show_blog_slide_show?.value || "",
      recentBlogs: pageConfig.recent_blogs?.value || [],
      topViewedBlogs: pageConfig.top_blogs?.value || [],
      sliderFilterTags: pageConfig.filter_tags?.value || [],
    }),
    [pageConfig]
  );

  const contactInfo = useGlobalStore(fpi.getters.CONTACT_INFO);
  const { blogDetails } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);

  const [isBlogDetailsLoading, setIsBlogDetailsLoading] = useState(
    !blogDetails?.[slug]
  );

  const getPageUrl = (pageNo) => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    searchParams?.set("page_no", pageNo);
    return `${location?.pathname}?${searchParams?.toString()}`;
  };

  const getStartPage = ({ current, totalPageCount }) => {
    const index = Math.max(current - PAGE_OFFSET, 1);
    const lastIndex = Math.max(totalPageCount - PAGES_TO_SHOW + 1, 1);

    if (index <= 1) {
      return 1;
    }
    if (index > lastIndex) {
      return lastIndex;
    }
    return index;
  };

  const paginationProps = useMemo(() => {
    if (!blogs?.page) {
      return;
    }
    const {
      current,
      has_next: hasNext,
      has_previous: hasPrevious,
      item_total,
    } = blogs?.page || {};
    const totalPageCount = Math.ceil(item_total / PAGE_SIZE);
    const startingPage = getStartPage({ current, totalPageCount });

    const displayPageCount = Math.min(totalPageCount, PAGES_TO_SHOW);

    const pages = [];
    for (let i = 0; i < displayPageCount; i++) {
      pages.push({
        link: getPageUrl(startingPage + i),
        index: startingPage + i,
      });
    }

    return {
      current: current || 1,
      hasNext,
      hasPrevious: hasPrevious || current > 1,
      prevPageLink: hasPrevious || current > 1 ? getPageUrl(current - 1) : "",
      nextPageLink: hasNext ? getPageUrl(current + 1) : "",
      pages,
    };
  }, [blogs?.page]);

  const handleLoadMoreProducts = () => {
    const queryParams = isClient ? new URLSearchParams(location.search) : null;

    const values = {
      pageNo: (blogs?.page?.current ?? 1) + 1,
    };
    const tags = queryParams?.get("tags") || "";
    if (tags) values.tags = tags;
    const search = queryParams?.get("search") || "";
    if (search) values.search = search;
    fetchBlogs(values, true, true);
  };

  useEffect(() => {
    fpi.custom.setValue("isBlogSsrFetched", false);
  }, []);

  useEffect(() => {
    if (!isBlogSsrFetched) {
      const queryParams = isClient
        ? new URLSearchParams(location.search)
        : null;
      const pageNo =
        pageConfig?.loading_options?.value !== "infinite"
          ? queryParams?.get("page_no") || "1"
          : "1";

      const values = {
        pageNo: Number(pageNo),
      };

      const tags = queryParams?.getAll("tag") || "";
      if (tags.length > 0) values.tags = tags.join(",");

      const search = queryParams?.get("search") || "";
      if (search) values.search = search;

      fetchBlogs(values, true);
    }
  }, [location?.search]);

  useEffect(() => {
    const values = {
      pageNo: Number(1),
    };
    if (pageConfig?.filter_tags?.value?.length > 0)
      values.tags = pageConfig.filter_tags?.value?.join(",");

    fpi
      .executeGQL(FETCH_BLOGS_LIST, values, { skipStoreUpdate: true })
      .then((res) => {
        if (res?.data?.applicationContent) {
          const data = res?.data?.applicationContent?.blogs;
          setSliderBlogs(data);
        }
      });
  }, [pageConfig]);

  useEffect(() => {
    if (!totalBlogsListData) {
      const values = {
        pageSize: 12,
        pageNo: 1,
      };
      fpi
        .executeGQL(FETCH_BLOGS_LIST, values, { skipStoreUpdate: true })
        .then((res) => {
          if (res?.data?.applicationContent) {
            const data = res?.data?.applicationContent?.blogs;
            setTotalBlogsList(data);
          }
        });
    }
  }, [totalBlogsListData]);

  function fetchBlogs(values, updateStore, append = false) {
    values.pageSize = PAGE_SIZE;
    setIsLoading(true);
    return fpi
      .executeGQL(FETCH_BLOGS_LIST, values)
      .then((res) => {
        if (res?.data?.applicationContent) {
          const data = res?.data?.applicationContent?.blogs;
          const updatedData = append
            ? {
                ...data,
                items: (blogs?.items || [])?.concat(data?.items || []),
              }
            : data;
          if (updateStore) setBlogs(updatedData);
          setIsLoading(false);
          return updatedData;
        }
      })
      .finally(() => {
        setIsLoading(false);
        setIsBlogPageLoading(false);
      });
  }

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

  const filters = useMemo(() => {
    const search = filterQuery?.search;
    const blogFilters = filterQuery?.tag;

    let tagBlogFilters = [];

    if (blogFilters) {
      tagBlogFilters = (
        Array.isArray(blogFilters) ? blogFilters : [blogFilters]
      )?.map((item) => ({
        display: item,
        pretext: "tag",
        key: item?.toLowerCase(),
      }));
    }

    return [
      ...(tagBlogFilters || []),
      ...(search
        ? [
            {
              display: search,
              pretext: "text",
              key: "search_text",
            },
          ]
        : []),
    ];
  }, [filterQuery]);

  return {
    blogs: blogs || blogsData,
    sliderBlogs: sliderBlogs || totalBlogsListData,
    blogDetails: blogDetails?.[slug],
    totalBlogsList: totalBlogsList || totalBlogsListData,
    footerProps,
    sliderProps,
    contactInfo,
    getBlog,
    fetchBlogs,
    isLoading,
    isBlogDetailsLoading,
    paginationProps,
    isBlogPageLoading,
    search: filterQuery?.search || "",
    filters,
    onLoadMoreProducts: handleLoadMoreProducts,
  };
};

export default useBlog;
