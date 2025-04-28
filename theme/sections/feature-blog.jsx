import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import styles from "../styles/sections/feature-blog.less";
import FyImage from "../components/core/fy-image/fy-image";
import { FDKLink } from "fdk-core/components";
import { isRunningOnClient, throttle, formatLocale } from "../helper/utils";
import { FETCH_BLOGS_LIST } from "../queries/blogQuery";
import { useGlobalStore, useFPI, useGlobalTranslation } from "fdk-core/utils";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";

export function Component({ props, globalConfig }) {
  const fpi = useFPI();
  const { language, countryCode } = useGlobalStore(fpi.getters.i18N_DETAILS);
  const locale = language?.locale
  const { t } = useGlobalTranslation("translation");
  const customValues = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const blogItems = customValues?.featuredBlogSectionData ?? [];
  const { heading, description } = props;
  const [windowWidth, setWindowWidth] = useState(0);
  const [config, setConfig] = useState({
    arrows: blogItems.length > 3,
    dots: blogItems.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    swipeToSlide: true,
    autoplay: false,
    pauseOnHover: true,
    cssEase: "linear",
    infinite: blogItems?.length > 3,
    nextArrow: <SliderRightIcon />,
    prevArrow: <SliderLeftIcon />,
    responsive: [
      {
        breakpoint: 780,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
          swipe: true,
          swipeToSlide: false,
          touchThreshold: 80,
          draggable: false,
          touchMove: true,
          dots: blogItems?.length > 2,
          arrows: false,
        },
      },
    ],
  });
  const [configMobile, setConfigMobile] = useState({
    dots: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipeToSlide: false,
    swipe: true,
    autoplay: false,
    pauseOnHover: true,
    cssEase: "linear",
    arrows: false,
    infinite: blogItems?.length > 3,
    touchThreshold: 80,
    draggable: false,
    touchMove: true,
    nextArrow: <SliderRightIcon />,
    prevArrow: <SliderLeftIcon />,
  });

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

  useEffect(() => {
    if (blogItems?.length > 3) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        arrows: blogItems.length > 3,
        dots: blogItems.length > 3,
        infinite: blogItems.length > 3,
      }));
    }
  }, [blogItems]);

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

  const dynamicStyles = {
    paddingTop: "16px",
    paddingBottom: `16px`,
  };

  const getImgSrcSet = () => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      {
        breakpoint: { min: 1023 },
        width: 500,
      },
      {
        breakpoint: { min: 481 },
        width: 350,
      },
      {
        breakpoint: { max: 480 },
        width: 480,
      },
    ];
  };

  useEffect(() => {
    const handleResize = throttle(() => {
      setWindowWidth(isRunningOnClient() ? window.innerWidth : 0);
    }, 500);

    if (isRunningOnClient()) {
      window.addEventListener("resize", handleResize);
      handleResize();
    }

    return () => {
      if (isRunningOnClient()) {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return (
    <div style={dynamicStyles} className={styles.featureBlogWrapper}>
      <div className={styles.blogSection}>
        {heading?.value && (
          <h2 className={`${styles.blogSection__heading} fontHeader`}>
            {heading?.value}
          </h2>
        )}
        {description?.value && (
          <p className={`${styles.blogSection__description} ${styles.b4}`}>
            {description?.value}
          </p>
        )}
      </div>
      {blogItems?.length > 0 && (
        <div
          className={`${blogItems?.length < 3 && styles["single-card-view"]}  ${styles.blogSection__list}`}
          style={{
            "--slick-dots": `${blogItems?.length * 22 + 10}px`,
          }}
        >
          <Slider
            {...config}
            className={` ${blogItems?.length <= 3 ? "no-nav" : ""}   ${styles.hideOnMobile}`}
          >
            {blogItems?.map((blog, index) => (
              <div key={index} className={styles.sliderView}>
                <div className={styles.blog__image}>
                  <FDKLink
                    target="_blank"
                    to={`/blog/${blog.slug}`}
                    title={blog.title}
                  >
                    <div className={`${styles.imageWrapper}`}>
                      <FyImage
                        customClass={`${styles.fImg}`}
                        isImageCover={true}
                        src={blog?.feature_image?.secure_url}
                        alt={blog.title}
                        isLazyLoaded={false}
                        sources={getImgSrcSet()}
                        aspectRatio={16 / 9}
                        mobileAspectRatio={2 / 1}
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
                        <h4>{getBlogTag(blog)}</h4>
                        {blog?.tags?.[1] && <h4>{blog?.tags?.[1]}</h4>}
                      </div>
                    )}

                    <h3 className={`fontHeader ${styles.blog__info__title}`}>
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
                    <span>{blog?.author?.name}</span>
                    <span>{getFormattedDate(blog?.publish_date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
          <Slider
            {...configMobile}
            className={` "no-nav"  ${styles.hideOnDesktop}`}
          >
            {blogItems?.map((blog, index) => (
              <div key={index} className={styles.sliderView}>
                <div className={styles.blog__image}>
                  <FDKLink
                    target="_blank"
                    to={`/blog/${blog.slug}`}
                    title={blog.title}
                  >
                    <div className={`${styles.imageWrapper}`}>
                      <FyImage
                        customClass={`${styles.fImg}`}
                        isImageCover={true}
                        src={blog?.feature_image?.secure_url}
                        alt={blog.title}
                        isLazyLoaded={false}
                        sources={getImgSrcSet()}
                        aspectRatio={16 / 9}
                        mobileAspectRatio={2 / 1}
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
                        <h4>{getBlogTag(blog)}</h4>
                        {blog?.tags?.[1] && <h4>{blog?.tags?.[1]}</h4>}
                      </div>
                    )}

                    <h3 className={`fontHeader ${styles.blog__info__title}`}>
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
                    <span>{blog?.author?.name}</span>
                    <span>{getFormattedDate(blog?.publish_date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}
      {blogItems?.length > 1 && (
        <div className={styles.blogSection__ctaWrapper}>
          <FDKLink
            target="_blank"
            className={styles.blogSection__cta}
            to="/blog"
          >
            {t("resource.facets.view_all")}
          </FDKLink>
        </div>
      )}
    </div>
  );
}

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
      default: "t:resource.sections.blog.feature_blog_description",
      label: "t:resource.common.description",
      info: "t:resource.common.section_description_text",
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
