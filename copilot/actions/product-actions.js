import {
  getProductInfo,
  extractProductsFromCurrentPage,
} from "../utils/product-utils.js";
import {
  createErrorResponse,
  createSuccessResponse,
  getCurrentPincodeFromStore,
} from "../utils/common-utils.js";

export const productActions = [
  {
    name: "get_product_info",
    description:
      "Get detailed product information including availability, sizes, and pricing",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        product_id: {
          type: "string",
          description: "Product ID, SKU, or product slug",
        },
        pincode: {
          type: "string",
          description:
            "6-digit pincode to check availability and pricing - will automatically use stored pincode if available",
        },
      },
      required: ["product_id"],
    },
    handler: async ({ product_id, pincode }) => {
      // Auto-fill pincode from store if not provided
      const targetPincode = pincode || getCurrentPincodeFromStore();
      return await getProductInfo({ product_id, pincode: targetPincode });
    },
  },

  {
    name: "list_products_on_page",
    description:
      "List all products currently visible on the product listing page with their positions",
    timeout: 10000,
    handler: async () => {
      try {
        // Check if we're on a product listing page
        const currentPath = window.location.pathname;
        const isProductListingPage =
          currentPath.includes("/products") ||
          currentPath.includes("/collections") ||
          currentPath.includes("/categories") ||
          currentPath.includes("/brands");

        if (!isProductListingPage) {
          return createErrorResponse(
            false,
            "This command works only when you're on a product listing page. Please navigate to a product page first.",
            "navigate_to_products"
          );
        }

        // Get products from the current page
        const products = await extractProductsFromCurrentPage();

        if (!products || products.length === 0) {
          return createErrorResponse(
            false,
            "No products found on the current page.",
            null,
            {
              debug_info: {
                current_url: window.location.href,
                pathname: window.location.pathname,
                search_params: Object.fromEntries(
                  new URLSearchParams(window.location.search)
                ),
              },
            }
          );
        }

        // Format product list for display
        const productList = products
          .map(
            (product, index) =>
              `${index + 1}. ${product.name}${product.brand ? ` (${product.brand})` : ""}
       Slug: ${product.slug || "N/A"}${product.price ? ` | Price: ${JSON.stringify(product.price)}` : ""}`
          )
          .join("\n\n");

        return createSuccessResponse(
          `Found ${products.length} products on this page:

${productList}

You can now say things like:
• "Add the 3rd product to cart"
• "Add 5 products to cart"
• "Add the first product to cart"

TIP: Products are identified by their unique slugs for accuracy!
Each product will be added using its slug identifier shown above.`,
          {
            total_products: products.length,
            products: products.map((p, i) => ({
              position: i + 1,
              name: p.name,
              brand: p.brand,
              slug: p.slug,
              uid: p.uid,
              price: p.price,
              identifier: p.slug || p.uid, // Show which identifier will be used
            })),
            page_info: {
              url: window.location.href,
              pathname: window.location.pathname,
              search_params: Object.fromEntries(
                new URLSearchParams(window.location.search)
              ),
            },
          }
        );
      } catch (error) {
        console.error("List products error:", error);
        return createErrorResponse(
          false,
          `Failed to list products: ${error.message}`,
          "system_error"
        );
      }
    },
  },
];
