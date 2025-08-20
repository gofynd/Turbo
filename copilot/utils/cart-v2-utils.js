/**
 * Cart Actions V2 - Store-Based Utilities
 *
 * These utilities follow the correct flow:
 * - PLP Pages: Get data from store.CUSTOM_VALUE.customProductList
 * - PDP Pages: Get data from store.PRODUCT object
 * - NO unnecessary API calls - everything from store
 */

// ===== CORE STORE ACCESS FUNCTIONS =====

/**
 * Get store state directly
 * @returns {Object} Store state
 */
export const getStoreState = () => {
  console.log("🔍 [STORE] Accessing store state...");
  if (!window.fpi?.store) {
    console.error("🚨 [STORE] FPI store not available");
    return null;
  }
  const state = window.fpi.store.getState();
  console.log("✅ [STORE] Store state retrieved successfully:", {
    hasCustomValue: !!state?.custom,
    hasProduct: !!state?.product,
    hasLocationDetails: !!state?.location_details,
    timestamp: new Date().toISOString(),
  });
  return state;
};

/**
 * Get custom value from store (used for PLP data)
 * @returns {Object} CUSTOM_VALUE object containing product lists
 */
export const getCustomValue = () => {
  console.log("📋 [CUSTOM_VALUE] Accessing CUSTOM_VALUE from store...");
  const state = getStoreState();
  const customValue = state?.custom || null;

  if (customValue) {
    console.log("✅ [CUSTOM_VALUE] Retrieved successfully:", {
      hasProductList: !!customValue.customProductList,
      hasCollectionList: !!customValue.customCollectionList,
      productListCount: customValue.customProductList?.items?.length || 0,
      collectionListCount: customValue.customCollectionList?.items?.length || 0,
    });
  } else {
    console.warn("⚠️ [CUSTOM_VALUE] No CUSTOM_VALUE found in store");
  }

  return customValue;
};

/**
 * Get product object from store (used for PDP data)
 * @returns {Object} PRODUCT object containing current product details
 */
export const getProductFromStore = () => {
  console.log("📱 [PRODUCT] Accessing PRODUCT from store...");
  const state = getStoreState();
  const product = state?.PRODUCT || null;

  if (product) {
    console.log("✅ [PRODUCT] Retrieved successfully:", {
      hasProductDetails: !!product.product_details,
      hasProductMeta: !!product.product_meta,
      productName: product.product_details?.name || "N/A",
      productSlug: product.product_details?.slug || "N/A",
    });
  } else {
    console.warn("⚠️ [PRODUCT] No PRODUCT found in store");
  }

  return product;
};

// ===== PAGE CONTEXT DETECTION =====

/**
 * Detect current page type based on URL patterns
 * @returns {Object} Page context with type and detected data
 */
export const detectPageContextV2 = () => {
  console.log("🎯 [CONTEXT V2] Starting page context detection...");
  const currentPath = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  console.log("🔍 [CONTEXT V2] Analyzing page URL:", {
    pathname: currentPath,
    search: window.location.search,
    fullUrl: window.location.href,
  });

  // PDP Detection - /product/slug
  if (currentPath.match(/^(?:\/[a-zA-Z-]+)?\/product\/([^/]+)\/?$/i)) {
    console.log("📱 [CONTEXT V2] Detected PDP page pattern");
    const productSlug = currentPath.match(
      /^(?:\/[a-zA-Z-]+)?\/product\/([^/]+)\/?$/i
    )[1];
    console.log("🔍 [CONTEXT V2] Extracted product slug:", productSlug);

    const productData = getPDPProductData();
    const result = {
      type: "PDP",
      product_slug: productSlug,
      product: productData,
      data_source: "store.PRODUCT",
    };

    console.log("✅ [CONTEXT V2] PDP context created:", {
      type: result.type,
      product_slug: result.product_slug,
      has_product_data: !!result.product,
      data_source: result.data_source,
    });

    return result;
  }

  // PLP Detection - /products (with or without search)
  if (currentPath.includes("/products")) {
    console.log("📋 [CONTEXT V2] Detected PLP page pattern");
    const products = getPLPProductsData();
    const result = {
      type: "PLP",
      products: products,
      search_query: searchParams.get("q"),
      data_source: "store.CUSTOM_VALUE.customProductList",
    };

    console.log("✅ [CONTEXT V2] PLP context created:", {
      type: result.type,
      products_count: result.products?.length || 0,
      search_query: result.search_query,
      data_source: result.data_source,
    });

    return result;
  }

  // Search Detection - any page with ?q= parameter
  if (searchParams.has("q")) {
    const products = getPLPProductsData();
    return {
      type: "SEARCH",
      products: products,
      search_query: searchParams.get("q"),
      data_source: "store.CUSTOM_VALUE.customProductList",
    };
  }

  // Collection Detection - /collection/slug
  if (currentPath.includes("/collection")) {
    const products = getPLPProductsData();
    return {
      type: "COLLECTION",
      products: products,
      data_source: "store.CUSTOM_VALUE.customCollectionList",
    };
  }

  // Category Detection - /categories/slug
  if (currentPath.includes("/categories")) {
    const products = getPLPProductsData();
    return {
      type: "CATEGORY",
      products: products,
      data_source: "store.CUSTOM_VALUE.customProductList",
    };
  }

  return {
    type: "UNKNOWN",
    products: [],
    data_source: "none",
  };
};

