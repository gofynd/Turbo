import React, { useState, useEffect, useMemo } from "react";
import styles from "../styles/sections/brand-listing.less";
import { FDKLink, BlockRenderer } from "fdk-core/components";
import { BRAND_DETAILS } from "../queries/brandsQuery";
import placeholderImage from "../assets/images/placeholder/brand-listing.png";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import { useWindowWidth } from "../helper/hooks";
import useLocaleDirection from "../helper/hooks/useLocaleDirection";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../components/carousel";

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
      blocks
        ?.map((block, index) => ({
          type: block?.type,
          slug:
            block?.type !== "category"
              ? `${block?.type}_${index}`
              : block?.props?.brand?.value?.id,
          block,
        }))
        ?.filter(({ slug }) => slug) ?? []
    );
  }, [blocks]);
  const customSectionId = brandIds?.map(({ slug }) => slug)?.join?.("__");
  const brands = brandCustomValue[`brandData-${customSectionId}`];

  useEffect(() => {
    const fetchBrands = async () => {
      if (!brands?.length && brandIds?.length) {
        try {
          const promisesArr = brandIds?.map(async ({ type, slug, block }) => {
            const listingData = { type };
            if (type !== "category") {
              listingData["data"] = block;
            } else {
              const response = await fpi.executeGQL(BRAND_DETAILS, { slug });
              listingData["data"] = response?.data || {};
            }

            return listingData;
          });
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
        width: Math.round(810 / (logoOnly?.value ? 3 : 1)),
      },
      {
        breakpoint: { min: 180 },
        width: Math.round(450 / (logoOnly?.value ? 3 : 1)),
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
      ? card?.brand?.logo?.url
      : card?.brand?.banners?.portrait?.url || placeholderImage;
  };
  const { isRTL } = useLocaleDirection();

  const len = brands?.length;

  const desktopCount = Math.min(len, Number(per_row?.value ?? 4));
  const tabletCount = Math.min(len, 3);
  const mobileCount = logoOnly?.value ? 3 : 1;
  const centerModeMobile = !(logoOnly?.value || len === 1);

  const options = useMemo(
    () => ({
      direction: isRTL ? "rtl" : "ltr",
      align: "start",
      loop: true,
      draggable: true,
      containScroll: "trimSnaps",
      slidesToScroll: desktopCount,
      duration: 35,
      breakpoints: {
        "(max-width: 779px)": {
          draggable: false,
          slidesToScroll: 3,
          align: "start",
          loop: true,
        },
        "(max-width: 479px)": {
          draggable: false,
          slidesToScroll: mobileCount,
          align: centerModeMobile ? "center" : "start",
          loop: true,
        },
      },
    }),
    [isRTL, desktopCount, mobileCount, centerModeMobile]
  );

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
          {getBrandCount()?.map(({ type, data: card }, index) =>
            type !== "category" ? (
              <BlockRenderer key={index} block={card} />
            ) : (
              <div
                key={index}
                //   className={`${styles["animation-fade-up"]}`}
                style={{ "--delay": `${150 * (index + 1)}ms` }}
              >
                <FDKLink to={`/products/?brand=${card?.brand?.slug}`}>
                  <div
                    data-cardtype="BRANDS"
                    className={styles["pos-relative"]}
                  >
                    <FyImage
                      backgroundColor={img_container_bg?.value}
                      customClass={
                        !logoOnly?.value ? styles["brand-image"] : styles.imgRad
                      }
                      isImageFill={img_fill?.value || logoOnly?.value}
                      src={getImgSrc(card)}
                      alt={card?.brand?.name || "Brand banner"}
                      aspectRatio={logoOnly?.value ? "1" : "0.8"}
                      mobileAspectRatio={logoOnly?.value ? "1" : "0.8"}
                      sources={getImgSrcSet()}
                    />
                    {card?.brand?.name?.length > 0 && !logoOnly?.value && (
                      <div className={styles["brand-info"]}>
                        <div className={styles["brand-logo"]}>
                          <FyImage
                            src={
                              card?.brand?.logo?.url
                                ? card?.brand?.logo?.url
                                : placeholderImage
                            }
                            alt={card?.brand?.name || "Brand logo"}
                            aspectRatio="1"
                            mobileAspectRatio="1"
                            sources={[{ width: 100 }]}
                          />
                        </div>
                        <span
                          className={`${styles.fontBody} ${styles.brandNameSec}`}
                        >
                          {card?.brand?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </FDKLink>
              </div>
            )
          )}
        </div>
      )}
      {showScrollView() && getBrandCount()?.length > 0 && (
        <>
          <div
            className={`remove-horizontal-scroll ${styles["categories-horizontal"]} ${
              styles[`card-count-${per_row?.value}`]
            } ${logoOnly?.value ? styles.logoWidth : ""} ${
              getBrandCount()?.length === 1 ? styles["single-card"] : ""
            }`}
            style={{
              "--brand-item": per_row?.value,
              "--slick-dots": `${Math.ceil(getBrandCount()?.length / per_row?.value) * 22 + 10}px`,
            }}
          >
            <Carousel
              opts={options}
              className={` ${styles["brands-carousel"]} ${logoOnly?.value ? styles[`logo-carousel`] : ""} ${logoOnly?.value ? styles[`card-count-${per_row?.value}`] : ""} ${getBrandCount()?.length <= per_row?.value || windowWidth <= 480 ? "no-nav" : ""} ${styles[alignment?.value]}`}
            >
              <CarouselContent>
                {!isLoading &&
                  getBrandCount()?.map(({ type, data: card }, index) => (
                    <CarouselItem
                      key={index}
                      className={styles.carouselItem}
                      style={{
                        "--count-desktop":
                          brands?.length < per_row?.value
                            ? brands?.length
                            : Number(per_row?.value),
                        "--count-mobile": logoOnly?.value ? 3 : 1,
                        "--count-tablet":
                          brands?.length < 4 ? brands?.length : 3,
                      }}
                    >
                      {type !== "category" ? (
                        <BlockRenderer key={index} block={card} />
                      ) : (
                        <div
                          key={index}
                          className={styles["custom-slick-slide"]}
                        >
                          <div
                            // className={`${styles["animation-fade-up"]}`}
                            style={{ "--delay": `${150 * (index + 1)}ms` }}
                          >
                            <FDKLink
                              to={`/products/?brand=${card?.brand?.slug}`}
                            >
                              <div
                                data-cardtype="BRANDS"
                                style={{ position: "relative" }}
                                // className={`${logoOnly?.value ? styles["logo-carousel"] : ""}`}
                              >
                                <FyImage
                                  backgroundColor={img_container_bg?.value}
                                  customClass={styles["brand-image"]}
                                  isImageFill={
                                    img_fill?.value || logoOnly?.value
                                  }
                                  src={getImgSrc(card)}
                                  aspectRatio={logoOnly?.value ? 1 : 0.8}
                                  mobileAspectRatio={logoOnly?.value ? 1 : 0.8}
                                  sources={getImgSrcSet()}
                                  alt={card?.brand?.name || "Brand banner"}
                                />
                                {card?.brand?.name?.length > 0 &&
                                  !logoOnly?.value && (
                                    <div className={styles["brand-info"]}>
                                      <div className={styles["brand-logo"]}>
                                        <FyImage
                                          src={
                                            card?.brand?.logo?.url
                                              ? card?.brand?.logo?.url
                                              : placeholderImage
                                          }
                                          aspectRatio={1}
                                          mobileAspectRatio={1}
                                          sources={[{ width: 100 }]}
                                          alt={card?.brand?.name || "Brand logo"}
                                        />
                                      </div>
                                      <span className={styles["font-body"]}>
                                        {card?.brand?.name}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </FDKLink>
                          </div>
                        </div>
                      )}
                    </CarouselItem>
                  ))}
              </CarouselContent>
              <CarouselPrevious className={styles.carouselBtn} />
              <CarouselNext className={styles.carouselBtn} />
            </Carousel>
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
                  alt="Brand placeholder"
                />

                {!logoOnly?.value && (
                  <div className={styles["brand-info"]}>
                    <div className={styles["brand-logo"]}>
                      <FyImage
                        src={placeholderImage}
                        aspectRatio={1}
                        mobileAspectRatio={1}
                        sources={[{ width: 100 }]}
                        alt="Brand placeholder logo"
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

Component.serverFetch = async ({ fpi, blocks }) => {
  try {
    const ids = [];
    const promises = [];

    blocks?.forEach((block, index) => {
      if (block.type !== "category") {
        // Non-category blocks: client expects { type, data }
        ids.push(`${block.type}_${index}`);
        promises.push(Promise.resolve({ type: block.type, data: block }));
      } else if (block?.props?.brand?.value?.id) {
        // Category blocks: fetch brand details and wrap as { type, data }
        const slug = block.props.brand.value.id;
        ids.push(slug);
        const p = fpi
          .executeGQL(BRAND_DETAILS, { slug })
          .then((res) => ({ type: "category", data: res?.data || {} }));
        promises.push(p);
      }
    });

    const responses = await Promise.all(promises);
    return fpi.custom.setValue(`brandData-${ids.join("__")}`, responses);
  } catch (err) {
    console.error("brand-listing serverFetch error:", err);
  }
};

export default Component;
