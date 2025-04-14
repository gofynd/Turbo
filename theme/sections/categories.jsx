import React, { useEffect, useState } from "react";

import { FDKLink } from "fdk-core/components";
import Loader from "../components/loader/loader";
import styles from "../styles/categories.less";
import CardList from "../components/card-list/card-list";
import useCategories from "../page-layouts/categories/useCategories";
import { detectMobileWidth } from "../helper/utils";
import ScrollToTop from "../components/scroll-to-top/scroll-to-top";
import EmptyState from "../components/empty-state/empty-state";
import { CATEGORIES_LISTING } from "../queries/categoryQuery";
import { useFPI } from "fdk-core/utils";

export function Component({ props = {}, globalConfig = {}, blocks = [] }) {
  const fpi = useFPI();
  const { categories, fetchAllCategories, isLoading } = useCategories(fpi);
  const [isMobile, setIsMobile] = useState(true);

  const {
    heading = "",
    description = "",
    logo_only = false,
    back_top = false,
    category_name_placement = "inside",
    category_name_position = "bottom",
    category_name_text_alignment = "text-center",
    show_category_name = true,
  } = Object.fromEntries(
    Object.entries(props).map(([key, obj]) => [key, obj.value])
  );

  const sortCategoriesByPriority = (categoriesList) => {
    if (!categoriesList) return [];
    return [...categoriesList]
      .sort((a, b) => (a?.priority ?? Infinity) - (b?.priority ?? Infinity))
      .map((category) => ({
        ...category,
        childs: sortCategoriesByPriority(category?.childs),
      }));
  };

  const sortedCategories = sortCategoriesByPriority(categories);

  useEffect(() => {
    if (!categories) {
      fetchAllCategories();
    }
    setIsMobile(detectMobileWidth());
  }, []);

  if (!isLoading && !sortedCategories?.length) {
    return <EmptyState title="No category found" />;
  }

  return (
    <div
      className={`${styles.categories} basePageContainer margin0auto fontBody`}
    >
      <div className={`${styles.categories__breadcrumbs} captionNormal`}>
        <span>
          <FDKLink to="/">Home</FDKLink>&nbsp; / &nbsp;
        </span>
        <span className={styles.active}>Categories</span>
      </div>

      {!isLoading ? (
        <div>
          {heading && (
            <h1 className={`${styles.categories__title} fontHeader`}>
              {heading}
            </h1>
          )}
          {description && (
            <div
              className={`${styles.categories__description} ${isMobile ? styles.b2 : styles.b1}`}
            >
              <p>{description}</p>
            </div>
          )}
          <div className={styles.categories__cards}>
            <CardList
              cardList={sortedCategories}
              cardType="CATEGORIES"
              showOnlyLogo={!!logo_only}
              globalConfig={globalConfig}
              pageConfig={{
                category_name_placement,
                category_name_position,
                category_name_text_alignment,
                show_category_name,
                img_container_bg: globalConfig?.img_container_bg,
                img_fill: globalConfig?.img_fill,
              }}
            />
          </div>
        </div>
      ) : (
        <Loader />
      )}
      {!!back_top && <ScrollToTop />}
    </div>
  );
}

export const settings = {
  label: "Categories",
  props: [
    {
      type: "text",
      id: "heading",
      default: "",
      info: "Set the heading text for the categories page",
      label: "Heading",
    },
    {
      type: "textarea",
      id: "description",
      default: "",
      info: "Add a description for the categories page",
      label: "Description",
    },
    {
      type: "checkbox",
      id: "back_top",
      label: "Back to Top button",
      info: "Enable a 'Back to Top' button to help users quickly return to the top of the page",
      default: true,
    },
    {
      type: "checkbox",
      id: "show_category_name",
      default: true,
      info: "Show the category name on the category cards",
      label: "Show Category Name",
    },
    {
      type: "select",
      id: "category_name_placement",
      label: "Category Name Placement",
      default: "inside",
      info: "Place the category name on the inside or outside the category card",
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
      label: "Category Name Position",
      info: "Display category name at the top, center or bottom of the category card",
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
      label: "Category Name Text Alignment",
      info: "Select the alignment of the category name - left, center or right",
    },
  ],
};

Component.serverFetch = async ({ fpi }) => {
  const response = await fpi.executeGQL(CATEGORIES_LISTING);
  if (!response?.data?.categories?.data) {
    return { categories: [] };
  }

  const sortCategoriesByPriority = (categoriesList) => {
    if (!categoriesList) return [];
    return [...categoriesList]
      .sort((a, b) => (a?.priority ?? Infinity) - (b?.priority ?? Infinity))
      .map((category) => ({
        ...category,
        childs: sortCategoriesByPriority(category?.childs),
      }));
  };

  const sortedCategories = sortCategoriesByPriority(
    response.data.categories.data
  );

  return { categories: sortedCategories };
};

export default Component;