// ===== PDP DATA EXTRACTION =====

/**
 * Get current product data from store (for PDP pages)
 * @returns {Object|null} Current product object
 */
export const getPDPProductData = () => {
  console.log("📱 [PDP DATA] Starting PDP product data extraction...");
  try {
    const productStore = getProductFromStore();

    if (!productStore) {
      console.error("🚨 [PDP DATA] No PRODUCT data in store");
      return null;
    }

    // Extract product details from store.PRODUCT.product_details
    const productDetails = productStore.product_details;

    if (!productDetails) {
      console.error("🚨 [PDP DATA] No product_details in PRODUCT store");
      return null;
    }

    console.log("✅ [PDP DATA] Retrieved product from store:", {
      name: productDetails.name,
      slug: productDetails.slug,
      uid: productDetails.uid,
      has_price: !!productDetails.price,
      has_media: !!productDetails.media?.length,
      has_sizes: !!productDetails.sizes?.sizes?.length,
      has_variants: !!productDetails.variants?.length,
      source: "store.PRODUCT.product_details",
    });

    // Return normalized product object
    return {
      name: productDetails.name,
      slug: productDetails.slug,
      uid: productDetails.uid,
      brand: productDetails.brand?.name,
      price: productDetails.price,
      media: productDetails.media,
      sizes: productDetails.sizes,
      variants: productDetails.variants,
      sellable: true, // PDP products are generally sellable
      position: 1, // Single product on PDP
      source: "PDP_STORE",
    };
  } catch (error) {
    console.error("🚨 [PDP] Error getting product data:", error);
    return null;
  }
};

// ===== PLP DATA EXTRACTION =====

/**
 * Get products list from store (for PLP/Search/Collection pages)
 * @returns {Array} Array of product objects
 */
export const getPLPProductsData = () => {
  console.log("📋 [PLP DATA] Starting PLP products data extraction...");
  try {
    const customValue = getCustomValue();

    if (!customValue) {
      console.error("🚨 [PLP DATA] No CUSTOM_VALUE in store");
      return [];
    }

    // Try different product list sources in priority order
    let products = [];

    // 1. Try customProductList first (main product listing)
    if (customValue.customProductList?.items?.length > 0) {
      products = customValue.customProductList.items;
      console.log("✅ [PLP DATA] Retrieved products from customProductList:", {
        count: products.length,
        first_product: products[0]?.name || "N/A",
        source: "store.CUSTOM_VALUE.customProductList.items",
      });
    }
    // 2. Try customCollectionList as fallback
    else if (customValue.customCollectionList?.items?.length > 0) {
      products = customValue.customCollectionList.items;
      console.log(
        "✅ [PLP DATA] Retrieved products from customCollectionList:",
        {
          count: products.length,
          first_product: products[0]?.name || "N/A",
          source: "store.CUSTOM_VALUE.customCollectionList.items",
        }
      );
    } else {
      console.error("🚨 [PLP DATA] No products found in any store lists");
      return [];
    }

    // Normalize product objects with position
    return products.map((product, index) => ({
      name: product.name,
      slug: product.slug,
      uid: product.uid,
      position: index + 1,
      brand: product.brand?.name,
      price: product.price,
      media: product.media || product.medias,
      sellable: product.sellable,
      variants: product.variants,
      source: "PLP_STORE",
    }));
  } catch (error) {
    console.error("🚨 [PLP] Error getting products data:", error);
    return [];
  }
};

// ===== PRODUCT SELECTION UTILITIES =====

/**
 * Parse product selector and find matching product
 * @param {string} selector - Product selector (position number or product name from API)
 * @param {Array} products - Array of products to select from
 * @returns {Object|null} Selected product object
 */
