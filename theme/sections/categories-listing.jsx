import React, { useEffect, useState, useRef, useMemo } from "react";
import { FDKLink } from "fdk-core/components";
import { convertActionToUrl } from "@gofynd/fdk-client-javascript/sdk/common/Utility";
import Slider from "react-slick";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import styles from "../styles/sections/category-listing.less";
import FyImage from "../components/core/fy-image/fy-image";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";
import { isRunningOnClient, throttle } from "../helper/utils";
import useCategories from "../page-layouts/categories/useCategories";
import placeholderImage from "../assets/images/placeholder/categories-listing.png";
import CategoriesCard from "../components/categories-card/categories-card";
import { CATEGORIES_LISTING } from "../queries/categoryQuery";

export function Component({ props, blocks, preset, globalConfig }) {
  const fpi = useFPI();
  const { getCategoriesByDepartment } = useCategories(fpi);

  const departmentsIds = useMemo(() => {
    return blocks?.reduce((acc, m) => {
      if (m?.props?.department?.value) {
        acc.push(m.props.department.value);
      }
      return acc;
    }, []);
  }, [blocks]);
  const departments = [...new Set(departmentsIds)];
  const categoriesListingValue =
    useGlobalStore(fpi?.getters?.CUSTOM_VALUE) ?? {};
  const departmentCategories =
    categoriesListingValue[`categories-listing-${departments?.join("__")}`] ||
    [];
  const getGallery = departmentCategories?.length ? departmentCategories : [];
  const defaultCategories = ["Chair", "Sofa", "Plants & Flowers", "Bags"];

  const {
    autoplay,
    play_slides,
    title,
    cta_text,
    item_count,
    mobile_layout,
    desktop_layout,
    img_fill,
    img_container_bg,
    button_text,
    show_category_name,
    category_name_position,
    category_name_placement,
    category_name_text_alignment,
  } = props;
  const [windowWidth, setWindowWidth] = useState();
  // const [departmentCategories, setDepartmentCategories] = useState([]);
  const [config, setConfig] = useState({
    dots: imagesForScrollView()?.length > item_count?.value,
    speed: 500,
    slidesToShow: Number(item_count?.value),
    slidesToScroll: Number(item_count?.value),
    swipeToSlide: true,
    autoplay: false,
    autoplaySpeed: play_slides?.value ? play_slides?.value * 1000 : 3000,
    cssEase: "linear",
    arrows: imagesForScrollView()?.length > item_count?.value,
    // arrows: getGallery.length > item_count?.value,
    nextArrow: <SliderRightIcon />,
    prevArrow: <SliderLeftIcon />,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 780,
        settings: {
          arrows: false,
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
    ],
  });
  const [configMobile, setConfigMobile] = useState({
    dots: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipeToSlide: true,
    // lazyLoad: true,
    autoplay: false,
    autoplaySpeed: play_slides?.value ? play_slides?.value * 1000 : 3000,
    cssEase: "linear",
    arrows: false,
    // arrows: getGallery.length > item_count?.value,
    nextArrow: <SliderRightIcon />,
    prevArrow: <SliderLeftIcon />,
    adaptiveHeight: true,
    centerMode: getGallery?.length !== 1,
    centerPadding: "25px",
  });

  useEffect(() => {
    const fetchAllCategories = async () => {
      let accumulatedCategories = [];

      for (const department of departments) {
        if (accumulatedCategories.length >= 12) break;
        /* eslint-disable-next-line no-await-in-loop */
        const newCategories = await getCategoriesByDepartment(department);
        accumulatedCategories = [
          ...accumulatedCategories,
          ...newCategories.slice(0, 12 - accumulatedCategories.length),
        ];
      }
      fpi.custom.setValue(
        `categories-listing-${departments?.join("__")}`,
        accumulatedCategories
      );
    };
    if (departmentCategories?.length === 0) {
      fetchAllCategories();
    }
  }, [blocks]);

  useEffect(() => {
    if (autoplay?.value !== config.autoplay) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        autoplay: autoplay?.value,
      }));
      setConfigMobile((prevConfig) => ({
        ...prevConfig,
        autoplay: autoplay?.value,
      }));
    }

    if (item_count?.value !== config.slidesToShow) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        slidesToShow: item_count?.value,
        slidesToScroll: item_count?.value,
      }));
    }

    if (play_slides?.value * 1000 !== config.autoplaySpeed) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        autoplaySpeed: play_slides?.value * 1000,
      }));
      setConfigMobile((prevConfig) => ({
        ...prevConfig,
        autoplaySpeed: play_slides?.value * 1000,
      }));
    }
    if (config.arrows !== imagesForScrollView()?.length > item_count?.value) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        arrows: imagesForScrollView()?.length > item_count?.value,
        dots: imagesForScrollView()?.length > item_count?.value,
      }));
    }
  }, [autoplay, play_slides, item_count, imagesForScrollView()?.length]);

  useEffect(() => {
    const handleResize = throttle(() => {
      setWindowWidth(isRunningOnClient() ? window.innerWidth : 0);
    }, 500);

    if (isRunningOnClient()) {
      window.addEventListener("resize", handleResize);
      handleResize();
    }

    return () => {
      if (isRunningOnClient()) {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  function getDesktopImage(block) {
    return block?.banners?.portrait?.url || placeholderImage;
  }

  function getImgSrcSet() {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 1024 }, width: 450 },
      { breakpoint: { min: 768 }, width: 250 },
      { breakpoint: { min: 481 }, width: 480 },
      { breakpoint: { max: 390 }, width: 390 },
    ];
  }

  function getWidthByCount() {
    if (windowWidth <= 768) {
      return getGallery?.length <= 3 ? getGallery?.length : 3;
    }
    return getGallery?.length < item_count?.value
      ? getGallery?.length
      : item_count?.value;
  }

  function imagesForStackedView() {
    const itemCount = item_count?.value;

    if (!getGallery) return [];

    if (windowWidth <= 480) {
      return getGallery.slice(0, 8);
    }
    if (windowWidth <= 768) {
      return getGallery.slice(0, 9);
    }
    return getGallery.slice(0, itemCount * 2);
  }

  function imagesForScrollView() {
    const itemCount = item_count?.value;

    if (!getGallery) return [];

    if (windowWidth <= 480) {
      return getGallery;
    }
    if (windowWidth <= 768) {
      return getGallery.slice(0, 12);
    }
    return getGallery.slice(0, itemCount * 4);
  }

  function showStackedView() {
    if (windowWidth <= 768) {
      return mobile_layout?.value === "grid";
    }

    return desktop_layout?.value === "grid";
  }
  function showScrollView() {
    if (windowWidth <= 768) {
      return mobile_layout?.value === "horizontal";
    }

    return desktop_layout?.value === "horizontal";
  }

  return (
    <div
      style={{
        padding: `16px 16px 16px`,
        "--bg-color": `${img_container_bg?.value || "#00000000"}`,
      }}
    >
      <div>
        <div className={styles.titleBlock}>
          {(title?.value?.length > 0 || cta_text?.value?.length > 0) && (
            <h2 className={`${styles.sectionHeading} fontHeader`}>
              {title?.value}
            </h2>
          )}
          {cta_text?.value?.length > 0 && (
            <p className={`${styles.description} b2`}>{cta_text?.value}</p>
          )}
        </div>
        {departmentCategories?.length > 0 && showScrollView() && (
          <div
            className={styles.slideWrap}
            style={{
              "--slick-dots": `${Math.ceil(imagesForScrollView()?.length / item_count?.value) * 22 + 10}px`,
            }}
          >
            <Slider
              className={`
                  ${
                    imagesForScrollView()?.length <= item_count?.value
                      ? "no-nav"
                      : ""
                  } ${styles.customSlider}  ${styles.hideOnMobile}`}
              {...config}
              initialSlide={0}
            >
              {imagesForScrollView()?.map((category, index) => (
                <div data-cardtype="'Categories'" key={index}>
                  {getDesktopImage(category).length > 0 && (
                    <div className={styles.sliderView}>
                      <CategoriesCard
                        config={{
                          category_name_placement:
                            category_name_placement?.value,
                          category_name_position: category_name_position?.value,
                          category_name_text_alignment:
                            category_name_text_alignment?.value,
                          show_category_name: show_category_name?.value,
                          img_container_bg: img_container_bg?.value,
                          img_fill: img_fill?.value,
                        }}
                        url={convertActionToUrl(category.action)}
                        category={category}
                        img={{
                          src: getDesktopImage(category) || placeholderImage,
                          srcSet: getImgSrcSet(),
                        }}
                        differ={index <= item_count?.value ? false : true}
                      />
                    </div>
                  )}
                </div>
              ))}
            </Slider>
            <Slider
              className={`
                  ${
                    imagesForScrollView()?.length <= item_count?.value
                      ? "no-nav"
                      : ""
                  } ${styles.customSlider}  ${styles.hideOnDesktop}`}
              {...configMobile}
              initialSlide={0}
            >
              {imagesForScrollView()?.map((category, index) => (
                <div data-cardtype="'Categories'" key={index}>
                  {getDesktopImage(category).length > 0 && (
                    <div className={styles.sliderView}>
                      <CategoriesCard
                        config={{
                          category_name_placement:
                            category_name_placement?.value,
                          category_name_position: category_name_position?.value,
                          category_name_text_alignment:
                            category_name_text_alignment?.value,
                          show_category_name: show_category_name?.value,
                          img_container_bg: img_container_bg?.value,
                          img_fill: img_fill?.value,
                        }}
                        url={convertActionToUrl(category.action)}
                        category={category}
                        img={{
                          src: getDesktopImage(category) || placeholderImage,
                          srcSet: getImgSrcSet(),
                        }}
                        differ={index <= item_count?.value ? false : true}
                      />
                    </div>
                  )}
                </div>
              ))}
            </Slider>
            {button_text?.value && (
              <div
                className={`${styles["flex-justify-center"]} ${styles["gap-above-button"]}`}
              >
                <FDKLink to="/categories/">
                  <button
                    type="button"
                    className={`btn-secondary ${styles["section-button"]} ${styles.fontBody}`}
                  >
                    {button_text?.value}
                  </button>
                </FDKLink>
              </div>
            )}
          </div>
        )}
        {showStackedView() && !!departmentCategories?.length && (
          <div
            className={`${styles.imageGrid} ${
              imagesForStackedView().length === 1 && styles.singleItem
            }`}
            style={{
              "--per_row": item_count?.value,
              "--brand-item": getWidthByCount() || 1,
            }}
          >
            {imagesForStackedView().map((category, index) => (
              <div
                key={index}
                data-cardtype="'Categories'"
                className={styles["pos-relative"]}
              >
                <CategoriesCard
                  config={{
                    category_name_placement: category_name_placement?.value,
                    category_name_position: category_name_position?.value,
                    category_name_text_alignment:
                      category_name_text_alignment?.value,
                    show_category_name: show_category_name?.value,
                    img_container_bg: img_container_bg?.value,
                    img_fill: img_fill?.value,
                  }}
                  category={category}
                  url={convertActionToUrl(category.action)}
                  img={{
                    src: getDesktopImage(category) || placeholderImage,
                    srcSet: getImgSrcSet(),
                  }}
                />
              </div>
            ))}
          </div>
        )}
        {!departmentCategories?.length && (
          <div
            className={`${styles.imageGrid} `}
            style={{
              "--per_row": item_count?.value,
              "--brand-item": getWidthByCount() || 1,
            }}
          >
            {preset?.blocks?.map((category, index) => (
              <div
                key={index}
                data-cardtype="'Categories'"
                className={styles["pos-relative"]}
              >
                <div
                  style={{ "--gap": "24px" }}
                  className={`${styles[category_name_placement?.value]} ${styles[category_name_position?.value]}`}
                >
                  <FyImage
                    backgroundColor={img_container_bg?.value}
                    customClass={`${styles.imageGallery} ${
                      img_fill?.value ? styles.streach : ""
                    }`}
                    src={placeholderImage}
                  />
                  {show_category_name?.value && (
                    <div
                      className={`${styles["categories-name"]} h5 ${styles.fontBody} ${styles.inlineBlock} ${styles[category_name_position?.value]} ${styles[category_name_text_alignment?.value]}`}
                      title={defaultCategories?.[index]}
                    >
                      {defaultCategories?.[index]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {button_text?.value &&
          (showStackedView() || !departmentCategories?.length) && (
            <div
              className={`${styles["flex-justify-center"]} ${styles["gap-above-button"]}`}
            >
              <FDKLink to="/categories/">
                <button
                  type="button"
                  className={`btn-secondary ${styles["section-button"]} ${styles.fontBody}`}
                >
                  {button_text?.value}
                </button>
              </FDKLink>
            </div>
          )}
      </div>
    </div>
  );
}

export const settings = {
  label: "Categories Listing",
  props: [
    {
      type: "checkbox",
      id: "autoplay",
      default: false,
      label: "Auto Play Slides",
    },
    {
      type: "checkbox",
      id: "show_category_name",
      default: true,
      label: "Show category name",
    },
    {
      type: "select",
      id: "category_name_placement",
      label: "Category name placement",
      default: "inside",
      info: "Place the category name inside or outside the image",
      options: [
        {
          value: "inside",
          text: "Inside the image",
        },
        {
          value: "outside",
          text: "Outside the image",
        },
      ],
    },
    {
      id: "category_name_position",
      type: "select",
      options: [
        {
          value: "top",
          text: "Top",
        },
        {
          value: "center",
          text: "Center",
        },
        {
          value: "bottom",
          text: "Bottom",
        },
      ],
      default: "bottom",
      label: "Category name position",
      info: "Display category name at top, bottom or center",
    },
    {
      id: "category_name_text_alignment",
      type: "select",
      options: [
        {
          value: "text-left",
          text: "Left",
        },
        {
          value: "text-center",
          text: "Center",
        },
        {
          value: "text-right",
          text: "Right",
        },
      ],
      default: "text-center",
      label: "Category name text alignment",
      info: "Align category name left, right or center",
    },
    {
      type: "range",
      id: "play_slides",
      min: 1,
      max: 10,
      step: 1,
      unit: "sec",
      label: "Change slides every",
      default: 3,
    },
    {
      type: "range",
      id: "item_count",
      min: 3,
      max: 5,
      step: 1,
      unit: "",
      label: "Items per row(Desktop)",
      default: 4,
      info: "Maximum items allowed per row for Horizontal view, for gallery max 5 are viewable and only 5 blocks are required",
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
      id: "mobile_layout",
      type: "select",
      options: [
        {
          value: "grid",
          text: "Stack",
        },
        {
          value: "horizontal",
          text: "Horizontal scroll ",
        },
      ],
      default: "grid",
      label: "Mobile Layout",
      info: "Alignment of content",
    },
    {
      id: "desktop_layout",
      type: "select",
      options: [
        {
          value: "grid",
          text: "Stack",
        },
        {
          value: "horizontal",
          text: "Horizontal scroll",
        },
      ],
      default: "horizontal",
      label: "Desktop Layout",
      info: "Alignment of content",
    },
    {
      type: "text",
      id: "title",
      default: "A True Style",
      label: "Heading",
    },
    {
      type: "text",
      id: "cta_text",
      default: "Be exclusive, Be Divine, Be yourself",
      label: "Description",
    },
    {
      type: "text",
      id: "button_text",
      default: "",
      label: "Button Text",
    },
  ],
  blocks: [
    {
      name: "Category Item",
      type: "category",
      props: [
        {
          type: "department",
          id: "department",
          label: "Select Department",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "Category Item",
        type: "category",
        props: [
          {
            type: "department",
            id: "department",
            label: "Select Department",
          },
        ],
      },
      {
        name: "Category Item",
        type: "category",
        props: [
          {
            type: "department",
            id: "department",
            label: "Select Department",
          },
        ],
      },
      {
        name: "Category Item",
        type: "category",
        props: [
          {
            type: "department",
            id: "department",
            label: "Select Department",
          },
        ],
      },
      {
        name: "Category Item",
        type: "category",
        props: [
          {
            type: "department",
            id: "department",
            label: "Select Department",
          },
        ],
      },
    ],
  },
};

Component.serverFetch = async ({ fpi, blocks }) => {
  try {
    const getCategoriesByDepartment = async (department) => {
      const res = await fpi.executeGQL(CATEGORIES_LISTING, { department });

      if (res?.data?.categories?.data?.length > 0) {
        const data = res?.data?.categories?.data;
        const categoriesList = data
          .flatMap((item) => item?.items?.map((m) => m.childs))
          .flat()
          .flatMap((i) => i?.childs);

        return categoriesList;
      }
    };

    let accumulatedCategories = [];
    let departments = blocks?.reduce((acc, m) => {
      if (m?.props?.department.value) {
        acc.push(m?.props?.department.value);
      }
      return acc;
    }, []);
    departments = [...new Set(departments)];

    for (const department of departments) {
      if (accumulatedCategories.length >= 12) break;
      /* eslint-disable-next-line no-await-in-loop */
      const newCategories = await getCategoriesByDepartment(department);
      accumulatedCategories = [
        ...accumulatedCategories,
        ...newCategories.slice(0, 12 - accumulatedCategories.length),
      ];
    }
    return fpi.custom.setValue(
      `categories-listing-${departments?.join("__")}`,
      accumulatedCategories
    );
  } catch (err) {
    fpi.custom.setValue("error-section", err);
  }
};

export default Component;
