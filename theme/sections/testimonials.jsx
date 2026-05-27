import React, { useMemo } from "react";
import clsx from "clsx";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import styles from "../styles/sections/testimonials.less";
import { useWindowWidth } from "../helper/hooks";
import { getEffectiveCarouselControls } from "../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import useLocaleDirection from "../helper/hooks/useLocaleDirection";
import { BlockRenderer } from "fdk-core/components";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from "../components/carousel";
import Autoplay from "embla-carousel-autoplay";

export function Component({ props, globalConfig, blocks, preset }) {
  const { direction } = useLocaleDirection();
  const { title, autoplay, slide_interval, padding_top, padding_bottom } =
    props;
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth <= 480;
  const isDesktop = windowWidth >= 769;
  const itemsPerView = isMobile ? 1 : 2;

  const testimonialsList = useMemo(() => {
    const blocksData = blocks?.length > 0 ? blocks : preset?.blocks || [];
    const testimonial =
      blocksData.length !== 0 &&
      blocksData.filter(
        (block) =>
          block.type !== "testimonial" ||
          block.props.author_image ||
          block.props.author_testimonial ||
          block.props.author_name ||
          block.props.author_description
      );
    if (blocksData.length !== 0) {
      if (!isMobile) {
        return testimonial.slice(0, 8);
      }
      return testimonial.slice(0, 12);
    }
    return [];
  }, [blocks, preset, isMobile]);

  const shouldForceDesktopLoop =
    isDesktop &&
    testimonialsList.length > 1 &&
    testimonialsList.length <= itemsPerView + 1;

  // Duplicate short desktop lists so Embla can keep both arrows active and
  // cycle testimonials the same way the mobile slider does.
  const renderedTestimonials = useMemo(() => {
    if (!shouldForceDesktopLoop) {
      return testimonialsList;
    }
    return [...testimonialsList, ...testimonialsList];
  }, [testimonialsList, shouldForceDesktopLoop]);

  const len = renderedTestimonials.length;
  const { showArrows, showDots } = getEffectiveCarouselControls(
    globalConfig,
    isDesktop,
    shouldForceDesktopLoop ? len : testimonialsList.length,
    itemsPerView
  );
  const shouldShowArrows =
    showArrows || (shouldForceDesktopLoop && testimonialsList.length > 1);
  const autoplayEnabled = autoplay?.value && len > itemsPerView;
  const autoplayDelay = Number(slide_interval?.value) * 1000 || 3000;

  const carouselProps = useMemo(() => {
    const opts = {
      align: len > itemsPerView ? "start" : "center",
      direction,
      loop: len > itemsPerView,
      draggable: true,
      containScroll: "trimSnaps",
      slidesToScroll: shouldForceDesktopLoop ? 1 : itemsPerView,
      duration: 35,
      breakpoints: {
        "(max-width: 480px)": {
          align: len > 1 ? "start" : "center",
          loop: len > 1,
          slidesToScroll: 1,
        },
      },
    };

    const plugins = autoplayEnabled ? [Autoplay({ delay: autoplayDelay })] : [];
    return { opts, plugins };
  }, [
    direction,
    len,
    itemsPerView,
    shouldForceDesktopLoop,
    autoplayEnabled,
    autoplayDelay,
  ]);

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
        className={clsx(
          styles.testimonialSlider,
          testimonialsList?.length === 1 && styles.oneItem,
          testimonialsList?.length === 2 && styles.twoItem
        )}
      >
        {renderedTestimonials?.length > 0 && (
          <Carousel {...carouselProps}>
            <CarouselContent>
              {renderedTestimonials?.map((block, index) => (
                <CarouselItem key={index} className={styles.carouselItem}>
                  {block?.type === "testimonial" ? (
                    <TestimonialItem
                      className={styles.sliderItem}
                      testimonial={block.props}
                      globalConfig={globalConfig}
                    />
                  ) : (
                    <BlockRenderer block={block} />
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            {shouldShowArrows && (
              <>
                <CarouselPrevious className={styles.carouselBtn} />
                <CarouselNext className={styles.carouselBtn} />
              </>
            )}
            {showDots && !shouldForceDesktopLoop && (
              <CarouselDots productsPerRow={1} />
            )}
          </Carousel>
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
            alt={author_name?.value || t("resource.section.testimonials.author_image")}
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
            aspect_ratio_strict_check: false,
            maxSize: 1024,
            file_types: ["image/png", "image/jpeg"],
            min_resolution: { width: 200, height: 200 },
            max_resolution: { width: 2000, height: 2000 },
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
