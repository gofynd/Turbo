import React, { useMemo } from "react";
import clsx from "clsx";
import { FDKLink, BlockRenderer } from "fdk-core/components";
import styles from "../styles/sections/image-gallery.less";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import placeholderImage from "../assets/images/placeholder/image-gallery.png";
import { useLocaleDirection } from "../helper/hooks";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../components/carousel";
import Autoplay from "embla-carousel-autoplay";
import { getMediaLayout } from "../helper/media-layout";
import { useWindowWidth } from "../helper/hooks";

export function Component({ props, blocks = [], globalConfig = {}, preset }) {
  const {
    autoplay: { value: autoplay } = {},
    play_slides: { value: playSlides } = {},
    title: { value: title } = {},
    description: { value: description } = {},
    desktop_layout: { value: desktopLayout } = {},
    item_count = {},
    mobile_layout: { value: mobileLayout } = {},
    item_count_mobile = {},
    card_radius: { value: cardRadius } = {},
    padding_top: { value: paddingTop = 16 } = {},
    padding_bottom: { value: paddingBottom = 16 } = {},
    in_new_tab = { value: false },
    height_mode,
    desktop_height,
    mobile_height,
    desktop_aspect_ratio,
    mobile_aspect_ratio,
  } = props;
  const windowWidth = useWindowWidth();
  const isMobileViewport = windowWidth <= 768;

  const itemCount = Number(item_count?.value ?? 5);
  const itemCountMobile = Number(item_count_mobile?.value ?? 2);

  const galleryItems = blocks?.length ? blocks : preset?.blocks || [];

  const isStackView = desktopLayout === "grid" || mobileLayout === "grid";
  const isHorizontalView =
    desktopLayout === "horizontal" || mobileLayout === "horizontal";

  const getImgSrcSet = useMemo(() => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 1728 }, width: Math.round(3564 / itemCount) },
      { breakpoint: { min: 1512 }, width: Math.round(3132 / itemCount) },
      { breakpoint: { min: 1296 }, width: Math.round(2700 / itemCount) },
      { breakpoint: { min: 1080 }, width: Math.round(2250 / itemCount) },
      { breakpoint: { min: 900 }, width: Math.round(1890 / itemCount) },
      { breakpoint: { min: 720 }, width: Math.round(1530 / itemCount) },
      { breakpoint: { min: 540 }, width: Math.round(1170 / itemCountMobile) },
      { breakpoint: { min: 360 }, width: Math.round(810 / itemCountMobile) },
      { breakpoint: { min: 180 }, width: Math.round(450 / itemCountMobile) },
    ];
  }, [globalConfig?.img_hd, itemCount, itemCountMobile]);

  const dynamicStyles = {
    paddingTop: `${paddingTop}px`,
    paddingBottom: `${paddingBottom}px`,
    maxWidth: "100vw",
    "--bd-radius": `${(cardRadius || 0) / 2}%`,
  };

  // Only use mediaLayout when height_mode is explicitly configured
  const hasHeightConfig =
    height_mode?.value &&
    height_mode.value !== "auto" &&
    (height_mode.value === "aspect_ratio" ||
      height_mode.value === "fixed_height");

  const mediaLayout = useMemo(
    () =>
      hasHeightConfig
        ? getMediaLayout(
            {
              height_mode,
              desktop_height,
              mobile_height,
              desktop_aspect_ratio,
              mobile_aspect_ratio,
            },
            isMobileViewport,
            1
          )
        : null,
    [
      hasHeightConfig,
      height_mode?.value,
      desktop_height?.value,
      mobile_height?.value,
      desktop_aspect_ratio?.value,
      mobile_aspect_ratio?.value,
      isMobileViewport,
    ]
  );

  const mediaWrapperClass = [
    mediaLayout
      ? [
          styles.mediaShell,
          mediaLayout.isAspectRatio ? styles.mediaShellAspect : "",
          mediaLayout.isFixedHeight ? styles.mediaShellFixedHeight : "",
        ]
      : [],
  ]
    .flat()
    .filter(Boolean)
    .join(" ");

  return (
    <section style={dynamicStyles}>
      <div className={`fx-title-block ${styles.titleBlock}`}>
        {title && (
          <h2 className={`fx-title ${styles.sectionHeading} fontHeader`}>
            {title}
          </h2>
        )}
        {description && (
          <p className={`fx-description ${styles.description} b2`}>
            {description}
          </p>
        )}
      </div>
      {isHorizontalView && (
        <HorizontalLayout
          className={`${desktopLayout === "grid" ? styles.hideOnDesktop : ""} ${
            mobileLayout === "grid" ? styles.hideOnTablet : ""
          }`}
          items={galleryItems}
          globalConfig={globalConfig}
          colCount={itemCount}
          colCountMobile={itemCountMobile}
          sources={getImgSrcSet}
          autoplay={autoplay}
          autoplaySpeed={playSlides * 1000}
          in_new_tab={in_new_tab}
          mediaLayout={mediaLayout}
          mediaWrapperClass={mediaWrapperClass}
        />
      )}
      {isStackView && (
        <StackLayout
          className={`${
            desktopLayout === "horizontal" ? styles.hideOnDesktop : ""
          } ${mobileLayout === "horizontal" ? styles.hideOnTablet : ""}`}
          items={galleryItems}
          globalConfig={globalConfig}
          colCount={itemCount}
          colCountMobile={itemCountMobile}
          sources={getImgSrcSet}
          desktopLayout={desktopLayout}
          mobileLayout={mobileLayout}
          in_new_tab={in_new_tab}
          mediaLayout={mediaLayout}
          mediaWrapperClass={mediaWrapperClass}
        />
      )}
    </section>
  );
}

