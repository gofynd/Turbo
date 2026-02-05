import React, { useMemo } from "react";
import { useFPI } from "fdk-core/utils";
import { useParams } from "react-router-dom";
import { PLPShimmer } from "../components/core/skeletons";
import ProductListing from "@gofynd/theme-template/pages/product-listing/product-listing";
import "@gofynd/theme-template/pages/product-listing/index.css";
import useCollectionListing from "../page-layouts/collection-listing/useCollectionListing";
import { getHelmet } from "../providers/global-provider";
import { isRunningOnClient, sanitizeHTMLTag } from "../helper/utils";
import {
  COLLECTION_DETAILS,
  COLLECTION_WITH_ITEMS,
} from "../queries/collectionsQuery";
import useSeoMeta from "../helper/hooks/useSeoMeta";

export function Component({ props = {}, blocks = [], globalConfig = {} }) {
  const fpi = useFPI();
  const isClient = typeof window !== "undefined";
  const params = isClient ? useParams() : null;
  const slug = props?.collection?.value // Don't replace with double ?? operator <----
    ? props?.collection?.value
    : params?.slug;
  const listingProps = useCollectionListing({ fpi, slug, props });

  const { seo } = listingProps;
  const {
    brandName,
    canonicalUrl,
    pageUrl,
    description: seoDescription,
    socialImage,
  } = useSeoMeta({
    fpi,
    seo,
    fallbackImage: props?.desktop_banner?.value || props?.mobile_banner?.value,
  });

  const title = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seo?.title || listingProps?.title || "Collection"
    );
    if (raw && brandName) return `${raw} | ${brandName}`;
    return raw || brandName || "";
  }, [seo?.title, listingProps?.title, brandName]);

  const description = useMemo(() => {
    const raw = sanitizeHTMLTag(
      seo?.description || listingProps?.description || ""
    );
    const normalized = raw.replace(/\s+/g, " ").trim();
    return normalized || seoDescription;
  }, [seo?.description, listingProps?.description, seoDescription]);

  if (listingProps?.isPageLoading && isRunningOnClient()) {
    return (
      <PLPShimmer
        gridDesktop={props?.grid_desktop?.value || 4}
        gridTablet={props?.grid_tablet?.value || 3}
        gridMobile={props?.grid_mob?.value || 1}
        showFilters={true}
        showSortBy={true}
        showPagination={props?.loading_options?.value === "pagination"}
        productCount={props?.page_size?.value || 12}
      />
    );
  }

  return (
    <>
      {getHelmet({
        title,
        description,
        image: socialImage,
        canonicalUrl,
        url: pageUrl,
        siteName: brandName,
        ogType: "website",
      })}
      <div className="margin0auto basePageContainer">
        <ProductListing {...listingProps} />
      </div>
    </>
  );
}

