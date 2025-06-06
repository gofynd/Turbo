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
import { useFPI, useGlobalTranslation } from "fdk-core/utils";

export function Component({ props = {}, globalConfig = {}, blocks = [] }) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");
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
    return <EmptyState title={t("resource.categories.empty_state")} />;
  }

  return (
    <div
      className={`${styles.categories} basePageContainer margin0auto fontBody`}
    >
      <div className={`${styles.categories__breadcrumbs} captionNormal`}>
        <span>
          <FDKLink to="/">{t("resource.common.breadcrumb.home")}</FDKLink>&nbsp; / &nbsp;
        </span>
        <span className={styles.active}>{t("resource.common.breadcrumb.categories")}</span>
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
  label: "t:resource.sections.categories.categories",
  props: [
    {
      type: "text",
      id: "heading",
      default: "",
      info: "t:resource.sections.categories.heading_info",
      label: "t:resource.common.heading",
    },
    {
      type: "textarea",
      id: "description",
      default: "",
      info: "t:resource.sections.categories.description_info",
      label: "t:resource.common.description",
    },
    {
      type: "checkbox",
      id: "back_top",
      label: "t:resource.sections.categories.back_top",
      info: "t:resource.sections.brand_landing.back_to_top_info",
      default: true,
    },
    {
      type: "checkbox",
      id: "show_category_name",
      default: true,
      info: "t:resource.sections.categories.show_category_name_info",
      label: "t:resource.sections.categories.show_category_name",
    },
    {
      type: "select",
      id: "category_name_placement",
      label: "t:resource.sections.categories.category_name_placement",
      default: "inside",
      info: "t:resource.sections.categories.category_name_placement_info",
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
      label: "t:resource.sections.categories.bottom",
      info: "t:resource.sections.categories.bottom_info",
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
      label: "t:resource.sections.categories.category_name_text_alignment",
      info: "t:resource.sections.categories.category_name_text_alignment_info",
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