const StackLayout = ({
  className,
  items,
  globalConfig,
  colCount,
  colCountMobile,
  sources,
  in_new_tab,
  mediaLayout,
  mediaWrapperClass,
}) => {
  const dynamicStyles = {
    "--item-count": `${colCount}`,
    "--item-count-mobile": `${colCountMobile}`,
  };

  return (
    <div className={`${styles.imageGrid} ${className}`} style={dynamicStyles}>
      {items.map(({ props: block }, index) => (
        <div key={index}>
          <FDKLink
            to={block?.link?.value || ""}
            target={in_new_tab?.value ? "_blank" : "_self"}
          >
            <div className={mediaWrapperClass} style={mediaLayout?.style}>
              <FyImage
                customClass={styles.imageGallery}
                src={block?.image?.value || placeholderImage}
                sources={sources}
                globalConfig={globalConfig}
                {...(mediaLayout
                  ? {
                      isFixedAspectRatio: mediaLayout.isAspectRatio,
                      aspectRatio: mediaLayout.aspectRatio ?? 1,
                      mobileAspectRatio: mediaLayout.mobileAspectRatio ?? 1,
                      isImageFill:
                        mediaLayout.isAspectRatio || mediaLayout.isFixedHeight,
                    }
                  : {
                      isFixedAspectRatio: false,
                    })}
                alt={block?.image?.alt || "Gallery image"}
              />
            </div>
          </FDKLink>
        </div>
      ))}
    </div>
  );
};

