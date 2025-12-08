import React from "react";

import SiteMap from "../components/site-map/site-map";
import { tranformCategoriesData } from "../page-layouts/site-map/useSiteMap";
import {
  BLOGS,
  CATEGORIES_LISTING,
  COLLECTIONS,
  PRODUCTS,
} from "../queries/siteMapQuery";
export function SiteMapCustom({ props }) {
  return (
    <>
      <SiteMap props={props} />
    </>
  );
}

export const settings = {
  label: "Site Map",
  props: [
    {
      type: "text",
      id: "sitemap_text",
      default: "Sitemap",
      label: "Section Title",
    },
  ],
};

SiteMapCustom.serverFetch = async ({ fpi }) => {
  const [categoryRes, productRes, blogRes, collectionRes] = await Promise.all([
    fpi.executeGQL(CATEGORIES_LISTING, {}),
    fpi.executeGQL(PRODUCTS, {}),
    fpi.executeGQL(BLOGS, {}),
    fpi.executeGQL(COLLECTIONS, {}),
  ]);
  const categoriesList = tranformCategoriesData(
    categoryRes?.data?.categories?.data
  );
  const productData = productRes?.data?.products?.items || [];
  const blogData = blogRes?.data?.applicationContent?.blogs?.items || [];
  const collectionData = collectionRes?.data?.collections?.items || [];
  fpi.custom.setValue("siteMapSectionData", {
    categoryRes: categoriesList,
    productRes: productData,
    blogRes: blogData,
    collectionRes: collectionData,
  });
};

export default SiteMapCustom;
