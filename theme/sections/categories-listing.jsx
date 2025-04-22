import React, { useEffect, useState, useMemo } from "react";
import { FDKLink } from "fdk-core/components";
import { convertActionToUrl } from "@gofynd/fdk-client-javascript/sdk/common/Utility";
import Slider from "react-slick";
import { useFPI, useGlobalStore } from "fdk-core/utils";
import styles from "../styles/sections/category-listing.less";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";
import useCategories from "../page-layouts/categories/useCategories";
import placeholderImage from "../assets/images/placeholder/categories-listing.png";
import CategoriesCard from "../components/categories-card/categories-card";
import { CATEGORIES_LISTING } from "../queries/categoryQuery";
import { useWindowWidth } from "../helper/hooks";

export function Component({ props, blocks, preset, globalConfig }) {
  const fpi = useFPI();
  const {
    autoplay,
    play_slides,
    title,
    cta_text,
    item_count,
    mobile_layout,
    desktop_layout,
    img_container_bg,
    button_text,
  } = props;

  const customValue = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const { getCategoriesByDepartment } = useCategories(fpi);

  const departments = useMemo(() => {
    if (!blocks) {
      return [];
    }
    return [
      ...blocks.reduce((acc, m) => {
        const val = m?.props?.department?.value;
        if (val) {
          acc.add(val);
        }
        return acc;
      }, new Set()),
    ];
  }, [blocks]);

  const categories = useMemo(() => {
    return customValue[`categories-listing-${departments?.join("__")}`] || [];
  }, [departments, customValue]);

  const itemCount = Number(item_count?.value ?? 4);
  const windowWidth = useWindowWidth();

  const getImgSrcSet = useMemo(() => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 1728 }, width: Math.round(3564 / itemCount) },
      { breakpoint: { min: 1512 }, width: Math.round(3132 / itemCount) },
      { breakpoint: { min: 1296 }, width: Math.round(2700 / itemCount) },
      { breakpoint: { min: 1080 }, width: Math.round(2250 / itemCount) },
      { breakpoint: { min: 900 }, width: Math.round(1890 / itemCount) },
      { breakpoint: { min: 720 }, width: Math.round(1530 / 3) },
      { breakpoint: { min: 540 }, width: Math.round(1170 / 3) },
      { breakpoint: { min: 360 }, width: Math.round(810) },
      { breakpoint: { min: 180 }, width: Math.round(450) },
    ];
  }, [globalConfig?.img_hd, itemCount]);

  function getWidthByCount() {
    if (windowWidth <= 768) {
      return Math.min(categories?.length, 3);
    }
    return Math.min(categories?.length, itemCount);
  }

  const imagesForStackedView = useMemo(() => {
    if (windowWidth <= 480) {
      return categories.slice(0, 8);
    }
    if (windowWidth <= 768) {
      return categories.slice(0, 9);
    }
    return categories.slice(0, itemCount * 2);
  }, [categories, itemCount, windowWidth]);

  const imagesForScrollView = useMemo(() => {
    if (windowWidth <= 480) {
      return categories;
    }
    if (windowWidth <= 768) {
      return categories.slice(0, 12);
    }
    return categories.slice(0, itemCount * 4);
  }, [categories, itemCount, windowWidth]);

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

  const config = useMemo(() => {
    return {
      arrows: imagesForScrollView?.length > itemCount,
      dots: imagesForScrollView?.length > itemCount,
      speed: 500,
      slidesToShow: itemCount,
      slidesToScroll: itemCount,
      swipeToSlide: true,
      infinite: imagesForScrollView?.length > itemCount,
      autoplay: autoplay?.value,
      autoplaySpeed: (play_slides?.value ?? 3) * 1000,
      cssEase: "linear",
      nextArrow: <SliderRightIcon />,
      prevArrow: <SliderLeftIcon />,
      responsive: [
        {
          breakpoint: 780,
          settings: {
            arrows: false,
            infinite: imagesForScrollView?.length > 3,
            slidesToShow: 3,
            slidesToScroll: 3,
          },
        },
      ],
    };
  }, [
    itemCount,
    autoplay?.value,
    play_slides?.value,
    imagesForScrollView?.length,
  ]);

  const configMobile = useMemo(
    () => ({
      arrows: false,
      dots: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipeToSlide: true,
      infinite: imagesForScrollView?.length > 1,
      autoplay: autoplay?.value,
      autoplaySpeed: (play_slides?.value ?? 3) * 1000,
      cssEase: "linear",
      nextArrow: <SliderRightIcon />,
      prevArrow: <SliderLeftIcon />,
      centerMode: imagesForScrollView?.length > 1,
      centerPadding: "25px",
    }),
    [
      itemCount,
      autoplay?.value,
      play_slides?.value,
      imagesForScrollView?.length,
    ]
  );

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
    if (categories?.length === 0) {
      fetchAllCategories();
    }
  }, [departments]);

  return (
    <section
      style={{
        padding: `16px 0`,
        "--bg-color": `${img_container_bg?.value || "#00000000"}`,
      }}
    >
      {(!!title?.value || !!cta_text?.value) && (
        <div className={styles.titleBlock}>
          {!!title?.value && <h2 className={`fontHeader`}>{title?.value}</h2>}
          {!!cta_text?.value && <p className={`b2`}>{cta_text?.value}</p>}
        </div>
      )}
      {!!categories?.length > 0 && showScrollView() && (
        <div
          className={`${styles.categorySlider} ${imagesForScrollView?.length === 1 ? styles.singleItem : ""}`}
          style={{
            "--slick-dots": `${Math.ceil(imagesForScrollView?.length / itemCount) * 22 + 10}px`,
          }}
        >
          <Slider
            className={`
                  ${
                    imagesForScrollView?.length <= itemCount ? "no-nav" : ""
                  } ${styles.hideOnMobile}`}
            {...config}
            initialSlide={0}
          >
            {imagesForScrollView?.map((category, index) => (
              <CategoriesItem
                key={`${category.name}_${index}`}
                className={styles.sliderItem}
                props={props}
                category={category}
                srcset={getImgSrcSet}
                defer={index > itemCount}
              />
            ))}
          </Slider>
          <Slider
            className={`
                  ${
                    imagesForScrollView?.length <= itemCount ? "no-nav" : ""
                  } ${styles.hideOnDesktop}`}
            {...configMobile}
            initialSlide={0}
          >
            {imagesForScrollView?.map((category, index) => (
              <CategoriesItem
                key={`${category.name}_${index}`}
                className={styles.sliderItem}
                props={props}
                category={category}
                srcset={getImgSrcSet}
                defer={index > 2}
              />
            ))}
          </Slider>
        </div>
      )}
      {!!categories?.length && showStackedView() && (
        <div
          className={`${styles.categoryGrid} ${
            imagesForStackedView.length === 1 && styles.singleItem
          }`}
          style={{
            "--per_row": itemCount,
            "--brand-item": getWidthByCount() || 1,
          }}
        >
          {imagesForStackedView.map((category, index) => (
            <CategoriesItem
              key={`${category.name}_${index}`}
              className={styles.gridItem}
              props={props}
              category={category}
              srcset={getImgSrcSet}
              defer={index > itemCount}
            />
          ))}
        </div>
      )}
      {!departments?.length && (
        <div
          className={`${styles.categoryGrid} `}
          style={{
            "--per_row": itemCount,
            "--brand-item": getWidthByCount() || 1,
          }}
        >
          {preset?.blocks?.map((_, index) => (
            <CategoriesItem
              key={index}
              className={styles.gridItem}
              props={props}
              category={{ name: "Category" }}
              srcset={getImgSrcSet}
            />
          ))}
        </div>
      )}
      {button_text?.value && !!preset?.blocks?.length && (
        <div
          className={`${styles["flex-justify-center"]} ${styles["gap-above-button"]}`}
        >
          <FDKLink
            to="/categories/"
            className={`btn-secondary ${styles.sectionButton}`}
          >
            {button_text?.value}
          </FDKLink>
        </div>
      )}
    </section>
  );
}

const CategoriesItem = ({
  className = "",
  props,
  category,
  srcset,
  defer = false,
}) => {
  const {
    img_fill,
    img_container_bg,
    show_category_name,
    category_name_position,
    category_name_placement,
    category_name_text_alignment,
  } = props;
  return (
    <div className={className}>
      <CategoriesCard
        config={{
          category_name_placement: category_name_placement?.value,
          category_name_position: category_name_position?.value,
          category_name_text_alignment: category_name_text_alignment?.value,
          show_category_name: show_category_name?.value,
          img_container_bg: img_container_bg?.value,
          img_fill: img_fill?.value,
        }}
        url={convertActionToUrl(category?.action)}
        category={category}
        img={{
          src: category?.banners?.portrait?.url || placeholderImage,
          srcSet: srcset,
        }}
        differ={defer}
      />
    </div>
  );
};

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
