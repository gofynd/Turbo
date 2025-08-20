import {
  addToCart,
  checkPincodeDelivery,
  clearCart,
} from "../utils/cart-utils.js";
import { extractProductsFromCurrentPage } from "../utils/product-utils.js";
import { spaNavigate } from "../../theme/helper/utils";
import { getCurrentPincodeFromStore } from "../utils/common-utils.js";

export const cartActions = [
  {
    name: "add_to_cart_from_pdp",
    description:
      "Add to cart, add this product to cart, add current product, or add the displayed product when viewing a product page. Automatically detects the current product and handles size selection intelligently.",
    timeout: 15000,
    parameters: {
      type: "object",
      properties: {
        quantity: {
          type: "number",
          description: "Quantity to add to cart",
          default: 1,
          minimum: 1,
        },
        size: {
          type: "string",
          description:
            "Product size (if applicable) - will ask user if required but not provided",
        },
        pincode: {
          type: "string",
          description:
            "6-digit delivery pincode - will automatically use stored pincode if available, otherwise ask user",
        },
        color: {
          type: "string",
          description:
            "Product color (if applicable) - will ask user if required but not provided",
        },
      },
      required: [],
    },
    handler: async (params = {}) => {
      console.log("🔧 [CART ACTION] add_to_cart_from_pdp handler called", {
        params,
        currentUrl: window.location.href,
        timestamp: new Date().toISOString(),
      });

      try {
        // Check if we're on a PDP page and extract slug
        const currentPath = window.location.pathname;
        const pdpMatch = currentPath.match(
          /^(?:\/[a-zA-Z-]+)?\/product\/([^/]+)\/?$/i
        );

        if (!pdpMatch) {
          return {
            success: false,
            message:
              "This action only works when you're viewing a specific product page. Please navigate to a product page first.",
            action_required: "navigate_to_product",
            current_page: window.location.pathname,
          };
        }

        const productSlug = pdpMatch[1]; // Extract slug from URL

        // Check FPI availability
        if (!window.fpi) {
          return {
            success: false,
            message: "Unable to access product information. Please try again.",
            action_required: "system_error",
          };
        }

        // Get current product information from the global store
        let productData;
        try {
          const state = window.fpi.store.getState();

          // Access PRODUCT data from store
          productData = state.product;

          // Also check if there's another way the product data might be stored
          if (!productData) {
            // Check available keys in store for debugging
            const storeKeys = Object.keys(state || {});
          }
        } catch (error) {
          return {
            success: false,
            message: "Unable to access store data. Please try again.",
            action_required: "store_access_error",
          };
        }

        if (!productData || !productData.product_details) {
          return {
            success: false,
            message:
              "Product information is not available. Please wait for the page to load completely or refresh the page.",
            action_required: "page_loading",
            debug_info: {
              hasProductData: !!productData,
              storeKeys: Object.keys(window.fpi.store.getState() || {}),
              extractedSlug: productSlug,
            },
          };
        }

        const { product_details, product_meta, product_price_by_slug } =
          productData;

        if (!product_details || !product_details.uid) {
          return {
            success: false,
            message:
              "Unable to identify the current product. Please refresh the page and try again.",
            action_required: "refresh_page",
          };
        }

        // Extract product information
        const productId = product_details.uid;
        const productName = product_details.name || "Unknown Product";
        const productSlugFromStore = product_details.slug;

        // Check if product has sizes - use the sizes from product_meta
        const availableSizes = product_meta?.sizes?.sizes || [];
        const hasMultipleSizes = availableSizes.length > 1;
        const hasSizes = availableSizes.length > 0;

        // Handle size requirement
        let selectedSize = params.size;

        if (hasSizes && !selectedSize) {
          if (hasMultipleSizes) {
            // Multiple sizes available - user must select
            const sizeOptions = availableSizes
              .filter((s) => s.is_available)
              .map((s) => s.display)
              .join(", ");

            return {
              success: false,
              message: `Please select a size for "${productName}". Available sizes: ${sizeOptions}`,
              action_required: "size_selection_required",
              available_sizes: availableSizes
                .filter((s) => s.is_available)
                .map((s) => ({
                  display: s.display,
                  value: s.value,
                  is_available: s.is_available,
                })),
              product_info: {
                name: productName,
                slug: productSlugFromStore || productSlug,
                uid: productId,
              },
            };
          } else {
            // Single size available - auto-select it
            const onlySize = availableSizes[0];
            if (onlySize && onlySize.is_available) {
              selectedSize = onlySize.value;
            } else {
              return {
                success: false,
                message: `The size for "${productName}" is currently out of stock.`,
                action_required: "size_unavailable",
              };
            }
          }
        }

        // Validate selected size if provided
        if (selectedSize && hasSizes) {
          const sizeExists = availableSizes.find(
            (s) => s.value === selectedSize || s.display === selectedSize
          );
          if (!sizeExists) {
            const availableSizeDisplays = availableSizes
              .filter((s) => s.is_available)
              .map((s) => s.display)
              .join(", ");
            return {
              success: false,
              message: `Size "${selectedSize}" is not available for "${productName}". Available sizes: ${availableSizeDisplays}`,
              action_required: "invalid_size",
              available_sizes: availableSizes
                .filter((s) => s.is_available)
                .map((s) => ({
                  display: s.display,
                  value: s.value,
                })),
            };
          }

          if (!sizeExists.is_available) {
            return {
              success: false,
              message: `Size "${selectedSize}" is currently out of stock for "${productName}".`,
              action_required: "size_out_of_stock",
            };
          }

          // Normalize size value
          selectedSize = sizeExists.value;
        }

        // Use the existing addToCart function with the current product information
        const addToCartParams = {
          product_id: productSlugFromStore || productSlug, // Use slug from store or URL
          quantity: params.quantity || 1,
          pincode: params.pincode || getCurrentPincodeFromStore(), // Auto-fill from store if not provided
        };

        // Add size if required
        if (selectedSize) {
          addToCartParams.size = selectedSize;
        }

        // Add color if provided
        if (params.color) {
          addToCartParams.color = params.color;
        }

        // Call the existing addToCart function
        console.log(
          "🚀 [CART ACTION] PDP calling addToCart with params",
          addToCartParams
        );
        const result = await addToCart(addToCartParams);
        console.log("📋 [CART ACTION] PDP addToCart result", {
          success: result.success,
          message: result.message,
        });

        // Enhance the response with PDP-specific information
        if (result.success) {
          return {
            ...result,
            message: `Successfully added "${productName}" to cart! ${
              selectedSize ? `Size: ${selectedSize}. ` : ""
            }${result.message || ""}`.trim(),
            product_info: {
              name: productName,
              slug: productSlugFromStore || productSlug,
              uid: productId,
              selected_size: selectedSize,
              quantity: params.quantity || 1,
            },
            action_completed: "pdp_add_to_cart",
          };
        } else {
          return {
            ...result,
            product_info: {
              name: productName,
              slug: productSlugFromStore || productSlug,
              uid: productId,
            },
            context: "pdp_page",
          };
        }
      } catch (error) {
        return {
          success: false,
          message: `Failed to add product to cart: ${error.message}`,
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
    name: "check_pincode_delivery",
    description:
      "Check if delivery is available for a pincode - will automatically use stored pincode if not provided",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        pincode: {
          type: "string",
          description:
            "6-digit pincode to check delivery availability - will use stored pincode if not provided",
        },
      },
      required: [],
    },
    handler: async ({ pincode }) => {
      const targetPincode = pincode || getCurrentPincodeFromStore();
      if (!targetPincode) {
        return {
          success: false,
          message:
            "No pincode provided and no pincode found in store. Please provide a 6-digit pincode to check delivery availability.",
          action_required: "pincode_required",
        };
      }
      return await checkPincodeDelivery(targetPincode);
    },
  },

  {
    name: "redirect_to_cart",
    description: "Redirect user to the shopping cart page",
    timeout: 5000,
    handler: () => {
      try {
        spaNavigate("/cart");
        return {
          success: true,
          message: "Redirecting to your cart...",
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to redirect to cart: ${error.message}`,
        };
      }
    },
  },

  {
    name: "add_product_from_listing",
    description:
      "Add products from the current product listing/search results page to cart by position (e.g., 'add 3rd product to cart', 'add first product to cart', 'add 2 products to cart'). Use when on PLP/search pages.",
    timeout: 15000,
    parameters: {
      type: "object",
      properties: {
        selection_type: {
          type: "string",
          description:
            "Type of selection: 'position' for specific positions (e.g., 'add 3rd product') or 'quantity' for multiple items (e.g., 'add 3 products')",
          enum: ["position", "quantity"],
        },
        position: {
          type: "number",
          description:
            "Product position on the listing page (1-based index, e.g., 1 for first product, 3 for third product). Use when selection_type is 'position'.",
        },
        quantity: {
          type: "number",
          description:
            "Number of different products to add starting from the first (e.g., 3 for first three products)",
        },
        size: {
          type: "string",
          description: "Size for products that require size selection",
        },
        pincode: {
          type: "string",
          description:
            "6-digit delivery pincode - will automatically use stored pincode if available",
        },
        color: {
          type: "string",
          description: "Color for products that require color selection",
        },
      },
      required: ["selection_type"],
    },
    handler: async (params) => {
      console.log("🔧 [CART ACTION] add_product_from_listing handler called", {
        params,
        currentUrl: window.location.href,
        timestamp: new Date().toISOString(),
      });

      try {
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
              "This command works only when you're on a product listing page. Please navigate to a product page first.",
            action_required: "navigate_to_products",
          };
        }

        // Get products from the current page
        const products = await extractProductsFromCurrentPage();

        if (!products || products.length === 0) {
          return {
            success: false,
            message: "No products found on the current page.",
            debug_info: {
              current_url: window.location.href,
              pathname: window.location.pathname,
              search_params: Object.fromEntries(
                new URLSearchParams(window.location.search)
              ),
            },
          };
        }

        let selectedProducts = [];
        const { selection_type, position, quantity, size, pincode, color } =
          params;

        // Handle different selection types
        if (selection_type === "position") {
          if (!position || position < 1 || position > products.length) {
            const availableProducts = products
              .slice(0, 5)
              .map((p, i) => `${i + 1}. ${p.name} (slug: ${p.slug})`)
              .join("\n");
            return {
              success: false,
              message: `Please specify a valid product position between 1 and ${products.length}.

  Available products:
  ${availableProducts}${products.length > 5 ? "\n... and more" : ""}

  Try saying "add the [number] product to cart" where [number] is between 1 and ${products.length}.`,
              action_required: "invalid_position",
              available_positions: products.length,
              available_products: products.slice(0, 10).map((p, i) => ({
                position: i + 1,
                name: p.name,
                slug: p.slug,
              })),
            };
          }

          selectedProducts = [products[position - 1]]; // Convert to 0-based index
        } else if (selection_type === "quantity") {
          if (!quantity || quantity < 1) {
            return {
              success: false,
              message:
                "Please specify how many products you want to add. For example, 'add 3 products to cart'.",
              action_required: "invalid_quantity",
            };
          }

          const maxQuantity = Math.min(quantity, products.length);
          selectedProducts = products.slice(0, maxQuantity);

          if (quantity > products.length) {
            // Still proceed but inform user about limitation
            console.warn(
              `User requested ${quantity} products but only ${products.length} available`
            );
          }
        }

        // Add each selected product to cart using slug for accuracy
        const results = [];
        let successCount = 0;
        let totalAttempts = selectedProducts.length;

        for (let i = 0; i < selectedProducts.length; i++) {
          const product = selectedProducts[i];
          const productPosition =
            selection_type === "position" ? position : i + 1;

          try {
            // Use slug as primary identifier, fallback to uid if slug not available
            const productIdentifier = product.slug || product.uid;

            if (!productIdentifier) {
              throw new Error(
                `No valid identifier found for product: ${product.name}`
              );
            }
            console.log(
              `🚀 [CART ACTION] Adding product ${i + 1}/${selectedProducts.length}`,
              {
                productName: product.name,
                productIdentifier,
                position: productPosition,
              }
            );

            const addToCartResult = await addToCart({
              product_id: productIdentifier,
              quantity: 1,
              size: size,
              pincode: pincode || getCurrentPincodeFromStore(), // Auto-fill from store if not provided
              color: color,
            });

            console.log(`📋 [CART ACTION] Product ${i + 1} result:`, {
              productName: product.name,
              success: addToCartResult.success,
              message: addToCartResult.message,
            });

            results.push({
              position: productPosition,
              product_name: product.name,
              product_slug: product.slug,
              product_identifier: productIdentifier,
              result: addToCartResult,
            });

            if (addToCartResult.success) {
              successCount++;
            } else {
              console.log(
                `❌ Failed to add: ${product.name} (${productIdentifier})`,
                addToCartResult.message
              );
            }
          } catch (error) {
            console.error(`❌ Error adding product ${product.name}:`, error);
            results.push({
              position: productPosition,
              product_name: product.name,
              product_slug: product.slug,
              product_identifier: product.slug || product.uid,
              result: {
                success: false,
                message: `Failed to add ${product.name}: ${error.message}`,
              },
            });
          }
        }

        // Generate summary response
        if (successCount === totalAttempts) {
          const productNames = results
            .filter((r) => r.result.success)
            .map((r) => `${r.product_name} (${r.product_slug})`)
            .join(", ");

          return {
            success: true,
            message: `Successfully added ${successCount} product${successCount > 1 ? "s" : ""} to cart: ${productNames}`,
            data: {
              total_attempts: totalAttempts,
              successful_additions: successCount,
              failed_additions: totalAttempts - successCount,
              products_added: results.filter((r) => r.result.success),
              detailed_results: results,
            },
          };
        } else if (successCount > 0) {
          const successfulProducts = results
            .filter((r) => r.result.success)
            .map((r) => `${r.product_name} (${r.product_slug})`)
            .join(", ");

          const failedProducts = results
            .filter((r) => !r.result.success)
            .map(
              (r) =>
                `${r.product_name} (${r.product_slug}): ${r.result.message}`
            )
            .join(", ");

          return {
            success: true,
            message: `Partially successful: Added ${successCount} out of ${totalAttempts} products to cart.

  ✅ Successfully added: ${successfulProducts}
  ❌ Failed: ${failedProducts}`,
            data: {
              total_attempts: totalAttempts,
              successful_additions: successCount,
              failed_additions: totalAttempts - successCount,
              products_added: results.filter((r) => r.result.success),
              failed_products: results.filter((r) => !r.result.success),
              detailed_results: results,
            },
          };
        } else {
          const failedProducts = results
            .map(
              (r) =>
                `${r.product_name} (${r.product_slug}): ${r.result.message}`
            )
            .join("; ");

          return {
            success: false,
            message: `Failed to add any products to cart. Details: ${failedProducts}`,
            data: {
              total_attempts: totalAttempts,
              successful_additions: 0,
              failed_additions: totalAttempts,
              detailed_results: results,
            },
          };
        }
      } catch (error) {
        console.error("Add product from listing error:", error);
        return {
          success: false,
          message: `Failed to add products to cart: ${error.message}`,
          action_required: "system_error",
        };
      }
    },
  },

  {
    name: "add_to_cart",
    description:
      "Add a specific product to the shopping cart using product ID, SKU, or slug when you know the exact product identifier",
    timeout: 15000,
    parameters: {
      type: "object",
      properties: {
        product_id: {
          type: "string",
          description: "Product ID, SKU, or product slug",
        },
        quantity: {
          type: "number",
          description: "Quantity to add to cart",
          default: 1,
          minimum: 1,
        },
        size: {
          type: "string",
          description:
            "Product size (if applicable) - will ask user if required but not provided",
        },
        pincode: {
          type: "string",
          description:
            "6-digit delivery pincode - will automatically use stored pincode if available, otherwise ask user",
        },
        color: {
          type: "string",
          description: "Product color (if applicable)",
        },
      },
      required: ["product_id"],
    },
    handler: async (params) => {
      console.log("🔧 [CART ACTION] add_to_cart handler called", {
        params,
        timestamp: new Date().toISOString(),
      });

      // Auto-fill pincode from store if not provided
      if (!params.pincode) {
        const storePincode = getCurrentPincodeFromStore();
        if (storePincode) {
          params.pincode = storePincode;
          console.log("📍 [CART ACTION] Auto-filled pincode from store", {
            pincode: storePincode,
          });
        }
      }

      console.log(
        "🚀 [CART ACTION] Calling addToCart function with params",
        params
      );
      const result = await addToCart(params);
      console.log("📋 [CART ACTION] addToCart result", {
        success: result.success,
        message: result.message,
      });

      return result;
    },
  },

  {
    name: "clear_cart",
    description:
      "Clear all items from the shopping cart, remove everything from cart, empty the cart completely",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async () => {
      console.log("🔧 [CART ACTION] clear_cart handler called", {
        timestamp: new Date().toISOString(),
        currentUrl: window.location.href,
      });

      try {
        console.log("🚀 [CART ACTION] Calling clearCart function");
        const result = await clearCart();
        console.log("📋 [CART ACTION] clearCart result", {
          success: result.success,
          message: result.message,
          itemsRemoved: result.data?.items_removed,
        });

        return result;
      } catch (error) {
        console.error("❌ [CART ACTION] Clear cart error:", error);
        return {
          success: false,
          message: `Failed to clear cart: ${error.message}`,
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
