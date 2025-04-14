import React, { useState, useEffect, useRef, useMemo } from "react";
import Slider from "react-slick";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import styles from "../styles/sections/testimonials.less";
import { isRunningOnClient } from "../helper/utils";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";

export function Component({ props, globalConfig, blocks, preset }) {
  const { title, autoplay, slide_interval, testimonials } = props;
  const [windowWidth, setWindowWidth] = useState(
    isRunningOnClient() ? window?.innerWidth : 400
  );
  const blocksData = blocks?.length > 0 ? blocks : preset?.blocks;
  const [isImageless, setIsImageless] = useState(false);

  useEffect(() => {
    const isImageUnavailable = !blocks?.some(
      (b) => b.props.author_image?.value?.length > 0
    );
    setIsImageless(isImageUnavailable);
  }, [JSON.stringify(blocks)]);

  useEffect(() => {
    if (isRunningOnClient()) {
      setWindowWidth(window?.innerWidth);

      const handleResize = () => {
        setWindowWidth(window?.innerWidth);
      };

      window?.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  const getTestimonials = () => {
    const testimonial =
      blocksData.length !== 0 &&
      blocksData.filter(
        (block) =>
          block.props.author_image ||
          block.props.author_testimonial ||
          block.props.author_name ||
          block.props.author_description
      );
    if (blocksData.length !== 0) {
      if (windowWidth > 480) {
        return testimonial.slice(0, 8);
      }
      return testimonial.slice(0, 12);
    }
  };

  const slickSetting = () => {
    const testimonialsList = getTestimonials();
    return {
      dots: testimonialsList.length > 2,
      arrows: testimonialsList.length > 2,
      focusOnSelect: true,
      infinite: testimonialsList.length > 1,
      speed: 600,
      slidesToShow: 2, // Show only one slide if there's only one testimonial
      slidesToScroll: 2, // Scroll one slide if there's only one testimonial
      autoplay: autoplay?.value && testimonialsList.length > 2,
      autoplaySpeed: Number(slide_interval?.value) * 1000,
      centerMode: testimonialsList.length !== 2,
      centerPadding: testimonialsList.length === 1 ? "0" : "75px",
      nextArrow: <SliderRightIcon />,
      prevArrow: <SliderLeftIcon />,
      responsive: [
        {
          breakpoint: 1023,
          settings: {
            arrows: false,
            centerPadding: "50px",
            autoplay: autoplay?.value && testimonialsList.length > 2,
          },
        },
        {
          breakpoint: 768,
          settings: {
            arrows: false,
            centerPadding: "64px",
            autoplay: autoplay?.value && testimonialsList.length > 2,
          },
        },
      ],
    };
  };
  const slickSettingMobile = () => {
    const testimonialsList = getTestimonials();
    return {
      dots: false,
      arrows: false,
      slidesToShow: 1,
      slidesToScroll: 1,
      focusOnSelect: true,
      infinite: testimonialsList.length > 1,
      speed: 600,
      autoplay: autoplay?.value && testimonialsList.length > 1,
      autoplaySpeed: Number(slide_interval?.value) * 1000,
      centerMode: testimonialsList.length !== 1,
      centerPadding: "50px",
      nextArrow: <SliderRightIcon />,
      prevArrow: <SliderLeftIcon />,
    };
  };

  const dynamicStyles = {
    paddingTop: "16px",
    paddingBottom: `16px`,
  };

  return (
    <div className={styles.testimonial} style={dynamicStyles}>
      <h2 className={`${styles.testimonial__title} fontHeader`}>
        {title?.value}
      </h2>

      <div
        className={styles.sliderWrap}
        style={{
          "--slick-dots": `${Math.ceil(getTestimonials()?.length) * 22 + 10}px`,
        }}
      >
        {getTestimonials()?.length > 0 && (
          <>
            <Slider
              className={`${styles.testimonial__carousel} ${getTestimonials()?.length > 2 ? "" : "no-nav"} ${styles.hideOnMobile}`}
              {...slickSetting()}
            >
              {getTestimonials().map((block, index) => (
                <div key={index} className={styles.testimonialItem}>
                  <div
                    className={`${styles.testimonial__block} ${isImageless ? styles.b24 : ""} animation-fade-up animate`}
                    style={{
                      "--delay":
                        getTestimonials().length - 1 === index
                          ? "150ms"
                          : `${150 * (index + 2)}ms`,
                    }}
                  >
                    {block.props?.author_image?.value && (
                      <FyImage
                        customClass={styles.testimonial__block__image}
                        src={block?.props?.author_image?.value}
                        aspectRatio={1 / 1}
                        mobileAspectRatio={1 / 1}
                        sources={
                          globalConfig?.img_hd
                            ? []
                            : [
                                { breakpoint: { min: 1024 }, width: 350 },
                                { breakpoint: { min: 768 }, width: 350 },
                                { breakpoint: { min: 481 }, width: 350 },
                                { breakpoint: { max: 390 }, width: 350 },
                              ]
                        }
                        isFixedAspectRatio={false}
                      />
                    )}
                    <div
                      className={`${styles.testimonial__block__info} ${
                        block.props?.author_image?.value
                          ? styles.testimonial__block__info__has__image
                          : ""
                      }`}
                    >
                      <div
                        className={`${styles.testimonial__block__info__text} fontBody`}
                        title={block.props?.author_testimonial?.value}
                      >
                        {`"${block.props?.author_testimonial?.value || "Add customer reviews and testimonials to showcase your store's happy customers."}"`}
                      </div>
                      <div className={styles.testimonial__block__info__author}>
                        <h5
                          className={`${styles.testimonial__block__info__author__name} fontBody `}
                          title={block.props?.author_name?.value}
                        >
                          {block.props?.author_name?.value || ""}
                        </h5>
                        <div
                          className={`${styles.testimonial__block__info__author__description} captionNormal`}
                          title={block.props?.author_description?.value}
                        >
                          {block.props?.author_description?.value || ""}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
            <Slider
              className={`${styles.testimonial__carousel} ${getTestimonials()?.length > 2 ? "" : "no-nav"} ${styles.hideOnDesktop}`}
              {...slickSettingMobile()}
            >
              {getTestimonials().map((block, index) => (
                <div key={index} className={styles.testimonialItem}>
                  <div
                    className={`${styles.testimonial__block} ${isImageless ? styles.b24 : ""} animation-fade-up animate`}
                    style={{
                      "--delay":
                        getTestimonials().length - 1 === index
                          ? "150ms"
                          : `${150 * (index + 2)}ms`,
                    }}
                  >
                    {block.props?.author_image?.value && (
                      <FyImage
                        customClass={styles.testimonial__block__image}
                        src={block?.props?.author_image?.value}
                        aspectRatio={1 / 1}
                        mobileAspectRatio={1 / 1}
                        sources={[
                          { breakpoint: { min: 1024 }, width: 350 },
                          { breakpoint: { min: 768 }, width: 350 },
                          { breakpoint: { min: 481 }, width: 350 },
                          { breakpoint: { max: 390 }, width: 350 },
                        ]}
                        isFixedAspectRatio={false}
                      />
                    )}
                    <div
                      className={`${styles.testimonial__block__info} ${
                        block.props?.author_image?.value
                          ? styles.testimonial__block__info__has__image
                          : ""
                      }`}
                    >
                      <div
                        className={`${styles.testimonial__block__info__text} fontBody`}
                        title={block.props?.author_testimonial?.value}
                      >
                        {`"${block.props?.author_testimonial?.value || "Add customer reviews and testimonials to showcase your store's happy customers."}"`}
                      </div>
                      <div className={styles.testimonial__block__info__author}>
                        <h5
                          className={`${styles.testimonial__block__info__author__name} fontBody `}
                          title={block.props?.author_name?.value}
                        >
                          {block.props?.author_name?.value || ""}
                        </h5>
                        <div
                          className={`${styles.testimonial__block__info__author__description} captionNormal`}
                          title={block.props?.author_description?.value}
                        >
                          {block.props?.author_description?.value || ""}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </>
        )}
      </div>
    </div>
  );
}

export const settings = {
  label: "Testimonial",
  name: "testimonials",
  props: [
    {
      type: "text",
      id: "title",
      default: "What People Are Saying About Us ",
      label: "Heading",
    },
    {
      type: "checkbox",
      id: "autoplay",
      default: false,
      label: "AutoPlay Slides",
    },
    {
      type: "range",
      id: "slide_interval",
      min: 1,
      max: 10,
      step: 1,
      unit: "sec",
      label: "Change slides every",
      default: 2,
    },
  ],
  blocks: [
    {
      type: "testimonial",
      name: "Testimonial",
      props: [
        {
          type: "image_picker",
          id: "author_image",
          default: "",
          label: "Image",
          options: {
            aspect_ratio: "1:1",
          },
        },
        {
          type: "textarea",
          id: "author_testimonial",
          label: "Testimonial",
          default:
            "Add customer reviews and testimonials to showcase your store's happy customers.",
          info: "Text for testimonial",
          placeholder: "Text",
        },
        {
          type: "text",
          id: "author_name",
          default: "Author Name",
          label: "Author Name",
        },
        {
          type: "text",
          id: "author_description",
          default: "Author Description",
          label: "Author Description",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "Testimonial",
        props: {
          author_image: {
            type: "image_picker",
            value: "",
          },
          author_testimonial: {
            type: "textarea",
            value:
              "Add customer reviews and testimonials to showcase your store's happy customers.",
          },
          author_name: {
            type: "text",
            value: "Author Description",
          },
          author_description: {
            type: "text",
            value: "Author Description",
          },
        },
      },
      {
        name: "Testimonial",
        props: {
          author_image: {
            type: "image_picker",
            value: "",
          },
          author_testimonial: {
            type: "textarea",
            value:
              "Add customer reviews and testimonials to showcase your store's happy customers.",
          },
          author_name: {
            type: "text",
            value: "Author Description",
          },
          author_description: {
            type: "text",
            value: "Author Description",
          },
        },
      },
      {
        name: "Testimonial",
        props: {
          author_image: {
            type: "image_picker",
            value: "",
          },
          author_testimonial: {
            type: "textarea",
            value:
              "Add customer reviews and testimonials to showcase your store's happy customers.",
          },
          author_name: {
            type: "text",
            value: "Author Description",
          },
          author_description: {
            type: "text",
            value: "Author Description",
          },
        },
      },
    ],
  },
};
export default Component;
