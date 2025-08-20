import { extractProductsFromCurrentPage } from "./product-utils.js";
import { spaNavigate } from "../../theme/helper/utils";
import {
  ADD_WISHLIST,
  REMOVE_WISHLIST,
  FOLLOWED_PRODUCTS_ID,
} from "../../theme/queries/wishlistQuery";
import {
  getFpiState,
  createErrorResponse,
  createSuccessResponse,
} from "./common-utils.js";

/**
 * Helper function to add product to wishlist
 */
export const addToWishList = async (product) => {
  if (!window.fpi) {
    throw new Error("FPI not available");
  }

  const payload = {
    collectionType: "products",
    collectionId: product?.uid?.toString(),
  };

  const result = await window.fpi.executeGQL(ADD_WISHLIST, payload);

  if (result?.data?.followById?.message) {
    // Refresh followed products list
    await window.fpi.executeGQL(FOLLOWED_PRODUCTS_ID, {
      collectionType: "products",
      pageSize: 500,
    });
    return result.data.followById;
  }

  throw new Error(result?.errors?.[0]?.message || "Failed to add to wishlist");
};

/**
 * Helper function to remove product from wishlist
 */
export const removeFromWishList = async (product) => {
  if (!window.fpi) {
    throw new Error("FPI not available");
  }

  const payload = {
    collectionType: "products",
    collectionId: product?.uid?.toString(),
  };

  const result = await window.fpi.executeGQL(REMOVE_WISHLIST, payload);

  if (result?.data?.unfollowById?.message) {
    // Refresh followed products list
    await window.fpi.executeGQL(FOLLOWED_PRODUCTS_ID, {
      collectionType: "products",
      pageSize: 500,
    });
    return result.data.unfollowById;
  }

  throw new Error(
    result?.errors?.[0]?.message || "Failed to remove from wishlist"
  );
};

/**
 * Helper function to check if user is logged in
 * Uses the same pattern as the theme components: fpi.getters.LOGGED_IN
 */
export const isUserLoggedIn = () => {
  if (!window.fpi) {
    return false;
  }

  try {
    let isLoggedIn = false;

    // Method 1: Use FPI getters (same as theme components)
    if (window.fpi.getters && window.fpi.getters.LOGGED_IN) {
      const state = getFpiState();
      isLoggedIn = Boolean(state[window.fpi.getters.LOGGED_IN]);
    }

    // Method 2: Fallback - check auth state directly (as used in auth-guard.js)
    if (!isLoggedIn) {
      const state = getFpiState();
      const authLoggedIn = state?.auth?.logged_in;

      if (authLoggedIn !== undefined) {
        isLoggedIn = Boolean(authLoggedIn);
      } else {
        // Check other possible locations
        const alternativeChecks = [
          state?.auth?.user_fetched,
          state?.USER?.is_logged_in,
          state?.AUTH?.is_logged_in,
          state?.LOGIN?.is_logged_in,
        ];

        isLoggedIn = alternativeChecks.some((val) => Boolean(val));
      }
    }

    return isLoggedIn;
  } catch (error) {
    return false;
  }
};

/**
 * Helper function to get current product from PDP using store data only
 */
export const getCurrentProductFromPDP = () => {
  try {
    const currentPath = window.location.pathname;

    // Check if we're on a PDP page
    if (!currentPath.includes("/product/")) {
      return null;
    }

    // Get product details from store
    if (!window.fpi) {
      return null;
    }

    const state = getFpiState();

    // Method 1: Try product.product_details (most likely location based on Redux screenshot)
    const productDetails = state?.product?.product_details;

    if (productDetails && productDetails.uid) {
      const currentProduct = {
        slug: productDetails.slug,
        name: productDetails.name,
        uid: productDetails.uid,
        brand: productDetails.brand?.name,
      };
      return currentProduct;
    }

    // Method 2: Try other common store patterns
    const possiblePaths = [
      { path: state?.product?.current, name: "product.current" },
      { path: state?.product?.selected, name: "product.selected" },
      { path: state?.product?.detail, name: "product.detail" },
      { path: state?.currentProduct, name: "currentProduct" },
      { path: state?.PRODUCT, name: "PRODUCT" },
    ];

    for (const { path } of possiblePaths) {
      if (path && path.uid) {
        const currentProduct = {
          slug: path.slug,
          name: path.name,
          uid: path.uid,
          brand: path.brand?.name,
        };
        return currentProduct;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Helper function to check if product is already in wishlist
 */
export const isProductInWishlist = (productUid) => {
  if (!window.fpi) {
    return false;
  }

  try {
    // Use the same data fetching strategy as getWishlistData for consistency
    const { followedList } = getWishlistData();

    const followedIds = followedList?.items?.map((item) => item.uid) || [];

    // Check both strict and string comparison for robustness
    const isIncluded = followedIds.some(
      (id) => id === productUid || String(id) === String(productUid)
    );

    return isIncluded;
  } catch (error) {
    return false;
  }
};

/**
 * Helper function to get wishlist data from store only
 */
export const getWishlistData = () => {
  if (!window.fpi) throw new Error("FPI not available");

  const state = getFpiState();
  let followedList = null;
  let dataSource = "none";

  // Step 1: Try the exact path we see in the store: product.followed_listing
  const productFollowedListing = state?.product?.followed_listing;

  if (productFollowedListing) {
    followedList = productFollowedListing;
    dataSource = "store_product_followed_listing";
    return { followedList, dataSource };
  }

  // Step 2: Try to get from store using FPI getter as fallback
  if (window.fpi.getters && window.fpi.getters.FOLLOWED_LIST) {
    const getterKey = window.fpi.getters.FOLLOWED_LIST;
    followedList = state[getterKey];

    if (followedList) {
      dataSource = `store_via_getter(${getterKey})`;
      return { followedList, dataSource };
    }
  }

  // Step 3: Try other common patterns as fallback
  const directAccessPaths = [
    { path: state?.FOLLOWED_LIST, name: "FOLLOWED_LIST" },
    { path: state?.followedList, name: "followedList" },
    { path: state?.followed, name: "followed" },
    { path: state?.wishlist, name: "wishlist" },
    { path: state?.WISHLIST, name: "WISHLIST" },
  ];

  for (const { path, name } of directAccessPaths) {
    if (path) {
      followedList = path;
      dataSource = `store_direct_access(${name})`;
      return { followedList, dataSource };
    }
  }

  // If no store data found, return empty (no API calls)
  return {
    followedList: { items: [], page: { item_total: 0 } },
    dataSource: "store_empty",
  };
};

/**
 * Helper function to get product by slug
 */
export const getProductBySlug = async (productSlug) => {
  if (!window.fpi) {
    throw new Error("FPI not available");
  }

  const { GET_PRODUCT_DETAILS } = await import(
    "../../theme/queries/pdpQuery.js"
  );
  const result = await window.fpi.executeGQL(GET_PRODUCT_DETAILS, {
    slug: productSlug,
  });

  if (result?.data?.product) {
    const product = result.data.product;
    return {
      slug: product.slug,
      name: product.name,
      uid: product.uid,
      brand: product.brand?.name,
    };
  }

  return null;
};

/**
 * Helper function to validate if current page is a product listing page
 */
export const isProductListingPage = () => {
  const currentPath = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  return (
    currentPath.includes("/products") ||
    currentPath.includes("/collections") ||
    currentPath.includes("/categories") ||
    currentPath.includes("/brands") ||
    searchParams.has("q")
  );
};
