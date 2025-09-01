import { spaNavigate } from "../../theme/helper/utils";
import { getFpiState } from "../utils/common-utils.js";
import { CATEGORIES_LISTING } from "../../theme/queries/categoryQuery.js";

/**
 * Helper function to parse size depth range values
 * Converts natural language ranges to platform format
 * @param {string} value - Range value (e.g., "1 to 4", "2-5", "3 TO 7")
 * @returns {string|null} - Formatted range string or null if invalid
 */
const parseSizeDepthRange = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.toLowerCase().trim();

  // Try different range patterns
  let match;

  // Pattern 1: "1 to 4", "2 to 5"
  match = normalizedValue.match(/^(\d+)\s+to\s+(\d+)$/);
  if (match) {
    return `[${match[1]} TO ${match[2]}]`;
  }

  // Pattern 2: "1-4", "2-5"
  match = normalizedValue.match(/^(\d+)-(\d+)$/);
  if (match) {
    return `[${match[1]} TO ${match[2]}]`;
  }

  // Pattern 3: "1 TO 4" (already formatted)
  match = normalizedValue.match(/^(\d+)\s+TO\s+(\d+)$/i);
  if (match) {
    return `[${match[1]} TO ${match[2]}]`;
  }

  // Pattern 4: Single number (treat as exact match range)
  match = normalizedValue.match(/^(\d+)$/);
  if (match) {
    return `[${match[1]} TO ${match[1]}]`;
  }

  // If no pattern matches, return the original value
  console.warn(`[SIZE_DEPTH] Could not parse range: "${value}"`);
  return value;
};

/**
 * Helper function to build clean URLs for discount filters
 * Supports both simple and complex discount formats
 * @param {URLSearchParams} searchParams - Base search parameters
 * @param {number} minDiscount - Minimum discount percentage
 * @param {number} maxDiscount - Maximum discount percentage (optional)
 * @param {string} sortBy - Sort parameter (optional)
 * @returns {string} - Clean URL with discount parameters
 */
const buildDiscountUrl = (
  searchParams,
  minDiscount,
  maxDiscount = 99,
  sortBy = null
) => {
  // Use the complex format [X TO Y] that the platform expects
  return buildDiscountUrlWithComplexFormat(
    searchParams,
    minDiscount,
    maxDiscount,
    sortBy
  );
};

/**
 * Alternative helper function that builds URLs with complex discount format
 * but avoids URL encoding by constructing the URL manually
 * @param {URLSearchParams} searchParams - Base search parameters
 * @param {number} minDiscount - Minimum discount percentage
 * @param {number} maxDiscount - Maximum discount percentage (optional)
 * @param {string} sortBy - Sort parameter (optional)
 * @returns {string} - URL with complex discount format but clean appearance
 */
const buildDiscountUrlWithComplexFormat = (
  searchParams,
  minDiscount,
  maxDiscount = 100,
  sortBy = null
) => {
  // Add sort parameter if provided
  if (sortBy) {
    const sortMapping = {
      discount_high_to_low: "discount_dsc",
      discount_low_to_high: "discount_asc",
      price_high_to_low: "price_dsc",
      price_low_to_high: "price_asc",
      newest: "latest",
      popular: "popular",
      rating: "rating_dsc",
      customer_rating: "rating_dsc",
      relevance: "relevance",
      name_asc: "name_asc",
      name_desc: "name_dsc",
    };
    const platformSort = sortMapping[sortBy] || sortBy;
    searchParams.set("sort_on", platformSort);
  }

  // Build base parameters manually to avoid URL encoding issues
  const baseParams = Array.from(searchParams.entries())
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  // Add discount parameter in the format expected by Fynd platform
  // Format: discount=[20 TO 99] (no percent signs)
  const discountParam = `discount=[${minDiscount} TO ${maxDiscount}]`;

  const separator = baseParams ? "&" : "";
  return `/products?${baseParams}${separator}${discountParam}`;
};

