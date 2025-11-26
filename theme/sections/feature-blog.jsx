import React, { useEffect, useMemo } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "../styles/sections/feature-blog.less";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import { FETCH_BLOGS_LIST } from "../queries/blogQuery";
import { useGlobalStore, useFPI, useGlobalTranslation } from "fdk-core/utils";
import { formatLocale } from "../helper/utils";
import useLocaleDirection from "../helper/hooks/useLocaleDirection";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../components/carousel";

export function Component({ props, globalConfig }) {
  const fpi = useFPI();
  const { language, countryCode } =
    useGlobalStore(fpi.getters.i18N_DETAILS) || {};
  const locale = language?.locale || "en";
  const { t } = useGlobalTranslation("translation");
  const customValues = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const blogItems = customValues?.featuredBlogSectionData ?? [];
  const { heading, description, padding_top, padding_bottom } = props;
  const { isRTL } = useLocaleDirection();

  const len = blogItems.length;

  const options = useMemo(() => {
    return {
      align: "start",
      direction: isRTL ? "rtl" : "ltr",
      loop: len > 3,
      draggable: true,
      containScroll: "trimSnaps",
      slidesToScroll: 1,
      duration: 30,
      breakpoints: {
        "(max-width: 768px)": {
          startIndex: 0,
        },
      },
    };
  }, [isRTL, len]);

  useEffect(() => {
    const fetchBlogs = () => {
      const payload = {
        pageSize: 12,
        pageNo: 1,
      };
      fpi.executeGQL(FETCH_BLOGS_LIST, payload).then((res) => {
        fpi.custom.setValue(
          `featuredBlogSectionData`,
          res?.data?.applicationContent?.blogs?.items
        );
      });
    };

    if (!customValues.featuredBlogSectionData) fetchBlogs();
  }, [customValues.featuredBlogSectionData]);

  const getImgSrcSet = () => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 1728 }, width: Math.round(3564 / 3) },
      { breakpoint: { min: 1512 }, width: Math.round(3132 / 3) },
      { breakpoint: { min: 1296 }, width: Math.round(2700 / 3) },
      { breakpoint: { min: 1080 }, width: Math.round(2250 / 3) },
      { breakpoint: { min: 900 }, width: Math.round(1890 / 3) },
      { breakpoint: { min: 720 }, width: Math.round(1530 / 2) },
      { breakpoint: { min: 540 }, width: Math.round(1170 / 2) },
      { breakpoint: { min: 360 }, width: Math.round(810) },
      { breakpoint: { min: 180 }, width: Math.round(450) },
    ];
  };

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 16}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  return (
    <section style={dynamicStyles}>
      {(!!heading?.value || !!description?.value) && (
        <div className={`fx-title-block ${styles.blogTitleWrapper}`}>
          {!!heading?.value && (
            <h2 className={`fx-title ${styles.blogTitle} fontHeader`}>
              {heading?.value}
            </h2>
          )}
          {!!description?.value && (
            <p
              className={`fx-description ${styles.blogDescription} ${styles.b4}`}
            >
              {description?.value}
            </p>
          )}
        </div>
      )}
      {blogItems?.length > 0 && (
        <div
          className={`remove-horizontal-scroll ${blogItems?.length < 3 && styles["single-card-view"]}  ${styles.blogSlider}`}
        >
          <Carousel opts={options}>
            <CarouselContent>
              {blogItems?.map((blog, index) => (
                <CarouselItem key={index} className={styles.carouselItem}>
                  <BlogItem
                    key={index}
                    className={styles.sliderItem}
                    blog={blog}
                    sources={getImgSrcSet()}
                    defer={index > 1}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className={styles.carouselBtn} />
            <CarouselNext className={styles.carouselBtn} />
          </Carousel>
        </div>
      )}
      {!!blogItems?.length && (
        <div className={styles.blogCtaWrapper}>
          <FDKLink
            target="_blank"
            className={`fx-button ${styles.blogCta}`}
            to="/blog"
          >
            View All
          </FDKLink>
        </div>
      )}
    </section>
  );
}

const BlogItem = ({ className = "", blog, sources, defer }) => {
  const fpi = useFPI();
  const { language, countryCode } =
    useGlobalStore(fpi.getters.i18N_DETAILS) || {};
  const locale = language?.locale || "en";
  const getBlogTag = (blog) => {
    return blog?.tags?.length > 1 ? `${blog?.tags?.[0]},` : blog?.tags?.[0];
  };

  const convertUTCDateToLocalDate = (date, format) => {
    if (!format) {
      format = {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };
    }
    const utcDate = new Date(date);
    // Convert the UTC date to the local date using toLocaleString() with specific time zone
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = {
      ...format,
      timeZone: browserTimezone,
    };
    // Convert the UTC date and time to the desired format
    const formattedDate = utcDate
      .toLocaleString(formatLocale(locale, countryCode), options)
      .replace(" at ", ", ");
    return formattedDate;
  };

  const getFormattedDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return convertUTCDateToLocalDate(dateString, options);
  };

  return (
    <div className={`fx-blog-card ${className}`}>
      <div className={styles.blog__image}>
        <FDKLink target="_blank" to={`/blog/${blog.slug}`} title={blog.title}>
          <div className={`${styles.imageWrapper}`}>
            <FyImage
              customClass={`fx-blog-image ${styles.fImg}`}
              isImageFill={true}
              src={blog?.feature_image?.secure_url || ""}
              alt={blog.title}
              sources={sources}
              aspectRatio={16 / 9}
              mobileAspectRatio={2 / 1}
              defer={defer}
            />
          </div>
        </FDKLink>
      </div>
      <div className={styles.blog__info}>
        <div className={styles.blog__info__titleSection}>
          {getBlogTag(blog) && (
            <div
              className={`${styles.blog__info__tags} ${styles.blog__info__flexAlignAenter}`}
            >
              <h4 className="fx-blog-tag">{getBlogTag(blog)}</h4>
              {blog?.tags?.[1] && (
                <h4 className="fx-blog-tag">{blog?.tags?.[1]}</h4>
              )}
            </div>
          )}
          <h3
            className={`fx-blog-title fontHeader ${styles.blog__info__title}`}
          >
            <FDKLink
              target="_blank"
              to={`/blog/${blog.slug}`}
              title={blog.title}
            >
              {blog.title}
            </FDKLink>
          </h3>
        </div>
        <div
          className={`${styles.blog__info__meta} ${styles.blog__info__flexAlignAenter} ${styles.blog__info__dateContainer}`}
        >
          <span className="fx-author">{blog?.author?.name}</span>
          <span className="fx-publish-date">
            {getFormattedDate(blog?.publish_date)}
          </span>
        </div>
      </div>
    </div>
  );
};

export const settings = {
  label: "t:resource.sections.blog.feature_blog",
  props: [
    {
      type: "text",
      id: "heading",
      default: "t:resource.sections.blog.feature_blog",
      label: "t:resource.common.heading",
      info: "t:resource.common.section_heading_text",
    },
    {
      type: "textarea",
      id: "description",
      default: "t:resource.default_values.feature_blog_description",
      label: "t:resource.common.description",
      info: "t:resource.common.section_description_text",
    },
    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.categories.top_padding",
      default: 16,
      info: "t:resource.sections.categories.top_padding_for_section",
    },
    {
      type: "range",
      id: "padding_bottom",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.categories.bottom_padding",
      default: 16,
      info: "t:resource.sections.categories.bottom_padding_for_section",
    },
  ],
};

Component.serverFetch = async ({ fpi, props, id }) => {
  try {
    const payload = {
      pageSize: 12,
      pageNo: 1,
    };
    const response = await fpi.executeGQL(FETCH_BLOGS_LIST, payload);
    return fpi.custom.setValue(
      `featuredBlogSectionData`,
      response?.data?.applicationContent?.blogs?.items
    );
  } catch (err) {
    console.log(err);
  }
};
export default Component;
