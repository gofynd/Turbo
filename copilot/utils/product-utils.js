/**
 * Product Utilities for Copilot Integration
 *
 * This module contains all product-related utility functions including
 * product information retrieval, product listing extraction, and product formatting.
 */

import { GET_PRODUCT_DETAILS } from "../../theme/queries/pdpQuery.js";
import { FEATURE_PRODUCT_SIZE_PRICE } from "../../theme/queries/featureProductQuery.js";
import {
  getCachedPincodeValidation,
  getFpiState,
  createErrorResponse,
  createSuccessResponse,
  isValidPincodeFormat,
} from "./common-utils.js";

/**
 * Build product description without caching
 * @param {string} productName - Product name
 * @param {string} size - Product size
 * @param {string} color - Product color
 * @returns {string} Formatted product description
 */
export const buildProductDescription = (productName, size, color) => {
  return `${productName}${size ? ` (Size: ${size})` : ""}${color ? ` (Color: ${color})` : ""}`;
};

/**
 * Get detailed product information including availability, sizes, and pricing
 *
 * @param {Object} params - Parameters
 * @param {string} params.product_id - Product ID, SKU, or slug
 * @param {string} [params.pincode] - 6-digit pincode to check availability and pricing
 * @returns {Promise<Object>} Response object with product information
 */
export const getProductInfo = async ({ product_id, pincode }) => {
  try {
    if (!window.fpi) {
      return createErrorResponse(
        false,
        "Unable to fetch product information. Please try again."
      );
    }

    // Fetch product details
    const productDetails = await window.fpi.executeGQL(GET_PRODUCT_DETAILS, {
      slug: product_id,
    });

    if (!productDetails?.data?.product) {
      return createErrorResponse(
        false,
        `Product with ID "${product_id}" not found.`
      );
    }

    const { product } = productDetails.data;

    // Prepare product info
    const productInfo = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      short_description: product.short_description,
      brand: product.brand?.name,
      price: product.price,
      images: product.media?.slice(0, 3), // First 3 images
      rating: product.rating,
      rating_count: product.rating_count,
      highlights: product.highlights,
      has_sizes: Boolean(product.sizes?.sizes?.length),
      has_colors: Boolean(
        product.variants?.some(
          (v) => v.key === "color" || v.header?.toLowerCase().includes("color")
        )
      ),
      is_custom_order: Boolean(product.custom_order?.is_custom_order),
      moq: product.moq,
    };

    // Add size information if available
    const productSizes = product.sizes?.sizes;
    if (productSizes?.length > 0) {
      const availableSizes = [];
      const outOfStockSizes = [];

      for (const size of productSizes) {
        const sizeData = { value: size.value, display: size.display };
        if (size.is_available && size.quantity > 0) {
          availableSizes.push({ ...sizeData, quantity: size.quantity });
        } else {
          outOfStockSizes.push(sizeData);
        }
      }

      productInfo.available_sizes = availableSizes;
      productInfo.out_of_stock_sizes = outOfStockSizes;
    }

    // Add color information if available
    const productVariants = product.variants;
    if (productVariants?.length > 0) {
      const colorVariants = productVariants.find(
        (variant) =>
          variant.key === "color" ||
          variant.header?.toLowerCase().includes("color")
      );

      if (colorVariants?.items?.length > 0) {
        const availableColors = [];
        const outOfStockColors = [];

        for (const item of colorVariants.items) {
          const colorData = {
            value: item.color || item.value,
            display: item.color_name || item.name,
            hex_code: item.color,
          };

          if (item.is_available) {
            availableColors.push(colorData);
          } else {
            outOfStockColors.push(colorData);
          }
        }

        productInfo.available_colors = availableColors;
        productInfo.out_of_stock_colors = outOfStockColors;
      }
    }

    // If pincode provided, get pricing and delivery info
    if (pincode && isValidPincodeFormat(pincode)) {
      try {
        const promises = [getCachedPincodeValidation(pincode)];

        // Add pricing call for first available size if product has sizes
        let pricePromise = null;
        if (productSizes?.length > 0) {
          const firstAvailableSize = productSizes.find(
            (s) => s.is_available && s.quantity > 0
          );
          if (firstAvailableSize) {
            pricePromise = window.fpi.executeGQL(FEATURE_PRODUCT_SIZE_PRICE, {
              slug: product_id,
              size: firstAvailableSize.value,
              pincode,
            });
            promises.push(pricePromise);
          }
        }

        const results = await Promise.all(promises);
        const [pincodeValidation, priceData] = results;

        if (pincodeValidation?.data?.locality) {
          productInfo.delivery_info = {
            pincode,
            is_serviceable: true,
            location: pincodeValidation.data.locality.display_name,
          };

          if (priceData?.data?.productPrice) {
            productInfo.pricing_info = {
              price: priceData.data.productPrice.price,
              quantity_available: priceData.data.productPrice.quantity,
              delivery_promise: priceData.data.productPrice.delivery_promise,
            };
          }
        } else {
          productInfo.delivery_info = {
            pincode,
            is_serviceable: false,
            message: `Delivery not available to pincode ${pincode}`,
          };
        }
      } catch (error) {
        console.error("Error checking pincode:", error);
        productInfo.delivery_info = {
          pincode,
          error: "Unable to check delivery availability",
        };
      }
    }

    return createSuccessResponse(
      `Product information for ${product.name}`,
      productInfo
    );
  } catch (error) {
    console.error("Get product info error:", error);
    return createErrorResponse(
      false,
      `Failed to fetch product information: ${error.message}`
    );
  }
};

