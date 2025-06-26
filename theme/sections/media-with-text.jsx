import React, { useState, useEffect } from "react";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import styles from "../styles/sections/media-with-text.less";
import { getProductImgAspectRatio } from "../helper/utils";
import Hotspot from "../components/hotspot/product-hotspot";
import { FEATURE_PRODUCT_DETAILS } from "../queries/featureProductQuery";
import { useViewport } from "../helper/hooks";
import { FDKLink } from "fdk-core/components";
import placeholderDesktop from "../assets/images/placeholder/media-with-text-desktop.jpg";
import placeholderMobile from "../assets/images/placeholder/media-with-text-mobile.jpg";
import { MEDIA_WITH_TEXT_HOTSPOT_PLACEHOLDER_PRODUCT } from "../helper/constant";

export function Component({ props, globalConfig, blocks, fpi }) {
  const isMobile = useViewport(0, 768);
  const [products, setProducts] = useState([]);
  const {
    image_desktop,
    image_mobile,
    banner_link,
    title,
    description,
    button_text,
    align_text_desktop,
    text_alignment,
    text_alignment_mobile,
    padding_top,
    padding_bottom,
  } = props;

  const getMobileImage = image_mobile?.value || placeholderMobile;
  const getDesktopImage = image_desktop?.value || placeholderDesktop;

  const getImgSrcSet = () => {
    if (globalConfig?.img_hd) {
      return [
        { breakpoint: { min: 481 } },
        { breakpoint: { max: 480 }, url: getMobileImage },
      ];
    }
    return [
      { breakpoint: { min: 1728 }, width: 2331 },
      { breakpoint: { min: 1512 }, width: 2049 },
      { breakpoint: { min: 1296 }, width: 1768 },
      { breakpoint: { min: 1080 }, width: 1472 },
      { breakpoint: { min: 900 }, width: 1236 },
      { breakpoint: { min: 720 }, width: 1530 },
      { breakpoint: { max: 180 }, width: 450, url: getMobileImage },
      { breakpoint: { max: 360 }, width: 810, url: getMobileImage },
      { breakpoint: { max: 540 }, width: 1170, url: getMobileImage },
    ];
  };
  const getProductSlugs = () => {
    return (
      blocks?.reduce((acc, block) => {
        const productSlug = block?.props?.product?.value;
        if (productSlug && !acc.includes(productSlug)) {
          acc.push(productSlug);
        }
        return acc;
      }, []) || []
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      const productSlugs = getProductSlugs();
      if (!productSlugs.length) {
        return;
      }
      try {
        const results = await Promise.all(
          productSlugs.map((slug) =>
            fpi
              .executeGQL(
                FEATURE_PRODUCT_DETAILS,
                { slug },
                { skipStoreUpdate: true }
              )
              .then((result) => ({
                uid: result?.data?.product?.uid,
                data: result,
              }))
          )
        );
        // Aggregate only the data field into a single array
        const aggregatedResults = results.map(({ data }) => data);
        setProducts(aggregatedResults);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, []);

  const getFormattedProducts = () => {
    return getProductSlugs()?.reduce((acc, slug, index) => {
      acc[slug] = products?.[index]?.data?.product;
      return acc;
    }, {});
  };
  const getHotspots = () => {
    return {
      desktop: blocks?.filter((block) => block?.type === "hotspot_desktop"),
      mobile: blocks?.filter((block) => block?.type === "hotspot_mobile"),
    };
  };

  const mapAlignment = !isMobile
    ? {
      top_start: {
        justifyContent: "unset",
        alignItems: "flex-start",
        textAlign: "start",
      },
      top_center: {
        justifyContent: "unset",
        alignItems: "center",
        textAlign: "center",
      },
      top_end: {
        justifyContent: "unset",
        alignItems: "flex-end",
        textAlign: "end",
      },
      center_center: {
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      },
      center_start: {
        justifyContent: "center",
        alignItems: "flex-start",
        textAlign: "start",
      },
      center_end: {
        justifyContent: "center",
        alignItems: "flex-end",
        textAlign: "end",
      },
      bottom_start: {
        justifyContent: "flex-end",
        alignItems: "flex-start",
        textAlign: "start",
      },
      bottom_end: {
        justifyContent: "flex-end",
        alignItems: "flex-end",
        textAlign: "end",
      },
      bottom_center: {
        justifyContent: "flex-end",
        alignItems: "center",
        textAlign: "center",
      },
    }
    : {
      center: {
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      },
      left: {
        justifyContent: "center",
        alignItems: "flex-start",
        textAlign: "start",
      },
      right: {
        justifyContent: "center",
        alignItems: "flex-end",
        textAlign: "end",
      },
    };

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 16}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  return (
    <section
      className={`${styles.media_text} ${align_text_desktop?.value && styles["media_text--invert"]}`}
      style={dynamicStyles}
    >
      <div className={styles["media_text__image-wrapper"]}>
        <FyImage
          customClass={styles.imageWrapper}
          src={getDesktopImage}
          sources={getImgSrcSet()}
          isFixedAspectRatio={false}
        />
        {!isMobile &&
          getHotspots()?.desktop?.map((hotspot, index) => (
            <Hotspot
              className={styles["hotspot--desktop"]}
              key={index}
              hotspot={hotspot}
              product={
                getFormattedProducts()?.[hotspot?.props?.product?.value] ??
                MEDIA_WITH_TEXT_HOTSPOT_PLACEHOLDER_PRODUCT
              }
              aspectRatio={getProductImgAspectRatio(globalConfig)}
            />
          ))}
        {isMobile &&
          getHotspots()?.mobile?.map((hotspot, index) => (
            <Hotspot
              className={styles["hotspot--mobile"]}
              key={index}
              hotspot={hotspot}
              isMobile={isMobile}
              product={
                getFormattedProducts()?.[hotspot?.props?.product?.value] ??
                MEDIA_WITH_TEXT_HOTSPOT_PLACEHOLDER_PRODUCT
              }
              aspectRatio={getProductImgAspectRatio(globalConfig)}
            />
          ))}
      </div>
      <div
        className={styles.media_text__info}
        style={
          !isMobile
            ? mapAlignment[text_alignment?.value]
            : mapAlignment[text_alignment_mobile?.value]
        }
      >
        {title?.value && (
          <h2 className={`fx-title ${styles.media_text__heading} fontHeader`}>
            {title?.value}
          </h2>
        )}
        {description?.value && (
          <p className={`fx-description ${styles.media_text__description}`}>
            {description?.value}
          </p>
        )}
        {button_text?.value && (
          <FDKLink
            className={`fx-button ${styles.media_text__cta} btnSecondary`}
            to={banner_link?.value}
          >
            {button_text?.value}
          </FDKLink>
        )}
      </div>
    </section>
  );
}
export const settings = {
  label: "t:resource.sections.media_with_text.media_with_text",
  props: [
    {
      type: "image_picker",
      id: "image_desktop",
      label: "t:resource.common.desktop_image",
      default: "",
      options: {
        aspect_ratio: "314:229",
      },
    },
    {
      type: "image_picker",
      id: "image_mobile",
      label: "t:resource.sections.media_with_text.mobile_image",
      default: "",
      options: {
        aspect_ratio: "320:467",
      },
    },
    {
      id: "text_alignment",
      type: "select",
      options: [
        {
          value: "top_start",
          text: "t:resource.sections.media_with_text.top_start",
        },
        {
          value: "top_center",
          text: "t:resource.sections.media_with_text.top_center",
        },
        {
          value: "top_end",
          text: "t:resource.sections.media_with_text.top_end",
        },
        {
          value: "center_center",
          text: "t:resource.sections.media_with_text.center_center",
        },
        {
          value: "center_start",
          text: "t:resource.sections.media_with_text.center_start",
        },
        {
          value: "center_left",
          text: "t:resource.sections.hero_image.center_left",
        },
        {
          value: "center_right",
          text: "t:resource.sections.hero_image.center_right",
        },
        {
          value: "center_end",
          text: "t:resource.sections.media_with_text.center_end",
        },
        {
          value: "bottom_start",
          text: "t:resource.sections.media_with_text.bottom_start",
        },
        {
          value: "bottom_end",
          text: "t:resource.sections.media_with_text.bottom_end",
        },
        {
          value: "bottom_center",
          text: "t:resource.sections.media_with_text.bottom_center",
        },
      ],
      default: "center_start",
      label: "t:resource.common.text_alignment_desktop",
      info: "t:resource.sections.media_with_text.text_align_desktop",
    },
    {
      id: "text_alignment_mobile",
      type: "select",
      options: [
        {
          value: "center",
          text: "t:resource.common.center",
        },
        {
          value: "left",
          text: "t:resource.common.start",
        },
        {
          value: "right",
          text: "t:resource.common.end",
        },
      ],
      default: "left",
      label: "t:resource.common.text_alignment_mobile",
      info: "t:resource.sections.media_with_text.text_align_mobile",
    },
    {
      type: "url",
      id: "banner_link",
      default: "",
      label: "t:resource.common.redirect_link",
    },
    {
      type: "text",
      id: "title",
      default: "",
      label: "t:resource.common.heading",
    },
    {
      type: "textarea",
      id: "description",
      default: "",
      label: "t:resource.common.description",
    },
    {
      type: "text",
      id: "button_text",
      default: "",
      label: "t:resource.common.button_text",
    },
    {
      type: "checkbox",
      id: "align_text_desktop",
      default: false,
      label: "t:resource.sections.media_with_text.invert_section",
      info: "t:resource.sections.media_with_text.reverse_section_desktop",
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
      type: "hotspot_desktop",
      name: "t:resource.common.hotspot_desktop",
      props: [
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
          id: "x_position",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.horizontal_position",
          default: 50,
        },
        {
          type: "product",
          name: "t:resource.common.product",
          id: "product",
          label: "t:resource.common.select_a_product",
          info: "t:resource.common.product_item_display",
        },
      ],
    },
    {
      type: "hotspot_mobile",
      name: "t:resource.common.hotspot_mobile",
      props: [
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
          id: "x_position",
          min: 0,
          max: 100,
          step: 1,
          unit: "%",
          label: "t:resource.common.horizontal_position",
          default: 50,
        },
        {
          type: "product",
          name: "t:resource.common.product",
          id: "product",
          label: "t:resource.common.select_a_product",
          info: "t:resource.common.product_item_display",
        },
      ],
    },
  ],
};
export default Component;
