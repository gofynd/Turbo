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
  label: "Product Listing",
  props: [
    {
      type: "image_picker",
      id: "desktop_banner",
      label: "Desktop Banner Image",
      info: "Upload an image to be displayed as a banner on desktop devices",
      default: "",
    },
    {
      type: "image_picker",
      id: "mobile_banner",
      label: "Mobile Banner Image",
      info: "Upload an image to be displayed as a banner on mobile devices",
      default: "",
    },
    {
      type: "url",
      id: "banner_link",
      default: "",
      info: "Select the destination link where users will be redirected when they click on the banner image",
      label: "Redirect",
    },
    {
      type: "checkbox",
      id: "product_number",
      label: "Show Product Numbers",
      info: "Show the number of products in the listing",
      default: true,
    },
    {
      id: "loading_options",
      type: "select",
      options: [
        {
          value: "view_more",
          text: "View More",
        },
        {
          value: "infinite",
          text: "Infinite Scroll",
        },
        {
          value: "pagination",
          text: "Pagination",
        },
      ],
      default: "infinite",
      info: "Choose how products load on the page based on user interaction. Infinite Scroll continuously loads more products as users scroll. Pagination organises products into separate pages with navigation controls. View More loads additional products only when users click a button",
      label: "Page Loading Options",
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
      label: "Products per Page",
    },
    {
      type: "checkbox",
      id: "back_top",
      label: "Show back to Top button",
      info: "Enable a 'Back to Top' button to help users quickly return to the top of the page",
      default: true,
    },
    {
      type: "checkbox",
      id: "in_new_tab",
      label: "Open Product in New Tab",
      default: false,
      info: "Open Product in New Tab for Desktop",
    },
    {
      type: "checkbox",
      id: "hide_brand",
      label: "Hide Brand Name",
      default: false,
      info: "Check to hide brand name",
    },
    {
      id: "grid_desktop",
      type: "select",
      options: [
        {
          value: "4",
          text: "4 Cards",
        },
        {
          value: "2",
          text: "2 Cards",
        },
      ],
      default: "4",
      label: "Default Grid Layout Desktop",
    },
    {
      id: "grid_tablet",
      type: "select",
      options: [
        {
          value: "3",
          text: "3 Cards",
        },
        {
          value: "2",
          text: "2 Cards",
        },
      ],
      default: "2",
      label: "Default Grid Layout Tablet",
    },
    {
      id: "grid_mob",
      type: "select",
      options: [
        {
          value: "2",
          text: "2 Cards",
        },
        {
          value: "1",
          text: "1 Card",
        },
      ],
      default: "1",
      label: "Default Grid Layout Mobile",
    },
    {
      id: "description",
      type: "textarea",
      default: "",
      info: "Add a description to be displayed at the bottom of the product listing page",
      label: "Description",
    },
    {
      id: "img_resize",
      label: "Image size for Tablet/Desktop",
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
      label: "Show Add to Cart button",
      info: "Not Applicable for International Websites",
      default: false,
    },
    {
      type: "checkbox",
      id: "show_size_guide",
      label: "Show Size Guide",
      info: "Show size guide in add to cart popup. Not applicable for international websites",
      default: false,
    },
    {
      type: "text",
      id: "tax_label",
      label: "Price tax label text",
      default: "Tax inclusive of all GST",
      info: "Set the text for the price tax label displayed in the 'Add to Cart' popup. Not applicable for international websites",
    },
    {
      type: "checkbox",
      id: "mandatory_pincode",
      label: "Mandatory Delivery check",
      info: "Mandatory delivery check in Add to Cart popup. Not applicable for international websites",
      default: false,
    },
    {
      type: "checkbox",
      id: "hide_single_size",
      label: "Hide single size",
      info: "Hide single size in Add to Cart popup. Not applicable for international websites",
      default: false,
    },
    {
      type: "checkbox",
      id: "preselect_size",
      label: "Preselect size",
      info: "Preselect size in Add to Cart popup. Applicable only for multi-sized products. Not applicable for international websites",
      default: false,
    },
    {
      type: "radio",
      id: "size_selection_style",
      label: "Size selection style",
      info: "Select the size display format in Add to Cart popup. Not applicable for international websites",
      default: "block",
      options: [
        {
          value: "dropdown",
          text: "Dropdown Style",
        },
        {
          value: "block",
          text: "Block Style",
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