export const settings = {
  label: "t:resource.sections.collections_listing.collection_product_grid",
  props: [
    {
      type: "collection",
      id: "collection",
      label: "t:resource.sections.collections_listing.select_collection",
      info: "t:resource.sections.collections_listing.select_collection_info",
    },
    {
      type: "image_picker",
      id: "desktop_banner",
      label: "t:resource.sections.products_listing.desktop_banner_image",
      info: "t:resource.sections.products_listing.desktop_banner_info",
      default: "",
    },
    {
      type: "image_picker",
      id: "mobile_banner",
      label: "t:resource.sections.products_listing.mobile_banner_image",
      info: "t:resource.sections.products_listing.mobile_banner_info",
      default: "",
    },
    {
      type: "url",
      id: "button_link",
      default: "",
      info: "t:resource.sections.collections_listing.button_link_info",
      label: "t:resource.common.redirect_link",
    },
    {
      type: "checkbox",
      id: "product_number",
      label: "t:resource.sections.collections_listing.product_number",
      info: "t:resource.sections.collections_listing.product_number_info",
      default: true,
    },
    {
      id: "loading_options",
      type: "select",
      options: [
        {
          value: "view_more",
          text: "t:resource.common.view_more",
        },
        {
          value: "infinite",
          text: "t:resource.common.infinite_loading",
        },
        {
          value: "pagination",
          text: "t:resource.common.pagination",
        },
      ],
      info: "t:resource.sections.collections_listing.loading_options_info",
      default: "pagination",
      label: "t:resource.common.loading_options",
    },
    {
      id: "page_size",
      type: "select",
      options: [
        {
          value: 12,
          text: "12",
        },
        {
          value: 24,
          text: "24",
        },
        {
          value: 36,
          text: "36",
        },
        {
          value: 48,
          text: "48",
        },
        {
          value: 60,
          text: "60",
        },
      ],
      default: 12,
      info: "",
      label: "t:resource.sections.products_listing.products_per_page",
    },
    {
      type: "checkbox",
      id: "back_top",
      label: "t:resource.common.show_back_to_top",
      default: true,
    },
    {
      type: "checkbox",
      id: "in_new_tab",
      label: "t:resource.common.open_product_in_new_tab",
      default: false,
      info: "t:resource.common.open_product_in_new_tab_desktop",
    },
    {
      type: "checkbox",
      id: "hide_brand",
      label: "t:resource.common.hide_brand_name",
      default: false,
      info: "t:resource.common.hide_brand_name_info",
    },
    {
      id: "grid_desktop",
      type: "select",
      options: [
        {
          value: "4",
          text: "t:resource.common.four_cards",
        },
        {
          value: "2",
          text: "t:resource.common.two_cards",
        },
      ],
      default: "4",
      label: "t:resource.common.default_grid_layout_desktop",
    },
    {
      id: "grid_tablet",
      type: "select",
      options: [
        {
          value: "3",
          text: "t:resource.common.three_cards",
        },
        {
          value: "2",
          text: "t:resource.common.two_cards",
        },
      ],
      default: "3",
      label: "t:resource.common.default_grid_layout_tablet",
    },
    {
      id: "grid_mob",
      type: "select",
      options: [
        {
          value: "2",
          text: "t:resource.common.two_cards",
        },
        {
          value: "1",
          text: "t:resource.common.one_card",
        },
      ],
      default: "1",
      label: "t:resource.common.default_grid_layout_mobile",
    },
    {
      id: "img_resize",
      label:
        "t:resource.sections.products_listing.image_size_for_tablet_desktop",
      type: "select",
      options: [
        {
          value: "300",
          text: "300px",
        },
        {
          value: "500",
          text: "500px",
        },
        {
          value: "700",
          text: "700px",
        },
        {
          value: "900",
          text: "900px",
        },
        {
          value: "1100",
          text: "1100px",
        },
        {
          value: "1300",
          text: "1300px",
        },
      ],
      default: "300",
    },
    {
      id: "img_resize_mobile",
      label: "t:resource.sections.products_listing.image_size_for_mobile",
      type: "select",
      options: [
        {
          value: "300",
          text: "300px",
        },
        {
          value: "500",
          text: "500px",
        },
        {
          value: "700",
          text: "700px",
        },
        {
          value: "900",
          text: "900px",
        },
      ],
      default: "500",
    },
    {
      type: "checkbox",
      id: "show_add_to_cart",
      label: "t:resource.common.show_add_to_cart",
      info: "t:resource.common.not_applicable_international_websites",
      default: true,
    },
    {
      type: "text",
      id: "card_cta_text",
      label: "t:resource.common.button_text",
      default:
        "t:resource.settings_schema.cart_and_button_configuration.add_to_cart",
    },
    {
      type: "checkbox",
      id: "show_size_guide",
      label: "t:resource.common.show_size_guide",
      default: true,
      info: "t:resource.sections.collections_listing.show_size_guide_info",
    },
    {
      type: "text",
      id: "tax_label",
      label: "t:resource.common.price_tax_label_text",
      default: "t:resource.default_values.tax_label",
      info: "t:resource.sections.collections_listing.show_size_guide_info",
    },
    {
      type: "checkbox",
      id: "mandatory_pincode",
      label: "t:resource.common.show_hide_mandatory_delivery_check",
      info: "t:resource.pages.wishlist.show_hide_mandatory_delivery_check_info",
      default: true,
    },
    {
      type: "checkbox",
      id: "hide_single_size",
      label: "t:resource.common.hide_single_size",
      default: false,
    },
    {
      type: "checkbox",
      id: "preselect_size",
      label: "t:resource.common.preselect_size",
      info: "t:resource.common.applicable_for_multiple_size_products",
      default: true,
    },
    {
      type: "radio",
      id: "size_selection_style",
      label: "t:resource.common.size_selection_style",
      default: "dropdown",
      options: [
        {
          value: "dropdown",
          text: "t:resource.common.dropdown_style",
        },
        {
          value: "block",
          text: "t:resource.common.block_style",
        },
      ],
    },
  ],
};

