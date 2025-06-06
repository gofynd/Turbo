import React, { useState, useEffect, useMemo } from "react";
import styles from "../styles/sections/brand-listing.less";
import Slider from "react-slick";
import { FDKLink } from "fdk-core/components";
import { BRAND_DETAILS } from "../queries/brandsQuery";
import placeholderImage from "../assets/images/placeholder/brand-listing.png";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";
import { useWindowWidth } from "../helper/hooks";

export function Component({ props, globalConfig, blocks, id: sectionId }) {
  const fpi = useFPI();
  const {
    heading,
    description,
    logoOnly,
    per_row,
    layout_mobile,
    layout_desktop,
    img_fill,
    button_text,
    img_container_bg,
    alignment,
    padding_top,
    padding_bottom,
  } = props;

  const placeholderBrands = ["Brand1", "Brand2", "Brand3", "Brand4"];

  const [isLoading, setIsLoading] = useState(false);
  const windowWidth = useWindowWidth();
  const brandCustomValue = useGlobalStore(fpi?.getters?.CUSTOM_VALUE) ?? {};
  const brandIds = useMemo(() => {
    return (
      blocks?.reduce((acc, b) => {
        if (b?.props?.brand?.value?.id)
          return [...acc, b?.props?.brand?.value?.id];
        return acc;
      }, []) ?? []
    );
  }, [blocks]);
  const customSectionId = brandIds?.join?.("__");
  const brands = brandCustomValue[`brandData-${customSectionId}`];

  useEffect(() => {
    const fetchBrands = async () => {
      if (!brands?.length && brandIds?.length) {
        try {
          const promisesArr = brandIds?.map((slug) =>
            fpi.executeGQL(BRAND_DETAILS, { slug })
          );
          const responses = await Promise.all(promisesArr);
          fpi.custom.setValue(`brandData-${customSectionId}`, responses);
        } catch (err) {
          console.log(err);
        }
      }
    };
    fetchBrands();
  }, [brandIds, customSectionId]);

  const getImgSrcSet = () => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      {
        breakpoint: { min: 1728 },
        width: Math.round(3564 / Number(per_row?.value)),
      },
      {
        breakpoint: { min: 1512 },
        width: Math.round(3132 / Number(per_row?.value)),
      },
      {
        breakpoint: { min: 1296 },
        width: Math.round(2700 / Number(per_row?.value)),
      },
      {
        breakpoint: { min: 1080 },
        width: Math.round(2250 / Number(per_row?.value)),
      },
      {
        breakpoint: { min: 900 },
        width: Math.round(1890 / Number(per_row?.value)),
      },
      { breakpoint: { min: 720 }, width: Math.round(1530 / 3) },
      { breakpoint: { min: 540 }, width: Math.round(1170 / 3) },
      {
        breakpoint: { min: 360 },
        width: Math.round(810 / logoOnly?.value ? 3 : 1),
      },
      {
        breakpoint: { min: 180 },
        width: Math.round(450 / logoOnly?.value ? 3 : 1),
      },
    ];
  };

  const showStackedView = () => {
    if (
      (windowWidth > 768 && per_row?.value >= brands?.length) ||
      brands?.length === 1
    ) {
      return true;
    }
    if (!brands?.length) return [];
    if (windowWidth <= 768) {
      return layout_mobile?.value === "stacked";
    }
    return layout_desktop?.value === "grid";
  };

  const showScrollView = () => {
    if (windowWidth <= 768 && brands?.length > 1) {
      return layout_mobile?.value === "horizontal";
    } else if (per_row?.value < brands?.length) {
      return layout_desktop?.value === "horizontal";
    }
  };

  const getBrandCount = () => {
    const perRowItem = per_row?.value;
    // if (!isRunningOnClient()) {
    //   return brands?.slice(
    //     0,
    //     logoOnly?.value ? (perRowItem ?? 1 * 2) : perRowItem
    //   );
    // }
    if (logoOnly?.value) {
      if (showScrollView()) {
        if (windowWidth >= 768 && windowWidth < 830)
          return brands?.slice(0, 12);
        if (windowWidth < 768) return brands?.slice(0, 12);
        return brands?.slice(0, perRowItem * 4);
      } else if (showStackedView()) {
        if (windowWidth >= 768 && windowWidth < 830) return brands?.slice(0, 9);
        if (windowWidth < 768) return brands?.slice(0, 9);
        return brands?.slice(0, perRowItem * 2);
      }
    } else if (showScrollView()) {
      if (windowWidth >= 768 && windowWidth < 830) return brands?.slice(0, 12);
      if (windowWidth < 768) return brands?.slice(0, 4);
      return brands?.slice(0, perRowItem * 4);
    } else if (showStackedView()) {
      if (windowWidth >= 768 && windowWidth < 830) return brands?.slice(0, 6);
      if (windowWidth < 768) return brands?.slice(0, 4);
      return brands?.slice(0, perRowItem * 2);
    }
    return [];
  };

  const getImgSrc = (card) => {
    return logoOnly?.value
      ? card?.data?.brand?.logo?.url
      : card?.data?.brand?.banners?.portrait?.url || placeholderImage;
  };

  const [slickSetting, setSlickSettings] = useState({
    dots: brands?.length > per_row?.value,
    arrows: brands?.length > per_row?.value,
    nextArrow: <SliderRightIcon />,
    prevArrow: <SliderLeftIcon />,
    // nextArrow: ({ currentSlide, slideCount, ...props }) => (
    //   <SliderRightIcon {...props} />
    // ),
    // prevArrow: ({ currentSlide, slideCount, ...props }) => (
    //   <SliderLeftIcon {...props} />
    // ),
    focusOnSelect: true,
    infinite: true,
    speed: 600,
    slidesToShow:
      brands?.length < per_row?.value ? brands?.length : Number(per_row?.value),
    slidesToScroll:
      brands?.length < per_row?.value ? brands?.length : Number(per_row?.value),
    responsive: [
      {
        breakpoint: 780,
        settings: {
          arrows: false,
          slidesToShow: brands?.length < 4 ? brands?.length : 3,
          slidesToScroll: 3,
          swipe: true,
          swipeToSlide: false,
          touchThreshold: 80,
          draggable: false,
          touchMove: true,
        },
      },
    ],
  });
  const [slickSettingsMobile, setSlickSettingsMobile] = useState({
    dots: false,
    arrows: false,
    nextArrow: <SliderRightIcon />,
    prevArrow: <SliderLeftIcon />,
    focusOnSelect: true,
    infinite: true,
    speed: 600,
    slidesToShow: logoOnly?.value ? 3 : 1,
    slidesToScroll: logoOnly?.value ? 3 : 1,
    centerMode: !(logoOnly?.value || getBrandCount()?.length === 1),
    centerPadding: "25px",
    swipe: true,
    swipeToSlide: false,
    touchThreshold: 80,
    draggable: false,
    touchMove: true,
  });

  useEffect(() => {
    if (slickSetting.arrows !== brands?.length > per_row?.value) {
      setSlickSettings((prevConfig) => ({
        ...prevConfig,
        arrows: brands?.length > per_row?.value,
        dots: brands?.length > per_row?.value,
      }));
    }
  }, [per_row, brands]);

  const isDemoBlock = () => {
    const brands =
      blocks?.reduce((acc, b) => {
        if (b?.props?.brand?.value?.id) {
          return [...acc, b?.props?.brand?.value?.id];
        }
        return acc;
      }, []) || [];
    return brands?.length === 0;
  };

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 16}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
  };

  return (
    <section style={dynamicStyles}>
      <div>
        {heading?.value && (
          <h2
            className={`${styles["section-heading"]} fontHeader ${
              logoOnly?.value ? styles["logo-only"] : ""
            }`}
          >
            {heading.value}
          </h2>
        )}
        {description?.value && (
          <p className={`${styles["section-description"]} b-small fontBody`}>
            {description.value}
          </p>
        )}
      </div>
      {showStackedView() && (
        <div
          className={`${styles["categories-block"]} ${
            logoOnly?.value ? styles.logoWidth : styles.nonLogoMaxWidth
          } ${styles[`card-count-${per_row?.value}`]} ${styles[alignment?.value]}`}
          style={{ "--brand-item": per_row?.value }}
        >
          {getBrandCount()?.map((card, index) => (
            <div
              key={index}
              //   className={`${styles["animation-fade-up"]}`}
              style={{ "--delay": `${150 * (index + 1)}ms` }}
            >
              <FDKLink to={`/products/?brand=${card?.data?.brand?.slug}`}>
                <div data-cardtype="BRANDS" className={styles["pos-relative"]}>
                  <FyImage
                    backgroundColor={img_container_bg?.value}
                    customClass={
                      !logoOnly?.value ? styles["brand-image"] : styles.imgRad
                    }
                    isImageFill={img_fill?.value || logoOnly?.value}
                    src={getImgSrc(card)}
                    alt={card?.data?.brand?.name || ""}
                    aspectRatio={logoOnly?.value ? "1" : "0.8"}
                    mobileAspectRatio={logoOnly?.value ? "1" : "0.8"}
                    sources={getImgSrcSet()}
                  />
                  {card?.data?.brand?.name?.length > 0 && !logoOnly?.value && (
                    <div className={styles["brand-info"]}>
                      <div className={styles["brand-logo"]}>
                        <FyImage
                          src={
                            card?.data?.brand?.logo?.url
                              ? card?.data?.brand?.logo?.url
                              : placeholderImage
                          }
                          alt={card?.data?.brand?.name || ""}
                          aspectRatio="1"
                          mobileAspectRatio="1"
                          sources={[{ width: 100 }]}
                        />
                      </div>
                      <span
                        className={`${styles.fontBody} ${styles.brandNameSec}`}
                      >
                        {card?.data?.brand?.name}
                      </span>
                    </div>
                  )}
                </div>
              </FDKLink>
            </div>
          ))}
        </div>
      )}
      {showScrollView() && getBrandCount()?.length > 0 && (
        <>
          <div
            className={`${styles["categories-horizontal"]} ${
              styles[`card-count-${per_row?.value}`]
            } ${logoOnly?.value ? styles.logoWidth : ""} ${
              getBrandCount()?.length === 1 ? styles["single-card"] : ""
            } ${styles.hideOnMobile}`}
            style={{
              "--brand-item": per_row?.value,
              "--slick-dots": `${Math.ceil(getBrandCount()?.length / per_row?.value) * 22 + 10}px`,
            }}
          >
            <Slider
              style={{ maxWidth: "100vw" }}
              className={`${styles["brands-carousel"]} ${logoOnly?.value ? styles[`logo-carousel`] : ""} ${logoOnly?.value ? styles[`card-count-${per_row?.value}`] : ""} ${getBrandCount()?.length <= per_row?.value || windowWidth <= 480 ? "no-nav" : ""} ${styles[alignment?.value]}`}
              {...slickSetting}
            >
              {!isLoading &&
                getBrandCount()?.map((card, index) => (
                  <div key={index} className={styles["custom-slick-slide"]}>
                    <div
                      // className={`${styles["animation-fade-up"]}`}
                      style={{ "--delay": `${150 * (index + 1)}ms` }}
                    >
                      <FDKLink
                        to={`/products/?brand=${card?.data?.brand?.slug}`}
                      >
                        <div
                          data-cardtype="BRANDS"
                          style={{ position: "relative" }}
                          // className={`${logoOnly?.value ? styles["logo-carousel"] : ""}`}
                        >
                          <FyImage
                            backgroundColor={img_container_bg?.value}
                            customClass={styles["brand-image"]}
                            isImageFill={img_fill?.value || logoOnly?.value}
                            src={getImgSrc(card)}
                            aspectRatio={logoOnly?.value ? 1 : 0.8}
                            mobileAspectRatio={logoOnly?.value ? 1 : 0.8}
                            sources={getImgSrcSet()}
                          />
                          {card?.data?.brand?.name?.length > 0 &&
                            !logoOnly?.value && (
                              <div className={styles["brand-info"]}>
                                <div className={styles["brand-logo"]}>
                                  <FyImage
                                    src={
                                      card?.data?.brand?.logo?.url
                                        ? card?.data?.brand?.logo?.url
                                        : placeholderImage
                                    }
                                    aspectRatio={1}
                                    mobileAspectRatio={1}
                                    sources={[{ width: 100 }]}
                                  />
                                </div>
                                <span className={styles["font-body"]}>
                                  {card?.data?.brand?.name}
                                </span>
                              </div>
                            )}
                        </div>
                      </FDKLink>
                    </div>
                  </div>
                ))}
            </Slider>
          </div>
          <div
            className={`${styles["categories-horizontal"]} ${
              styles[`card-count-${per_row?.value}`]
            } ${logoOnly?.value ? styles.logoWidth : ""} ${
              getBrandCount()?.length === 1 ? styles["single-card"] : ""
            } ${styles.hideOnDesktop}`}
            style={{
              "--brand-item": per_row?.value,
              "--slick-dots": `${Math.ceil(getBrandCount()?.length / per_row?.value) * 22 + 10}px`,
            }}
          >
            <Slider
              style={{ maxWidth: "100vw" }}
              className={`${styles["brands-carousel"]} ${logoOnly?.value ? styles[`logo-carousel`] : ""} ${logoOnly?.value ? styles[`card-count-${per_row?.value}`] : ""} ${getBrandCount()?.length <= per_row?.value || windowWidth <= 480 ? "no-nav" : ""} ${styles[alignment?.value]}`}
              {...slickSettingsMobile}
            >
              {!isLoading &&
                getBrandCount()?.map((card, index) => (
                  <div key={index} className={styles["custom-slick-slide"]}>
                    <div
                      // className={`${styles["animation-fade-up"]}`}
                      style={{ "--delay": `${150 * (index + 1)}ms` }}
                    >
                      <FDKLink
                        to={`/products/?brand=${card?.data?.brand?.slug}`}
                      >
                        <div
                          data-cardtype="BRANDS"
                          style={{ position: "relative" }}
                          // className={`${logoOnly?.value ? styles["logo-carousel"] : ""}`}
                        >
                          <FyImage
                            backgroundColor={img_container_bg?.value}
                            customClass={styles["brand-image"]}
                            isImageFill={img_fill?.value || logoOnly?.value}
                            src={getImgSrc(card)}
                            aspectRatio={logoOnly?.value ? 1 : 0.8}
                            mobileAspectRatio={logoOnly?.value ? 1 : 0.8}
                            sources={getImgSrcSet()}
                          />
                          {card?.data?.brand?.name?.length > 0 &&
                            !logoOnly?.value && (
                              <div className={styles["brand-info"]}>
                                <div className={styles["brand-logo"]}>
                                  <FyImage
                                    src={
                                      card?.data?.brand?.logo?.url
                                        ? card?.data?.brand?.logo?.url
                                        : placeholderImage
                                    }
                                    aspectRatio={1}
                                    mobileAspectRatio={1}
                                    sources={[{ width: 100 }]}
                                  />
                                </div>
                                <span className={styles["font-body"]}>
                                  {card?.data?.brand?.name}
                                </span>
                              </div>
                            )}
                        </div>
                      </FDKLink>
                    </div>
                  </div>
                ))}
            </Slider>
          </div>
        </>
      )}

      {isDemoBlock() && (
        <div
          className={`${styles.defaultBrandBlock} ${
            logoOnly?.value ? styles.logoWidth : styles.nonLogoMaxWidth
          } ${styles["card-count-4"]}`}
        >
          {placeholderBrands?.map((item, index) => (
            <div key={index}>
              <div data-cardtype="BRANDS" className={styles["pos-relative"]}>
                <FyImage
                  backgroundColor={img_container_bg?.value}
                  customClass={logoOnly?.value ? styles["brand-image"] : ""}
                  isImageFill={true}
                  src={placeholderImage}
                  aspectRatio={logoOnly?.value ? 1 : 0.8}
                  mobileAspectRatio={logoOnly?.value ? 1 : 0.8}
                  sources={getImgSrcSet()}
                />

                {!logoOnly?.value && (
                  <div className={styles["brand-info"]}>
                    <div className={styles["brand-logo"]}>
                      <FyImage
                        src={placeholderImage}
                        aspectRatio={1}
                        mobileAspectRatio={1}
                        sources={[{ width: 100 }]}
                      />
                    </div>
                    <span className={styles.fontBody}>{item}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {button_text && (
        <div
          className={`${styles["flex-justify-center"]} ${styles["gap-above-button"]}`}
        >
          <FDKLink to="/brands/">
            {button_text?.value && (
              <button
                type="button"
                className={`${styles["section-button"]} btn-secondary`}
              >
                {button_text?.value}
              </button>
            )}
          </FDKLink>
        </div>
      )}
    </section>
  );
}

export const settings = {
  label: "t:resource.sections.brand_listing.brands_listing",
  props: [
    {
      type: "range",
      id: "per_row",
      label: "t:resource.sections.brand_listing.brands_per_row_desktop",
      min: "3",
      max: "5",
      step: "1",
      info: "t:resource.common.not_applicable_for_mobile",
      default: "4",
    },
    {
      type: "checkbox",
      id: "logoOnly",
      default: false,
      label: "t:resource.sections.brand_listing.logo_only",
      info: "t:resource.common.show_logo_of_brands",
    },
    {
      id: "layout_mobile",
      type: "select",
      options: [
        {
          value: "stacked",
          text: "t:resource.common.stack",
        },
        {
          value: "horizontal",
          text: "t:resource.common.horizontal",
        },
      ],
      default: "stacked",
      label: "t:resource.common.mobile_layout",
      info: "t:resource.common.alignment_of_content",
    },
    {
      id: "layout_desktop",
      type: "select",
      options: [
        {
          value: "grid",
          text: "t:resource.common.stack",
        },
        {
          value: "horizontal",
          text: "t:resource.common.horizontal",
        },
      ],
      default: "grid",
      label: "t:resource.common.desktop_layout",
      info: "t:resource.common.alignment_of_content",
    },
    {
      id: "alignment",
      type: "select",
      options: [
        {
          value: "left",
          text: "t:resource.common.left",
        },
        {
          value: "right",
          text: "t:resource.common.right",
        },
        {
          value: "center",
          text: "t:resource.common.center",
        },
      ],
      default: "center",
      label: "t:resource.sections.brand_listing.align_brands",
      info: "t:resource.sections.brand_listing.brand_alignment",
    },
    {
      type: "color",
      id: "img_container_bg",
      category: "t:resource.common.image_container",
      default: "#00000000",
      label: "t:resource.common.container_background_color",
      info: "t:resource.common.image_container_bg_color",
    },
    {
      type: "checkbox",
      id: "img_fill",
      category: "t:resource.common.image_container",
      default: true,
      label: "t:resource.common.fit_image_to_container",
      info: "t:resource.common.clip_image_to_fit_container",
    },
    {
      type: "text",
      id: "heading",
      default: "t:resource.sections.brand_listing.our_top_brands",
      label: "t:resource.common.heading",
      info: "t:resource.common.section_heading_text",
    },
    {
      type: "textarea",
      id: "description",
      default: "t:resource.sections.brand_listing.all_is_unique",
      label: "t:resource.common.description",
      info: "t:resource.common.section_description_text",
    },
    {
      type: "text",
      id: "button_text",
      default: "t:resource.default_values.view_all_caps",
      label: "t:resource.common.button_text",
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
      type: "category",
      name: "t:resource.sections.brand_listing.brand_item",
      props: [
        {
          type: "brand",
          id: "brand",
          label: "t:resource.sections.brand_listing.select_brand",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "t:resource.sections.brand_listing.brand_item",
      },
      {
        name: "t:resource.sections.brand_listing.brand_item",
      },
      {
        name: "t:resource.sections.brand_listing.brand_item",
      },
      {
        name: "t:resource.sections.brand_listing.brand_item",
      },
    ],
  },
};


Component.serverFetch = async ({ fpi, blocks, id }) => {
  try {
    const promisesArr = [];
    const ids = [];
    blocks?.map(async (block) => {
      if (block?.props?.brand?.value) {
        const slug = block.props.brand.value.id;
        ids.push(slug);
        const res = fpi.executeGQL(BRAND_DETAILS, {
          slug,
        });
        if (res !== undefined) {
          promisesArr.push(res);
        }
      }
    });
    const responses = await Promise.all(promisesArr);
    return fpi.custom.setValue(`brandData-${ids?.join("__")}`, responses);
  } catch (err) {
    console.log(err);
  }
};
export default Component;