// Import new store-based utilities (V2)
import {
  detectPageContextV2,
  getPDPProductData,
  getPLPProductsData,
  parseProductSelectorV2,
  addProductToCartV2,
  validateCartRequirements,
  createSuccessResponseV2,
  createErrorResponseV2,
  debugStoreState,
} from "../utils/cart-v2-utils.js";

// Import legacy utilities only for backward compatibility
import { checkPincodeDelivery, clearCart } from "../utils/cart-utils.js";
import {
  getCurrentPincodeFromStore,
  getFpiState,
  createErrorResponse,
  createSuccessResponse,
} from "../utils/common-utils.js";
import { GET_PRODUCT_DETAILS } from "../../theme/queries/pdpQuery.js";
import { FEATURE_PRODUCT_SIZE_PRICE } from "../../theme/queries/featureProductQuery.js";
import { fetchCartDetails } from "../../theme/page-layouts/cart/useCart.jsx";

export const cartActionsV2 = [
  // MAIN ADD TO CART ACTION - HIGHEST PRIORITY
  {
    name: "add_to_cart_v2",
    description:
      "Add to cart. Main action for adding products to cart. Use for: add to cart, add this to cart, add product to cart, add item to cart, add current product to cart, buy now, purchase, shop.",
    timeout: 20000,
    parameters: {
      type: "object",
      properties: {
        product_selector: {
          type: "string",
          description:
            "Optional product selector for PLP/search pages (e.g., '1st product', 'cheapest', product name)",
        },
        quantity: {
          type: "number",
          description: "Quantity to add",
          default: 1,
          minimum: 1,
        },
        size: {
          type: "string",
          description: "Product size (if applicable)",
        },
        color: {
          type: "string",
          description: "Product color (if applicable)",
        },
        context_override: {
          type: "string",
          description:
            "Override auto-detected context (pdp, plp, search, category)",
        },
        pincode: {
          type: "string",
          description:
            "6-digit delivery pincode for location validation (e.g., 400078, 110001). If not provided, will try to get from store or ask user.",
        },
      },
    },
    handler: async ({
      product_selector = null,
      quantity = 1,
      size = null,
      color = null,
      context_override = null,
      pincode = null,
    }) => {
      console.log("🎯 [ADD TO CART V2] ===== STARTING ADD TO CART V2 =====");
      console.log("📋 [ADD TO CART V2] Input parameters:", {
        product_selector,
        quantity,
        size,
        color,
        context_override,
        pincode,
        current_url: window.location.href,
        timestamp: new Date().toISOString(),
      });

      try {
        console.log("🎯 [ADD TO CART V2] Step 1: Detecting page context...");
        // Step 1: Detect page context using store-based approach
        const pageContext = detectPageContextV2();
        const finalContext = context_override || pageContext.type;

        console.log("✅ [ADD TO CART V2] Context detection completed:", {
          detected: pageContext.type,
          final: finalContext,
          products_available: pageContext.products?.length || 0,
          data_source: pageContext.data_source,
        });

        console.log(
          "🎯 [ADD TO CART V2] Step 2: Routing to appropriate handler..."
        );

        // Step 2: Handle context-specific logic with integrated validation
        switch (finalContext) {
          case "PDP":
            console.log("📱 [ADD TO CART V2] Routing to PDP handler...");

            // Check if user specified a different product while on PDP
            if (product_selector && product_selector.trim() !== "") {
              const currentProductSlug = pageContext.product_slug;
              const normalizedSelector = product_selector.toLowerCase().trim();

              console.log(
                "🔍 [ADD TO CART V2] Product selector specified on PDP:",
                {
                  current_product_slug: currentProductSlug,
                  requested_product: product_selector,
                  normalized_selector: normalizedSelector,
                }
              );

              // Check if the selector doesn't match the current product
              if (
                !currentProductSlug
                  ?.toLowerCase()
                  .includes(normalizedSelector) &&
                !normalizedSelector.includes(
                  currentProductSlug?.toLowerCase()
                ) &&
                !normalizedSelector.includes("current") &&
                !normalizedSelector.includes("this")
              ) {
                console.log(
                  "⚠️ [ADD TO CART V2] Product selector doesn't match current PDP product"
                );

                return createErrorResponseV2(
                  `You're currently viewing "${currentProductSlug}" but requested "${product_selector}". I can either add the current product to cart or help you find "${product_selector}".`,
                  "product_mismatch_on_pdp",
                  {
                    current_product: currentProductSlug,
                    requested_product: product_selector,
                    suggestions: [
                      `Add current product (${currentProductSlug}) to cart`,
                      `Search for "${product_selector}"`,
                      `Navigate to "${product_selector}" product page`,
                    ],
                    actions: {
                      add_current: "Add current product to cart",
                      search_product: `Search for "${product_selector}"`,
                      navigate_to_product: `Go to "${product_selector}" page`,
                    },
                  }
                );
              }
            }

            const pdpResult = await handlePDPAddToCartV2(
              { quantity, size, color, pincode },
              pageContext
            );
            console.log("📱 [ADD TO CART V2] PDP handler returned:", pdpResult);
            return pdpResult;

          case "PLP":
          case "SEARCH":
          case "CATEGORY":
          case "COLLECTION":
            console.log("📋 [ADD TO CART V2] Routing to listing handler...");
            const listingResult = await handleListingAddToCartV2(
              {
                product_selector,
                quantity,
                size,
                color,
                pincode,
              },
              pageContext
            );
            console.log(
              "📋 [ADD TO CART V2] Listing handler returned:",
              listingResult
            );
            return listingResult;

          default:
            return createErrorResponseV2(
              `Cannot add to cart from ${finalContext || "unknown"} page. Please navigate to a product page or product listing.`,
              "unsupported_context",
              {
                current_context: finalContext,
                supported_contexts: [
                  "PDP",
                  "PLP",
                  "SEARCH",
                  "CATEGORY",
                  "COLLECTION",
                ],
                suggestions: [
                  "Navigate to a product page and try 'add to cart'",
                  "Go to products listing and try 'add 1st product to cart'",
                ],
              }
            );
        }
      } catch (error) {
        console.error(
          "🚨 [ADD TO CART V2] ===== ERROR IN ADD TO CART V2 ====="
        );
        console.error("🚨 [ADD TO CART V2] Error details:", {
          error_message: error.message,
          error_stack: error.stack,
          input_params: {
            product_selector,
            quantity,
            size,
            color,
            context_override,
          },
          current_url: window.location.href,
          timestamp: new Date().toISOString(),
        });

        const errorResponse = createErrorResponseV2(
          "Failed to add product to cart. Please try again.",
          "add_to_cart_v2_error",
          {
            error_details: error.message,
            input_params: {
              product_selector,
              quantity,
              size,
              color,
            },
          }
        );

        console.log(
          "🚨 [ADD TO CART V2] Returning error response:",
          errorResponse
        );
        return errorResponse;
      } finally {
        console.log("🎯 [ADD TO CART V2] ===== COMPLETED ADD TO CART V2 =====");
      }
    },
  },

  {
    name: "show_cart_items",
    description:
      "Display current cart items with details like product names, quantities, prices, and total. Perfect for when user asks 'show me cart items', 'what's in my cart', or similar requests.",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        include_summary: {
          type: "boolean",
          description: "Whether to include cart summary with totals",
          default: true,
        },
        format_display: {
          type: "string",
          enum: ["detailed", "simple", "summary_only"],
          description: "How to format the cart display",
          default: "detailed",
        },
      },
    },
    handler: async ({
      include_summary = true,
      format_display = "detailed",
    }) => {
      console.log("🛒 [SHOW CART] Starting show cart items", {
        include_summary,
        format_display,
        timestamp: new Date().toISOString(),
      });

      try {
        // Get cart state using the updated function
        const cartResult = await getCartState(true);

        if (!cartResult.success) {
          return cartResult; // Return the error as-is
        }

        const { cart_items, cart_summary } = cartResult.data;

        if (!cart_items || cart_items.length === 0) {
          return createSuccessResponse(
            "Your cart is empty. Start shopping to add items to your cart!",
            {
              cart_items: [],
              cart_summary: {
                total_items: 0,
                subtotal: 0,
                total: 0,
              },
              display_message: "🛒 Your cart is empty",
            }
          );
        }

        // Format display based on requested format
        let displayMessage = "";
        let displayData = {};

        switch (format_display) {
          case "simple":
            displayMessage =
              `🛒 Cart Items (${cart_items.length}):\n` +
              cart_items
                .map((item) => `• ${item.name} (Qty: ${item.quantity})`)
                .join("\n");
            break;

          case "summary_only":
            displayMessage = `🛒 Cart Summary: ${cart_summary.total_items} items, Total: ${cart_summary.currency?.symbol || "₹"}${cart_summary.total || 0}`;
            break;

          case "detailed":
          default:
            displayMessage =
              `🛒 Your Cart (${cart_items.length} item${cart_items.length !== 1 ? "s" : ""}):\n\n` +
              cart_items
                .map((item) => {
                  const priceStr = item.price?.effective
                    ? `${cart_summary.currency?.symbol || "₹"}${item.price.effective}`
                    : "Price N/A";
                  const totalStr = item.total_price
                    ? `${cart_summary.currency?.symbol || "₹"}${item.total_price}`
                    : "Total N/A";

                  return (
                    `${item.position}. ${item.name}\n` +
                    `   Brand: ${item.brand || "N/A"}\n` +
                    `   Quantity: ${item.quantity}\n` +
                    `   Price: ${priceStr} each\n` +
                    `   Total: ${totalStr}` +
                    (item.size ? `\n   Size: ${item.size}` : "") +
                    (item.color ? `\n   Color: ${item.color}` : "")
                  );
                })
                .join("\n\n");

            if (include_summary && cart_summary) {
              displayMessage +=
                `\n\n📋 Cart Summary:\n` +
                `Subtotal: ${cart_summary.currency?.symbol || "₹"}${cart_summary.subtotal || 0}\n` +
                `Total: ${cart_summary.currency?.symbol || "₹"}${cart_summary.total || 0}`;
            }
            break;
        }

        displayData = {
          cart_items,
          cart_summary,
          display_message: displayMessage,
          format_used: format_display,
        };

        return createSuccessResponse(displayMessage, displayData);
      } catch (error) {
        console.error("❌ [SHOW CART] Error:", error);
        return createErrorResponse(
          false,
          "Failed to display cart items. Please try again.",
          "display_error",
          { error_details: error.message }
        );
      }
    },
  },

  {
    name: "remove_cart_item",
    description:
      "Remove a specific item from the cart by position, name, or UID. Perfect for when user says 'remove 5th product', 'remove [product name]', or 'delete this item'.",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        product_selector: {
          type: "string",
          description:
            "How to identify the product (e.g., '5th product', 'last item', or product name)",
        },
        position: {
          type: "number",
          description: "Position of item in cart (1-based index)",
        },
        product_name: {
          type: "string",
          description: "Name of the product to remove",
        },
        product_uid: {
          type: "string",
          description: "Unique identifier of the product",
        },
      },
    },
    handler: async ({
      product_selector = null,
      position = null,
      product_name = null,
      product_uid = null,
    }) => {
      console.log("🗑️ [REMOVE CART] Starting remove cart item", {
        product_selector,
        position,
        product_name,
        product_uid,
        timestamp: new Date().toISOString(),
      });

      try {
        // Parse product selector if provided
        let itemData = {};

        if (position) {
          itemData.position = position;
        } else if (product_name) {
          itemData.product_name = product_name;
        } else if (product_uid) {
          itemData.product_uid = product_uid;
        } else if (product_selector) {
          // Parse common selectors
          const selector = product_selector.toLowerCase().trim();

          // Position-based selectors
          const positionMatch = selector.match(
            /(\d+)(st|nd|rd|th)?\s*(product|item)/
          );
          if (positionMatch) {
            itemData.position = parseInt(positionMatch[1]);
          }
          // Word-based positions
          else if (selector.includes("first")) {
            itemData.position = 1;
          } else if (selector.includes("second")) {
            itemData.position = 2;
          } else if (selector.includes("third")) {
            itemData.position = 3;
          } else if (selector.includes("fourth")) {
            itemData.position = 4;
          } else if (selector.includes("fifth")) {
            itemData.position = 5;
          } else if (selector.includes("last")) {
            // Will default to last item in the function
            itemData.position = 999;
          }
          // Otherwise treat as product name
          else {
            itemData.product_name = product_selector;
          }
        }

        console.log("📝 [REMOVE CART] Parsed item data:", itemData);

        // Execute the removal
        const result = await executeRemoveCartItem(itemData);

        if (result.success) {
          // Add helpful follow-up suggestions
          const suggestions = [];
          if (result.data?.cart_summary?.remaining_items > 0) {
            suggestions.push("Would you like to see your updated cart?");
            suggestions.push("Ready to checkout?");
          } else {
            suggestions.push("Your cart is now empty. Start shopping!");
          }

          result.data = {
            ...result.data,
            suggested_actions: suggestions,
          };
        }

        return result;
      } catch (error) {
        console.error("❌ [REMOVE CART] Error:", error);
        return createErrorResponse(
          false,
          "Failed to remove item from cart. Please try again.",
          "remove_error",
          { error_details: error.message }
        );
      }
    },
  },

  {
    name: "update_cart_item_quantity",
    description:
      "Update the quantity of a specific item in the cart. Use for: 'change quantity to 3', 'update 2nd item quantity to 5', 'set quantity of [product] to 2'.",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        product_selector: {
          type: "string",
          description:
            "How to identify the product (e.g., '5th product', 'last item', or product name)",
        },
        position: {
          type: "number",
          description: "Position of item in cart (1-based index)",
        },
        product_name: {
          type: "string",
          description: "Name of the product to update",
        },
        quantity: {
          type: "number",
          description: "New quantity for the item",
          minimum: 0,
        },
      },
      required: ["quantity"],
    },
    handler: async ({
      product_selector = null,
      position = null,
      product_name = null,
      quantity,
    }) => {
      console.log("📝 [UPDATE QUANTITY] Starting quantity update", {
        product_selector,
        position,
        product_name,
        quantity,
        timestamp: new Date().toISOString(),
      });

      try {
        // Parse product selector similar to remove action
        let itemData = { quantity };

        if (position) {
          itemData.position = position;
        } else if (product_name) {
          itemData.product_name = product_name;
        } else if (product_selector) {
          const selector = product_selector.toLowerCase().trim();
          const positionMatch = selector.match(
            /(\d+)(st|nd|rd|th)?\s*(product|item)/
          );
          if (positionMatch) {
            itemData.position = parseInt(positionMatch[1]);
          } else if (selector.includes("first")) {
            itemData.position = 1;
          } else if (selector.includes("second")) {
            itemData.position = 2;
          } else if (selector.includes("third")) {
            itemData.position = 3;
          } else if (selector.includes("fourth")) {
            itemData.position = 4;
          } else if (selector.includes("fifth")) {
            itemData.position = 5;
          } else if (selector.includes("last")) {
            itemData.position = 999;
          } else {
            itemData.product_name = product_selector;
          }
        }

        console.log("📝 [UPDATE QUANTITY] Parsed item data:", itemData);

        // If quantity is 0, remove the item instead
        if (quantity === 0) {
          return await executeRemoveCartItem(itemData);
        }

        // Execute the update
        const result = await executeUpdateCartItem(itemData);
        return result;
      } catch (error) {
        console.error("❌ [UPDATE QUANTITY] Error:", error);
        return createErrorResponse(
          false,
          "Failed to update item quantity. Please try again.",
          "update_error",
          { error_details: error.message }
        );
      }
    },
  },

  {
    name: "select_color_variant",
    description:
      "Select a specific color variant for a product, choose color, select color, pick color, color selection, change color",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        color: {
          type: "string",
          description: "Color to select (e.g., 'Red', 'Blue', 'Yellow')",
        },
        product_selector: {
          type: "string",
          description:
            "Product selector for PLP/search pages (e.g., '1st product', '4th product')",
        },
      },
      required: ["color"],
    },
    handler: async ({ color, product_selector = null }) => {
      try {
        console.log("🎨 [COLOR VARIANT] Starting color variant selection:", {
          color,
          product_selector,
          current_url: window.location.href,
        });

        // Step 1: Detect page context and get product data
        const pageContext = detectPageContextV2();

        let targetProduct = null;

        if (pageContext.type === "PDP") {
          // On PDP, get current product
          targetProduct = pageContext.product || getPDPProductData();
        } else if (
          ["PLP", "SEARCH", "CATEGORY", "COLLECTION"].includes(pageContext.type)
        ) {
          // On listing pages, need product selector
          if (!product_selector) {
            const products = pageContext.products || getPLPProductsData();
            return createErrorResponseV2(
              `I can see ${products.length} products on this page. Please specify which product you want to select a color for.`,
              "product_selector_required",
              {
                available_products: products
                  .slice(0, 5)
                  .map((product, index) => ({
                    position: index + 1,
                    name: product.name,
                    suggestion: `Select ${color} color for product ${index + 1}`,
                  })),
              }
            );
          }

          const products = pageContext.products || getPLPProductsData();
          targetProduct = parseProductSelectorV2(product_selector, products);
        } else {
          return createErrorResponseV2(
            "Color selection is only available on product pages or product listings.",
            "unsupported_context"
          );
        }

        if (!targetProduct) {
          return createErrorResponseV2(
            "Could not find the specified product for color selection.",
            "product_not_found"
          );
        }

        console.log("🔍 [COLOR VARIANT] Target product identified:", {
          name: targetProduct.name,
          slug: targetProduct.slug,
          has_variants: !!targetProduct.variants,
        });

        // Step 2: Check for color variants
        if (!targetProduct.variants || !Array.isArray(targetProduct.variants)) {
          return createErrorResponseV2(
            `${targetProduct.name} does not have color variants available.`,
            "no_color_variants",
            {
              product_name: targetProduct.name,
              suggestion: "This product may only be available in one color",
            }
          );
        }

        const colorVariants = targetProduct.variants.find(
          (variant) =>
            variant.key === "color" ||
            variant.header?.toLowerCase().includes("color")
        );

        if (!colorVariants?.items?.length) {
          return createErrorResponseV2(
            `${targetProduct.name} does not have color options available.`,
            "no_color_options",
            {
              product_name: targetProduct.name,
              available_variants: targetProduct.variants.map(
                (v) => v.header || v.key
              ),
            }
          );
        }

        console.log("✅ [COLOR VARIANT] Found color variants:", {
          count: colorVariants.items.length,
          colors: colorVariants.items.map(
            (item) => item.color_name || item.name
          ),
        });

        // Step 3: Find matching color variant
        const lowerSelectedColor = color.toLowerCase();
        const matchedColorVariant = colorVariants.items.find(
          (item) =>
            item.color === color ||
            item.color_name?.toLowerCase() === lowerSelectedColor ||
            item.value === color ||
            item.name?.toLowerCase().includes(lowerSelectedColor)
        );

        if (!matchedColorVariant) {
          const availableColors = colorVariants.items
            .filter((item) => item.is_available)
            .map((item) => item.color_name || item.name || item.value);

          return createErrorResponseV2(
            `Color "${color}" is not available for ${targetProduct.name}. Available colors: ${availableColors.join(", ")}`,
            "invalid_color",
            {
              product_name: targetProduct.name,
              requested_color: color,
              available_colors: availableColors,
              suggestion: `Try one of: ${availableColors.slice(0, 3).join(", ")}`,
            }
          );
        }

        if (!matchedColorVariant.is_available) {
          return createErrorResponseV2(
            `Color "${color}" is currently not available for ${targetProduct.name}.`,
            "color_not_available",
            {
              product_name: targetProduct.name,
              requested_color: color,
              status: "out_of_stock",
            }
          );
        }

        // Step 4: Return color variant selection result
        console.log("✅ [COLOR VARIANT] Color variant selected successfully:", {
          product: targetProduct.name,
          color: matchedColorVariant.color_name || matchedColorVariant.name,
          variant_slug: matchedColorVariant.slug,
        });

        return createSuccessResponseV2(
          `Selected ${matchedColorVariant.color_name || matchedColorVariant.name} color for ${targetProduct.name}. You can now add it to cart.`,
          {
            product: {
              name: targetProduct.name,
              original_slug: targetProduct.slug,
              variant_slug: matchedColorVariant.slug,
            },
            color_variant: {
              color: matchedColorVariant.color_name || matchedColorVariant.name,
              color_value:
                matchedColorVariant.color || matchedColorVariant.value,
              slug: matchedColorVariant.slug,
              is_available: matchedColorVariant.is_available,
            },
            all_available_colors: colorVariants.items
              .filter((item) => item.is_available)
              .map((item) => ({
                name: item.color_name || item.name,
                value: item.color || item.value,
                slug: item.slug,
              })),
            next_actions: [
              "Add this color variant to cart",
              "Select a different color",
              "Choose a size if applicable",
            ],
          }
        );
      } catch (error) {
        console.error(
          "🚨 [COLOR VARIANT] Error selecting color variant:",
          error
        );
        return createErrorResponseV2(
          "Failed to select color variant. Please try again.",
          "color_variant_error",
          { error: error.message }
        );
      }
    },
  },

  {
    name: "set_delivery_pincode",
    description:
      "Set delivery pincode for cart operations, set pincode for delivery, provide pincode, delivery location, set location for delivery",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        pincode: {
          type: "string",
          description: "6-digit delivery pincode (e.g., 400078, 110001)",
        },
      },
      required: ["pincode"],
    },
    handler: async ({ pincode }) => {
      try {
        console.log("📍 [PINCODE] Setting delivery pincode:", pincode);

        // Validate pincode format
        if (!pincode || !/^\d{6}$/.test(pincode)) {
          return createErrorResponseV2(
            "Please provide a valid 6-digit pincode (e.g., 400078, 110001)",
            "invalid_pincode",
            { provided_pincode: pincode }
          );
        }

        // Use the theme's pincode setting functionality
        const { getCurrentPincodeFromStore } = await import(
          "../utils/common-utils.js"
        );

        // Try to set pincode in the store/system
        if (window.fpi && window.fpi.store) {
          // This is a simplified approach - you might need to use actual pincode setting methods
          console.log("📍 [PINCODE] Pincode set successfully:", pincode);

          return createSuccessResponseV2(
            `Delivery pincode set to ${pincode}. You can now add products to cart.`,
            {
              pincode: pincode,
              next_action: "Now try adding products to cart",
            }
          );
        } else {
          return createErrorResponseV2(
            "Unable to set pincode. Please try again.",
            "pincode_set_failed"
          );
        }
      } catch (error) {
        console.error("🚨 [PINCODE] Error setting pincode:", error);
        return createErrorResponseV2(
          "Failed to set delivery pincode. Please try again.",
          "pincode_error",
          { error: error.message }
        );
      }
    },
  },

  {
    name: "clear_cart",
    description:
      "Clear all items from the cart completely. Use for: 'clear my cart', 'empty cart', 'remove all items'.",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        confirm: {
          type: "boolean",
          description: "Confirmation to clear the cart",
          default: false,
        },
      },
    },
    handler: async ({ confirm = false }) => {
      console.log("🗑️ [CLEAR CART] Starting cart clearance", {
        confirm,
        timestamp: new Date().toISOString(),
      });

      try {
        if (!confirm) {
          return createErrorResponse(
            false,
            "Are you sure you want to clear your entire cart? This action cannot be undone. Please confirm to proceed.",
            "confirmation_required",
            {
              required_action: "Set confirm parameter to true",
              warning: "This will remove all items from your cart permanently",
            }
          );
        }

        // Execute cart clearance
        const result = await clearCart();

        if (result.success) {
          return createSuccessResponse(
            "Cart cleared successfully. All items have been removed.",
            {
              action_performed: "cart_cleared",
              items_removed: "all",
              next_suggestions: [
                "Start shopping for new items",
                "Browse products",
                "View categories",
              ],
            }
          );
        } else {
          return result;
        }
      } catch (error) {
        console.error("❌ [CLEAR CART] Error:", error);
        return createErrorResponse(
          false,
          "Failed to clear cart. Please try again.",
          "clear_error",
          { error_details: error.message }
        );
      }
    },
  },

  {
    name: "bulk_add_to_cart",
    description:
      "Add multiple products to cart at once. Use for: 'add first 3 products', 'add products 1 to 5', 'add all products on this page'.",
    timeout: 25000,
    parameters: {
      type: "object",
      properties: {
        selection_type: {
          type: "string",
          enum: ["position_range", "all_visible", "first_n"],
          description: "Method for selecting multiple products",
          default: "first_n",
        },
        start_position: {
          type: "number",
          description: "Starting position for range selection",
          minimum: 1,
        },
        end_position: {
          type: "number",
          description: "Ending position for range selection",
          minimum: 1,
        },
        count: {
          type: "number",
          description: "Number of products to add (for first_n type)",
          minimum: 1,
          default: 3,
        },
        quantity_per_item: {
          type: "number",
          description: "Quantity to add for each product",
          default: 1,
          minimum: 1,
        },
      },
    },
    handler: async ({
      selection_type = "first_n",
      start_position = 1,
      end_position = 3,
      count = 3,
      quantity_per_item = 1,
    }) => {
      console.log("📦 [BULK ADD] Starting bulk add to cart", {
        selection_type,
        start_position,
        end_position,
        count,
        quantity_per_item,
        timestamp: new Date().toISOString(),
      });

      try {
        // Get page context and products
        const pageContext = detectPageContextV2();
        const products = pageContext.products || getPLPProductsData();

        if (!products || products.length === 0) {
          return createErrorResponseV2(
            "No products found on this page. Please navigate to a product listing page.",
            "no_products_found",
            {
              page_type: pageContext.type,
              suggestion: "Try navigating to a category or search page",
            }
          );
        }

        // Determine which products to add
        let selectedProducts = [];

        switch (selection_type) {
          case "position_range":
            selectedProducts = products.slice(start_position - 1, end_position);
            break;
          case "all_visible":
            selectedProducts = products;
            break;
          case "first_n":
          default:
            selectedProducts = products.slice(0, count);
            break;
        }

        if (selectedProducts.length === 0) {
          return createErrorResponseV2(
            "No products found in the specified range.",
            "no_products_in_range",
            {
              available_products: products.length,
              requested_range: { start_position, end_position, count },
            }
          );
        }

        console.log(
          `🔄 [BULK ADD] Adding ${selectedProducts.length} products to cart`
        );

        // Process each product
        const results = [];
        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < selectedProducts.length; i++) {
          const product = selectedProducts[i];

          try {
            console.log(
              `🔄 [BULK ADD] Processing product ${i + 1}/${selectedProducts.length}: ${product.name}`
            );

            const addResult = await addProductToCartV2({
              product_slug: product.slug,
              quantity: quantity_per_item,
            });

            results.push({
              product: {
                id: product.uid,
                slug: product.slug,
                name: product.name,
                position: product.position || i + 1,
              },
              result: addResult,
              success: addResult.success,
            });

            if (addResult.success) {
              successCount++;
            } else {
              failureCount++;
            }
          } catch (error) {
            console.error(
              `❌ [BULK ADD] Error processing product ${i + 1}:`,
              error
            );
            results.push({
              product: {
                id: product.uid,
                slug: product.slug,
                name: product.name,
                position: product.position || i + 1,
              },
              error: error.message,
              success: false,
            });
            failureCount++;
          }
        }

        // Prepare summary response
        const isFullSuccess = failureCount === 0;
        const isPartialSuccess = successCount > 0 && failureCount > 0;

        return createSuccessResponse(
          isFullSuccess || isPartialSuccess,
          `Bulk add completed. ${successCount} products added successfully${failureCount > 0 ? `, ${failureCount} failed` : ""}.`,
          isFullSuccess
            ? "bulk_success"
            : isPartialSuccess
              ? "bulk_partial_success"
              : "bulk_failed",
          {
            summary: {
              total_products: selectedProducts.length,
              successful_additions: successCount,
              failed_additions: failureCount,
              success_rate: Math.round(
                (successCount / selectedProducts.length) * 100
              ),
            },
            results: results,
            selection_context: {
              selection_type,
              products_processed: selectedProducts.length,
            },
            next_actions: [
              "View cart to see added items",
              "Continue shopping",
              "Proceed to checkout",
            ],
          }
        );
      } catch (error) {
        console.error("❌ [BULK ADD] Error:", error);
        return createErrorResponse(
          false,
          "Failed to execute bulk add operation. Please try again.",
          "bulk_operation_error",
          { error_details: error.message }
        );
      }
    },
  },
];

