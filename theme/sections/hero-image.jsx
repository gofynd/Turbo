import React, { useState, useEffect } from "react";
import { BlockRenderer, FDKLink } from "fdk-core/components";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import { getDirectionAdaptiveValue, getLocaleDirection } from "../helper/utils";
import styles from "../styles/sections/hero-image.less";
import placeholderDesktop from "../assets/images/placeholder/hero-image-desktop.jpg";
import placeholderMobile from "../assets/images/placeholder/hero-image-mobile.jpg";
import Hotspot from "../components/hotspot/product-hotspot";
import { DIRECTION_ADAPTIVE_CSS_PROPERTIES } from "../helper/constant";
import { useWindowWidth } from "../helper/hooks";
import { useFPI } from "fdk-core/utils";
import { getMediaLayout } from "../helper/media-layout";

export function Component({ props, globalConfig, blocks }) {
  const {
    button_link,
    button_text,
    description,
    desktop_banner,
    heading,
    invert_button_color,
    mobile_banner,
    overlay_option,
    text_alignment_desktop,
    text_alignment_mobile,
    text_placement_desktop,
    text_placement_mobile,
    padding_top,
    padding_bottom,
    height_mode,
    desktop_height,
    mobile_height,
    desktop_aspect_ratio,
    mobile_aspect_ratio,
  } = props;
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth <= 540;
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const fpi = useFPI();

  useEffect(() => {
    const updateTooltipDimensions = () => {
      const tooltip = document.querySelector(
        `.${styles["application-banner-container"]} .${styles["tooltip-visible"]}`
      );
      if (tooltip) {
        const newHeight = tooltip.clientHeight - 20;
        const newWidth = tooltip.clientWidth;
        if (newHeight !== tooltipHeight) {
          setTooltipHeight(newHeight);
        }
        if (newWidth !== tooltipWidth) {
          setTooltipWidth(newWidth);
        }
      }
    };

    updateTooltipDimensions();
  }, [tooltipHeight, tooltipWidth]);

  const getMobileUrl = mobile_banner?.value || placeholderMobile;
  const getDesktopUrl = desktop_banner?.value || placeholderDesktop;

  const getImgSrcSet = () => {
    if (globalConfig?.img_hd) {
      return [
        { breakpoint: { min: 481 } },
        { breakpoint: { max: 480 }, url: getMobileUrl },
      ];
    }
    return [
      { breakpoint: { min: 1728 }, width: 3564 },
      { breakpoint: { min: 1512 }, width: 3132 },
      { breakpoint: { min: 1296 }, width: 2700 },
      { breakpoint: { min: 1080 }, width: 2250 },
      { breakpoint: { min: 900 }, width: 1890 },
      { breakpoint: { min: 720 }, width: 1530 },
      { breakpoint: { max: 180 }, width: 450, url: getMobileUrl },
      { breakpoint: { max: 360 }, width: 810, url: getMobileUrl },
      { breakpoint: { max: 540 }, width: 1170, url: getMobileUrl },
    ];
  };

  const getOverlayPositionStyles = () => {
    const positions = {};
    const responsiveViews = ["mobile", "desktop"];

    responsiveViews.forEach((view) => {
      const overlayPosition =
        view === "mobile"
          ? text_placement_mobile?.value
          : text_placement_desktop?.value;

      const contentAlignment =
        view === "mobile"
          ? text_alignment_mobile?.value
          : text_alignment_desktop?.value;
      const isMobileDevice = windowWidth <= 480;

      const HORIZONTAL_SPACING_TABLET = "1.75rem";
      const HORIZONTAL_SPACING_DESKTOP = "2.5rem";

      const VERTICAL_SPACING_MOBILE = "1rem";
      const VERTICAL_SPACING_TABLET = "1.5rem";
      const VERTICAL_SPACING_DESKTOP = "4rem";

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
            positions[`--transform-${view}`] =
              `translateX(${getLocaleDirection(fpi) === "ltr" ? "-" : ""}50%)`;
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
            positions[`--transform-${view}`] =
              `translate(${getLocaleDirection(fpi) === "ltr" ? "-" : ""}50%, -50%)`;
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
            positions[`--transform-${view}`] =
              `translateX(${getLocaleDirection(fpi) === "ltr" ? "-" : ""}50%)`;
          }

          break;

        case "bottom_end":
          if (view === "mobile" && isMobileDevice) {
            positions[`--bottom-position-${view}`] = VERTICAL_SPACING_MOBILE;
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

  const dynamicBoxStyle = (block) => {
    return {
      "--x_position": `${block?.props?.x_position?.value || 0}%`,
      "--y_position": `${block?.props?.y_position?.value || 0}%`,
      "--box_width": `${block?.props?.box_width?.value || 0}%`,
      "--box_height": `${block?.props?.box_height?.value || 0}%`,
      "--tooltip-height": `${tooltipHeight}px`,
      "--tooltip-width": `${tooltipWidth}px`,
      "--x_offset": `-${block.props?.x_position?.value || 0}%`,
      "--y_offset": `-${block.props?.y_position?.value || 0}%`,
    };
  };

  const displayOverlay =
    !!overlay_option?.value && overlay_option.value !== "no_overlay";

  const getOverlayColor =
    overlay_option?.value === "black_overlay" ? "#000" : "#fff";

  const getHotspots = () => {
    return {
      desktop: blocks?.filter(
        (block) => block?.type && block?.type !== "hotspot_mobile"
      ),
      mobile: blocks?.filter(
        (block) => block?.type && block?.type !== "hotspot_desktop"
      ),
    };
  };

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 0}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  const mediaLayout = getMediaLayout(
    {
      height_mode,
      desktop_height,
      mobile_height,
      desktop_aspect_ratio,
      mobile_aspect_ratio,
    },
    windowWidth <= 768,
    16 / 9
  );

  const heroContainerClassNames = [
    styles.heroImageContainer,
    styles.mediaShell,
    mediaLayout.isAspectRatio ? styles.mediaShellAspect : "",
    mediaLayout.isFixedHeight ? styles.mediaShellFixedHeight : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section style={dynamicStyles}>
      <div className={heroContainerClassNames} style={mediaLayout.style}>
        <FyImage
          src={getDesktopUrl}
          sources={getImgSrcSet()}
          showOverlay={displayOverlay}
          overlayColor={getOverlayColor}
          defer={false}
          isFixedAspectRatio={mediaLayout.isAspectRatio}
          aspectRatio={mediaLayout.aspectRatio}
          mobileAspectRatio={mediaLayout.mobileAspectRatio}
          isImageFill={mediaLayout.isAspectRatio || mediaLayout.isFixedHeight}
          alt={heading?.value || "Hero banner"}
        />
        <div className={styles.overlayItems} style={getOverlayPositionStyles()}>
          {heading?.value && (
            <h1 className={`fx-title ${styles.header} fontHeader`}>
              {heading?.value}
            </h1>
          )}
          {description?.value && (
            <p className={`fx-description ${styles.description} b2`}>
              {description?.value}
            </p>
          )}
          {button_text?.value && (
            <FDKLink to={button_link?.value}>
              <button
                type="button"
                className={`fx-button ${styles.cta_button} ${
                  invert_button_color?.value ? "btnSecondary" : "btnPrimary"
                }`}
                disabled={!(button_link?.value?.length > 0)}
              >
                {button_text?.value}
              </button>
            </FDKLink>
          )}
        </div>
        {!isMobile &&
          getHotspots()?.desktop?.map((hotspot, index) => {
            if (hotspot.type !== "hotspot_desktop") {
              return <BlockRenderer key={index} block={hotspot} />;
            }

            return hotspot?.props?.pointer_type?.value !== "box" ? (
              <Hotspot
                className={styles["hotspot--desktop"]}
                key={index}
                hotspot={hotspot}
                product={{
                  hotspot_description: hotspot?.props?.hotspot_header?.value,
                  media: [
                    {
                      type: "image",
                      url: hotspot?.props?.hotspot_image?.value,
                    },
                  ],
                  name: hotspot?.props?.hotspot_description?.value,
                }}
                hotspot_link_text={hotspot?.props?.hotspot_link_text?.value}
                redirect_link={hotspot?.props?.redirect_link?.value}
              />
            ) : (
              <FDKLink to={hotspot?.props?.redirect_link?.value} target="_self">
                <div
                  className={`
                        ${styles["box-wrapper"]}
                        ${hotspot?.props?.edit_visible?.value ? `${styles["box-wrapper-visible"]}` : ""}
                      `}
                  style={dynamicBoxStyle(hotspot)}
                ></div>
              </FDKLink>
            );
          })}
        {isMobile &&
          getHotspots()?.mobile?.map((hotspot, index) => {
            if (hotspot.type !== "hotspot_mobile") {
              return <BlockRenderer key={index} block={hotspot} />;
            }

            return hotspot?.props?.pointer_type?.value !== "box" ? (
              <Hotspot
                className={styles["hotspot--mobile"]}
                key={index}
                hotspot={hotspot}
                product={{
                  hotspot_description: hotspot?.props?.hotspot_header?.value,
                  media: [
                    {
                      type: "image",
                      url: hotspot?.props?.hotspot_image?.value,
                    },
                  ],
                  name: hotspot?.props?.hotspot_description?.value,
                }}
                hotspot_link_text={hotspot?.props?.hotspot_link_text?.value}
                redirect_link={hotspot?.props?.redirect_link?.value}
              />
            ) : (
              <FDKLink to={hotspot?.props?.redirect_link?.value}>
                <div
                  className={`
                        ${styles["box-wrapper"]}
                        ${hotspot?.props?.edit_visible?.value ? `${styles["box-wrapper-visible"]}` : ""}
                      `}
                  style={dynamicBoxStyle(hotspot)}
                ></div>
              </FDKLink>
            );
          })}
      </div>
    </section>
  );
}

export const settings = {
  label: "t:resource.sections.hero_image.hero_image",
  props: [
    {
      type: "text",
      id: "heading",
      default: "t:resource.default_values.hero_image_heading",
      label: "t:resource.common.heading",
      info: "t:resource.common.section_heading_text",
    },
    {
      type: "text",
      id: "description",
      default: "t:resource.default_values.hero_image_description",
      label: "t:resource.common.description",
      info: "t:resource.common.section_description_text",
    },
    {
      id: "overlay_option",
      type: "select",
      options: [
        {
          value: "no_overlay",
          text: "t:resource.sections.hero_image.no_overlay",
        },
        {
          value: "white_overlay",
          text: "t:resource.sections.hero_image.white_overlay",
        },
        {
          value: "black_overlay",
          text: "t:resource.sections.hero_image.black_overlay",
        },
      ],
      default: "no_overlay",
      label: "t:resource.sections.hero_image.overlay_option",
      info: "t:resource.sections.hero_image.image_overlay_opacity",
    },
    {
      type: "text",
      id: "button_text",
      default: "t:resource.default_values.shop_now",
      label: "t:resource.common.button_text",
    },
    {
      type: "url",
      id: "button_link",
      default: "",
      label: "t:resource.common.redirect_link",
    },
    {
      type: "checkbox",
      id: "invert_button_color",
      default: false,
      label: "t:resource.sections.hero_image.invert_button_color",
      info: "t:resource.sections.hero_image.primary_button_inverted_color",
    },
    {
      id: "desktop_banner",
      type: "image_picker",
      label: "t:resource.sections.hero_image.desktop_banner",
      default: "",
      options: {
        aspect_ratio: "16:9",
      },
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
      id: "mobile_banner",
      type: "image_picker",
      label: "t:resource.sections.hero_image.mobile_tablet_banner",
      default: "",
      options: {
        aspect_ratio: "9:16",
      },
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
      type: "range",
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
  ],
  blocks: [
    {
      type: "hotspot_desktop",
      name: "t:resource.common.hotspot_desktop",
      props: [
        {
          type: "select",
          id: "pointer_type",
          label: "t:resource.common.pointer_type",
          options: [
            {
              value: "box",
              text: "t:resource.common.box",
            },
            {
              value: "pointer",
              text: "t:resource.common.pointer",
            },
          ],
          default: "box",
        },

        {
          type: "checkbox",
          id: "edit_visible",
          default: true,
          label: "t:resource.common.show_clickable_area",
        },
        {
          type: "range",
          id: "x_position",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.horizontal_position",
          default: 50,
        },
        {
          type: "range",
          id: "y_position",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.vertical_position",
          default: 50,
        },
        {
          type: "range",
          id: "box_width",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.width",
          default: 15,
        },
        {
          type: "range",
          id: "box_height",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.height",
          default: 15,
        },
        {
          type: "image_picker",
          id: "hotspot_image",
          label: "t:resource.common.hotspot_hover_image",
          options: {
            aspect_ratio: "1:1",
            aspect_ratio_strict_check: true,
          },
        },
        {
          type: "text",
          id: "hotspot_header",
          label: "t:resource.common.header",
          placeholder: "t:resource.common.header",
          value: "",
        },
        {
          type: "textarea",
          id: "hotspot_description",
          label: "t:resource.common.description",
          placeholder: "t:resource.common.description",
          value: "",
        },
        {
          type: "text",
          id: "hotspot_link_text",
          label: "t:resource.common.hover_link_text",
          placeholder: "t:resource.common.link_text",
          value: "",
        },
        {
          type: "url",
          id: "redirect_link",
          label: "t:resource.common.redirect_link",
        },
      ],
    },
    {
      type: "hotspot_mobile",
      name: "t:resource.common.hotspot_mobile",
      props: [
        {
          type: "select",
          id: "pointer_type",
          label: "t:resource.common.pointer_type",
          options: [
            {
              value: "box",
              text: "t:resource.common.box",
            },
            {
              value: "pointer",
              text: "t:resource.common.pointer",
            },
          ],
          default: "box",
        },
        {
          type: "checkbox",
          id: "edit_visible",
          default: true,
          label: "t:resource.common.show_clickable_area",
        },
        {
          type: "range",
          id: "x_position",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.horizontal_position",
          default: 50,
        },
        {
          type: "range",
          id: "y_position",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.vertical_position",
          default: 50,
        },
        {
          type: "range",
          id: "box_width",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.width",
          default: 15,
        },
        {
          type: "range",
          id: "box_height",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.height",
          default: 15,
        },
        {
          type: "image_picker",
          id: "hotspot_image",
          label: "t:resource.common.hotspot_hover_image",
          options: {
            aspect_ratio: "1:1",
            aspect_ratio_strict_check: true,
          },
        },
        {
          type: "text",
          id: "hotspot_header",
          label: "t:resource.common.header",
          placeholder: "t:resource.common.header",
          value: "",
        },
        {
          type: "textarea",
          id: "hotspot_description",
          label: "t:resource.common.description",
          placeholder: "t:resource.common.description",
          value: "",
        },
        {
          type: "text",
          id: "hotspot_link_text",
          label: "t:resource.common.hover_link_text",
          placeholder: "t:resource.common.link_text",
          value: "",
        },
        {
          type: "url",
          id: "redirect_link",
          label: "t:resource.common.redirect_link",
        },
      ],
    },
  ],
};
export default Component;
