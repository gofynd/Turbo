import { useCallback, useEffect, useMemo, useState } from "react";
import { useFPI } from "fdk-core/utils";
import useCategories from "../../page-layouts/categories/useCategories";
import useHeader from "../../components/header/useHeader";
import {
  PRODUCTS,
  BLOGS,
  COLLECTIONS,
  CATEGORIES_LISTING,
} from "../../queries/siteMapQuery";
import { useGlobalStore } from "fdk-core/utils";

function convertSocialLinks(socialObj) {
  if (!socialObj || typeof socialObj !== "object") return [];
  return Object.values(socialObj).map((item) => ({
    label: item?.title ?? "",
    path: item?.link
      ? item.link.startsWith("http")
        ? item.link
        : `https://${item.link}`
      : "",
  }));
}

export function tranformCategoriesData(data) {
  return data
    ?.flatMap((item) => item?.items?.map((m) => m.childs))
    ?.flat()
    ?.flatMap((i) => i?.childs);
}

export default function useSiteMap() {
  const fpi = useFPI();
  const { categories } = useCategories(fpi);
  const { contactInfo } = useHeader(fpi);

  const [loading, setLoading] = useState(false);

  const SOCIAL_LINKS = contactInfo?.social_links;

  const { siteMapSectionData = {} } = useGlobalStore(
    fpi?.getters?.CUSTOM_VALUE
  );

  const {
    blogRes,
    categoryRes,
    collectionRes,
    productRes,
  } = siteMapSectionData || {};

  const callApisFromClient = async () => {
    setLoading(true);

    try {
      const [categoryRes, productRes, blogRes, collectionRes] =
        await Promise.all([
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
      setLoading(false)
    } catch (err) {
      console.warn("error in fetching api from Sitemap", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  if (Object.keys(siteMapSectionData).length === 0) {
    callApisFromClient();
  }
}, [siteMapSectionData]); 

  const convertedSocialLinks = useMemo(
    () => convertSocialLinks(SOCIAL_LINKS),
    [SOCIAL_LINKS]
  );

  const OTHER_PAGES = useMemo(
    () => [
      { label: "FAQ", path: "/faq" },
      { label: "Forgot Password", path: "/forgot-password" },
      { label: "Locate Us", path: "/locate-us" },
      { label: "Login", path: "/login" },
      { label: "Order Tracking", path: "/order-tracking" },
    ],
    []
  );

  const sitemapSections = useMemo(
    () => [
      {
        title: "Products",
        data: productRes,
        pathPrefix: "/product/",
        labelKey: "name",
        pathKey: "slug",
        sectionLink: "/products",
      },
      {
        title: "Categories",
        data: categoryRes,
        pathPrefix: "products?category=",
        labelKey: "name",
        pathKey: "slug",
        sectionLink: "/categories",
      },
      {
        title: "Blogs",
        data: blogRes,
        pathPrefix: "/blog/",
        labelKey: "title",
        pathKey: "slug",
        sectionLink: "/blog",
      },
      {
        title: "Collections",
        data: collectionRes,
        pathPrefix: "/collection/",
        labelKey: "name",
        pathKey: "slug",
        sectionLink: "/collections",
      },
      {
        title: "About Us",
        data: [
          { label: "Tnc", path: "/tnc" },
          { label: "Policy", path: "/policy" },
          { label: "Return Policy", path: "/return-policy" },
          { label: "Shipping Policy", path: "/shipping-policy" },
        ],
        pathPrefix: "",
        labelKey: "label",
        pathKey: "path",
        sectionLink: "/about-us",
      },
      {
        title: "Socials",
        data: convertedSocialLinks,
        pathPrefix: "",
        labelKey: "label",
        pathKey: "path",
        sectionLink: "",
      },
      {
        title: "Contact Us",
        pathPrefix: "",
        labelKey: "label",
        pathKey: "path",
        sectionLink: "/contact-us",
      },
      {
        title: "Other",
        data: OTHER_PAGES,
        pathPrefix: "",
        labelKey: "label",
        pathKey: "path",
        sectionLink: "",
      },
    ],
    [categories, convertedSocialLinks, OTHER_PAGES]
  );

  return {
    sitemapSections,
    convertedSocialLinks,
    loading,
  };
}