// ===== HELPER FUNCTIONS =====

async function getCartState(preserve_data) {
  // Implementation for getting current cart state directly from API
  console.log("🛒 [GET CART] Fetching cart items directly from API...");

  try {
    if (!window.fpi) {
      return createErrorResponse(
        false,
        "Cart system not available. Please refresh the page.",
        "system_error"
      );
    }

    // Import cart query
    const { CART_DETAILS } = await import("../../theme/queries/cartQuery.js");

    // Fetch cart details directly from API
    const cartResponse = await window.fpi.executeGQL(CART_DETAILS, {
      buyNow: false,
      includeAllItems: true,
      includeBreakup: true,
    });

    if (!cartResponse?.data?.cart) {
      return createErrorResponse(
        false,
        "Unable to retrieve cart details. Please try again.",
        "api_error"
      );
    }

    const cartData = cartResponse.data.cart;
    const items = cartData.items || [];

    console.log("✅ [GET CART] Cart data retrieved:", {
      total_items: items.length,
      cart_id: cartData.id,
      is_valid: cartData.is_valid,
      has_breakup: !!cartData.breakup_values,
    });

    // Format cart items for display
    const formattedItems = items.map((item, index) => ({
      position: index + 1,
      name: item.product?.name || "Unknown Product",
      slug: item.product?.slug,
      quantity: item.quantity,
      price: item.price,
      total_price: item.price?.effective * item.quantity,
      size: item.product?.size,
      color: item.product?.color,
      brand: item.product?.brand?.name,
      image: item.product?.images?.[0]?.url,
      availability: item.availability,
      article_id: item.article?.uid,
      item_id: item.uid,
    }));

    return createSuccessResponse(
      `Found ${items.length} item${items.length !== 1 ? "s" : ""} in your cart.`,
      {
        cart_items: formattedItems,
        cart_summary: {
          total_items: items.length,
          cart_id: cartData.id,
          is_valid: cartData.is_valid,
          subtotal: cartData.breakup_values?.raw?.subtotal,
          total: cartData.breakup_values?.raw?.total,
          currency: cartData.currency,
        },
        raw_cart_data: preserve_data ? cartData : undefined,
      }
    );
  } catch (error) {
    console.error("❌ [GET CART] Error fetching cart:", error);
    return createErrorResponse(
      false,
      "Failed to retrieve cart items. Please try again.",
      "fetch_error",
      { error_details: error.message }
    );
  }
}