export const parseProductSelectorV2 = (selector, products) => {
  console.log("🎯 [SELECTOR V2] Starting product selector parsing...");

  if (!selector || !products || products.length === 0) {
    console.error("🚨 [SELECTOR V2] Invalid input:", {
      has_selector: !!selector,
      has_products: !!products,
      products_length: products?.length || 0,
    });
    return null;
  }

  const trimmedSelector = selector.trim();

  console.log("🔍 [SELECTOR V2] Analyzing selector:", {
    original: selector,
    trimmed: trimmedSelector,
    available_products: products.length,
    products_preview: products
      .slice(0, 3)
      .map((p) => ({ name: p.name, position: p.position })),
  });

  // 1. Check if selector is a numeric position
  const numericPosition = parseInt(trimmedSelector);
  if (
    !isNaN(numericPosition) &&
    numericPosition > 0 &&
    numericPosition <= products.length
  ) {
    const selectedProduct = products[numericPosition - 1];
    console.log("✅ [SELECTOR V2] Position-based selection:", {
      position: numericPosition,
      selected: selectedProduct.name,
      selector: trimmedSelector,
    });
    return selectedProduct;
  }

  // 2. Check if selector matches product name (exact match)
  const exactNameMatch = products.find(
    (product) =>
      product.name?.toLowerCase() === trimmedSelector.toLowerCase() ||
      product.slug?.toLowerCase() === trimmedSelector.toLowerCase()
  );
  if (exactNameMatch) {
    console.log(
      "✅ [SELECTOR V2] Exact name match found:",
      exactNameMatch.name
    );
    return exactNameMatch;
  }

  // 3. Check if selector matches product name (partial match)
  const partialNameMatch = products.find(
    (product) =>
      product.name?.toLowerCase().includes(trimmedSelector.toLowerCase()) ||
      product.slug?.toLowerCase().includes(trimmedSelector.toLowerCase())
  );
  if (partialNameMatch) {
    console.log(
      "✅ [SELECTOR V2] Partial name match found:",
      partialNameMatch.name
    );
    return partialNameMatch;
  }

  // 4. No match found
  console.error("🚨 [SELECTOR V2] No matching product found:", {
    selector: trimmedSelector,
    available_products: products.map((p, i) => ({
      position: i + 1,
      name: p.name,
    })),
  });
  return null;
};

// ===== CART OPERATION UTILITIES =====

/**
 * Add product to cart using existing cart utility
 * @param {Object} params - Cart parameters
 * @param {string} params.product_slug - Product slug or ID
 * @param {number} params.quantity - Quantity to add
 * @param {string} params.size - Size selection
 * @param {string} params.color - Color selection
 * @returns {Promise<Object>} Cart operation result
 */
export const addProductToCartV2 = async ({
  product_slug,
  quantity = 1,
  size = null,
  color = null,
  pincode = null,
}) => {
  console.log("🛒 [CART V2] Starting add to cart operation...");

  try {
    console.log("📝 [CART V2] Add to cart parameters:", {
      product_slug,
      quantity,
      size,
      color,
      pincode,
      timestamp: new Date().toISOString(),
    });

    console.log("🔄 [CART V2] Importing advanced cart utility...");

    // Import the advanced cart utility that handles variants, color switching, and product fetching
    const { addToCart } = await import("../utils/cart-utils.js");
    console.log("✅ [CART V2] Theme utility imported successfully");

    console.log("🚀 [CART V2] Calling theme addToCart function...");

    // Use the existing addToCart function with our parameters
    const cartParams = {
      product_id: product_slug,
      quantity: quantity,
      size: size,
      color: color,
      pincode: pincode,
    };

    console.log("📝 [CART V2] Calling addToCart with params:", cartParams);

    const result = await addToCart(cartParams);

    console.log("✅ [CART V2] Cart operation completed:", {
      success: result.success,
      message: result.message,
      has_data: !!result.data,
      error_code: result.error_code || "none",
    });

    return result;
  } catch (error) {
    console.error("🚨 [CART V2] Error adding to cart:", error);
    return {
      success: false,
      message: `Failed to add product to cart: ${error.message}`,
      error_code: "CART_ADD_FAILED",
      error: error,
    };
  }
};

// ===== VALIDATION UTILITIES =====

/**
 * Validate that required cart data is available
 * @returns {Object} Validation result
 */
export const validateCartRequirements = () => {
  const errors = [];

  // Check FPI availability
  if (!window.fpi) {
    errors.push("FPI not available");
  }

  // Check store availability
  if (!window.fpi?.store) {
    errors.push("FPI store not available");
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
};

// ===== RESPONSE HELPERS =====

/**
 * Create success response object
 * @param {string} message - Success message
 * @param {Object} data - Additional data
 * @returns {Object} Success response
 */
export const createSuccessResponseV2 = (message, data = {}) => ({
  success: true,
  message: message,
  timestamp: new Date().toISOString(),
  ...data,
});

/**
 * Create error response object
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} details - Additional error details
 * @returns {Object} Error response
 */
export const createErrorResponseV2 = (
  message,
  code = "UNKNOWN_ERROR",
  details = {}
) => ({
  success: false,
  message: message,
  error_code: code,
  timestamp: new Date().toISOString(),
  ...details,
});

// ===== DEBUG UTILITIES =====

/**
 * Debug function to inspect current store state
 * @returns {Object} Debug information
 */
export const debugStoreState = () => {
  const state = getStoreState();
  const customValue = getCustomValue();
  const product = getProductFromStore();

  return {
    store_available: !!window.fpi?.store,
    custom_value: {
      available: !!customValue,
      product_list_count: customValue?.customProductList?.items?.length || 0,
      collection_list_count:
        customValue?.customCollectionList?.items?.length || 0,
    },
    product: {
      available: !!product,
      has_details: !!product?.product_details,
      product_name: product?.product_details?.name || "N/A",
    },
    current_url: window.location.href,
    timestamp: new Date().toISOString(),
  };
};
