import React, { useMemo } from "react";
import Slider from "react-slick";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import styles from "../styles/sections/testimonials.less";
import { useWindowWidth } from "../helper/hooks";
import { SliderNextArrow,SliderPrevArrow } from "../components/slider-arrow/slider-arrow";
import { useGlobalTranslation } from "fdk-core/utils";

export function Component({ props, globalConfig, blocks, preset }) {
  const { title, autoplay, slide_interval, padding_top, padding_bottom } =
    props;
  const windowWidth = useWindowWidth();

  const testimonialsList = useMemo(() => {
    const blocksData = blocks?.length > 0 ? blocks : preset?.blocks;
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
  }, [blocks, preset]);

  const slickSetting = () => {
    return {
      dots: false,
      arrows: testimonialsList.length > 2,
      focusOnSelect: true,
      infinite: testimonialsList.length > 2,
      speed: 600,
      slidesToShow: 2,
      slidesToScroll: 2,
      autoplay: autoplay?.value && testimonialsList.length > 2,
      autoplaySpeed: Number(slide_interval?.value) * 1000,
      centerMode: testimonialsList.length > 2,
      centerPadding: testimonialsList.length > 2 ? "75px" : "0px",
       nextArrow: <SliderNextArrow />,
      prevArrow: <SliderPrevArrow />,
      responsive: [
        {
          breakpoint: 1023,
          settings: {
            arrows: false,
            centerPadding: testimonialsList.length > 2 ? "50px" : "0px",
          },
        },
        {
          breakpoint: 768,
          settings: {
            arrows: false,
            centerPadding: testimonialsList.length > 2 ? "64px" : "0px",
          },
        },
      ],
    };
  };

  const slickSettingMobile = () => {
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
      centerMode: testimonialsList.length > 1,
      centerPadding: "50px",
      nextArrow: <SliderNextArrow />,
      prevArrow: <SliderPrevArrow />,
    };
  };

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 16}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  return (
    <section style={dynamicStyles}>
      <h2 className={`fx-title ${styles.testimonialTitle} fontHeader`}>
        {title?.value}
      </h2>

      <div
        className={`testimonial-slider ${styles.testimonialSlider} 
          ${testimonialsList?.length === 1 ? styles.oneItem : ""}  
          ${testimonialsList?.length === 2 ? styles.twoItem : ""}
        `}
        style={{
          "--slick-dots": `${Math.ceil(testimonialsList?.length) * 22 + 10}px`,
        }}
      >
        {testimonialsList?.length > 0 && (
          <>
            <Slider className={`${styles.hideOnMobile}`} {...slickSetting()}>
              {testimonialsList.map((block, index) => (
                <TestimonialItem
                  key={`desktop_${index}`}
                  className={styles.sliderItem}
                  testimonial={block.props}
                  globalConfig={globalConfig}
                />
              ))}
            </Slider>
            <Slider
              className={`${styles.hideOnDesktop}`}
              {...slickSettingMobile()}
            >
              {testimonialsList.map((block, index) => (
                <TestimonialItem
                  key={`mobile_${index}`}
                  className={styles.sliderItem}
                  testimonial={block.props}
                  globalConfig={globalConfig}
                />
              ))}
            </Slider>
          </>
        )}
      </div>
    </section>
  );
}

const TestimonialItem = ({ className = "", testimonial, globalConfig }) => {
  const { t } = useGlobalTranslation("translation");
  const { author_image, author_testimonial, author_name, author_description } =
    testimonial;
  return (
    <div className={className}>
      <div className={`fx-testimonial-card ${styles.testimonial}`}>
        {author_image?.value && (
          <FyImage
            customClass={styles.testimonialImage}
            src={author_image?.value}
            sources={globalConfig?.img_hd ? [] : [{ width: 700 }]}
            isFixedAspectRatio={false}
          />
        )}
        <div
          className={`fx-testimonial-info ${styles.testimonialInfo} ${
            author_image?.value
              ? styles.testimonial__block__info__has__image
              : ""
          }`}
        >
          <div
            className={`fx-text ${styles.testimonialText}`}
            title={author_testimonial?.value}
          >
            {`${author_testimonial?.value || t("resource.section.testimonials.add_customer_review_text")}`}
          </div>
          <div className={styles.testimonialAuthorInfo}>
            <h5
              className={`fx-author ${styles.authorName}`}
              title={author_name?.value}
            >
              {author_name?.value || ""}
            </h5>
            <div
              className={`fx-author-description ${styles.authorDescription} captionNormal`}
              title={author_description?.value}
            >
              {author_description?.value || ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const settings = {
  label: "t:resource.sections.testimonial.testimonial",
  name: "testimonials",
  props: [
    {
      type: "text",
      id: "title",
      default: "t:resource.default_values.testimonial_title",
      label: "t:resource.common.heading",
    },
    {
      type: "checkbox",
      id: "autoplay",
      default: false,
      label: "t:resource.common.autoplay_slides",
    },
    {
      type: "range",
      id: "slide_interval",
      min: 1,
      max: 10,
      step: 1,
      unit: "sec",
      label: "t:resource.common.change_slides_every",
      default: 2,
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
  blocks: [
    {
      type: "testimonial",
      name: "t:resource.sections.testimonial.testimonial",
      props: [
        {
          type: "image_picker",
          id: "author_image",
          default: "",
          label: "t:resource.common.image",
          options: {
            aspect_ratio: "1:1",
          },
        },
        {
          type: "textarea",
          id: "author_testimonial",
          label: "t:resource.sections.testimonial.testimonial",
          default: "t:resource.default_values.testimonial_textarea",
          info: "t:resource.sections.testimonial.text_for_testimonial",
          placeholder: "t:resource.sections.testimonial.text",
        },
        {
          type: "text",
          id: "author_name",
          default: "t:resource.sections.testimonial.author_name",
          label: "t:resource.sections.testimonial.author_name",
        },
        {
          type: "text",
          id: "author_description",
          default: "t:resource.sections.testimonial.author_description",
          label: "t:resource.sections.testimonial.author_description",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "t:resource.sections.testimonial.testimonial",
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
        name: "t:resource.sections.testimonial.testimonial",
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
        name: "t:resource.sections.testimonial.testimonial",
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
