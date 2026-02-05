import React, { useMemo } from "react";
import { FDKLink, BlockRenderer } from "fdk-core/components";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import placeholderDesktop1 from "../assets/images/placeholder/slideshow-desktop1.jpg";
import placeholderDesktop2 from "../assets/images/placeholder/slideshow-desktop2.jpg";
import placeholderMobile1 from "../assets/images/placeholder/slideshow-mobile1.jpg";
import placeholderMobile2 from "../assets/images/placeholder/slideshow-mobile2.jpg";
import styles from "../styles/sections/image-slideshow.less";
import { useNavigate } from "fdk-core/utils";
import useLocaleDirection from "../helper/hooks/useLocaleDirection";
import { useWindowWidth } from "../helper/hooks";
import { getDirectionAdaptiveValue } from "../helper/utils";
import { DIRECTION_ADAPTIVE_CSS_PROPERTIES } from "../helper/constant";
import { getMediaLayout } from "../helper/media-layout";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../components/carousel";
import Autoplay from "embla-carousel-autoplay";

const placeholderImagesDesktop = [placeholderDesktop1, placeholderDesktop2];
const placeholderImagesMobile = [placeholderMobile1, placeholderMobile2];

function getMobileImage(block, index) {
  return (
    block?.props?.mobile_image?.value ||
    placeholderImagesMobile[index % placeholderImagesMobile.length]
  );
}
function getDesktopImage(block, index) {
  return (
    block?.props?.image?.value ||
    placeholderImagesDesktop[index % placeholderImagesDesktop.length]
  );
}

function getImgSrcSet(block, globalConfig, index) {
  if (globalConfig?.img_hd) {
    return [
      { breakpoint: { min: 501 } },
      { breakpoint: { max: 540 }, url: getMobileImage(block, index) },
    ];
  }
  return [
    { breakpoint: { min: 1728 }, width: 3564 },
    { breakpoint: { min: 1512 }, width: 3132 },
    { breakpoint: { min: 1296 }, width: 2700 },
    { breakpoint: { min: 1080 }, width: 2250 },
    { breakpoint: { min: 900 }, width: 1890 },
    { breakpoint: { min: 720 }, width: 1530 },
    { breakpoint: { max: 180 }, width: 450, url: getMobileImage(block, index) },
    { breakpoint: { max: 360 }, width: 810, url: getMobileImage(block, index) },
    {
      breakpoint: { max: 540 },
      width: 1170,
      url: getMobileImage(block, index),
    },
  ];
}