/**
 * Extract product information from the current product listing page using API calls
 * @returns {Promise<Array>} - Array of product objects with name, slug, uid, etc.
 */
export const extractProductsFromCurrentPage = async () => {
  try {
    if (!window.fpi) {
      throw new Error("FPI not available");
    }

    // Get current URL parameters to determine what API call to make
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams;
    const pathname = currentUrl.pathname;

    let products = [];

    // Determine the type of listing page and make appropriate API call
    if (pathname.includes("/collection")) {
      let collectionSlug;

      // Handle both /collection/slug and /collections/slug patterns
      if (pathname.includes("/collection/")) {
        // For /collection/bring-in-the-style -> extract "bring-in-the-style"
        collectionSlug = pathname.split("/collection/")[1]?.split("/")[0];
      } else if (pathname.includes("/collections/")) {
        // For /collections/bring-in-the-style -> extract "bring-in-the-style"
        collectionSlug = pathname.split("/collections/")[1]?.split("/")[0];
      }

      if (collectionSlug) {
        products = await getCollectionProducts(collectionSlug, searchParams);
      }
    } else if (pathname.includes("/categories/")) {
      const categorySlug = pathname.split("/categories/")[1]?.split("/")[0];
      if (categorySlug) {
        products = await getCategoryProducts(categorySlug, searchParams);
      }
    } else if (pathname.includes("/products") || searchParams.has("q")) {
      products = await getProductsFromSearch(searchParams);
    } else if (pathname.includes("/brands/")) {
      const brandSlug = pathname.split("/brands/")[1]?.split("/")[0];
      if (brandSlug) {
        products = await getBrandProducts(brandSlug, searchParams);
      }
    }

    // If no products found, try to get from current React state as fallback
    if (products.length === 0) {
      products = await getProductsFromReactState();
    }

    // Optimized product mapping
    return products.map((product, index) => ({
      name: product.name,
      slug: product.slug,
      uid: product.uid,
      position: index + 1,
      brand: product.brand?.name,
      price: product.price,
      image: product.media?.[0]?.url || product.medias?.[0]?.url,
      sellable: product.sellable,
      variants: product.variants,
    }));
  } catch (error) {
    console.error("Error extracting products from API:", error);

    // Final fallback: try React state
    try {
      const products = await getProductsFromReactState();
      return products.map((product, index) => ({
        name: product.name,
        slug: product.slug,
        uid: product.uid,
        position: index + 1,
        brand: product.brand?.name,
        price: product.price,
        image: product.media?.[0]?.url || product.medias?.[0]?.url,
      }));
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return [];
    }
  }
};

/**
 * Get products from search/filter API
 */
