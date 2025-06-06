import React, { useEffect, useMemo } from "react";
import { FDKLink } from "fdk-core/components";
import { convertActionToUrl } from "@gofynd/fdk-client-javascript/sdk/common/Utility";
import Slider from "react-slick";
import { useFPI, useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import styles from "../styles/sections/category-listing.less";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";
import useCategories from "../page-layouts/categories/useCategories";
import placeholderImage from "../assets/images/placeholder/categories-listing.png";
import CategoriesCard from "../components/categories-card/categories-card";
import { useParams } from "react-router-dom";
import { CATEGORIES_LISTING } from "../queries/categoryQuery";
import { useWindowWidth } from "../helper/hooks";

// check for FDKLink here
export function Component({ props, blocks, preset, globalConfig }) {
  const { locale } = useParams();
  const { t } = useGlobalTranslation("translation");
  const fpi = useFPI();
  const {
    autoplay,
    play_slides,
    title,
    cta_text,
    item_count,
    item_count_mobile,
    mobile_layout,
    desktop_layout,
    img_container_bg,
    button_text,
    padding_top,
    padding_bottom,
  } = props;

  const customValue = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const { getCategoriesByDepartment } = useCategories(fpi);


const sortCategoriesByPriority = (categoriesList) => {
  if (!categoriesList) return [];
  return [...categoriesList]
    .sort((a, b) => (a?.priority ?? Infinity) - (b?.priority ?? Infinity))
    .map((category) => ({
      ...category,
      childs: sortCategoriesByPriority(category?.childs),
    }));
};

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
  const itemCountMobile = Number(item_count_mobile?.value ?? 1);
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
      { breakpoint: { min: 360 }, width: Math.round(810 / itemCountMobile) },
      { breakpoint: { min: 180 }, width: Math.round(450 / itemCountMobile) },
    ];
  }, [globalConfig?.img_hd, itemCount, itemCountMobile]);

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
      slidesToShow: itemCountMobile,
      slidesToScroll: 1,
      swipeToSlide: true,
      infinite: imagesForScrollView?.length > itemCountMobile,
      autoplay: autoplay?.value,
      autoplaySpeed: (play_slides?.value ?? 3) * 1000,
      cssEase: "linear",
      nextArrow: <SliderRightIcon />,
      prevArrow: <SliderLeftIcon />,
      centerMode: imagesForScrollView?.length > itemCountMobile,
      centerPadding: "25px",
    }),
    [
      itemCountMobile,
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
        sortCategoriesByPriority(accumulatedCategories)
      );
    };
    if (categories?.length === 0) {
      fetchAllCategories();
    }
  }, [departments]);

 const sortedCategories = categories;

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 16}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
    "--bg-color": `${img_container_bg?.value || "#00000000"}`,
  };

  return (
    <section style={dynamicStyles}>
      {(!!title?.value || !!cta_text?.value) && (
        <div className={`fx-title-block ${styles.titleBlock}`}>
          {!!title?.value && (
            <h2 className={`fx-title fontHeader`}>{title?.value}</h2>
          )}
          {!!cta_text?.value && (
            <p className={`fx-description b2`}>{cta_text?.value}</p>
          )}
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
            className={`${styles.hideOnMobile}`}
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
            className={`${styles.hideOnDesktop}`}
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
            "--per-row-mobile": itemCountMobile,
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
            className={`fx-button btn-secondary ${styles.sectionButton}`}
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
    <div className={`fx-category-card ${className}`}>
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
  label: "t:resource.sections.categories_listing.categories_listing",
  props: [
    {
      type: "checkbox",
      id: "autoplay",
      default: false,
      label: "t:resource.common.auto_play_slides",
    },
    {
      type: "checkbox",
      id: "show_category_name",
      default: true,
      label: "t:resource.common.show_category_name",
    },
    {
      type: "select",
      id: "category_name_placement",
      label: "t:resource.sections.categories_listing.category_name_placement",
      default: "inside",
      info: "t:resource.common.category_name_placement_info",
      options: [
        {
          value: "inside",
          text: "t:resource.sections.categories_listing.inside_the_image",
        },
        {
          value: "outside",
          text: "t:resource.sections.categories_listing.outside_the_image",
        },
      ],
    },
    {
      id: "category_name_position",
      type: "select",
      options: [
        {
          value: "top",
          text: "t:resource.sections.categories_listing.top",
        },
        {
          value: "center",
          text: "t:resource.common.center",
        },
        {
          value: "bottom",
          text: "t:resource.sections.categories_listing.bottom",
        },
      ],
      default: "bottom",
      label: "t:resource.sections.categories_listing.category_name_position",
      info: "t:resource.sections.categories_listing.category_name_alignment",
    },
    {
      id: "category_name_text_alignment",
      type: "select",
      options: [
        {
          value: "text-left",
          text: "t:resource.common.left",
        },
        {
          value: "text-center",
          text: "t:resource.common.center",
        },
        {
          value: "text-right",
          text: "t:resource.common.right",
        },
      ],
      default: "text-center",
      label: "t:resource.sections.categories_listing.category_name_text_alignment",
      info: "t:resource.sections.categories_listing.align_category_name",
    },
    {
      type: "range",
      id: "play_slides",
      min: 1,
      max: 10,
      step: 1,
      unit: "sec",
      label: "t:resource.common.change_slides_every",
      default: 3,
    },
    {
      type: "range",
      id: "item_count",
      min: 3,
      max: 5,
      step: 1,
      unit: "",
      label: "t:resource.sections.categories_listing.items_per_row_desktop",
      default: 4,
      info: "t:resource.sections.categories_listing.max_items_per_row_horizontal",
    },
    {
      type: "range",
      id: "item_count_mobile",
      min: 1,
      max: 2,
      step: 1,
      unit: "",
      label: "t:resource.sections.categories.item_count_mobile",
      default: 1,
      info: "t:resource.sections.categories.item_count_mobile_info",
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
      id: "mobile_layout",
      type: "select",
      options: [
        {
          value: "grid",
          text: "t:resource.common.stack",
        },
        {
          value: "horizontal",
          text: "t:resource.common.horizontal_scroll",
        },
      ],
      default: "grid",
      label: "t:resource.common.mobile_layout",
      info: "t:resource.common.alignment_of_content",
    },
    {
      id: "desktop_layout",
      type: "select",
      options: [
        {
          value: "grid",
          text: "t:resource.common.stack",
        },
        {
          value: "horizontal",
          text: "t:resource.common.horizontal_scroll",
        },
      ],
      default: "horizontal",
      label: "t:resource.sections.categories_listing.desktop_layout",
      info: "t:resource.common.alignment_of_content",
    },
    {
      type: "text",
      id: "title",
      default: "t:resource.default_values.a_true_style",
      label: "t:resource.common.heading",
    },
    {
      type: "text",
      id: "cta_text",
      default: "t:resource.default_values.cta_text",
      label: "t:resource.common.description",
    },
    {
      type: "text",
      id: "button_text",
      default: "",
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
      name: "t:resource.sections.categories_listing.category_item",
      type: "category",
      props: [
        {
          type: "department",
          id: "department",
          label: "t:resource.sections.categories_listing.select_department",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "t:resource.sections.categories_listing.category_item",
        type: "category",
        props: [
          {
            type: "department",
            id: "department",
            label: "t:resource.sections.categories_listing.select_department",
          },
        ],
      },
      {
        name: "t:resource.sections.categories_listing.category_item",
        type: "category",
        props: [
          {
            type: "department",
            id: "department",
            label: "t:resource.sections.categories_listing.select_department",
          },
        ],
      },
      {
        name: "t:resource.sections.categories_listing.category_item",
        type: "category",
        props: [
          {
            type: "department",
            id: "department",
            label: "t:resource.sections.categories_listing.select_department",
          },
        ],
      },
      {
        name: "t:resource.sections.categories_listing.category_item",
        type: "category",
        props: [
          {
            type: "department",
            id: "department",
            label: "t:resource.sections.categories_listing.select_department",
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
   const sortedCategories = sortCategoriesByPriority(accumulatedCategories);
    fpi.custom.setValue(
      `categories-listing-${departments?.join("__")}`,
      sortedCategories
    );
    return sortedCategories;
  } catch (err) {
    fpi.custom.setValue("error-section", err);
  }
};

export default Component;
