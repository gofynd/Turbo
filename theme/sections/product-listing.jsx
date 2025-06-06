import React from "react";
import { useFPI } from "fdk-core/utils";
import Shimmer from "../components/shimmer/shimmer";
import ProductListing from "@gofynd/theme-template/pages/product-listing/product-listing";
import "@gofynd/theme-template/pages/product-listing/index.css";
import useProductListing from "../page-layouts/plp/useProductListing";
import { isRunningOnClient } from "../helper/utils";
import { PLP_PRODUCTS, BRAND_META, CATEGORY_META } from "../queries/plpQuery";

export function Component({ props = {}, blocks = [], globalConfig = {} }) {
  const fpi = useFPI();

  const listingProps = useProductListing({ fpi, props });

  if (isRunningOnClient() && listingProps?.isPageLoading) {
    return <Shimmer />;
  }

  return (
    <div className="margin0auto basePageContainer">
      <ProductListing {...listingProps} />
    </div>
  );
}

export const settings = {
  label: "t:resource.sections.products_listing.product_listing",
  props: [
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
      id: "banner_link",
      default: "",
      info: "t:resource.sections.collections_listing.button_link_info",
      label: "t:resource.common.redirect",
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
        text: "t:resource.common.infinite_scroll",
      },
      {
        value: "pagination",
        text: "t:resource.common.pagination",
      },
      ],
      default: "infinite",
      info: "t:resource.sections.collections_listing.loading_options_info",
      label: "t:resource.sections.products_listing.page_loading_options",
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
      label: "t:resource.sections.products_listing.back_top",
      info: "t:resource.sections.brand_landing.back_to_top_info",
      default: true,
    },
    {
      type: "checkbox",
      id: "in_new_tab",
      label: "t:resource.common.open_product_in_new_tab",
      default: true,
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
      default: "2",
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
      id: "description",
      type: "textarea",
      default: "",
      info: "t:resource.sections.products_listing.description_info",
      label: "t:resource.common.description",
    },
    {
      id: "img_resize",
      label: "t:resource.sections.products_listing.image_size_for_tablet_desktop",
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
      label: "Image size for Mobile",
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
      label: "t:resource.pages.wishlist.show_add_to_cart",
      info: "t:resource.common.not_applicable_international_websites",
      default: false,
    },
    {
      type: "text",
      id: "card_cta_text",
      label: "t:resource.common.button_text",
      default: "t:resource.settings_schema.cart_and_button_configuration.add_to_cart",
    },
    {
      type: "checkbox",
      id: "show_size_guide",
      label: "t:resource.common.show_size_guide",
      info: "t:resource.sections.collections_listing.show_size_guide_info",
      default: false,
    },
    {
      type: "text",
      id: "tax_label",
      label: "t:resource.common.price_tax_label_text",
      default: "t:resource.default_values.product_listing_tax_label",
      info: "t:resource.sections.products_listing.tax_label_info",
    },
    {
      type: "checkbox",
      id: "mandatory_pincode",
      label: "t:resource.common.mandatory_delivery_check",
      info: "t:resource.pages.wishlist.mandatory_delivery_check_info",
      default: false,
    },
    {
      type: "checkbox",
      id: "hide_single_size",
      label: "t:resource.common.hide_single_size",
      info: "t:resource.pages.wishlist.hide_single_size_info",
      default: false,
    },
    {
      type: "checkbox",
      id: "preselect_size",
      label: "t:resource.common.preselect_size",
      info: "t:resource.pages.wishlist.preselect_size_info",
      default: false,
    },
    {
      type: "radio",
      id: "size_selection_style",
      label: "t:resource.common.size_selection_style",
      info: "t:resource.sections.products_listing.size_selection_style_info",
      default: "block",
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
  let search = "";
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

  Object.keys(router.filterQuery)?.forEach((key) => {
    if (key === "page_no") {
      pageNo = parseInt(router.filterQuery[key], 10);
    } else if (key === "sort_on") {
      sortQuery = router.filterQuery[key];
    } else if (key === "q") {
      search = router.filterQuery[key];
    } else if (typeof router.filterQuery[key] === "string") {
      if (filterQuery.includes(":")) {
        filterQuery = `${filterQuery}:::${key}:${router.filterQuery[key]}`;
      } else {
        filterQuery = `${key}:${router.filterQuery[key]}`;
      }
    } else {
      router.filterQuery[key]?.forEach((item) => {
        if (filterQuery.includes(":")) {
          filterQuery = `${filterQuery}:::${key}:${item}`;
        } else {
          filterQuery = `${key}:${item}`;
        }
      });
    }

    if (key === "category") {
      const slug = Array.isArray(router.filterQuery[key])
        ? router.filterQuery[key][0]
        : router.filterQuery[key];
      fpi.executeGQL(CATEGORY_META, { slug });
    }
    if (key === "brand") {
      const slug = Array.isArray(router.filterQuery[key])
        ? router.filterQuery[key][0]
        : router.filterQuery[key];
      fpi.executeGQL(BRAND_META, { slug });
    }
  });

  if (isAlgoliaEnabled) {
    const filterParams = [];
    const skipKeys = new Set(["q", "sort_on", "page_no"]);

    for (const [key, value] of Object.entries(router?.filterQuery || {})) {
      if (skipKeys.has(key)) continue;
      // Decode value to handle URL encoding
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

  const payload = {
    filterQuery,
    sortOn: sortQuery,
    search,
    enableFilter: true,
    first: pageSize,
    pageType: "number",
  };
  if (pageNo) payload.pageNo = pageNo;

  if (isAlgoliaEnabled) {
    const BASE_URL = `https://${fpiState?.custom?.appHostName}/ext/algolia/application/api/v1.0/products`;

    const url = new URL(BASE_URL);
    url.searchParams.append(
      "page_id",
      payload?.pageNo === 1 || !payload?.pageNo ? "*" : payload?.pageNo - 1
    );
    url.searchParams.append("page_size", payload?.first);

    if (payload?.sortOn) {
      url.searchParams.append("sort_on", payload?.sortOn);
    }
    if (filterQuery) {
      url.searchParams.append("f", filterQuery);
    }
    if (payload?.search) {
      url.searchParams.append("q", payload?.search);
    }

    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const productDataNormalization = data.items?.map((item) => ({
          ...item,
          media: item.medias,
        }));

        data.page.current = payload?.pageNo || 1;

        const productList = {
          filters: data?.filters,
          items: productDataNormalization,
          page: data?.page,
          sort_on: data?.sort_on,
        };
        fpi.custom.setValue("customProductList", productList);
        fpi.custom.setValue("isPlpSsrFetched", true);
      });
  } else {
    return fpi
      .executeGQL(PLP_PRODUCTS, payload, { skipStoreUpdate: false })
      .then(({ data }) => {
        fpi.custom.setValue("customProductList", data?.products);
        fpi.custom.setValue("isPlpSsrFetched", true);
      });
  }
};

export default Component;
