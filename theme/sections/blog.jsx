import React from "react";
import BlogList from "@gofynd/theme-template/pages/blog/blog";
import "@gofynd/theme-template/pages/blog/blog.css";
import { FETCH_BLOGS_LIST } from "../queries/blogQuery";
import useBlog from "../page-layouts/blog/useBlog";
import { useFPI } from "fdk-core/utils";

export function Component({ props }) {
  const fpi = useFPI();

  const {
    blogs,
    totalBlogsList,
    sliderBlogs,
    footerProps,
    sliderProps,
    paginationProps,
    onLoadMoreProducts,
    isLoading,
    isBlogPageLoading,
    search: ssrSearch,
    filters: ssrFilters,
  } = useBlog({ fpi, props });

  return (
    <>
      <BlogList
        blogs={blogs}
        totalBlogsList={totalBlogsList}
        sliderBlogs={sliderBlogs}
        footerProps={footerProps}
        sliderProps={sliderProps}
        paginationProps={paginationProps}
        onLoadMoreProducts={onLoadMoreProducts}
        isLoading={isLoading}
        isBlogPageLoading={isBlogPageLoading}
        ssrSearch={ssrSearch}
        ssrFilters={ssrFilters}
      ></BlogList>
    </>
  );
}

export const settings = {
  label: "Blog",
  props: [
    {
      type: "checkbox",
      id: "show_blog_slide_show",
      label: "Show Blog Slide Show",
      default: true,
    },
    {
      id: "filter_tags",
      type: "tags-list",
      default: "",
      label: "Filter By Tags",
      info: "Blog tags are case-sensitive. Enter the identical tag used on the Fynd platform, separated by commas, to display the blog post in the slideshow.",
    },
    {
      type: "checkbox",
      id: "autoplay",
      default: true,
      label: "AutoPlay Slides",
    },
    {
      type: "range",
      id: "slide_interval",
      min: 0,
      max: 10,
      step: 0.5,
      unit: "sec",
      label: "Change slides every",
      default: 3,
      info: "Set speed at which slides to be autoplayed in blog slideshow",

    },
    {
      type: "text",
      id: "btn_text",
      default: "Read More",
      label: "Button Text",
    },
    {
      type: "checkbox",
      id: "show_tags",
      label: "Show Tags",
      default: true,
    },
    {
      type: "checkbox",
      id: "show_search",
      label: "Show Search Bar",
      default: true,
    },
    {
      type: "checkbox",
      id: "show_recent_blog",
      label: "Show Recently Published",
      default: true,
      info: "The Recently Published section will display the latest five published blogs",
    },
    {
      id: "recent_blogs",
      type: "blog-list",
      default: "",
      label: "Recently Published Blogs",
      info: "",
    },
    {
      type: "checkbox",
      id: "show_top_blog",
      label: "Show Top Viewed",
      default: true,
      info: "The Top Viewed section will display the latest five published blogs tagged with the 'top5' value",
    },
    {
      id: "top_blogs",
      type: "blog-list",
      default: "",
      label: "Top Viewed Blogs",
      info: "",
    },
    {
      type: "checkbox",
      id: "show_filters",
      label: "Show Filters",
      default: true,
    },
    {
      id: "loading_options",
      type: "select",
      options: [
        {
          value: "infinite",
          text: "Infinite Loading",
        },
        {
          value: "pagination",
          text: "Pagination",
        },
      ],
      default: "pagination",
      label: "Loading Options",
      info:"Choose how blogs load on the page based on user interaction. Infinite Scroll continuously loads more blogs as users scroll. Pagination organises blogs into separate pages with navigation controls"
    },
    {
      id: "title",
      type: "text",
      value: "The Unparalleled Shopping Experience",
      default: "The Unparalleled Shopping Experience",
      label: "Heading",
    },
    {
      id: "description",
      type: "text",
      value:
        "Everything you need for that ultimate stylish wardrobe, Fynd has got it!",
       default: "Everything you need for that ultimate stylish wardrobe, Fynd has got it!",
      label: "Description",
    },
    {
      type: "text",
      id: "button_text",
      value: "Shop Now",
      default: "Shop Now",
      label: "Button Label",
    },
    {
      type: "url",
      id: "button_link",
      default: "",
      label: "Redirect Link",
    },
    {
      type: "image_picker",
      id: "fallback_image",
      label: "Fallback Image",
      default: "",
    },
  ],
};

Component.serverFetch = async ({ fpi, router }) => {
  try {
    const { filterQuery = {} } = router;

    const payload = {
      pageSize: 12,
      pageNo: 1,
    };

    const response = await fpi.executeGQL(FETCH_BLOGS_LIST, payload, {
      skipStoreUpdate: true,
    });

    fpi.custom.setValue("blogProps", {
      totalBlogsListData: response?.data?.applicationContent?.blogs,
      filterQuery,
    });

    const tags = filterQuery?.tag || [];
    if (tags.length > 0)
      payload.tags = Array.isArray(tags) ? tags.join(",") : tags;
    const search = filterQuery?.search || "";
    if (search) payload.search = search;
    const pageNo = filterQuery?.page_no;
    if (pageNo) payload.pageNo = Number(pageNo);

    fpi.custom.setValue("isBlogSsrFetched", true);

    return fpi.executeGQL(FETCH_BLOGS_LIST, payload);
  } catch (error) {
    console.log(error);
  }
};

export default Component;
