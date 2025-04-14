import React, { useState, useEffect } from "react";
import { FDKLink } from "fdk-core/components";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import { isRunningOnClient } from "../helper/utils";
import styles from "../styles/sections/hero-image.less";
import placeholderDesktop from "../assets/images/placeholder/hero-image-desktop.png";
import placeholderMobile from "../assets/images/placeholder/hero-image-mobile.png";
import Hotspot from "../components/hotspot/product-hotspot";
import { useViewport } from "../helper/hooks";

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
  } = props;
  const [windowWidth, setWindowWidth] = useState(
    isRunningOnClient() ? window?.innerWidth : 400
  );
  const isMobile = useViewport(0, 540);
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const [tooltipWidth, setTooltipWidth] = useState(0);

  useEffect(() => {
    if (isRunningOnClient()) {
      const handleResize = () => {
        setWindowWidth(window?.innerWidth);
      };
      window?.addEventListener("resize", handleResize);
      return () => {
        window?.removeEventListener("resize", handleResize);
      };
    }
  }, []);

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

  const getMobileUrl = () => mobile_banner?.value || placeholderMobile;
  const getDesktopUrl = () => desktop_banner?.value || placeholderDesktop;

  const getImgSrcSet = () => {
    if (globalConfig?.img_hd) {
      return [
        { breakpoint: { min: 481 } },
        {
          breakpoint: { max: 480 },
          url: getMobileUrl(),
        },
      ];
    }
    return [
      {
        breakpoint: { min: 1728 },
        width: 3564,
      },
      {
        breakpoint: { min: 1512 },
        width: 3132,
      },
      {
        breakpoint: { min: 1296 },
        width: 2700,
      },
      {
        breakpoint: { min: 1080 },
        width: 2250,
      },
      {
        breakpoint: { min: 900 },
        width: 1890,
      },
      {
        breakpoint: { min: 720 },
        width: 1530,
      },
      {
        breakpoint: { max: 180 },
        width: 450,
        url: getMobileUrl(),
      },
      {
        breakpoint: { max: 360 },
        width: 810,
        url: getMobileUrl(),
      },
      {
        breakpoint: { max: 540 },
        width: 1170,
        url: getMobileUrl(),
      },
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
        positions[`--content-alignment-${view}`] = contentAlignment;
      }

      switch (overlayPosition) {
        case "top_left":
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

        case "top_right":
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

        case "center_left":
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

        case "center_right":
          positions[`--top-position-${view}`] = "50%";
          positions[`--transform-${view}`] = "translateY(-50%)";
          positions[`--right-position-${view}`] =
            view === "mobile"
              ? HORIZONTAL_SPACING_TABLET
              : HORIZONTAL_SPACING_DESKTOP;

          break;

        case "bottom_left":
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

        case "bottom_right":
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

  const displayOverlay = () =>
    !!(overlay_option?.value && overlay_option?.value !== "no_overlay");

  const getOverlayColor = () =>
    overlay_option?.value === "black_overlay" ? "#000000" : "#ffffff";

  const getHotspots = () => {
    return {
      desktop: blocks?.filter((block) => block?.type === "hotspot_desktop"),
      mobile: blocks?.filter((block) => block?.type === "hotspot_mobile"),
    };
  };

  return (
    <div
      className={styles.heroImageContainer}
      style={{
        paddingBottom: `16px`,
      }}
    >
      {/* To Do: fix intersection observer flicker issue */}
      {/* <IntersectionObserverComponent> */}
      {(getDesktopUrl() || getMobileUrl()) && (
        <FyImage
          src={getDesktopUrl()}
          sources={getImgSrcSet()}
          showOverlay={displayOverlay()}
          overlayColor={getOverlayColor()}
          defer={false}
          isFixedAspectRatio={false}
        />
      )}
      <div className={styles.overlayItems} style={getOverlayPositionStyles()}>
        {heading?.value && (
          <h1 className={`${styles.header} fontHeader`}>{heading?.value}</h1>
        )}

        {description?.value && (
          <p className={`${styles.description} b2 fontBody `}>
            {description?.value}
          </p>
        )}

        {button_text?.value && (
          <FDKLink to={button_link?.value}>
            <button
              type="button"
              className={`${styles.cta_button} fontBody} ${
                invert_button_color?.value ? "btnSecondary" : "btnPrimary"
              }`}
              disabled={!(button_link?.value?.length > 1)}
            >
              {button_text?.value}
            </button>
          </FDKLink>
        )}
      </div>
      {!isMobile &&
        getHotspots()?.desktop?.map((hotspot, index) => {
          return hotspot?.props?.pointer_type?.value !== "box" ? (
            <Hotspot
              className={styles["hotspot--desktop"]}
              key={index}
              hotspot={hotspot}
              product={{
                hotspot_description: hotspot?.props?.hotspot_header?.value,
                media: [
                  { type: "image", url: hotspot?.props?.hotspot_image?.value },
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
          return hotspot?.props?.pointer_type?.value !== "box" ? (
            <Hotspot
              className={styles["hotspot--mobile"]}
              key={index}
              hotspot={hotspot}
              product={{
                hotspot_description: hotspot?.props?.hotspot_header?.value,
                media: [
                  { type: "image", url: hotspot?.props?.hotspot_image?.value },
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
  );
}

export const settings = {
  label: "Hero Image",
  props: [
    {
      type: "text",
      id: "heading",
      default: "Welcome to Your New Store",
      label: "Heading",
      info: "Heading text of the section",
    },
    {
      type: "text",
      id: "description",
      default:
        "Begin your journey by adding unique images and banners. This is your chance to create a captivating first impression. Customize it to reflect your brand's personality and style!",
      label: "Description",
      info: "Description text of the section",
    },
    {
      id: "overlay_option",
      type: "select",
      options: [
        {
          value: "no_overlay",
          text: "No Overlay",
        },
        {
          value: "white_overlay",
          text: "White Overlay",
        },
        {
          value: "black_overlay",
          text: "Black Overlay",
        },
      ],
      default: "no_overlay",
      label: "Overlay Option",
      info: "Use this option to add a black or white semi-transparent overlay on top of the image. This will help you to stand out your text content",
    },
    {
      type: "text",
      id: "button_text",
      default: "Shop Now",
      label: "Button Text",
    },
    {
      type: "url",
      id: "button_link",
      default: "",
      label: "Redirect Link",
    },
    {
      type: "checkbox",
      id: "invert_button_color",
      default: false,
      label: "Invert Button Color (Toggle)",
      info: "Inverted color of the primary button",
    },
    {
      id: "desktop_banner",
      type: "image_picker",
      label: "Desktop Banner",
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
          value: "top_left",
          text: "Top-Left",
        },
        {
          value: "top_center",
          text: "Top-Center",
        },
        {
          value: "top_right",
          text: "Top-Right",
        },
        {
          value: "center_left",
          text: "Center-Left",
        },
        {
          value: "center_center",
          text: "Center-Center",
        },
        {
          value: "center_right",
          text: "Center-Right",
        },
        {
          value: "bottom_left",
          text: "Bottom-Left",
        },
        {
          value: "bottom_center",
          text: "Bottom-Center",
        },
        {
          value: "bottom_right",
          text: "Bottom-Right",
        },
      ],
      default: "center_left",
      label: "Text Placement (Desktop)",
    },
    {
      id: "text_alignment_desktop",
      type: "select",
      options: [
        {
          value: "left",
          text: "Left",
        },
        {
          value: "center",
          text: "Center",
        },
        {
          value: "right",
          text: "Right",
        },
      ],
      default: "left",
      label: "Text Alignment (Desktop)",
    },
    {
      id: "mobile_banner",
      type: "image_picker",
      label: "Mobile/Tablet Banner",
      default: "",
      options: {
        aspect_ratio: "9:16",
      },
    },
    {
      id: "text_placement_mobile",
      type: "select",
      options: [
        {
          value: "top_left",
          text: "Top-Left",
        },
        {
          value: "top_center",
          text: "Top-Center",
        },
        {
          value: "top_right",
          text: "Top-Right",
        },
        {
          value: "center_left",
          text: "Center-Left",
        },
        {
          value: "center_center",
          text: "Center-Center",
        },
        {
          value: "center_right",
          text: "Center-Right",
        },
        {
          value: "bottom_left",
          text: "Bottom-Left",
        },
        {
          value: "bottom_center",
          text: "Bottom-Center",
        },
        {
          value: "bottom_right",
          text: "Bottom-Right",
        },
      ],
      default: "top_left",
      label: "Text Placement (Mobile)",
    },
    {
      id: "text_alignment_mobile",
      type: "select",
      options: [
        {
          value: "left",
          text: "Left",
        },
        {
          value: "center",
          text: "Center",
        },
        {
          value: "right",
          text: "Right",
        },
      ],
      default: "left",
      label: "Text Alignment (Mobile)",
    },
  ],
  blocks: [
    {
      type: "hotspot_desktop",
      name: "Hotspot Desktop",
      props: [
        {
          type: "select",
          id: "pointer_type",
          label: "Pointer Type",
          options: [
            {
              value: "box",
              text: "Box",
            },
            {
              value: "pointer",
              text: "Pointer",
            },
          ],
          default: "box",
        },

        {
          type: "checkbox",
          id: "edit_visible",
          default: true,
          label: "Show Clickable Area",
        },
        {
          type: "range",
          id: "x_position",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "Horizontal Position",
          default: 50,
        },
        {
          type: "range",
          id: "y_position",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "Vertical Position",
          default: 50,
        },
        {
          type: "range",
          id: "box_width",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "Width",
          default: 15,
        },
        {
          type: "range",
          id: "box_height",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "Height",
          default: 15,
        },
        {
          type: "image_picker",
          id: "hotspot_image",
          label: "Hotspot Hover Image",
          options: {
            aspect_ratio: "1:1",
            aspect_ratio_strict_check: true,
          },
        },
        {
          type: "text",
          id: "hotspot_header",
          label: "Header",
          placeholder: "Header",
          value: "",
        },
        {
          type: "textarea",
          id: "hotspot_description",
          label: "Description",
          placeholder: "Description",
          value: "",
        },
        {
          type: "text",
          id: "hotspot_link_text",
          label: "Hover Link Text",
          placeholder: "Link text",
          value: "",
        },
        {
          type: "url",
          id: "redirect_link",
          label: "Redirect Link",
        },
      ],
    },
    {
      type: "hotspot_mobile",
      name: "Hotspot Mobile",
      props: [
        {
          type: "select",
          id: "pointer_type",
          label: "Pointer Type",
          options: [
            {
              value: "box",
              text: "Box",
            },
            {
              value: "pointer",
              text: "Pointer",
            },
          ],
          default: "box",
        },
        {
          type: "checkbox",
          id: "edit_visible",
          default: true,
          label: "Show Clickable Area",
        },
        {
          type: "range",
          id: "x_position",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "Horizontal Position",
          default: 50,
        },
        {
          type: "range",
          id: "y_position",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "Vertical Position",
          default: 50,
        },
        {
          type: "range",
          id: "box_width",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "Width",
          default: 15,
        },
        {
          type: "range",
          id: "box_height",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "Height",
          default: 15,
        },
        {
          type: "image_picker",
          id: "hotspot_image",
          label: "Hotspot Hover Image",
          options: {
            aspect_ratio: "1:1",
            aspect_ratio_strict_check: true,
          },
        },
        {
          type: "text",
          id: "hotspot_header",
          label: "Header",
          placeholder: "Header",
          value: "",
        },
        {
          type: "textarea",
          id: "hotspot_description",
          label: "Description",
          placeholder: "Description",
          value: "",
        },
        {
          type: "text",
          id: "hotspot_link_text",
          label: "Hover Link Text",
          placeholder: "Link text",
          value: "",
        },
        {
          type: "url",
          id: "redirect_link",
          label: "Redirect Link",
        },
      ],
    },
  ],
};
export default Component;
