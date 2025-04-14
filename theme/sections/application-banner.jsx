import React, { useEffect, useState } from "react";
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
  const { image_desktop, image_mobile, banner_link } = props;

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
        { breakpoint: { max: 480 }, url: mobileImage },
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

  return (
    <div className={styles["application-banner-container"]}>
      {banner_link?.value?.length > 0 ? (
        <FDKLink to={banner_link?.value}>
          <FyImage
            customClass={`${styles.imageWrapper}`}
            src={desktopImage}
            sources={getImgSrcSet()}
            isLazyLoaded={false}
            defer={false}
            isFixedAspectRatio={false}
          />
        </FDKLink>
      ) : (
        <FyImage
          customClass={`${styles.imageWrapper}`}
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
    </div>
  );
}

export const settings = {
  label: "Application Banner",
  props: [
    {
      type: "image_picker",
      id: "image_desktop",
      label: "Desktop Image",
      default: "",
      options: {
        aspect_ratio: "19:6",
      },
    },
    {
      type: "image_picker",
      id: "image_mobile",
      label: "Mobile Image",
      default: "",
      options: {
        aspect_ratio: "4:5",
      },
    },
    {
      type: "url",
      id: "banner_link",
      default: "",
      label: "Redirect Link",
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
          info: "Only applicable for box pointer type",
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
          info: "Only applicable for box pointer type",
        },
        {
          type: "image_picker",
          id: "hotspot_image",
          label: "Hotspot Hover Image",
          options: {
            aspect_ratio: "1:1",
            aspect_ratio_strict_check: true,
          },
          info: "Only applicable for circular pointer type",
        },
        {
          type: "text",
          id: "hotspot_header",
          label: "Header",
          placeholder: "Header",
          value: "",
          info: "Only applicable for circular pointer type",
        },
        {
          type: "textarea",
          id: "hotspot_description",
          label: "Description",
          default: "",
          info: "Only applicable for circular pointer type",
        },
        {
          type: "text",
          id: "hotspot_link_text",
          label: "Hover Link Text",
          placeholder: "Link text",
          value: "",
          info: "Only applicable for circular pointer type",
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
          info: "Only applicable for box pointer type",
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
          info: "Only applicable for box pointer type",
        },
        {
          type: "image_picker",
          id: "hotspot_image",
          label: "Hotspot Hover Image",
          options: {
            aspect_ratio: "1:1",
            aspect_ratio_strict_check: true,
          },
          info: "Only applicable for circular pointer type",
        },
        {
          type: "text",
          id: "hotspot_header",
          label: "Header",
          placeholder: "Header",
          value: "",
          info: "Only applicable for circular pointer type",
        },
        {
          type: "textarea",
          id: "hotspot_description",
          label: "Description",
          default: "",
          info: "Only applicable for circular pointer type",
        },
        {
          type: "text",
          id: "hotspot_link_text",
          label: "Hover Link Text",
          placeholder: "Link text",
          value: "",
          info: "Only applicable for circular pointer type",
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