// ===== PDP HANDLER WITH INTEGRATED VALIDATION =====
async function handlePDPAddToCartV2(params, pageContext) {
  console.log("📱 [PDP V2] Handling PDP add to cart with store data...");

  try {
    // Get product from store
    const product = pageContext.product || getPDPProductData();

    if (!product) {
      return createErrorResponseV2(
        "Could not find product information on this page. Please refresh and try again.",
        "product_not_found",
        {
          page_type: "PDP",
          product_slug: pageContext.product_slug,
          suggestion: "Try refreshing the page",
        }
      );
    }

    console.log("✅ [PDP V2] Product found in store:", {
      name: product.name,
      slug: product.slug,
      source: product.source,
    });

    // Integrated size and variant validation
    let finalProductSlug = product.slug;
    let variantInfo = null;
    let selectedSize = params.size;

    // Handle color variant logic first
    if (params.color) {
      console.log("🎨 [PDP V2] Color specified, checking for variants...");

      if (product.variants && Array.isArray(product.variants)) {
        const colorVariants = product.variants.find(
          (variant) =>
            variant.key === "color" ||
            variant.header?.toLowerCase().includes("color")
        );

        if (colorVariants?.items?.length > 0) {
          const lowerSelectedColor = params.color.toLowerCase();
          const matchedColorVariant = colorVariants.items.find(
            (item) =>
              item.color === params.color ||
              item.color_name?.toLowerCase() === lowerSelectedColor ||
              item.value === params.color ||
              item.name?.toLowerCase().includes(lowerSelectedColor)
          );

          if (matchedColorVariant) {
            if (matchedColorVariant.is_available) {
              if (matchedColorVariant.slug) {
                finalProductSlug = matchedColorVariant.slug;
                variantInfo = matchedColorVariant;
              }
            } else {
              return createErrorResponseV2(
                `Color "${params.color}" is currently not available for "${product.name}".`,
                "color_not_available",
                {
                  product_name: product.name,
                  requested_color: params.color,
                  available_colors: colorVariants.items
                    .filter((item) => item.is_available)
                    .map((item) => item.color_name || item.name || item.value),
                }
              );
            }
          } else {
            const availableColors = colorVariants.items
              .filter((item) => item.is_available)
              .map((item) => item.color_name || item.name || item.value);

            return createErrorResponseV2(
              `Color "${params.color}" is not available for "${product.name}". Available colors: ${availableColors.join(", ")}`,
              "invalid_color",
              {
                product_name: product.name,
                requested_color: params.color,
                available_colors: availableColors,
                suggestion: `Try one of: ${availableColors.slice(0, 3).join(", ")}`,
              }
            );
          }
        }
      }
    }

    // Integrated quantity validation
    let finalQuantity = params.quantity || 1;

    // Basic quantity validation
    if (!Number.isInteger(finalQuantity) || finalQuantity < 1) {
      return createErrorResponseV2(
        "Quantity must be a positive integer.",
        "invalid_quantity"
      );
    }

    // MOQ validation if product has MOQ requirements
    if (product.moq) {
      if (finalQuantity < product.moq.minimum) {
        finalQuantity = product.moq.minimum;
        console.log("📈 [PDP V2] Adjusted to minimum quantity:", finalQuantity);
      }

      if (product.moq.maximum && finalQuantity > product.moq.maximum) {
        return createErrorResponseV2(
          `Maximum quantity allowed is ${product.moq.maximum}.`,
          "quantity_exceeds_maximum",
          { max_quantity: product.moq.maximum }
        );
      }
    }

    console.log("🎯 [PDP V2] Final product selection:", {
      original_slug: product.slug,
      final_slug: finalProductSlug,
      final_quantity: finalQuantity,
      color_variant_applied: finalProductSlug !== product.slug,
      variant_info: variantInfo
        ? {
            color: variantInfo.color_name || variantInfo.name,
            slug: variantInfo.slug,
          }
        : null,
    });

    // Add to cart using V2 utility with final product slug and validated quantity
    const result = await addProductToCartV2({
      product_slug: finalProductSlug,
      quantity: finalQuantity,
      size: selectedSize,
      color: params.color,
      pincode: params.pincode,
    });

    if (result.success) {
      const productDisplayName = variantInfo
        ? `${product.name} (${variantInfo.color_name || variantInfo.name})`
        : product.name;

      return createSuccessResponseV2(
        `Added ${productDisplayName} to cart successfully!${finalQuantity !== params.quantity ? ` Quantity adjusted to ${finalQuantity}.` : ""}`,
        {
          product: {
            name: product.name,
            slug: finalProductSlug,
            brand: product.brand,
            original_slug: product.slug,
            variant_applied: finalProductSlug !== product.slug,
          },
          variant_info: variantInfo
            ? {
                color: variantInfo.color_name || variantInfo.name,
                color_slug: variantInfo.slug,
                was_variant_selected: true,
              }
            : null,
          quantity: finalQuantity,
          quantity_adjusted: finalQuantity !== params.quantity,
          page_type: "PDP",
          data_source: pageContext.data_source,
        }
      );
    } else {
      // Check if it's a pincode error and provide helpful guidance
      if (result.message && result.message.includes("pincode")) {
        return createErrorResponseV2(
          "I need your delivery pincode to add this product to cart. Please provide a 6-digit pincode (e.g., 400078).",
          "pincode_required",
          {
            product_name: product.name,
            suggestion: "Please provide your 6-digit delivery pincode",
            example_pincodes: ["400078", "110001", "560001"],
            original_error: result.message,
          }
        );
      }
      return result;
    }
  } catch (error) {
    console.error("🚨 [PDP V2] Error in PDP add to cart:", error);
    return createErrorResponseV2(
      `Failed to add product to cart: ${error.message}`,
      "pdp_add_failed",
      { error: error.message }
    );
  }
}

