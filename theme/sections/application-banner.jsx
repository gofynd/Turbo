import React from "react";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import placeholderDesktop from "../assets/images/placeholder/application-banner-desktop.png";
import placeholderMobile from "../assets/images/placeholder/application-banner-mobile.png";
import { FDKLink } from "fdk-core/components";
import styles from "../styles/sections/application-banner.less";
import Hotspot from "../components/hotspot/product-hotspot";
import { useViewport } from "../helper/hooks";

export function Component({ props, blocks, globalConfig }) {
  const isMobile = useViewport(0, 540);
  const {
    image_desktop,
    image_mobile,
    banner_link,
    padding_top,
    padding_bottom,
    hover_application_banner,
  } = props;

  const dynamicBoxStyle = (block) => {
    return {
      "--x_position": `${block.props?.x_position?.value || 0}%`,
      "--y_position": `${block.props?.y_position?.value || 0}%`,
      "--box_width": `${block.props?.box_width?.value || 0}%`,
      "--box_height": `${block.props?.box_height?.value || 0}%`,
      "--x_offset": `-${block.props?.x_position?.value || 0}%`,
      "--y_offset": `-${block.props?.y_position?.value || 0}%`,
    };
  };

  const desktopImage = image_desktop?.value || placeholderDesktop;
  const mobileImage = image_mobile?.value || placeholderMobile;

  const getImgSrcSet = () => {
    if (globalConfig?.img_hd) {
      return [
        { breakpoint: { min: 481 } },
        { breakpoint: { max: 540 }, url: mobileImage },
      ];
    }
    return [
      { breakpoint: { min: 1728 }, width: 3564 },
      { breakpoint: { min: 1512 }, width: 3132 },
      { breakpoint: { min: 1296 }, width: 2700 },
      { breakpoint: { min: 1080 }, width: 2250 },
      { breakpoint: { min: 900 }, width: 1890 },
      { breakpoint: { min: 720 }, width: 1530 },
      { breakpoint: { max: 180 }, width: 450, url: mobileImage },
      { breakpoint: { max: 360 }, width: 810, url: mobileImage },
      { breakpoint: { max: 540 }, width: 1170, url: mobileImage },
    ];
  };

  const getHotspots = () => {
    return {
      desktop: blocks?.filter((block) => block?.type === "hotspot_desktop"),
      mobile: blocks?.filter((block) => block?.type === "hotspot_mobile"),
    };
  };

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 0}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  return (
    <section
      className={styles.applicationBannerContainer}
      style={dynamicStyles}
    >
      {banner_link?.value?.length > 0 ? (
        <FDKLink to={banner_link?.value}>
          <FyImage
           customClass={`${styles.imageWrapper} ${hover_application_banner?.value ? styles.imageHoverEnabled : ""}`}
            src={desktopImage}
            sources={getImgSrcSet()}
            isLazyLoaded={false}
            defer={false}
            isFixedAspectRatio={false}
          />
        </FDKLink>
      ) : (
        <FyImage
          customClass={`${styles.imageWrapper} ${hover_application_banner?.value ? styles.imageHoverEnabled : ""}`}
          src={desktopImage}
          sources={getImgSrcSet()}
          isLazyLoaded={false}
          defer={false}
          isFixedAspectRatio={false}
        />
      )}

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
    </section>
  );
}

export const settings = {
  label: "t:resource.sections.application_banner.application_banner",
  props: [
    {
      type: "image_picker",
      id: "image_desktop",
      label: "t:resource.common.desktop_image",
      default: "",
      options: {
        aspect_ratio: "19:6",
      },
    },
    {
      type: "image_picker",
      id: "image_mobile",
      label: "t:resource.common.mobile_image",
      default: "",
      options: {
        aspect_ratio: "4:5",
      },
    },
    {
      type: "url",
      id: "banner_link",
      default: "",
      label: "t:resource.common.redirect_link",
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
      id: "hover_application_banner",
      label: "t:resource.sections.application_banner.enable_hover_effect_on_banner",
      default: false,
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
          info: "t:resource.sections.application_banner.box_pointer_only",
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
          info: "t:resource.sections.application_banner.box_pointer_only",
        },
        {
          type: "image_picker",
          id: "hotspot_image",
          label: "t:resource.common.hotspot_hover_image",
          options: {
            aspect_ratio: "1:1",
            aspect_ratio_strict_check: true,
          },
          info: "t:resource.sections.application_banner.circular_pointer_only",
        },
        {
          type: "text",
          id: "hotspot_header",
          label: "t:resource.common.header",
          placeholder: "t:resource.common.header",
          value: "",
          info: "t:resource.sections.application_banner.circular_pointer_only",
        },
        {
          type: "textarea",
          id: "hotspot_description",
          label: "t:resource.common.description",
          default: "",
          info: "t:resource.sections.application_banner.circular_pointer_only",
        },
        {
          type: "text",
          id: "hotspot_link_text",
          label: "t:resource.common.hover_link_text",
          placeholder: "t:resource.common.link_text",
          value: "",
          info: "t:resource.sections.application_banner.circular_pointer_only",
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
          info: "t:resource.sections.application_banner.box_pointer_only",
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
          info: "t:resource.sections.application_banner.box_pointer_only",
        },
        {
          type: "image_picker",
          id: "hotspot_image",
          label: "t:resource.common.hotspot_hover_image",
          options: {
            aspect_ratio: "1:1",
            aspect_ratio_strict_check: true,
          },
          info: "t:resource.sections.application_banner.circular_pointer_only",
        },
        {
          type: "text",
          id: "hotspot_header",
          label: "t:resource.common.header",
          placeholder: "t:resource.common.header",
          value: "",
          info: "t:resource.sections.application_banner.circular_pointer_only",
        },
        {
          type: "textarea",
          id: "hotspot_description",
          label: "t:resource.common.description",
          default: "",
          info: "t:resource.sections.application_banner.circular_pointer_only",
        },
        {
          type: "text",
          id: "hotspot_link_text",
          label: "t:resource.common.hover_link_text",
          placeholder: "t:resource.common.link_text",
          value: "",
          info: "t:resource.sections.application_banner.circular_pointer_only",
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