const HorizontalLayout = ({
  className,
  items,
  globalConfig,
  colCount,
  colCountMobile,
  sources,
  autoplay,
  autoplaySpeed,
  in_new_tab,
  mediaLayout,
  mediaWrapperClass,
}) => {
  const { direction } = useLocaleDirection();
  const len = items?.length;

  const carouselProps = useMemo(() => {
    const opts = {
      align: len > colCountMobile ? "center" : "start",
      direction,
      loop: len > colCountMobile,
      draggable: true,
      containScroll: "trimSnaps",
      slidesToScroll: colCountMobile,
      duration: 30,
      breakpoints: {
        "(min-width: 481px)": {
          align: "start",
          loop: len > colCount,
          slidesToScroll: colCount,
        },
      },
    };
    const plugins = autoplay ? [Autoplay({ delay: autoplaySpeed })] : [];
    return { opts, plugins };
  }, [direction, len, colCount, colCountMobile, autoplay, autoplaySpeed]);

  return (
    <div
      className={clsx(
        "remove-horizontal-scroll",
        styles.imageSlider,
        items?.length <= colCountMobile && styles.mobileItemLess,
        className
      )}
    >
      <Carousel {...carouselProps}>
        <CarouselContent>
          {items.map((block, index) => (
            <CarouselItem
              key={index}
                className={styles.carouselItem}
                style={{
                  "--count-desktop": colCount,
                  "--count-mobile": colCountMobile,
                }}
              >
                {block.type === "gallery" ? (
                  <div key={index} className={styles.sliderItem}>
                    <FDKLink
                      to={block?.props?.link?.value || ""}
                      target={in_new_tab?.value ? "_blank" : "_self"}
                    >
                      <div className={mediaWrapperClass} style={mediaLayout?.style}>
                        <FyImage
                          customClass={styles.imageGallery}
                          src={block?.props?.image?.value || placeholderImage}
                          sources={sources}
                          globalConfig={globalConfig}
                          {...(mediaLayout
                            ? {
                                isFixedAspectRatio: mediaLayout.isAspectRatio,
                                aspectRatio: mediaLayout.aspectRatio ?? 1,
                                mobileAspectRatio:
                                  mediaLayout.mobileAspectRatio ?? 1,
                                isImageFill:
                                  mediaLayout.isAspectRatio ||
                                  mediaLayout.isFixedHeight,
                              }
                            : {
                                isFixedAspectRatio: false,
                              })}
                          alt={
                            block?.props?.image?.alt ||
                            block?.props?.title?.value ||
                            "Gallery image"
                          }
                        />
                      </div>
                    </FDKLink>
                  </div>
                ) : (
                  <BlockRenderer key={index} block={block} />
                )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className={styles.carouselBtn} />
        <CarouselNext className={styles.carouselBtn} />
      </Carousel>
    </div>
  );
};

export const settings = {
  label: "t:resource.sections.image_gallery.image_gallery",
  props: [
    {
      type: "text",
      id: "title",
      default: "t:resource.default_values.image_gallery_title",
      label: "t:resource.common.heading",
    },
    {
      type: "text",
      id: "description",
      default: "t:resource.default_values.image_gallery_description",
      label: "t:resource.common.description",
    },
    {
      type: "range",
      id: "card_radius",
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      label: "t:resource.sections.image_gallery.card_radius",
      default: 0,
    },
    {
      id: "desktop_layout",
      type: "select",
      options: [
        {
          value: "grid",
          text: "t:resource.common.stack",
        },
        {
          value: "horizontal",
          text: "t:resource.common.horizontal_scroll",
        },
      ],
      default: "horizontal",
      label: "t:resource.common.desktop_layout",
      info: "t:resource.sections.image_gallery.items_per_row_limit_for_scroll",
    },
    {
      type: "range",
      id: "item_count",
      min: 3,
      max: 10,
      step: 1,
      unit: "",
      label: "t:resource.sections.image_gallery.items_per_row_desktop",
      default: 5,
    },
    {
      id: "mobile_layout",
      type: "select",
      options: [
        {
          value: "grid",
          text: "t:resource.common.stack",
        },
        {
          value: "horizontal",
          text: "t:resource.common.horizontal_scroll",
        },
      ],
      default: "grid",
      label: "t:resource.common.mobile_layout",
      info: "t:resource.common.alignment_of_content",
    },
    {
      type: "range",
      id: "item_count_mobile",
      min: 1,
      max: 5,
      step: 1,
      unit: "",
      label: "t:resource.sections.image_gallery.items_per_row_mobile",
      default: 2,
    },
    {
      type: "checkbox",
      id: "autoplay",
      default: false,
      label: "t:resource.common.auto_play_slides",
    },
    {
      type: "checkbox",
      id: "in_new_tab",
      label: "t:resource.common.open_product_in_new_tab",
      default: false,
      info: "t:resource.common.open_product_in_new_tab_desktop",
    },
    {
      type: "range",
      id: "play_slides",
      min: 1,
      max: 10,
      step: 1,
      unit: "sec",
      label: "t:resource.common.change_slides_every",
      default: 3,
    },
    {
      id: "height_mode",
      type: "select",
      label: "t:resource.common.height_mode",
      default: "auto",
      options: [
        { value: "auto", text: "t:resource.common.auto" },
        { value: "fixed_height", text: "t:resource.common.fixed_height" },
        { value: "aspect_ratio", text: "t:resource.common.aspect_ratio" },
      ],
    },
    {
      type: "text",
      id: "desktop_height",
      label: "t:resource.common.desktop_height",
      info: "t:resource.common.desktop_height_info",
    },
    {
      type: "text",
      id: "mobile_height",
      label: "t:resource.common.mobile_height",
      info: "t:resource.common.mobile_height_info",
    },
    {
      type: "text",
      id: "desktop_aspect_ratio",
      label: "t:resource.common.desktop_aspect_ratio",
      info: "t:resource.common.aspect_ratio_help_text",
    },
    {
      type: "text",
      id: "mobile_aspect_ratio",
      label: "t:resource.common.mobile_aspect_ratio",
      info: "t:resource.common.aspect_ratio_help_text",
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
      name: "t:resource.common.image_card",
      type: "gallery",
      props: [
        {
          type: "image_picker",
          id: "image",
          label: "t:resource.common.image",
          default: "",
          options: {
            aspect_ratio: "1:1",
          },
        },
        {
          type: "url",
          id: "link",
          label: "t:resource.common.redirect",
          default: "",
          info: "t:resource.sections.image_gallery.search_link_type",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "t:resource.common.image_card",
        props: {
          image: {
            type: "image_picker",
          },
          link: {
            type: "url",
          },
        },
      },
      {
        name: "t:resource.common.image_card",
        props: {
          image: {
            type: "image_picker",
          },
          link: {
            type: "url",
          },
        },
      },
      {
        name: "t:resource.common.image_card",
        props: {
          image: {
            type: "image_picker",
          },
          link: {
            type: "url",
          },
        },
      },
      {
        name: "t:resource.common.image_card",
        props: {
          image: {
            type: "image_picker",
          },
          link: {
            type: "url",
          },
        },
      },
    ],
  },
};
export default Component;