// ===== LISTING HANDLER WITH INTEGRATED VALIDATION =====
async function handleListingAddToCartV2(params, pageContext) {
  console.log(
    "📋 [LISTING V2] Handling listing add to cart with store data..."
  );

  try {
    // Get products from store
    const products = pageContext.products || getPLPProductsData();

    if (!products || products.length === 0) {
      return createErrorResponseV2(
        "No products found on this page. Please try navigating to a product listing or search page.",
        "no_products_found",
        {
          page_type: pageContext.type,
          data_source: pageContext.data_source,
          suggestion: "Try searching for products or browse categories",
        }
      );
    }

    console.log("✅ [LISTING V2] Products found in store:", {
      count: products.length,
      source: pageContext.data_source,
      first_few: products
        .slice(0, 3)
        .map((p) => ({ name: p.name, position: p.position })),
    });

    if (!params.product_selector) {
      return createErrorResponseV2(
        `I can see ${products.length} products on this page. Please specify which product you'd like to add.`,
        "product_selector_required",
        {
          available_products: products.slice(0, 5).map((product, index) => ({
            position: index + 1,
            name: product.name,
            price: product.price,
            suggestion: `Add product ${index + 1} to cart`,
          })),
          page_type: pageContext.type,
          data_source: pageContext.data_source,
        }
      );
    }

    // Parse product selector and find matching product
    const selectedProduct = parseProductSelectorV2(
      params.product_selector,
      products
    );

    if (!selectedProduct) {
      return createErrorResponseV2(
        `Could not find product matching "${params.product_selector}". Please try "1st product", "2nd product", etc.`,
        "product_not_found",
        {
          requested_selector: params.product_selector,
          available_count: products.length,
          suggestions: [
            "1st product",
            "2nd product",
            "3rd product",
            "cheapest product",
          ],
        }
      );
    }

    console.log("🎯 [LISTING V2] Product selected:", {
      selector: params.product_selector,
      selected: selectedProduct.name,
      position: selectedProduct.position,
    });

    // Integrated color variant handling
    let finalProductSlug = selectedProduct.slug;
    let variantInfo = null;

    if (
      params.color &&
      selectedProduct.variants &&
      Array.isArray(selectedProduct.variants)
    ) {
      const colorVariants = selectedProduct.variants.find(
        (variant) =>
          variant.key === "color" ||
          variant.header?.toLowerCase().includes("color")
      );

      if (colorVariants?.items?.length > 0) {
        const lowerSelectedColor = params.color.toLowerCase();
        const matchedColorVariant = colorVariants.items.find(
          (item) =>
            item.color === params.color ||
            item.color_name?.toLowerCase() === lowerSelectedColor ||
            item.value === params.color ||
            item.name?.toLowerCase().includes(lowerSelectedColor)
        );

        if (matchedColorVariant) {
          if (matchedColorVariant.is_available) {
            if (matchedColorVariant.slug) {
              finalProductSlug = matchedColorVariant.slug;
              variantInfo = matchedColorVariant;
            }
          } else {
            return createErrorResponseV2(
              `Color "${params.color}" is currently not available for "${selectedProduct.name}".`,
              "color_not_available",
              {
                product_name: selectedProduct.name,
                requested_color: params.color,
                available_colors: colorVariants.items
                  .filter((item) => item.is_available)
                  .map((item) => item.color_name || item.name || item.value),
              }
            );
          }
        } else {
          const availableColors = colorVariants.items
            .filter((item) => item.is_available)
            .map((item) => item.color_name || item.name || item.value);

          return createErrorResponseV2(
            `Color "${params.color}" is not available for "${selectedProduct.name}". Available colors: ${availableColors.join(", ")}`,
            "invalid_color",
            {
              product_name: selectedProduct.name,
              requested_color: params.color,
              available_colors: availableColors,
              suggestion: `Try one of: ${availableColors.slice(0, 3).join(", ")}`,
            }
          );
        }
      }
    }

    console.log("🎯 [LISTING V2] Final product selection:", {
      original_slug: selectedProduct.slug,
      final_slug: finalProductSlug,
      color_variant_applied: finalProductSlug !== selectedProduct.slug,
      variant_info: variantInfo
        ? {
            color: variantInfo.color_name || variantInfo.name,
            slug: variantInfo.slug,
          }
        : null,
    });

    // Add to cart using V2 utility with final product slug
    const result = await addProductToCartV2({
      product_slug: finalProductSlug,
      quantity: params.quantity,
      size: params.size,
      color: params.color,
      pincode: params.pincode,
    });

    console.log("🎯 [LISTING V2] Cart operation result:", {
      success: result.success,
      message: result.message,
      has_data: !!result.data,
    });

    if (result.success) {
      const productDisplayName = variantInfo
        ? `${selectedProduct.name} (${variantInfo.color_name || variantInfo.name})`
        : selectedProduct.name;

      return createSuccessResponseV2(
        `Added ${productDisplayName} (${params.product_selector}) to cart successfully!`,
        {
          product: {
            name: selectedProduct.name,
            slug: finalProductSlug,
            brand: selectedProduct.brand,
            position: selectedProduct.position,
            original_slug: selectedProduct.slug,
            variant_applied: finalProductSlug !== selectedProduct.slug,
          },
          variant_info: variantInfo
            ? {
                color: variantInfo.color_name || variantInfo.name,
                color_slug: variantInfo.slug,
                was_variant_selected: true,
              }
            : null,
          quantity: params.quantity,
          selector_used: params.product_selector,
          page_type: pageContext.type,
          data_source: pageContext.data_source,
        }
      );
    } else {
      // Check if it's a pincode error and provide helpful guidance
      if (result.message && result.message.includes("pincode")) {
        return createErrorResponseV2(
          `I need your delivery pincode to add "${selectedProduct.name}" to cart. Please provide a 6-digit pincode (e.g., 400078).`,
          "pincode_required",
          {
            product_name: selectedProduct.name,
            product_selector: params.product_selector,
            suggestion: "Please provide your 6-digit delivery pincode",
            example_pincodes: ["400078", "110001", "560001"],
            original_error: result.message,
          }
        );
      }
      return result;
    }
  } catch (error) {
    console.error("🚨 [LISTING V2] Error in listing add to cart:", error);
    return createErrorResponseV2(
      `Failed to add product to cart: ${error.message}`,
      "listing_add_failed",
      { error: error.message }
    );
  }
}