export function Component({ props, blocks, globalConfig, preset }) {
  const { direction } = useLocaleDirection();
  const blocksData = blocks.length === 0 ? preset?.blocks : blocks;
  const {
    autoplay,
    slide_interval,
    padding_top,
    padding_bottom,
    open_in_new_tab,
    height_mode,
    desktop_height,
    mobile_height,
    desktop_aspect_ratio,
    mobile_aspect_ratio,
  } = props;
  const shouldOpenInNewTab =
    open_in_new_tab?.value === true || open_in_new_tab?.value === "true";
  const windowWidth = useWindowWidth();

  const plugins = useMemo(() => {
    if (autoplay?.value) {
      return [
        Autoplay({
          stopOnMouseEnter: true,
          stopOnInteraction: false,
          delay: (slide_interval?.value ?? 3) * 1000,
        }),
      ];
    }
    return [];
  }, [autoplay?.value, slide_interval?.value]);

  const mediaLayout = getMediaLayout(
    {
      height_mode,
      desktop_height,
      mobile_height,
      desktop_aspect_ratio,
      mobile_aspect_ratio,
    },
    windowWidth <= 768,
    16 / 5
  );

  const slideMediaClass = [
    styles.imageContainer,
    styles.mediaShell,
    mediaLayout.isAspectRatio ? styles.mediaShellAspect : "",
    mediaLayout.isFixedHeight ? styles.mediaShellFixedHeight : "",
  ]
    .filter(Boolean)
    .join(" ");

  const getOverlayPositionStyles = (block) => {
    const positions = {};
    const responsiveViews = ["mobile", "desktop"];

    responsiveViews.forEach((view) => {
      const overlayPosition =
        view === "mobile"
          ? block?.props?.text_placement_mobile?.value
          : block?.props?.text_placement_desktop?.value;

      const contentAlignment =
        view === "mobile"
          ? block?.props?.text_alignment_mobile?.value
          : block?.props?.text_alignment_desktop?.value;

      const isMobileDevice = windowWidth <= 480;

      const HORIZONTAL_SPACING_TABLET = "1.75rem";
      const HORIZONTAL_SPACING_DESKTOP = "2.5rem";
      const HORIZONTAL_SPACING_MOBILE = "1rem";
      const VERTICAL_SPACING_MOBILE = "1rem";
      const VERTICAL_SPACING_TABLET = "1.5rem";
      const VERTICAL_SPACING_DESKTOP = "2.5rem";

      if (contentAlignment) {
        positions[`--content-alignment-${view}`] = getDirectionAdaptiveValue(
          DIRECTION_ADAPTIVE_CSS_PROPERTIES.TEXT_ALIGNMENT,
          contentAlignment
        );
      }

      switch (overlayPosition) {
        case "top_start":
          if (view === "mobile" && isMobileDevice) {
            positions[`--top-position-${view}`] = VERTICAL_SPACING_MOBILE;
          } else {
            positions[`--top-position-${view}`] =
              view === "mobile"
                ? VERTICAL_SPACING_TABLET
                : VERTICAL_SPACING_DESKTOP;
            positions[`--left-position-${view}`] =
              view === "mobile"
                ? HORIZONTAL_SPACING_TABLET
                : HORIZONTAL_SPACING_DESKTOP;
          }

          break;

        case "top_center":
          if (view === "mobile" && isMobileDevice) {
            positions[`--top-position-${view}`] = VERTICAL_SPACING_MOBILE;
          } else {
            positions[`--top-position-${view}`] =
              view === "mobile"
                ? VERTICAL_SPACING_TABLET
                : VERTICAL_SPACING_DESKTOP;
            positions[`--left-position-${view}`] = "50%";
            positions[`--transform-${view}`] = "translateX(-50%)";
          }

          break;

        case "top_end":
          if (view === "mobile" && isMobileDevice) {
            positions[`--top-position-${view}`] = VERTICAL_SPACING_MOBILE;
          } else {
            positions[`--top-position-${view}`] =
              view === "mobile"
                ? VERTICAL_SPACING_TABLET
                : VERTICAL_SPACING_DESKTOP;
            positions[`--right-position-${view}`] =
              view === "mobile"
                ? HORIZONTAL_SPACING_TABLET
                : HORIZONTAL_SPACING_DESKTOP;
          }

          break;

        case "center_start":
          positions[`--top-position-${view}`] = "50%";
          positions[`--transform-${view}`] = "translateY(-50%)";
          positions[`--left-position-${view}`] =
            view === "mobile"
              ? HORIZONTAL_SPACING_TABLET
              : HORIZONTAL_SPACING_DESKTOP;

          break;

        case "center_center":
          positions[`--top-position-${view}`] = "50%";

          if (view === "mobile" && isMobileDevice) {
            positions[`--transform-${view}`] = "translateY(-50%)";
          } else {
            positions[`--left-position-${view}`] = "50%";
            positions[`--transform-${view}`] = "translate(-50%, -50%)";
          }

          break;

        case "center_end":
          positions[`--top-position-${view}`] = "50%";
          positions[`--transform-${view}`] = "translateY(-50%)";
          positions[`--right-position-${view}`] =
            view === "mobile"
              ? HORIZONTAL_SPACING_TABLET
              : HORIZONTAL_SPACING_DESKTOP;

          break;

        case "bottom_start":
          if (view === "mobile" && isMobileDevice) {
            positions[`--bottom-position-${view}`] = VERTICAL_SPACING_MOBILE;
          } else {
            positions[`--bottom-position-${view}`] =
              view === "mobile"
                ? VERTICAL_SPACING_TABLET
                : VERTICAL_SPACING_DESKTOP;
            positions[`--left-position-${view}`] =
              view === "mobile"
                ? HORIZONTAL_SPACING_TABLET
                : HORIZONTAL_SPACING_DESKTOP;
          }

          break;

        case "bottom_center":
          if (view === "mobile" && isMobileDevice) {
            positions[`--bottom-position-${view}`] = VERTICAL_SPACING_MOBILE;
          } else {
            positions[`--bottom-position-${view}`] =
              view === "mobile"
                ? VERTICAL_SPACING_TABLET
                : VERTICAL_SPACING_DESKTOP;
            positions[`--left-position-${view}`] = "50%";
            positions[`--transform-${view}`] = "translateX(-50%)";
          }

          break;

        case "bottom_end":
          if (view === "mobile" && isMobileDevice) {
            positions[`--bottom-position-${view}`] = VERTICAL_SPACING_MOBILE;
            positions[`--right-position-${view}`] = HORIZONTAL_SPACING_MOBILE;
          } else {
            positions[`--bottom-position-${view}`] =
              view === "mobile"
                ? VERTICAL_SPACING_TABLET
                : VERTICAL_SPACING_DESKTOP;
            positions[`--right-position-${view}`] =
              view === "mobile"
                ? HORIZONTAL_SPACING_TABLET
                : HORIZONTAL_SPACING_DESKTOP;
          }

          break;

        default:
          break;
      }
    });

    return positions;
  };

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 0}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };
  const navigate = useNavigate();
  return (
    <section className="remove-horizontal-scroll" style={dynamicStyles}>
      <Carousel
        className={styles.slideshowCarousel}
        opts={{ loop: true, skipSnaps: true, direction }}
        plugins={plugins}
      >
        <CarouselContent>
          {blocksData?.map((block, index) => (
            <CarouselItem key={index}>
              {block.type === "gallery" ? (
                <div
                  className={`${styles.blockItem} ${slideMediaClass}`}
                  style={mediaLayout.style}
                >
                  <FDKLink
                    to={
                      !block?.props?.button_text?.value &&
                      block?.props?.redirect_link?.value
                        ? block?.props?.redirect_link?.value
                        : ""
                    }
                    target={shouldOpenInNewTab ? "_blank" : "_self"}
                    key={index}
                  >
                    <div
                      className={styles.overlayItems}
                      style={getOverlayPositionStyles(block)}
                    >
                      {block?.props?.image_text?.value}
                      {block?.props?.button_text?.value && (
                        <div>
                          <button
                            type="button"
                            className={`fx-button ${styles.cta_button} ${
                              block?.props?.invert_button_color?.value
                                ? "btnSecondary"
                                : "btnPrimary"
                            }`}
                            disabled={
                              !(block?.props?.redirect_link?.value?.length > 0)
                            }
                            onClick={() =>
                              navigate(block?.props?.redirect_link?.value)
                            }
                          >
                            {block?.props?.button_text?.value}
                          </button>
                        </div>
                      )}
                    </div>
                    <FyImage
                      src={getDesktopImage(block, index)}
                      sources={getImgSrcSet(block, globalConfig, index)}
                      defer={index < 1 ? false : true}
                      alt={`slide-${index}`}
                      isFixedAspectRatio={mediaLayout.isAspectRatio}
                      aspectRatio={mediaLayout.aspectRatio}
                      mobileAspectRatio={mediaLayout.mobileAspectRatio}
                      isImageFill={
                        mediaLayout.isAspectRatio || mediaLayout.isFixedHeight
                      }
                    />
                  </FDKLink>
                </div>
              ) : (
                <BlockRenderer block={block} />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className={styles.carouselBtn} />
        <CarouselNext className={styles.carouselBtn} />
      </Carousel>
    </section>
  );
}

export const settings = {
  label: "t:resource.sections.image_slideshow.image_slideshow",
  blocks: [
    {
      name: "t:resource.common.image_card",
      type: "gallery",
      props: [
        {
          type: "image_picker",
          id: "image",
          label: "t:resource.common.desktop_image",
          default: "",
          options: {
            aspect_ratio: "16:5",
          },
        },
        {
          type: "image_picker",
          id: "mobile_image",
          label: "t:resource.common.mobile_image",
          default: "",
          options: {
            aspect_ratio: "3:4",
          },
        },
        {
          type: "url",
          id: "redirect_link",
          label: "t:resource.sections.image_slideshow.slide_link",
        },
        {
          type: "text",
          id: "image_text",
          default: "",
          label: "Image Text",
        },
        {
          id: "text_placement_desktop",
          type: "select",
          options: [
            {
              value: "top_start",
              text: "t:resource.sections.hero_image.top_start",
            },
            {
              value: "top_center",
              text: "t:resource.sections.hero_image.top_center",
            },
            {
              value: "top_end",
              text: "t:resource.sections.hero_image.top_end",
            },
            {
              value: "center_start",
              text: "t:resource.sections.hero_image.center_start",
            },
            {
              value: "center_center",
              text: "t:resource.sections.hero_image.center_center",
            },
            {
              value: "center_end",
              text: "t:resource.sections.hero_image.center_end",
            },
            {
              value: "bottom_start",
              text: "t:resource.sections.hero_image.bottom_start",
            },
            {
              value: "bottom_center",
              text: "t:resource.sections.hero_image.bottom_center",
            },
            {
              value: "bottom_end",
              text: "t:resource.sections.hero_image.bottom_end",
            },
          ],
          default: "top_start",
          label: "t:resource.sections.hero_image.text_placement_desktop",
        },
        {
          id: "text_alignment_desktop",
          type: "select",
          options: [
            {
              value: "left",
              text: "t:resource.common.start",
            },
            {
              value: "center",
              text: "t:resource.common.center",
            },
            {
              value: "right",
              text: "t:resource.common.end",
            },
          ],
          default: "left",
          label: "t:resource.common.text_alignment_desktop",
        },
        {
          id: "text_placement_mobile",
          type: "select",
          options: [
            {
              value: "top_start",
              text: "t:resource.sections.hero_image.top_start",
            },
            {
              value: "top_center",
              text: "t:resource.sections.hero_image.top_center",
            },
            {
              value: "top_end",
              text: "t:resource.sections.hero_image.top_end",
            },
            {
              value: "center_start",
              text: "t:resource.sections.hero_image.center_start",
            },
            {
              value: "center_center",
              text: "t:resource.sections.hero_image.center_center",
            },
            {
              value: "center_end",
              text: "t:resource.sections.hero_image.center_end",
            },
            {
              value: "bottom_start",
              text: "t:resource.sections.hero_image.bottom_start",
            },
            {
              value: "bottom_center",
              text: "t:resource.sections.hero_image.bottom_center",
            },
            {
              value: "bottom_end",
              text: "t:resource.sections.hero_image.bottom_end",
            },
          ],
          default: "top_start",
          label: "t:resource.sections.hero_image.text_placement_mobile",
        },
        {
          id: "text_alignment_mobile",
          type: "select",
          options: [
            {
              value: "left",
              text: "t:resource.common.start",
            },
            {
              value: "center",
              text: "t:resource.common.center",
            },
            {
              value: "right",
              text: "t:resource.common.end",
            },
          ],
          default: "left",
          label: "t:resource.common.text_alignment_mobile",
        },
        {
          type: "text",
          id: "button_text",
          default: "",
          label: "Button Text",
        },
        {
          type: "checkbox",
          id: "invert_button_color",
          default: false,
          label: "t:resource.sections.hero_image.invert_button_color",
          info: "t:resource.sections.hero_image.primary_button_inverted_color",
        },
      ],
    },
  ],
  props: [
    {
      type: "checkbox",
      id: "autoplay",
      default: true,
      label: "t:resource.common.auto_play_slides",
      info: "t:resource.sections.image_slideshow.check_to_autoplay_slides",
    },
    {
      type: "range",
      id: "slide_interval",
      min: 1,
      max: 10,
      step: 1,
      unit: "sec",
      label: "t:resource.common.change_slides_every",
      default: 3,
      info: "t:resource.sections.image_slideshow.autoplay_slide_duration",
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
      default: 0,
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
    {
      type: "checkbox",
      id: "open_in_new_tab",
      default: false,
      label: "t:resource.sections.image_slideshow.open_links_in_new_tab",
      info: "t:resource.sections.image_slideshow.open_links_in_new_tab_info",
    },
  ],
  preset: {
    blocks: [
      {
        name: "t:resource.common.image_card",
        type: "gallery",
        props: {
          image: {
            type: "image_picker",
            value: "",
          },
          mobile_image: {
            type: "image_picker",
            value: "",
          },
        },
      },
      {
        name: "t:resource.common.image_card",
        type: "gallery",
        props: {
          image: {
            type: "image_picker",
            value: "",
          },
          mobile_image: {
            type: "image_picker",
            value: "",
          },
        },
      },
    ],
  },
};
export default Component;
