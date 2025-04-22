import React from "react";
import { useFPI } from "fdk-core/utils";
import { useParams } from "react-router-dom";
import Shimmer from "../components/shimmer/shimmer";
import ProductListing from "@gofynd/theme-template/pages/product-listing/product-listing";
import "@gofynd/theme-template/pages/product-listing/index.css";
import useCollectionListing from "../page-layouts/collection-listing/useCollectionListing";
import { getHelmet } from "../providers/global-provider";
import { isRunningOnClient } from "../helper/utils";
import {
  COLLECTION_DETAILS,
  COLLECTION_WITH_ITEMS,
} from "../queries/collectionsQuery";

export function Component({ props = {}, blocks = [], globalConfig = {} }) {
  const fpi = useFPI();
  const params = useParams();
  const slug = params?.slug || props?.collection?.value;
  const listingProps = useCollectionListing({ fpi, slug, props });

  const { seo } = listingProps;

  if (listingProps?.isPageLoading && isRunningOnClient()) {
    return <Shimmer />;
  }

  return (
    <>
      {getHelmet({ seo })}
      <div className="margin0auto basePageContainer">
        <ProductListing {...listingProps} />
      </div>
    </>
  );
}

export const settings = {
  label: "Collection Product Grid",
  props: [
    {
      type: "collection",
      id: "collection",
      label: "Select Collection",
      info: "Select a collection to display its products. Applicable when the section is used on pages other than the collection listing page",
    },
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
      id: "button_link",
      default: "",
      info: "Select the destination link where users will be redirected when they click on the banner image",
      label: "Redirect Link",
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
          text: "Infinite Loading",
        },
        {
          value: "pagination",
          text: "Pagination",
        },
      ],
      info: "Choose how products load on the page based on user interaction. Infinite Scroll continuously loads more products as users scroll. Pagination organises products into separate pages with navigation controls. View More loads additional products only when users click a button",
      default: "pagination",
      label: "Loading Options",
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
      label: "Show back to top button",
      default: true,
    },
    {
      type: "checkbox",
      id: "in_new_tab",
      label: "Open product in new tab",
      default: false,
      info: "Open product in new tab for desktop",
    },
    {
      type: "checkbox",
      id: "hide_brand",
      label: "Hide Brand Name",
      default: false,
      info: "Check to hide Brand name",
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
      label: "Default grid layout desktop",
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
      default: "3",
      label: "Default grid layout tablet",
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
      label: "Default grid layout mobile",
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
      label: "Show Add to Cart",
      info: "Not Applicable for International Websites",
      default: true,
    },
    {
      type: "checkbox",
      id: "show_size_guide",
      label: "Show Size Guide",
      default: true,
      info: "Applicable for Add to Cart popup",
    },
    {
      type: "text",
      id: "tax_label",
      label: "Price tax label text",
      default: "Price inclusive of all tax",
      info: "Applicable for Add to Cart popup",
    },
    {
      type: "checkbox",
      id: "mandatory_pincode",
      label: "Mandatory Delivery check",
      default: true,
    },
    {
      type: "checkbox",
      id: "hide_single_size",
      label: "Hide single size",
      default: false,
    },
    {
      type: "checkbox",
      id: "preselect_size",
      label: "Preselect size",
      info: "Applicable only for multiple-size products",
      default: true,
    },
    {
      type: "radio",
      id: "size_selection_style",
      label: "Size selection style",
      default: "dropdown",
      options: [
        {
          value: "dropdown",
          text: "Dropdown style",
        },
        {
          value: "block",
          text: "Block style",
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

  const payload = {
    slug: router?.params?.slug,
    search: filterQuery || undefined,
    sortOn: sortQuery || undefined,
    first: pageSize,
    pageType: "number",
  };

  if (pageNo) payload.pageNo = pageNo;

  // Fetch data for SSR
  const getCollectionWithItems = async () => {
    if (isAlgoliaEnabled) {
      const BASE_URL = `https://${fpiState?.custom?.appHostName}/ext/algolia/application/api/v1.0/collections/${payload?.slug}/items`;

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
        .executeGQL(
          COLLECTION_DETAILS,
          { slug: payload?.slug },
          { skipStoreUpdate: true }
        )
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
        .executeGQL(COLLECTION_WITH_ITEMS, payload, { skipStoreUpdate: true })
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