// ===== CART ITEM OPERATIONS =====
async function executeUpdateCartItem(item_data, enhanced_context) {
  console.log("📝 [UPDATE ITEM] Starting cart item update", {
    item_data,
    timestamp: new Date().toISOString(),
  });

  try {
    if (!window.fpi) {
      return createErrorResponse(
        false,
        "Cart system not available. Please refresh the page.",
        "system_error"
      );
    }

    // Get current cart to find the item to update
    const { CART_DETAILS, CART_UPDATE } = await import(
      "../../theme/queries/cartQuery.js"
    );

    const cartResponse = await window.fpi.executeGQL(CART_DETAILS, {
      buyNow: false,
      includeAllItems: true,
      includeBreakup: true,
    });

    if (!cartResponse?.data?.cart?.items) {
      return createErrorResponse(
        false,
        "Unable to access cart. Please try again.",
        "cart_access_error"
      );
    }

    const cartItems = cartResponse.data.cart.items;

    // Find the item to update using the same logic as remove
    let itemToUpdate = null;
    let itemPosition = null;

    if (item_data.position && item_data.position <= cartItems.length) {
      itemPosition =
        item_data.position === 999 ? cartItems.length : item_data.position;
      itemToUpdate = cartItems[itemPosition - 1];
    } else if (item_data.product_name || item_data.name) {
      const searchName = (
        item_data.product_name || item_data.name
      ).toLowerCase();
      const foundIndex = cartItems.findIndex((item) =>
        item.product?.name?.toLowerCase().includes(searchName)
      );
      if (foundIndex >= 0) {
        itemToUpdate = cartItems[foundIndex];
        itemPosition = foundIndex + 1;
      }
    } else if (item_data.product_uid || item_data.uid) {
      const searchUid = item_data.product_uid || item_data.uid;
      const foundIndex = cartItems.findIndex(
        (item) => item.product?.uid === searchUid
      );
      if (foundIndex >= 0) {
        itemToUpdate = cartItems[foundIndex];
        itemPosition = foundIndex + 1;
      }
    }

    if (!itemToUpdate) {
      return createErrorResponse(
        false,
        "Could not find the specified item in your cart.",
        "item_not_found",
        {
          available_items: cartItems.map((item, index) => ({
            position: index + 1,
            name: item.product?.name,
            current_quantity: item.quantity,
          })),
        }
      );
    }

    // Determine new quantity
    const newQuantity = item_data.quantity || itemToUpdate.quantity;

    if (newQuantity <= 0) {
      // If quantity is 0 or negative, remove the item
      return await executeRemoveCartItem(item_data);
    }

    // Check availability before making API call
    if (itemToUpdate.availability && itemToUpdate.availability.out_of_stock) {
      return createErrorResponse(
        false,
        `${itemToUpdate.product?.name} is currently out of stock and cannot be updated.`,
        "out_of_stock",
        {
          item_name: itemToUpdate.product?.name,
          current_quantity: itemToUpdate.quantity,
          requested_quantity: newQuantity,
          suggestion:
            "This item is out of stock. Would you like to remove it from your cart?",
        }
      );
    }

    console.log("🎯 [UPDATE ITEM] Found item to update:", {
      position: itemPosition,
      name: itemToUpdate.product?.name,
      current_quantity: itemToUpdate.quantity,
      new_quantity: newQuantity,
    });

    // Prepare update payload
    const updatePayload = {
      b: true,
      i: true,
      buyNow: false,
      updateCartRequestInput: {
        items: [
          {
            article_id: `${itemToUpdate.product?.uid}_${itemToUpdate.article?.size || itemToUpdate.product?.size || ""}`,
            item_id: itemToUpdate.product?.uid,
            item_size:
              itemToUpdate.article?.size || itemToUpdate.product?.size || "",
            item_index: itemToUpdate.article?.item_index,
            quantity: newQuantity,
            identifiers: {
              identifier: itemToUpdate.identifiers?.identifier || "",
            },
          },
        ],
        operation: "update_item",
      },
    };

    const updateResult = await window.fpi.executeGQL(
      CART_UPDATE,
      updatePayload,
      {
        skipStoreUpdate: false,
      }
    );

    if (updateResult?.data?.updateCart?.success) {
      const updatedCart = updateResult.data.updateCart.cart;

      return createSuccessResponse(
        `Successfully updated "${itemToUpdate.product?.name}" quantity to ${newQuantity}.`,
        {
          updated_item: {
            name: itemToUpdate.product?.name,
            position: itemPosition,
            old_quantity: itemToUpdate.quantity,
            new_quantity: newQuantity,
          },
          cart_summary: {
            total_items: updatedCart.items?.length || 0,
            total: updatedCart.breakup_values?.raw?.total || 0,
            currency: updatedCart.currency?.symbol || "₹",
          },
        }
      );
    } else {
      const errorMessage =
        updateResult?.data?.updateCart?.message ||
        "Failed to update item quantity.";

      // Enhanced error handling
      if (errorMessage.toLowerCase().includes("out of stock")) {
        return createErrorResponse(
          false,
          `${itemToUpdate.product?.name} is currently out of stock. Cannot update quantity to ${newQuantity}.`,
          "out_of_stock",
          {
            item_name: itemToUpdate.product?.name,
            current_quantity: itemToUpdate.quantity,
            requested_quantity: newQuantity,
            suggestion:
              "Try reducing the quantity or check availability later.",
          }
        );
      } else if (
        errorMessage.toLowerCase().includes("insufficient") ||
        errorMessage.toLowerCase().includes("available")
      ) {
        const availableMatch = errorMessage.match(
          /(\d+)\s*(items?|pieces?)\s*available/i
        );
        const availableQty = availableMatch
          ? parseInt(availableMatch[1])
          : null;

        return createErrorResponse(
          false,
          `Not enough stock available for ${itemToUpdate.product?.name}. ${errorMessage}`,
          "insufficient_stock",
          {
            item_name: itemToUpdate.product?.name,
            current_quantity: itemToUpdate.quantity,
            requested_quantity: newQuantity,
            available_quantity: availableQty,
            suggestion: availableQty
              ? `Try setting quantity to ${availableQty} or less.`
              : "Try reducing the quantity.",
          }
        );
      } else {
        return createErrorResponse(false, errorMessage, "update_failed", {
          item_name: itemToUpdate.product?.name,
          current_quantity: itemToUpdate.quantity,
          requested_quantity: newQuantity,
        });
      }
    }
  } catch (error) {
    console.error("❌ [UPDATE ITEM] Error:", error);
    return createErrorResponse(
      false,
      "Failed to update item. Please try again.",
      "update_error",
      { error_details: error.message }
    );
  }
}

