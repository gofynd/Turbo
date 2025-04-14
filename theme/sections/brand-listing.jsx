import React, { useState, useEffect, useMemo, useRef } from "react";
import Slider from "react-slick";
import { FDKLink } from "fdk-core/components";
import { isRunningOnClient } from "../helper/utils";
import styles from "../styles/sections/brand-listing.less";
import { BRAND_DETAILS } from "../queries/brandsQuery";
import placeholderImage from "../assets/images/placeholder/brand-listing.png";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";

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
  } = props;

  const placeholderBrands = ["Brand1", "Brand2", "Brand3", "Brand4"];

  const [isLoading, setIsLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    isRunningOnClient() ? window?.innerWidth : 400
  );
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

  useEffect(() => {
    if (isRunningOnClient()) {
      setWindowWidth(window?.innerWidth);
      const handleResize = () => {
        setWindowWidth(window?.innerWidth);
      };

      window?.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  const getImgSrcSet = () => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 1024 }, width: 450 },
      { breakpoint: { min: 769 }, width: 416 },
      { breakpoint: { max: 768 }, width: 232 },
      { breakpoint: { max: 480 }, width: 136 },
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
      : card?.data?.brand?.banners?.portrait?.url || getPlaceHolder();
  };

  const [slickSetting, setSlickSettings] = useState({
    dots: brands?.length > per_row?.value,
    arrows: brands?.length > per_row?.value,
    nextArrow: ({ currentSlide, slideCount, ...props }) => (
      <SliderRightIcon {...props} />
    ),
    prevArrow: ({ currentSlide, slideCount, ...props }) => (
      <SliderLeftIcon {...props} />
    ),
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
    padding: `16px 0 16px`,
  };

  const getPlaceHolder = () => {
    return placeholderImage;
  };

  const logoPlaceholderSrc = () => {
    return placeholderImage;
  };

  return (
    <div style={dynamicStyles}>
      <div>
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
                      alt={card?.data?.brand?.name || ""}
                      aspectRatio={logoOnly?.value ? "1" : "0.8"}
                      mobileAspectRatio={logoOnly?.value ? "1" : "0.8"}
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
                                  : logoPlaceholderSrc()
                              }
                              alt={card?.data?.brand?.name || ""}
                              aspectRatio="1"
                              mobileAspectRatio="1"
                              sources={[
                                { breakpoint: { min: 769 }, width: 60 },
                                { breakpoint: { max: 768 }, width: 60 },
                                { breakpoint: { max: 480 }, width: 60 },
                              ]}
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
                                          : logoPlaceholderSrc()
                                      }
                                      aspectRatio={1}
                                      mobileAspectRatio={1}
                                      sources={[
                                        { breakpoint: { min: 769 }, width: 60 },
                                        { breakpoint: { max: 768 }, width: 60 },
                                        { breakpoint: { max: 480 }, width: 60 },
                                      ]}
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
                                          : logoPlaceholderSrc()
                                      }
                                      aspectRatio={1}
                                      mobileAspectRatio={1}
                                      sources={[
                                        { breakpoint: { min: 769 }, width: 60 },
                                        { breakpoint: { max: 768 }, width: 60 },
                                        { breakpoint: { max: 480 }, width: 60 },
                                      ]}
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
                    src={getPlaceHolder()}
                    aspectRatio={logoOnly?.value ? 1 : 0.8}
                    mobileAspectRatio={logoOnly?.value ? 1 : 0.8}
                    sources={getImgSrcSet()}
                  />

                  {!logoOnly?.value && (
                    <div className={styles["brand-info"]}>
                      <div className={styles["brand-logo"]}>
                        <FyImage
                          src={logoPlaceholderSrc()}
                          aspectRatio={1}
                          mobileAspectRatio={1}
                          sources={[
                            { breakpoint: { min: 769 }, width: 60 },
                            { breakpoint: { max: 768 }, width: 60 },
                            { breakpoint: { max: 480 }, width: 60 },
                          ]}
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
      </div>
    </div>
  );
}

export const settings = {
  label: "Brands Listing",
  props: [
    {
      type: "range",
      id: "per_row",
      label: "Display brands per row (desktop)",
      min: "3",
      max: "5",
      step: "1",
      info: "It'll not work for mobile layout",
      default: "4",
    },
    {
      type: "checkbox",
      id: "logoOnly",
      default: false,
      label: "Logo Only",
      info: "Show Logo of brands",
    },
    {
      id: "layout_mobile",
      type: "select",
      options: [
        {
          value: "stacked",
          text: "Stack",
        },
        {
          value: "horizontal",
          text: "Horizontal",
        },
      ],
      default: "stacked",
      label: "Mobile Layout",
      info: "Alignment of content",
    },
    {
      id: "layout_desktop",
      type: "select",
      options: [
        {
          value: "grid",
          text: "Stack",
        },
        {
          value: "horizontal",
          text: "Horizontal",
        },
      ],
      default: "grid",
      label: "Desktop Layout",
      info: "Alignment of content",
    },
    {
      id: "alignment",
      type: "select",
      options: [
        {
          value: "left",
          text: "Left",
        },
        {
          value: "right",
          text: "Right",
        },
        {
          value: "center",
          text: "Center",
        },
      ],
      default: "center",
      label: "Align brands",
      info: "Align brand cards to the left, right or centre of the page in desktop",
    },
    {
      type: "color",
      id: "img_container_bg",
      category: "Image Container",
      default: "#00000000",
      label: "Container Background Color",
      info: "This color will be used as the container background color of the Product/Collection/Category/Brand images wherever applicable",
    },
    {
      type: "checkbox",
      id: "img_fill",
      category: "Image Container",
      default: true,
      label: "Fit image to the container",
      info: "If the image aspect ratio is different from the container, the image will be clipped to fit the container. The aspect ratio of the image will be maintained",
    },
    {
      type: "text",
      id: "heading",
      default: "Our Top Brands",
      label: "Heading",
      info: "Heading text of the section",
    },
    {
      type: "textarea",
      id: "description",
      default: "All is unique no matter how you put it",
      label: "Description",
      info: "Description text of the section",
    },
    {
      type: "text",
      id: "button_text",
      default: "VIEW ALL",
      label: "Button Text",
    },
  ],
  blocks: [
    {
      type: "category",
      name: "Brand Item",
      props: [
        {
          type: "brand",
          id: "brand",
          label: "Select Brand",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "Brand Item",
      },
      {
        name: "Brand Item",
      },
      {
        name: "Brand Item",
      },
      {
        name: "Brand Item",
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