export const navigationActions = [
  {
    name: "show_products",
    description:
      "Navigate to products listing page when user asks to see products (e.g., 'show me products', 'display products', 'view all products', 'take me to products')",
    timeout: 5000,
    parameters: {
      type: "object",
      properties: {
        search_query: {
          type: "string",
          description: "Optional search query for specific products",
        },
        category: {
          type: "string",
          description: "Optional category filter",
        },
        brand: {
          type: "string",
          description: "Optional brand filter",
        },
      },
      required: [],
    },
    handler: async (params = {}) => {
      try {
        console.log("🔧 [NAVIGATION ACTION] show_products handler called", {
          params,
          currentUrl: window.location.href,
          timestamp: new Date().toISOString(),
        });

        const { search_query, category, brand } = params;

        // Build URL with optional parameters
        const searchParams = new URLSearchParams();

        if (search_query) {
          searchParams.set("q", search_query);
        }

        if (category) {
          searchParams.set("category", category);
        }

        if (brand) {
          searchParams.set("brand", brand);
        }

        const baseUrl = "/products";
        const queryString = searchParams.toString();
        const targetUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

        console.log("🚀 [NAVIGATION ACTION] Navigating to products", {
          targetUrl,
          hasSearch: !!search_query,
          hasCategory: !!category,
          hasBrand: !!brand,
        });

        spaNavigate(targetUrl);

        return {
          success: true,
          message: search_query
            ? `Showing products for "${search_query}"...`
            : "Showing all products...",
          url: targetUrl,
          ...(search_query && { search_query }),
          ...(category && { category }),
          ...(brand && { brand }),
        };
      } catch (error) {
        console.error("❌ [NAVIGATION ACTION] Error in show_products:", error);
        return {
          success: false,
          message: `Failed to show products: ${error.message}`,
          action_required: "system_error",
          error_details: {
            type: error.name,
            message: error.message,
          },
        };
      }
    },
  },
  {
    name: "navigate_to_product_by_position",
    description:
      "Navigate to view a specific product page by its position on the current product listing (e.g., 'show me 4th product', 'go to 2nd product', 'view 3rd product', 'take me to 5th product'). ONLY use for explicit navigation requests, NOT for adding to cart.",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        position: {
          type: "number",
          description:
            "Product position on the page (1-based index, e.g., 1 for first product, 4 for fourth product)",
          minimum: 1,
        },
      },
      required: ["position"],
    },
    handler: async (params) => {
      console.log(
        "🔧 [NAVIGATION ACTION] navigate_to_product_by_position handler called",
        {
          params,
          currentUrl: window.location.href,
          timestamp: new Date().toISOString(),
        }
      );

      try {
        const { position } = params;

        // Check if we're on a product listing page
        const currentPath = window.location.pathname;
        const isProductListingPage =
          currentPath.includes("/products") ||
          currentPath.includes("/collections") ||
          currentPath.includes("/collection/") ||
          currentPath.includes("/categories");

        if (!isProductListingPage) {
          return {
            success: false,
            message:
              "This command works only when you're on a product listing page. Please navigate to a product listing page first.",
            action_required: "navigate_to_products",
            current_page: currentPath,
          };
        }

        // Check FPI availability
        if (!window.fpi) {
          return {
            success: false,
            message: "Unable to access product information. Please try again.",
            action_required: "system_error",
          };
        }

        // Get product list from store first
        let productList = null;
        let dataSource = "none";

        try {
          const state = getFpiState();
          if (state?.custom?.customProductList?.items) {
            productList = state.custom.customProductList.items;
            dataSource = "store";
            console.log(
              "📦 [NAVIGATION ACTION] Using product list from store",
              {
                productCount: productList.length,
              }
            );
          }
        } catch (error) {
          console.warn(
            "❌ [NAVIGATION ACTION] Failed to get products from store:",
            error
          );
        }

        // If no products in store, try to extract from DOM/API
        if (!productList || productList.length === 0) {
          console.log(
            "📡 [NAVIGATION ACTION] No products in store, attempting to fetch from API"
          );

          try {
            // Import the existing function for extracting products
            const { extractProductsFromCurrentPage } = await import(
              "../utils/product-utils.js"
            );
            productList = await extractProductsFromCurrentPage();
            dataSource = "api";
            console.log("📦 [NAVIGATION ACTION] Fetched products from API", {
              productCount: productList.length,
            });
          } catch (error) {
            console.error(
              "❌ [NAVIGATION ACTION] Failed to extract products:",
              error
            );
            return {
              success: false,
              message:
                "Unable to get product list from the current page. Please try refreshing the page.",
              action_required: "refresh_page",
              error_details: error.message,
            };
          }
        }

        if (!productList || productList.length === 0) {
          return {
            success: false,
            message: "No products found on the current page.",
            action_required: "no_products_found",
            debug_info: {
              current_url: window.location.href,
              pathname: window.location.pathname,
              dataSource,
            },
          };
        }

        // Validate position
        if (position < 1 || position > productList.length) {
          const availableProducts = productList
            .slice(0, 5)
            .map((p, i) => `${i + 1}. ${p.name} (${p.slug})`)
            .join("\n");

          return {
            success: false,
            message: `Please specify a valid product position between 1 and ${productList.length}.

Available products:
${availableProducts}${productList.length > 5 ? "\n... and more" : ""}

Try saying "show me the [number] product" where [number] is between 1 and ${productList.length}.`,
            action_required: "invalid_position",
            available_positions: productList.length,
            available_products: productList.slice(0, 10).map((p, i) => ({
              position: i + 1,
              name: p.name,
              slug: p.slug,
            })),
          };
        }

        // Get the product at the specified position (convert to 0-based index)
        const selectedProduct = productList[position - 1];
        const productSlug = selectedProduct.slug;

        if (!productSlug) {
          return {
            success: false,
            message: `Unable to find a valid product identifier for the product at position ${position}.`,
            action_required: "invalid_product_data",
            product_info: {
              name: selectedProduct.name,
              position,
            },
          };
        }

        // Navigate to the product page
        const productUrl = `/product/${productSlug}`;
        console.log("🚀 [NAVIGATION ACTION] Navigating to product", {
          productName: selectedProduct.name,
          productSlug,
          productUrl,
          position,
        });

        spaNavigate(productUrl);

        return {
          success: true,
          message: `Navigating to "${selectedProduct.name}" (position ${position})...`,
          product_info: {
            name: selectedProduct.name,
            slug: productSlug,
            position,
            url: productUrl,
          },
          data_source: dataSource,
        };
      } catch (error) {
        console.error(
          "❌ [NAVIGATION ACTION] Error in navigate_to_product_by_position:",
          error
        );
        return {
          success: false,
          message: `Failed to navigate to product: ${error.message}`,
          action_required: "system_error",
          error_details: {
            type: error.name,
            message: error.message,
          },
        };
      }
    },
  },

  {
    name: "navigate_to_category",
    description:
      "Navigate to a specific predefined category section (e.g., 'go to dresses category', 'show me shoes category', 'navigate to electronics category'). Use only for general category browsing, not for specific product searches.",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        category_name: {
          type: "string",
          description:
            "Name of the category to navigate to (e.g., 'dresses', 'shoes', 'electronics')",
        },
      },
      required: ["category_name"],
    },
    handler: async (params) => {
      console.log(
        "🔧 [NAVIGATION ACTION] navigate_to_category handler called",
        {
          params,
          currentUrl: window.location.href,
          pathname: window.location.pathname,
          timestamp: new Date().toISOString(),
          fpiAvailable: !!window.fpi,
          fpiGettersAvailable: !!window.fpi?.getters,
        }
      );

      try {
        const { category_name } = params;

        // Check if we're on a categories page (allow both /categories and /categories/)
        const currentPath = window.location.pathname;
        const isCategoriesPage =
          currentPath === "/categories" ||
          currentPath.startsWith("/categories/");

        // If not on categories page, still try to help but give a helpful message
        if (!isCategoriesPage) {
          console.log(
            "ℹ️ [NAVIGATION ACTION] Not on categories page, but proceeding to help navigate to category",
            {
              currentPath,
              requestedCategory: category_name,
            }
          );
        }

        // Check FPI availability
        if (!window.fpi) {
          return {
            success: false,
            message: "Unable to access category information. Please try again.",
            action_required: "system_error",
          };
        }

        // Get categories from store first using the correct FPI getter
        let categoriesList = null;
        let dataSource = "none";

        try {
          // Use FPI getter like the real useCategories hook does
          const CATEGORIES = window.fpi?.getters?.CATEGORIES;

          if (CATEGORIES?.data && Array.isArray(CATEGORIES.data)) {
            // Transform the categories data exactly like in useCategories hook
            const transformCategoriesData = (data) => {
              return data
                ?.flatMap((item) => item?.items?.map((m) => m.childs))
                .flat()
                .flatMap((i) => i?.childs)
                .filter(Boolean); // Remove any null/undefined entries
            };

            categoriesList = transformCategoriesData(CATEGORIES.data);
            dataSource = "store_FPI_CATEGORIES";
            console.log(
              "📦 [NAVIGATION ACTION] Using categories from FPI store",
              {
                rawDataLength: CATEGORIES.data.length,
                categoryCount: categoriesList?.length || 0,
                sampleCategories:
                  categoriesList
                    ?.slice(0, 3)
                    .map((c) => ({ name: c.name, slug: c.slug })) || [],
              }
            );
          }
        } catch (error) {
          console.warn(
            "❌ [NAVIGATION ACTION] Failed to get categories from FPI store:",
            error
          );
        }

        // If no categories in store, fetch from API
        if (!categoriesList || categoriesList.length === 0) {
          console.log(
            "📡 [NAVIGATION ACTION] No categories in store, fetching from API"
          );

          try {
            const result = await window.fpi.executeGQL(CATEGORIES_LISTING);
            if (result?.data?.categories?.data?.length > 0) {
              // Use the same transformation function as above
              const transformCategoriesData = (data) => {
                return data
                  ?.flatMap((item) => item?.items?.map((m) => m.childs))
                  .flat()
                  .flatMap((i) => i?.childs)
                  .filter(Boolean); // Remove any null/undefined entries
              };

              categoriesList = transformCategoriesData(
                result.data.categories.data
              );
              dataSource = "api";
              console.log(
                "📦 [NAVIGATION ACTION] Fetched categories from API",
                {
                  rawDataLength: result.data.categories.data.length,
                  categoryCount: categoriesList?.length || 0,
                  sampleCategories:
                    categoriesList
                      ?.slice(0, 3)
                      .map((c) => ({ name: c.name, slug: c.slug })) || [],
                }
              );
            }
          } catch (error) {
            console.error(
              "❌ [NAVIGATION ACTION] Failed to fetch categories:",
              error
            );
            return {
              success: false,
              message:
                "Unable to get categories list. Please try refreshing the page.",
              action_required: "refresh_page",
              error_details: error.message,
            };
          }
        }

        if (!categoriesList || categoriesList.length === 0) {
          return {
            success: false,
            message: "No categories found.",
            action_required: "no_categories_found",
            debug_info: {
              current_url: window.location.href,
              pathname: window.location.pathname,
              dataSource,
            },
          };
        }

        // Search for the category by name (case-insensitive with multiple strategies)
        const searchTerm = category_name.toLowerCase().trim();

        // Try exact match first
        let matchedCategory = categoriesList.find(
          (category) =>
            category.name?.toLowerCase() === searchTerm ||
            category.slug?.toLowerCase() === searchTerm
        );

        // If no exact match, try partial match
        if (!matchedCategory) {
          matchedCategory = categoriesList.find(
            (category) =>
              category.name?.toLowerCase().includes(searchTerm) ||
              category.slug?.toLowerCase().includes(searchTerm)
          );
        }

        // If still no match, try reverse partial match (search term contains category name)
        if (!matchedCategory) {
          matchedCategory = categoriesList.find(
            (category) =>
              searchTerm.includes(category.name?.toLowerCase()) ||
              searchTerm.includes(category.slug?.toLowerCase())
          );
        }

        if (!matchedCategory) {
          // Provide helpful suggestions
          const availableCategories = categoriesList
            .slice(0, 10)
            .map((cat) => `• ${cat.name} (${cat.slug})`)
            .join("\n");

          const similarCategories = categoriesList
            .filter(
              (cat) =>
                cat.name?.toLowerCase().includes(searchTerm.substring(0, 3)) ||
                searchTerm.includes(cat.name?.toLowerCase().substring(0, 3))
            )
            .slice(0, 5)
            .map((cat) => cat.name)
            .join(", ");

          return {
            success: false,
            message: `Category "${category_name}" not found.${
              similarCategories ? `\n\nDid you mean: ${similarCategories}?` : ""
            }

Available categories:
${availableCategories}${categoriesList.length > 10 ? "\n... and more" : ""}`,
            action_required: "category_not_found",
            available_categories: categoriesList.slice(0, 20).map((cat) => ({
              name: cat.name,
              slug: cat.slug,
            })),
            search_term: category_name,
          };
        }

        // Build the category URL based on the action or slug - ALWAYS use /products
        let categoryUrl;
        if (matchedCategory.action?.page?.query) {
          // Use the action query parameters but force /products as the base path
          const query = matchedCategory.action.page.query;
          const queryParams = new URLSearchParams();

          Object.entries(query).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              // For arrays, join with & to create multiple parameters with same key
              value.forEach((v) => queryParams.append(key, v));
            } else {
              queryParams.set(key, value);
            }
          });

          categoryUrl = `/products?${queryParams.toString()}`;

          console.log("🔍 [NAVIGATION ACTION] Using category action query", {
            originalAction: matchedCategory.action,
            queryObject: query,
            finalUrl: categoryUrl,
          });
        } else {
          // Fallback to slug-based URL
          categoryUrl = `/products?category=${matchedCategory.slug}`;

          console.log("🔍 [NAVIGATION ACTION] Using fallback slug-based URL", {
            slug: matchedCategory.slug,
            finalUrl: categoryUrl,
          });
        }

        console.log("🚀 [NAVIGATION ACTION] Navigating to category", {
          categoryName: matchedCategory.name,
          categorySlug: matchedCategory.slug,
          categoryUrl,
        });

        spaNavigate(categoryUrl);

        return {
          success: true,
          message: `Navigating to "${matchedCategory.name}" category...`,
          category_info: {
            name: matchedCategory.name,
            slug: matchedCategory.slug,
            url: categoryUrl,
          },
          data_source: dataSource,
        };
      } catch (error) {
        console.error(
          "❌ [NAVIGATION ACTION] Error in navigate_to_category:",
          error
        );
        return {
          success: false,
          message: `Failed to navigate to category: ${error.message}`,
          action_required: "system_error",
          error_details: {
            type: error.name,
            message: error.message,
          },
        };
      }
    },
  },

  {
    name: "universal_navigate",
    description:
      "Universal navigation action for general site navigation and filtered browsing with specific criteria (e.g., 'go to home', 'take me to cart', 'browse dresses under 500 with 20% discount', 'show me highest discounted products', 'find least discounted items'). Use for navigation with filters, not simple product searches.",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        destination: {
          type: "string",
          description:
            "Natural language description of where to navigate (e.g., 'home', 'cart', 'profile', 'wishlist', 'login', 'checkout', 'orders', 'brands', 'categories', 'collections', 'blog', 'contact us', 'terms', 'privacy policy', etc.)",
        },
        specific_id: {
          type: "string",
          description:
            "Optional specific identifier like product slug, collection slug, blog post slug, etc. (e.g., for 'go to product shirt-abc' or 'show collection summer-wear')",
        },
        search_query: {
          type: "string",
          description:
            "Optional search query for products page (e.g., 'search for shoes')",
        },
        filters: {
          type: "object",
          description:
            "Optional filters for products/collections (e.g., {category: 'dresses', brand: 'nike', min_price: 100, max_price: 500, discount: 50, size_depth: '1 to 4', image_nature: 'standard', is_custom_order: false})",
          properties: {
            category: { type: "string" },
            brand: { type: "string" },
            department: { type: "string" },
            color: { type: "string" },
            sizes: { type: "string" },
            size_depth: {
              type: "string",
              description:
                "Size depth range filter (e.g., '1 to 4', '2-5', '3 TO 7', or single value '5')",
            },
            image_nature: {
              type: "string",
              description:
                "Filter by image type or characteristics (e.g., 'standard','default)",
            },
            is_custom_order: {
              type: "boolean",
              description:
                "Filter by product availability (false = ready to ship, true = custom/made-to-order)",
            },
            min_price: { type: "number" },
            max_price: { type: "number" },
            discount: {
              type: "number",
              description: "Minimum discount percentage (e.g., 20 for 20% off)",
            },
            min_discount: {
              type: "number",
              description: "Minimum discount percentage",
            },
            max_discount: {
              type: "number",
              description: "Maximum discount percentage",
            },
            sort_by: {
              type: "string",
              description:
                "Sort products by: 'price_low_to_high', 'price_high_to_low', 'discount_high_to_low', 'discount_low_to_high', 'newest', 'popular', 'rating', 'relevance', 'customer_rating', 'name_asc', 'name_desc'",
            },
            size_depth: {
              type: "string",
              description:
                "Filter by size depth range (e.g., '1 to 4', '2-5', '8'). Single numbers filter for exact size depth.",
            },
          },
        },
      },
      required: ["destination"],
    },
    handler: async (params) => {
      console.log("🔧 [NAVIGATION ACTION] universal_navigate handler called", {
        params,
        currentUrl: window.location.href,
        timestamp: new Date().toISOString(),
      });

      try {
        const { destination, specific_id, search_query, filters = {} } = params;
        const dest = destination.toLowerCase().trim();

        // 🔧 FIXED: Discount filter URL encoding issue
        // Previous format: discount=[5,% TO 100,%] → got URL encoded to ugly format
        // New approach:
        // 1. Simple format: discount_min=5 (cleaner URLs)
        // 2. Complex format built manually (if needed) to avoid URL encoding
        // Result: Clean URLs like /products?discount_min=5 instead of encoded mess

        // 🚀 ENHANCED: Natural language processing for discount-based requests
        let enhancedFilters = { ...filters };
        let enhancedDestination = dest;

        // Parse natural language discount requests
        if (
          dest.includes("highest discount") ||
          dest.includes("most discount") ||
          dest.includes("maximum discount") ||
          dest.includes("best discount") ||
          dest.includes("heavily discount") ||
          dest.includes("biggest discount")
        ) {
          enhancedDestination = "products";
          enhancedFilters.sort_by = "discount_high_to_low";
          enhancedFilters.min_discount = enhancedFilters.min_discount || 10; // Show products with at least 10% discount
        } else if (
          dest.includes("least discount") ||
          dest.includes("lowest discount") ||
          dest.includes("minimum discount") ||
          dest.includes("smallest discount") ||
          dest.includes("little discount") ||
          dest.includes("low discount")
        ) {
          enhancedDestination = "products";
          enhancedFilters.sort_by = "discount_low_to_high";
          enhancedFilters.max_discount = enhancedFilters.max_discount || 25; // Show products with up to 25% discount
        } else if (
          dest.includes("discount") &&
          (dest.includes("high to low") || dest.includes("descending"))
        ) {
          enhancedDestination = "products";
          enhancedFilters.sort_by = "discount_high_to_low";
        } else if (
          dest.includes("discount") &&
          (dest.includes("low to high") || dest.includes("ascending"))
        ) {
          enhancedDestination = "products";
          enhancedFilters.sort_by = "discount_low_to_high";
        }

        // 🚀 ENHANCED: Natural language processing for sorting requests
        if (
          dest.includes("popular") ||
          dest.includes("trending") ||
          dest.includes("best selling") ||
          dest.includes("bestselling") ||
          dest.includes("most popular") ||
          dest.includes("top selling")
        ) {
          enhancedDestination = "products";
          enhancedFilters.sort_by = "popular";
        } else if (
          dest.includes("newest") ||
          dest.includes("latest") ||
          dest.includes("recent") ||
          dest.includes("new arrivals") ||
          dest.includes("most recent")
        ) {
          enhancedDestination = "products";
          enhancedFilters.sort_by = "newest";
        } else if (
          dest.includes("highest rated") ||
          dest.includes("best rated") ||
          dest.includes("top rated") ||
          dest.includes("highest rating") ||
          dest.includes("best rating")
        ) {
          enhancedDestination = "products";
          enhancedFilters.sort_by = "rating";
        } else if (
          dest.includes("cheapest") ||
          dest.includes("lowest price") ||
          dest.includes("most affordable") ||
          (dest.includes("price") &&
            (dest.includes("low to high") || dest.includes("ascending")))
        ) {
          enhancedDestination = "products";
          enhancedFilters.sort_by = "price_low_to_high";
        } else if (
          dest.includes("most expensive") ||
          dest.includes("highest price") ||
          dest.includes("premium") ||
          (dest.includes("price") &&
            (dest.includes("high to low") || dest.includes("descending")))
        ) {
          enhancedDestination = "products";
          enhancedFilters.sort_by = "price_high_to_low";
        } else if (
          dest.includes("alphabetical") ||
          dest.includes("name") ||
          dest.includes("a to z") ||
          (dest.includes("alphabetically") && dest.includes("ascending"))
        ) {
          enhancedDestination = "products";
          enhancedFilters.sort_by = "name_asc";
        } else if (
          dest.includes("z to a") ||
          (dest.includes("name") &&
            (dest.includes("descending") || dest.includes("reverse"))) ||
          (dest.includes("alphabetically") && dest.includes("descending"))
        ) {
          enhancedDestination = "products";
          enhancedFilters.sort_by = "name_desc";
        } else if (
          dest.includes("relevance") ||
          dest.includes("relevant") ||
          dest.includes("most relevant")
        ) {
          enhancedDestination = "products";
          enhancedFilters.sort_by = "relevance";
        } else if (
          dest.includes("customer rating") ||
          dest.includes("user rating") ||
          dest.includes("reviews")
        ) {
          enhancedDestination = "products";
          enhancedFilters.sort_by = "customer_rating";
        } else if (
          dest.includes("size depth") ||
          dest.includes("largest size") ||
          dest.includes("biggest size") ||
          dest.includes("size high to low") ||
          (dest.includes("size") && dest.includes("descending"))
        ) {
          enhancedDestination = "products";

          // Extract size numbers from natural language
          const sizeMatch =
            dest.match(/size\s*(\d+)/i) || dest.match(/(\d+)\s*size/i);
          const rangeMatch = dest.match(/(\d+)\s*(?:to|-)\s*(\d+)/i);

          if (rangeMatch) {
            // Range like "size 6 to 8" or "6-10"
            enhancedFilters.size_depth = `${rangeMatch[1]} to ${rangeMatch[2]}`;
          } else if (sizeMatch) {
            // Single size like "size 8" or "8 size"
            enhancedFilters.size_depth = sizeMatch[1];
          } else {
            // Default to size depth 8 if no specific size mentioned
            enhancedFilters.size_depth = "8";
          }
        }

        // 🚀 ENHANCED: Natural language processing for shipping/availability requests
        if (dest.includes("ready to ship")) {
          enhancedDestination = "products";
          enhancedFilters.is_custom_order = false; // Ready to ship products
        } else if (
          dest.includes("custom order") ||
          dest.includes("made to order") ||
          dest.includes("custom made") ||
          dest.includes("bespoke") ||
          dest.includes("personalized")
        ) {
          enhancedDestination = "products";
          enhancedFilters.is_custom_order = true; // Custom order products
        }

        // Update references to use enhanced values
        const finalDestination = enhancedDestination;
        const finalFilters = enhancedFilters;

        // Define comprehensive route mappings
        const routeMappings = {
          // Main pages
          home: "/",
          homepage: "/",
          "main page": "/",
          index: "/",

          // Authentication
          login: "/auth/login",
          signin: "/auth/login",
          "sign in": "/auth/login",
          register: "/auth/register",
          signup: "/auth/register",
          "sign up": "/auth/register",
          "forgot password": "/auth/forgot-password",
          "reset password": "/auth/forgot-password",
          "set password": "/auth/set-password",

          // Shopping
          products: "/products",
          "product listing": "/products",
          "product list": "/products",
          shop: "/products",
          shopping: "/products",
          browse: "/products",
          cart: "/cart",
          "shopping cart": "/cart",
          basket: "/cart",
          checkout: "/checkout",
          payment: "/checkout",
          wishlist: "/wishlist",
          favorites: "/wishlist",
          "wish list": "/wishlist",
          "saved items": "/wishlist",

          // Categories & Collections
          categories: "/categories",
          category: "/categories",
          collections: "/collections",
          collection: "/collections",
          brands: "/brands",
          brand: "/brands",

          // Profile & Account
          profile: "/profile/details",
          account: "/profile/details",
          "my account": "/profile/details",
          "profile details": "/profile/details",
          "edit profile": "/profile/edit-profile",
          "profile address": "/profile/address",
          address: "/profile/address",
          addresses: "/profile/address",
          "my addresses": "/profile/address",
          orders: "/profile/orders",
          "my orders": "/profile/orders",
          "order history": "/profile/orders",
          "order list": "/profile/orders",

          // Order tracking
          "order tracking": "/order-tracking",
          "track order": "/order-tracking",
          "order status": "/order-status",

          // Support & Info
          blog: "/blog",
          "contact us": "/contact-us",
          contact: "/contact-us",
          support: "/contact-us",
          help: "/contact-us",
          faq: "/faq",
          "frequently asked questions": "/faq",
          "about us": "/about-us",
          about: "/about-us",
          "locate us": "/locate-us",
          location: "/locate-us",
          stores: "/locate-us",

          // Policies
          "terms and conditions": "/terms-and-conditions",
          terms: "/terms-and-conditions",
          tnc: "/terms-and-conditions",
          "privacy policy": "/privacy-policy",
          privacy: "/privacy-policy",
          "shipping policy": "/shipping-policy",
          shipping: "/shipping-policy",
          "return policy": "/returns-and-exchange",
          returns: "/returns-and-exchange",
          "exchange policy": "/returns-and-exchange",
          refund: "/refund",

          // Comparison
          compare: "/compare",
          comparison: "/compare",
          "compare products": "/compare",

          // Sharing
          "shared cart": "/shared-cart",
        };

        // Handle specific destinations with IDs
        if (specific_id) {
          if (dest.includes("product")) {
            const productUrl = `/product/${specific_id}`;
            spaNavigate(productUrl);
            return {
              success: true,
              message: `Navigating to product: ${specific_id}`,
              url: productUrl,
            };
          }

          if (dest.includes("collection")) {
            const collectionUrl = `/collection/${specific_id}`;
            spaNavigate(collectionUrl);
            return {
              success: true,
              message: `Navigating to collection: ${specific_id}`,
              url: collectionUrl,
            };
          }

          if (dest.includes("blog")) {
            const blogUrl = `/blog/${specific_id}`;
            spaNavigate(blogUrl);
            return {
              success: true,
              message: `Navigating to blog post: ${specific_id}`,
              url: blogUrl,
            };
          }

          if (dest.includes("order") && dest.includes("track")) {
            const trackingUrl = `/order-tracking/${specific_id}`;
            spaNavigate(trackingUrl);
            return {
              success: true,
              message: `Tracking order: ${specific_id}`,
              url: trackingUrl,
            };
          }
        }

        // Handle search queries
        if (
          search_query &&
          (finalDestination.includes("search") ||
            finalDestination.includes("product"))
        ) {
          const searchParams = new URLSearchParams();
          searchParams.set("q", search_query);

          let hasDiscountFilter = false;
          let minDiscount = 0;
          let maxDiscount = 99;

          // Add filters if provided
          Object.entries(finalFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              if (key === "min_price" || key === "max_price") {
                // Handle price filters
                const minPrice = finalFilters.min_price || 0;
                const maxPrice = finalFilters.max_price || 999999;
                searchParams.set(
                  "min_price_effective",
                  `[${minPrice},INR TO ${maxPrice},INR]`
                );
              } else if (key === "size_depth") {
                // Handle size_depth range filter (e.g., "1 to 4" -> "[1 TO 4]")
                const parsedRange = parseSizeDepthRange(value);
                if (parsedRange) {
                  searchParams.set("size_depth", parsedRange);
                }
              } else if (key === "discount" || key === "min_discount") {
                // Track discount filter for clean URL building
                hasDiscountFilter = true;
                minDiscount = value;
              } else if (key === "max_discount") {
                // Track maximum discount filter
                hasDiscountFilter = true;
                maxDiscount = value;
                if (!finalFilters.min_discount && !finalFilters.discount) {
                  minDiscount = 0;
                }
              } else if (key === "sort_by") {
                // Handle sort_by mapping to platform sort_on values
                const sortMapping = {
                  discount_high_to_low: "discount_dsc",
                  discount_low_to_high: "discount_asc",
                  price_high_to_low: "price_dsc",
                  price_low_to_high: "price_asc",
                  newest: "latest",
                  popular: "popular",
                  rating: "rating_dsc",
                  customer_rating: "rating_dsc",
                  relevance: "relevance",
                  name_asc: "name_asc",
                  name_desc: "name_dsc",
                };
                const platformSort = sortMapping[value] || value;
                searchParams.set("sort_on", platformSort);
              } else {
                searchParams.set(key, value);
              }
            }
          });

          let searchUrl;
          if (hasDiscountFilter) {
            // Use helper function for clean discount URLs
            searchUrl = buildDiscountUrl(
              searchParams,
              minDiscount,
              maxDiscount,
              finalFilters.sort_by
            );
          } else {
            searchUrl = `/products?${searchParams.toString()}`;
          }

          spaNavigate(searchUrl);
          return {
            success: true,
            message: `Searching for: ${search_query}`,
            url: searchUrl,
            filters: finalFilters,
          };
        }

        // Handle filtered product browsing
        if (
          Object.keys(finalFilters).length > 0 &&
          (finalDestination.includes("product") ||
            finalDestination.includes("shop") ||
            finalDestination.includes("browse"))
        ) {
          const searchParams = new URLSearchParams();

          let hasDiscountFilter = false;
          let minDiscount = 0;
          let maxDiscount = 99;

          Object.entries(finalFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              if (key === "min_price" || key === "max_price") {
                const minPrice = finalFilters.min_price || 0;
                const maxPrice = finalFilters.max_price || 999999;
                searchParams.set(
                  "min_price_effective",
                  `[${minPrice},INR TO ${maxPrice},INR]`
                );
              } else if (key === "size_depth") {
                // Handle size_depth range filter (e.g., "1 to 4" -> "[1 TO 4]")
                const parsedRange = parseSizeDepthRange(value);
                if (parsedRange) {
                  searchParams.set("size_depth", parsedRange);
                }
              } else if (key === "discount" || key === "min_discount") {
                // Track discount filter for clean URL building
                hasDiscountFilter = true;
                minDiscount = value;
              } else if (key === "max_discount") {
                // Track maximum discount filter
                hasDiscountFilter = true;
                maxDiscount = value;
                if (!finalFilters.min_discount && !finalFilters.discount) {
                  minDiscount = 0;
                }
              } else if (key === "sort_by") {
                // Handle sort_by mapping to platform sort_on values
                const sortMapping = {
                  discount_high_to_low: "discount_dsc",
                  discount_low_to_high: "discount_asc",
                  price_high_to_low: "price_dsc",
                  price_low_to_high: "price_asc",
                  newest: "latest",
                  popular: "popular",
                  rating: "rating_dsc",
                  customer_rating: "rating_dsc",
                  relevance: "relevance",
                  name_asc: "name_asc",
                  name_desc: "name_dsc",
                };
                const platformSort = sortMapping[value] || value;
                searchParams.set("sort_on", platformSort);
              } else {
                searchParams.set(key, value);
              }
            }
          });

          let filteredUrl;
          if (hasDiscountFilter) {
            // Use helper function for clean discount URLs
            filteredUrl = buildDiscountUrl(
              searchParams,
              minDiscount,
              maxDiscount,
              finalFilters.sort_by
            );
          } else {
            filteredUrl = `/products?${searchParams.toString()}`;
          }

          spaNavigate(filteredUrl);
          return {
            success: true,
            message: `Browsing products with filters: ${JSON.stringify(finalFilters)}`,
            url: filteredUrl,
            filters: finalFilters,
          };
        }

        // Try exact match first
        let targetUrl = routeMappings[finalDestination];

        // If no exact match, try partial matching
        if (!targetUrl) {
          const matchedKey = Object.keys(routeMappings).find(
            (key) =>
              key.includes(finalDestination) || finalDestination.includes(key)
          );
          if (matchedKey) {
            targetUrl = routeMappings[matchedKey];
          }
        }

        // Special case handling for common variations
        if (!targetUrl) {
          if (
            finalDestination.includes("product") &&
            !finalDestination.includes("listing")
          ) {
            targetUrl = "/products";
          } else if (
            finalDestination.includes("order") &&
            !finalDestination.includes("tracking")
          ) {
            targetUrl = "/profile/orders";
          } else if (finalDestination.includes("address")) {
            targetUrl = "/profile/address";
          } else if (
            finalDestination.includes("policy") ||
            finalDestination.includes("term")
          ) {
            targetUrl = "/terms-and-conditions";
          } else if (finalDestination.includes("track")) {
            targetUrl = "/order-tracking";
          }
        }

        if (!targetUrl) {
          // Provide helpful suggestions
          const suggestions = Object.keys(routeMappings)
            .filter(
              (key) =>
                key.substring(0, 2) === dest.substring(0, 2) ||
                dest.substring(0, 2) === key.substring(0, 2)
            )
            .slice(0, 5)
            .join(", ");

          return {
            success: false,
            message: `Destination "${destination}" not recognized. ${
              suggestions ? `Did you mean: ${suggestions}?` : ""
            }

Available destinations include:
• home, products, cart, wishlist, checkout
• categories, collections, brands
• profile, orders, addresses
• blog, contact us, about us
• login, register
• terms, privacy policy, shipping policy
• order tracking, compare

You can also use specific commands like:
• "go to product [product-slug]"
• "show collection [collection-slug]"
• "search for [query]"
• "browse [category] products"
• "search for shoes with discount 30" (products with 30%+ discount)
• "browse dresses with min_price 100, max_price 500, discount 20"`,
            action_required: "destination_not_found",
            available_destinations: Object.keys(routeMappings).slice(0, 20),
            search_term: destination,
          };
        }

        // Handle special cases where specific_id should modify the URL
        if (specific_id) {
          if (dest.includes("category") || dest.includes("categories")) {
            // For categories with specific_id, redirect to product listing with category filter
            console.log(
              "🔄 [NAVIGATION ACTION] Category with specific_id detected, redirecting to products",
              {
                destination,
                specific_id,
                originalTargetUrl: targetUrl,
              }
            );

            targetUrl = `/products?category=${encodeURIComponent(specific_id)}`;
          } else if (dest.includes("product") && !targetUrl.includes("?")) {
            // For products with specific_id, append as slug
            targetUrl = `${targetUrl}/${specific_id}`;
          } else if (dest.includes("collection") && !targetUrl.includes("?")) {
            // For collections with specific_id, append as slug
            targetUrl = `${targetUrl}/${specific_id}`;
          } else if (dest.includes("brand") && !targetUrl.includes("?")) {
            // For brands with specific_id, append as slug
            targetUrl = `${targetUrl}/${specific_id}`;
          }
        }

        console.log("🚀 [NAVIGATION ACTION] Universal navigation", {
          destination,
          targetUrl,
          specific_id,
          search_query,
          filters,
          discount_filters: {
            discount_range:
              filters.discount || filters.min_discount
                ? `[${filters.discount || filters.min_discount},% TO ${filters.max_discount || 100},%]`
                : null,
          },
        });

        spaNavigate(targetUrl);

        return {
          success: true,
          message: `Navigating to ${destination}...`,
          url: targetUrl,
          destination: destination,
          ...(specific_id && { specific_id }),
          ...(search_query && { search_query }),
          ...(Object.keys(filters).length > 0 && { filters }),
        };
      } catch (error) {
        console.error(
          "❌ [NAVIGATION ACTION] Error in universal_navigate:",
          error
        );
        return {
          success: false,
          message: `Failed to navigate: ${error.message}`,
          action_required: "system_error",
          error_details: {
            type: error.name,
            message: error.message,
          },
        };
      }
    },
  },
];