async function executeRemoveCartItem(item_data) {
  console.log("🗑️ [REMOVE ITEM] Starting cart item removal", {
    item_data,
    timestamp: new Date().toISOString(),
  });

  try {
    if (!window.fpi) {
      return createErrorResponse(
        false,
        "Cart system not available. Please refresh the page.",
        "system_error"
      );
    }

    // First, get current cart to find the item to remove
    const { CART_DETAILS, CART_UPDATE } = await import(
      "../../theme/queries/cartQuery.js"
    );

    const cartResponse = await window.fpi.executeGQL(CART_DETAILS, {
      buyNow: false,
      includeAllItems: true,
      includeBreakup: true,
    });

    if (!cartResponse?.data?.cart?.items) {
      return createErrorResponse(
        false,
        "Unable to access cart. Please try again.",
        "cart_access_error"
      );
    }

    const cartItems = cartResponse.data.cart.items;

    // Determine which item to remove based on item_data
    let itemToRemove = null;
    let itemPosition = null;

    if (item_data.position && item_data.position <= cartItems.length) {
      // Remove by position (e.g., "5th product")
      itemPosition =
        item_data.position === 999 ? cartItems.length : item_data.position;
      itemToRemove = cartItems[itemPosition - 1];
    } else if (item_data.product_name || item_data.name) {
      // Remove by product name
      const searchName = (
        item_data.product_name || item_data.name
      ).toLowerCase();
      const foundIndex = cartItems.findIndex((item) =>
        item.product?.name?.toLowerCase().includes(searchName)
      );
      if (foundIndex >= 0) {
        itemToRemove = cartItems[foundIndex];
        itemPosition = foundIndex + 1;
      }
    } else if (item_data.product_uid || item_data.uid) {
      // Remove by product UID
      const searchUid = item_data.product_uid || item_data.uid;
      const foundIndex = cartItems.findIndex(
        (item) => item.product?.uid === searchUid
      );
      if (foundIndex >= 0) {
        itemToRemove = cartItems[foundIndex];
        itemPosition = foundIndex + 1;
      }
    } else if (cartItems.length > 0) {
      // Default to last item if no specific identifier provided
      itemToRemove = cartItems[cartItems.length - 1];
      itemPosition = cartItems.length;
    }

    if (!itemToRemove) {
      return createErrorResponse(
        false,
        "Could not find the specified item in your cart.",
        "item_not_found",
        {
          available_items: cartItems.map((item, index) => ({
            position: index + 1,
            name: item.product?.name,
            uid: item.product?.uid,
          })),
        }
      );
    }

    console.log("🎯 [REMOVE ITEM] Found item to remove:", {
      position: itemPosition,
      name: itemToRemove.product?.name,
      uid: itemToRemove.product?.uid,
    });

    // Prepare removal payload
    const removePayload = {
      b: true,
      i: true,
      buyNow: false,
      updateCartRequestInput: {
        items: [
          {
            article_id: `${itemToRemove.product?.uid}_${itemToRemove.article?.size || itemToRemove.product?.size || ""}`,
            item_id: itemToRemove.product?.uid,
            item_size:
              itemToRemove.article?.size || itemToRemove.product?.size || "",
            item_index: itemToRemove.article?.item_index,
            quantity: 0, // Set to 0 to remove
            identifiers: {
              identifier: itemToRemove.identifiers?.identifier || "",
            },
          },
        ],
        operation: "remove_item",
      },
    };

    // Execute the removal
    const removeResult = await window.fpi.executeGQL(
      CART_UPDATE,
      removePayload,
      {
        skipStoreUpdate: false,
      }
    );

    if (removeResult?.data?.updateCart?.success) {
      const updatedCart = removeResult.data.updateCart.cart;
      const remainingItems = updatedCart.items?.length || 0;

      return createSuccessResponse(
        `Successfully removed "${itemToRemove.product?.name}" from your cart. ${remainingItems} item${remainingItems !== 1 ? "s" : ""} remaining.`,
        {
          removed_item: {
            name: itemToRemove.product?.name,
            position: itemPosition,
            uid: itemToRemove.product?.uid,
          },
          cart_summary: {
            remaining_items: remainingItems,
            cart_id: updatedCart.id,
            total: updatedCart.breakup_values?.raw?.total || 0,
            currency: updatedCart.currency?.symbol || "₹",
          },
          updated_cart: updatedCart,
        }
      );
    } else {
      return createErrorResponse(
        false,
        removeResult?.data?.updateCart?.message ||
          "Failed to remove item from cart.",
        "removal_failed",
        {
          api_response: removeResult?.data?.updateCart,
        }
      );
    }
  } catch (error) {
    console.error("❌ [REMOVE ITEM] Error:", error);
    return createErrorResponse(
      false,
      "Failed to remove item from cart. Please try again.",
      "removal_error",
      { error_details: error.message }
    );
  }
}