Component.serverFetch = async ({ fpi, router, props }) => {
  let filterQuery = "";
  let sortQuery = "";
  let pageNo = null;
  const pageSize =
    props?.loading_options?.value === "infinite"
      ? 12
      : (props?.page_size?.value ?? 12);
  const fpiState = fpi.store.getState();
  const globalConfig =
    fpiState?.theme?.theme?.config?.list?.[0]?.global_config?.custom?.props ||
    {};
  const isAlgoliaEnabled = globalConfig?.algolia_enabled || false;

  // Parse filter & sort
  Object.keys(router.filterQuery || {})?.forEach((key) => {
    if (key === "page_no") {
      pageNo = parseInt(router.filterQuery[key], 10);
    } else if (key === "sort_on") {
      sortQuery = router.filterQuery[key];
    } else if (typeof router.filterQuery[key] === "string") {
      filterQuery = filterQuery
        ? `${filterQuery}:::${key}:${router.filterQuery[key]}`
        : `${key}:${router.filterQuery[key]}`;
    } else {
      router.filterQuery[key]?.forEach((item) => {
        filterQuery = filterQuery
          ? `${filterQuery}:::${key}:${item}`
          : `${key}:${item}`;
      });
    }
  });

  // Algolia filter formatting
  if (isAlgoliaEnabled) {
    const filterParams = [];
    const skipKeys = new Set(["sort_on", "page_no"]);
    for (const [key, value] of Object.entries(router?.filterQuery || {})) {
      if (skipKeys.has(key)) continue;
      const decodedValue = Array.isArray(value)
        ? value.map((v) => decodeURIComponent(v)).join("||")
        : decodeURIComponent(value);
      const existingParam = filterParams.find((param) =>
        param.startsWith(`${key}:`)
      );
      if (existingParam) {
        const updatedParam = `${existingParam}||${decodedValue}`;
        filterParams[filterParams.indexOf(existingParam)] = updatedParam;
      } else {
        filterParams.push(`${key}:${decodedValue}`);
      }
    }
    filterQuery = filterParams.join(":::");
  }
  // Don't replace with double ?? operator below -->
  const payload = {
    slug: props?.collection?.value
      ? props?.collection?.value
      : router?.params?.slug,
    search: filterQuery || undefined,
    sortOn: sortQuery || undefined,
    first: pageSize,
    pageType: "number",
  };

  if (pageNo) payload.pageNo = pageNo;

  // Fetch data for SSR
  const getCollectionWithItems = async () => {
    if (isAlgoliaEnabled) {
      const BASE_URL = `https://${fpiState?.custom?.appHostName}/ext/search/application/api/v1.0/collections/${payload?.slug}/items`;

      const url = new URL(BASE_URL);
      url.searchParams.append(
        "page_id",
        payload?.pageNo === 1 || !payload?.pageNo ? "*" : payload?.pageNo - 1
      );
      url.searchParams.append("page_size", "12");

      if (payload?.sortOn) {
        url.searchParams.append("sort_on", payload?.sortOn);
      }
      if (filterQuery) {
        url.searchParams.append("f", filterQuery);
      }

      fpi
        .executeGQL(COLLECTION_DETAILS, { slug: payload?.slug })
        .then((res) => {
          fpi.custom.setValue("customCollection", res?.data?.collection);
        });

      return fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const productDataNormalization = data.items?.map((item) => ({
            ...item,
            media: item.medias,
          }));

          const productList = {
            filters: data?.filters,
            items: productDataNormalization,
            page: {
              ...data.page,
              current: payload?.pageNo || 1,
            },
            sortOn: data?.sort_on,
          };

          fpi.custom.setValue("customCollectionList", productList);
          fpi.custom.setValue("isCollectionsSsrFetched", true);
        });
    } else {
      return fpi
        .executeGQL(COLLECTION_WITH_ITEMS, payload)
        .then((res) => {
          const { collection, collectionItems } = res?.data || {};

          if (!collection || !collectionItems) {
            console.warn(
              "⚠️ SSR warning: collection or items missing",
              res?.data
            );
          }

          fpi.custom.setValue("customCollection", collection);
          fpi.custom.setValue("customCollectionList", collectionItems);
          fpi.custom.setValue("isCollectionsSsrFetched", true);
        })
        .catch((err) => {
          console.error("❌ SSR GraphQL error:", err);
        });
    }
  };

  return Promise.all([getCollectionWithItems()]);
};

export default Component;