const getProductsFromSearch = async (searchParams) => {
  try {
    // Import the query
    const { PLP_PRODUCTS } = await import("../../theme/queries/plpQuery.js");

    // Optimized filter query building
    const filterParts = [];
    const searchQuery = searchParams.get("q") || "";

    // Convert URL parameters to filter query format
    for (const [key, value] of searchParams.entries()) {
      if (!["q", "sort_on", "page_no"].includes(key)) {
        filterParts.push(`${key}:${value}`);
      }
    }

    const payload = {
      search: searchQuery || undefined,
      filterQuery: filterParts.join(":::") || undefined,
      enableFilter: true,
      first: 50, // Get more products to match page display
      pageNo: parseInt(searchParams.get("page_no")) || 1,
      pageType: "number",
      sortOn: searchParams.get("sort_on") || undefined,
    };

    const result = await window.fpi.executeGQL(PLP_PRODUCTS, payload);
    return result?.data?.products?.items || [];
  } catch (error) {
    console.error("Error fetching products from search API:", error);
    return [];
  }
};

/**
 * Get products from collection API
 */
const getCollectionProducts = async (collectionSlug, searchParams) => {
  try {
    // Import the collection query
    const { COLLECTION_ITEMS } = await import(
      "../../theme/queries/collectionsQuery.js"
    );

    // Optimized filter query building
    const filterParts = [];
    for (const [key, value] of searchParams.entries()) {
      if (!["sort_on", "page_no"].includes(key)) {
        filterParts.push(`${key}:${value}`);
      }
    }

    const payload = {
      slug: collectionSlug,
      filters: true,
      first: 50,
      pageNo: parseInt(searchParams.get("page_no")) || 1,
      pageType: "number",
      query: filterParts.join(":::") || undefined,
      sortOn: searchParams.get("sort_on") || undefined,
    };

    const result = await window.fpi.executeGQL(COLLECTION_ITEMS, payload);
    return result?.data?.collectionItems?.items || [];
  } catch (error) {
    console.error("Error fetching collection products:", error);
    return [];
  }
};

/**
 * Get products for category (using product search with category filter)
 */
const getCategoryProducts = async (categorySlug, searchParams) => {
  try {
    const { PLP_PRODUCTS } = await import("../../theme/queries/plpQuery.js");

    const filterParts = [`category:${categorySlug}`];

    // Add other filters from URL
    for (const [key, value] of searchParams.entries()) {
      if (!["q", "sort_on", "page_no", "category"].includes(key)) {
        filterParts.push(`${key}:${value}`);
      }
    }

    const payload = {
      filterQuery: filterParts.join(":::"),
      enableFilter: true,
      first: 50,
      pageNo: parseInt(searchParams.get("page_no")) || 1,
      pageType: "number",
      sortOn: searchParams.get("sort_on") || undefined,
    };

    const result = await window.fpi.executeGQL(PLP_PRODUCTS, payload);
    return result?.data?.products?.items || [];
  } catch (error) {
    console.error("Error fetching category products:", error);
    return [];
  }
};

/**
 * Get products for brand (using product search with brand filter)
 */
const getBrandProducts = async (brandSlug, searchParams) => {
  try {
    const { PLP_PRODUCTS } = await import("../../theme/queries/plpQuery.js");

    const filterParts = [`brand:${brandSlug}`];

    // Add other filters from URL
    for (const [key, value] of searchParams.entries()) {
      if (!["q", "sort_on", "page_no", "brand"].includes(key)) {
        filterParts.push(`${key}:${value}`);
      }
    }

    const payload = {
      filterQuery: filterParts.join(":::"),
      enableFilter: true,
      first: 50,
      pageNo: parseInt(searchParams.get("page_no")) || 1,
      pageType: "number",
      sortOn: searchParams.get("sort_on") || undefined,
    };

    const result = await window.fpi.executeGQL(PLP_PRODUCTS, payload);
    return result?.data?.products?.items || [];
  } catch (error) {
    console.error("Error fetching brand products:", error);
    return [];
  }
};

/**
 * Get products from React state (fallback method)
 */
const getProductsFromReactState = async () => {
  try {
    if (!window.fpi?.store) return [];

    const state = getFpiState();
    const customValue = state?.CUSTOM_VALUE;

    if (!customValue) return [];

    const productList = customValue.customProductList;
    const collectionList = customValue.customCollectionList;

    if (productList?.items?.length > 0) {
      return productList.items;
    }

    if (collectionList?.items?.length > 0) {
      return collectionList.items;
    }

    return [];
  } catch (error) {
    console.error("Error getting products from React state:", error);
    return [];
  }
};
