import { extractProductsFromCurrentPage } from "../utils/product-utils.js";
import { spaNavigate } from "../../theme/helper/utils";
import { FOLLOWED_PRODUCTS_ID } from "../../theme/queries/wishlistQuery";
import {
  addToWishList,
  removeFromWishList,
  isUserLoggedIn,
  getCurrentProductFromPDP,
  isProductInWishlist,
  getWishlistData,
  getProductBySlug,
  isProductListingPage,
} from "../utils/wishlist-utils";

const wishlistActions = [
  {
    name: "add_to_wishlist_from_pdp",
    description:
      "Add the current product to wishlist when on a Product Detail Page (PDP)",
    timeout: 10000,
    handler: async () => {
      try {
        // Check if user is logged in
        if (!isUserLoggedIn()) {
          return {
            success: false,
            message: "Please log in to add products to your wishlist.",
            action_required: "login_required",
            login_url: "/login",
          };
        }

        // Check if we're on a PDP page
        const currentPath = window.location.pathname;
        if (!currentPath.includes("/product/")) {
          return {
            success: false,
            message:
              "This action works only when you're on a product detail page. Please navigate to a product page first.",
            action_required: "navigate_to_product",
          };
        }

        // Get current product
        const currentProduct = getCurrentProductFromPDP();

        if (!currentProduct) {
          // Try alternative method: get product slug from URL and look in store
          const currentPath = window.location.pathname;
          const productSlug = currentPath.split("/product/")[1]?.split("/")[0];

          if (productSlug) {
            // Check if we can find this product in any store data
            const state = window.fpi?.store?.getState();

            return {
              success: false,
              message: `Unable to identify the current product. Detected product slug: "${productSlug}". Please check the console for debug information and try again.`,
              action_required: "system_error",
              debug_info: {
                productSlug,
                currentPath,
                storeKeys: Object.keys(state || {}),
                productStateKeys: Object.keys(state?.product || {}),
              },
            };
          }

          return {
            success: false,
            message:
              "Unable to identify the current product. Please try again.",
            action_required: "system_error",
          };
        }

        // Check if already in wishlist
        if (isProductInWishlist(currentProduct.uid)) {
          return {
            success: false,
            message: `${currentProduct.name} is already in your wishlist.`,
            action_required: "already_in_wishlist",
            data: {
              product_name: currentProduct.name,
              product_slug: currentProduct.slug,
            },
          };
        }

        // Add to wishlist
        await addToWishList(currentProduct);

        return {
          success: true,
          message: `Successfully added ${currentProduct.name} to your wishlist!`,
          data: {
            product_name: currentProduct.name,
            product_slug: currentProduct.slug,
            brand: currentProduct.brand,
          },
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to add product to wishlist: ${error.message}`,
          action_required: "system_error",
        };
      }
    },
  },

  {
    name: "add_to_wishlist_from_listing",
    description:
      "Add a specific product to wishlist from product listing page using position number (e.g., 'add 3rd product to wishlist')",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        position: {
          type: "number",
          description:
            "Position number of the product in the listing (e.g., 1 for first product, 2 for second, etc.)",
          minimum: 1,
        },
        product_slug: {
          type: "string",
          description: "Product slug/identifier (alternative to position)",
        },
      },
    },
    handler: async ({ position, product_slug }) => {
      try {
        // Check if user is logged in
        if (!isUserLoggedIn()) {
          return {
            success: false,
            message: "Please log in to add products to your wishlist.",
            action_required: "login_required",
            login_url: "/login",
          };
        }

        // Check if we're on a product listing page
        if (!isProductListingPage()) {
          return {
            success: false,
            message:
              "This action works only when you're on a product listing page. Please navigate to a product listing page first.",
            action_required: "navigate_to_products",
          };
        }

        // Get products from current page
        const products = await extractProductsFromCurrentPage();

        if (!products || products.length === 0) {
          return {
            success: false,
            message: "No products found on the current page.",
            action_required: "no_products_found",
          };
        }

        let selectedProduct = null;

        // Find product by position or slug
        if (position) {
          if (position > products.length) {
            return {
              success: false,
              message: `Only ${products.length} products found on this page. Please select a number between 1 and ${products.length}.`,
              action_required: "invalid_position",
              data: {
                total_products: products.length,
                max_position: products.length,
              },
            };
          }
          selectedProduct = products[position - 1];
        } else if (product_slug) {
          selectedProduct = products.find((p) => p.slug === product_slug);
          if (!selectedProduct) {
            return {
              success: false,
              message: `Product with slug "${product_slug}" not found on this page.`,
              action_required: "product_not_found",
            };
          }
        } else {
          return {
            success: false,
            message:
              "Please specify either the position number or product slug.",
            action_required: "missing_parameters",
            required_input: {
              field: "position",
              description: "Position number of the product in the listing",
              validation: "Must be a number between 1 and " + products.length,
            },
          };
        }

        // Check if already in wishlist
        if (isProductInWishlist(selectedProduct.uid)) {
          return {
            success: false,
            message: `${selectedProduct.name} is already in your wishlist.`,
            action_required: "already_in_wishlist",
            data: {
              product_name: selectedProduct.name,
              product_slug: selectedProduct.slug,
              position: selectedProduct.position,
            },
          };
        }

        // Add to wishlist
        await addToWishList(selectedProduct);

        return {
          success: true,
          message: `Successfully added ${selectedProduct.name} to your wishlist!`,
          data: {
            product_name: selectedProduct.name,
            product_slug: selectedProduct.slug,
            brand: selectedProduct.brand,
            position: selectedProduct.position,
          },
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to add product to wishlist: ${error.message}`,
          action_required: "system_error",
        };
      }
    },
  },

  {
    name: "remove_from_wishlist",
    description:
      "Remove a product from wishlist by product slug, position number, or when on PDP",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        product_slug: {
          type: "string",
          description: "Product slug/identifier to remove from wishlist",
        },
        position: {
          type: "number",
          description:
            "Position number of the product in wishlist (1st, 2nd, 3rd, or first, second, third, etc.)",
        },
        product_name: {
          type: "string",
          description: "Name of the product to remove from wishlist",
        },
      },
    },
    handler: async ({ product_slug, position, product_name }) => {
      try {
        // Check if user is logged in
        if (!isUserLoggedIn()) {
          return {
            success: false,
            message: "Please log in to manage your wishlist.",
            action_required: "login_required",
            login_url: "/login",
          };
        }

        let targetProduct = null;

        if (position) {
          // Remove by position number (1st, 2nd, 3rd, etc.)
          const { followedList: wishlistData, dataSource } = getWishlistData();

          if (
            !wishlistData ||
            !wishlistData.items ||
            wishlistData.items.length === 0
          ) {
            return {
              success: false,
              message: "Your wishlist is empty.",
              action_required: "empty_wishlist",
            };
          }

          // Validate position
          if (position < 1 || position > wishlistData.items.length) {
            return {
              success: false,
              message: `Invalid position. Please choose a number between 1 and ${wishlistData.items.length}.`,
              action_required: "invalid_position",
              data: {
                valid_range: `1-${wishlistData.items.length}`,
                total_products: wishlistData.items.length,
              },
            };
          }

          // Get product at position (position is 1-indexed)
          const productAtPosition = wishlistData.items[position - 1];
          targetProduct = {
            slug: productAtPosition.slug,
            name: productAtPosition.name,
            uid: productAtPosition.uid,
            brand: productAtPosition.brand?.name,
          };
        } else if (product_name) {
          // Remove by product name
          const { followedList: wishlistData, dataSource } = getWishlistData();

          if (
            !wishlistData ||
            !wishlistData.items ||
            wishlistData.items.length === 0
          ) {
            return {
              success: false,
              message: "Your wishlist is empty.",
              action_required: "empty_wishlist",
            };
          }

          // Find product by name (case-insensitive partial match)
          const matchingProduct = wishlistData.items.find(
            (item) =>
              item.name &&
              item.name.toLowerCase().includes(product_name.toLowerCase())
          );

          if (!matchingProduct) {
            const availableProducts = wishlistData.items
              .map((item, index) => `${index + 1}. ${item.name}`)
              .join("\n");

            return {
              success: false,
              message: `Could not find "${product_name}" in your wishlist.\n\nAvailable products:\n${availableProducts}`,
              action_required: "product_not_found",
              data: {
                searched_name: product_name,
                available_products: wishlistData.items.map((item) => item.name),
              },
            };
          }

          targetProduct = {
            slug: matchingProduct.slug,
            name: matchingProduct.name,
            uid: matchingProduct.uid,
            brand: matchingProduct.brand?.name,
          };
        } else if (product_slug) {
          // Remove by product slug
          targetProduct = await getProductBySlug(product_slug);
        } else {
          // Try to get current product from PDP
          targetProduct = getCurrentProductFromPDP();
        }

        if (!targetProduct) {
          return {
            success: false,
            message:
              "Please specify a product position (e.g., '2nd'), product name, product slug, or navigate to a product page.",
            action_required: "missing_product_info",
            required_input: {
              options: [
                {
                  field: "position",
                  description: "Position number (e.g., 1, 2, 3)",
                },
                {
                  field: "product_name",
                  description: "Product name or partial name",
                },
                {
                  field: "product_slug",
                  description: "Product slug/identifier",
                },
              ],
            },
          };
        }

        // Check if product is in wishlist using store data only
        const isInWishlist = isProductInWishlist(targetProduct.uid);

        if (!isInWishlist) {
          return {
            success: false,
            message: `${targetProduct.name} is not in your wishlist.`,
            action_required: "not_in_wishlist",
            data: {
              product_name: targetProduct.name,
              product_slug: targetProduct.slug,
            },
          };
        }

        // Remove from wishlist
        await removeFromWishList(targetProduct);

        return {
          success: true,
          message: `Successfully removed ${targetProduct.name} from your wishlist.`,
          data: {
            product_name: targetProduct.name,
            product_slug: targetProduct.slug,
            brand: targetProduct.brand,
          },
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to remove product from wishlist: ${error.message}`,
          action_required: "system_error",
        };
      }
    },
  },

  {
    name: "toggle_wishlist",
    description:
      "Toggle product in/out of wishlist (add if not present, remove if present) - works on PDP or with product slug",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        product_slug: {
          type: "string",
          description: "Product slug/identifier to toggle in wishlist",
        },
      },
    },
    handler: async ({ product_slug }) => {
      try {
        // Check if user is logged in
        if (!isUserLoggedIn()) {
          return {
            success: false,
            message: "Please log in to manage your wishlist.",
            action_required: "login_required",
            login_url: "/login",
          };
        }

        let targetProduct = null;

        if (product_slug) {
          targetProduct = await getProductBySlug(product_slug);
        } else {
          // Try to get current product from PDP
          targetProduct = getCurrentProductFromPDP();
        }

        if (!targetProduct) {
          return {
            success: false,
            message:
              "Please specify a product slug or navigate to a product page.",
            action_required: "missing_product_info",
            required_input: {
              field: "product_slug",
              description: "Product slug/identifier to toggle in wishlist",
            },
          };
        }

        const isInWishlist = isProductInWishlist(targetProduct.uid);

        if (isInWishlist) {
          // Remove from wishlist
          await removeFromWishList(targetProduct);
          return {
            success: true,
            message: `Removed ${targetProduct.name} from your wishlist.`,
            data: {
              action: "removed",
              product_name: targetProduct.name,
              product_slug: targetProduct.slug,
              brand: targetProduct.brand,
            },
          };
        } else {
          // Add to wishlist
          await addToWishList(targetProduct);
          return {
            success: true,
            message: `Added ${targetProduct.name} to your wishlist!`,
            data: {
              action: "added",
              product_name: targetProduct.name,
              product_slug: targetProduct.slug,
              brand: targetProduct.brand,
            },
          };
        }
      } catch (error) {
        return {
          success: false,
          message: `Failed to toggle product in wishlist: ${error.message}`,
          action_required: "system_error",
        };
      }
    },
  },

  {
    name: "redirect_to_wishlist",
    description: "Redirect user to the wishlist page",
    timeout: 5000,
    handler: () => {
      try {
        // Check if user is logged in
        if (!isUserLoggedIn()) {
          return {
            success: false,
            message: "Please log in to view your wishlist.",
            action_required: "login_required",
            login_url: "/login",
          };
        }

        spaNavigate("/wishlist");
        return {
          success: true,
          message: "Redirecting to your wishlist...",
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to redirect to wishlist: ${error.message}`,
          action_required: "system_error",
        };
      }
    },
  },

  {
    name: "list_wishlist_products",
    description: "List all products currently in the user's wishlist",
    timeout: 10000,
    handler: async () => {
      try {
        // Check if user is logged in
        if (!isUserLoggedIn()) {
          return {
            success: false,
            message: "Please log in to view your wishlist.",
            action_required: "login_required",
            login_url: "/login",
          };
        }

        if (!window.fpi) {
          return {
            success: false,
            message:
              "Unable to access wishlist functionality. Please try again.",
            action_required: "system_error",
          };
        }

        // Get wishlist data
        const { followedList, dataSource } = getWishlistData();

        // Check if wishlist is empty
        if (
          !followedList ||
          !followedList.items ||
          followedList.items.length === 0
        ) {
          return {
            success: true,
            message: "Your wishlist is empty. Start adding products you love!",
            data: {
              total_products: 0,
              products: [],
            },
          };
        }

        const wishlistProducts = followedList.items.map((product, index) => ({
          position: index + 1,
          name: product.name,
          slug: product.slug,
          uid: product.uid,
          brand: product.brand?.name,
          price: product.price,
          image: product.media?.[0]?.url,
        }));

        const productList = wishlistProducts
          .map(
            (product) =>
              `${product.position}. ${product.name}${product.brand ? ` (${product.brand})` : ""}
       Slug: ${product.slug || "N/A"}${product.price ? ` | Price: ${JSON.stringify(product.price)}` : ""}`
          )
          .join("\n\n");

        return {
          success: true,
          message: `You have ${wishlistProducts.length} products in your wishlist:

${productList}

You can remove any product by saying:
• "Remove [product name] from wishlist"
• "Remove the 2nd product from wishlist"

Or redirect to your full wishlist page by saying "Go to wishlist"`,
          data: {
            total_products: wishlistProducts.length,
            products: wishlistProducts,
            data_source: dataSource,
            page_info: {
              has_next: followedList.page?.has_next || false,
              item_total:
                followedList.page?.item_total || wishlistProducts.length,
            },
          },
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to retrieve wishlist: ${error.message}`,
          action_required: "system_error",
        };
      }
    },
  },

  {
    name: "add_to_cart_from_wishlist",
    description:
      "Add products from user's wishlist to cart by position. ONLY use when user explicitly mentions 'wishlist' (e.g., 'add 3rd product FROM WISHLIST to cart', 'add first WISHLIST item to cart'). Do not use for general product listing pages.",
    timeout: 15000,
    parameters: {
      type: "object",
      properties: {
        position: {
          type: "number",
          description:
            "Position number of the product in user's WISHLIST (e.g., 1 for first WISHLIST product, 2 for second WISHLIST product, etc.). Only use when user mentions 'wishlist'.",
          minimum: 1,
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
            "6-digit delivery pincode - will automatically use stored pincode if available",
        },
        color: {
          type: "string",
          description: "Product color (if applicable)",
        },
      },
      required: ["position"],
    },
    handler: async (params) => {
      try {
        console.log(
          "🔧 [WISHLIST TO CART] add_to_cart_from_wishlist handler called",
          {
            params,
            timestamp: new Date().toISOString(),
          }
        );

        // Check if user is logged in
        if (!isUserLoggedIn()) {
          return {
            success: false,
            message:
              "Please log in to access your wishlist and add items to cart.",
            action_required: "login_required",
            login_url: "/login",
          };
        }

        // Import addToCart function
        const { addToCart } = await import("../utils/cart-utils.js");

        // Get wishlist data
        const { followedList, dataSource } = getWishlistData();

        if (
          !followedList ||
          !followedList.items ||
          followedList.items.length === 0
        ) {
          return {
            success: false,
            message:
              "Your wishlist is empty. Add some products to your wishlist first!",
            action_required: "empty_wishlist",
            redirect_action: "Go to products and add items to wishlist",
          };
        }

        const { position, quantity = 1, size, pincode, color } = params;

        // Validate position
        if (position < 1 || position > followedList.items.length) {
          const availableProducts = followedList.items
            .slice(0, 5)
            .map(
              (item, index) =>
                `${index + 1}. ${item.name}${item.brand?.name ? ` (${item.brand.name})` : ""}`
            )
            .join("\n");

          return {
            success: false,
            message: `Invalid position. Please choose a number between 1 and ${followedList.items.length}.

Available products in your wishlist:
${availableProducts}${followedList.items.length > 5 ? "\n... and more" : ""}

Try saying "add the [number] product from wishlist to cart" where [number] is between 1 and ${followedList.items.length}.`,
            action_required: "invalid_position",
            data: {
              valid_range: `1-${followedList.items.length}`,
              total_products: followedList.items.length,
              available_products: followedList.items
                .slice(0, 10)
                .map((item, index) => ({
                  position: index + 1,
                  name: item.name,
                  slug: item.slug,
                  brand: item.brand?.name,
                })),
            },
          };
        }

        // Get the product at the specified position (position is 1-indexed)
        const selectedProduct = followedList.items[position - 1];

        if (!selectedProduct || !selectedProduct.slug) {
          return {
            success: false,
            message: `Unable to find product at position ${position} in your wishlist. Please try again.`,
            action_required: "product_not_found",
          };
        }

        console.log("🛒 [WISHLIST TO CART] Selected product from wishlist", {
          position: position,
          productName: selectedProduct.name,
          productSlug: selectedProduct.slug,
          productUid: selectedProduct.uid,
          brand: selectedProduct.brand?.name,
        });

        // Prepare addToCart parameters
        const addToCartParams = {
          product_id: selectedProduct.slug, // Use slug as primary identifier
          quantity: quantity,
        };

        // Add optional parameters if provided
        if (size) addToCartParams.size = size;
        if (pincode) addToCartParams.pincode = pincode;
        if (color) addToCartParams.color = color;

        console.log(
          "🚀 [WISHLIST TO CART] Calling addToCart with params",
          addToCartParams
        );

        // Call the existing addToCart function
        const addToCartResult = await addToCart(addToCartParams);

        console.log("📋 [WISHLIST TO CART] addToCart result", {
          success: addToCartResult.success,
          message: addToCartResult.message,
          productName: selectedProduct.name,
        });

        if (addToCartResult.success) {
          // Enhance success response with wishlist context
          return {
            ...addToCartResult,
            message:
              `Successfully added "${selectedProduct.name}" (${position}${position === 1 ? "st" : position === 2 ? "nd" : position === 3 ? "rd" : "th"} item from your wishlist) to cart! ${addToCartResult.message || ""}`.trim(),
            data: {
              ...addToCartResult.data,
              source: "wishlist",
              wishlist_position: position,
              wishlist_product_info: {
                name: selectedProduct.name,
                slug: selectedProduct.slug,
                uid: selectedProduct.uid,
                brand: selectedProduct.brand?.name,
                price: selectedProduct.price,
              },
              wishlist_data_source: dataSource,
            },
            action_completed: "wishlist_to_cart",
          };
        } else {
          // Return the error from addToCart with wishlist context
          return {
            ...addToCartResult,
            context: "wishlist_to_cart",
            wishlist_product_info: {
              name: selectedProduct.name,
              slug: selectedProduct.slug,
              uid: selectedProduct.uid,
              position: position,
            },
          };
        }
      } catch (error) {
        console.error("❌ [WISHLIST TO CART] Exception occurred:", error);
        return {
          success: false,
          message: `Failed to add product from wishlist to cart: ${error.message}`,
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
    name: "clear_wishlist",
    description:
      "Clear all items from the wishlist completely. Use for: 'clear my wishlist', 'remove all from wishlist', 'empty wishlist'.",
    timeout: 15000,
    parameters: {
      type: "object",
      properties: {
        confirm: {
          type: "boolean",
          description: "Confirmation to clear the wishlist",
          default: false,
        },
      },
    },
    handler: async ({ confirm = false }) => {
      try {
        console.log("🗑️ [CLEAR WISHLIST] Starting wishlist clearance", {
          confirm,
          timestamp: new Date().toISOString(),
        });

        // Check if user is logged in
        if (!isUserLoggedIn()) {
          return {
            success: false,
            message: "Please log in to manage your wishlist.",
            action_required: "login_required",
            login_url: "/login",
          };
        }

        if (!confirm) {
          return {
            success: false,
            message:
              "Are you sure you want to clear your entire wishlist? This action cannot be undone. Please confirm to proceed.",
            action_required: "confirmation_required",
            data: {
              required_action: "Set confirm parameter to true",
              warning:
                "This will remove all items from your wishlist permanently",
            },
          };
        }

        // Get current wishlist data
        const { followedList, dataSource } = getWishlistData();

        if (!followedList?.items || followedList.items.length === 0) {
          return {
            success: true,
            message: "Your wishlist is already empty.",
            data: {
              items_removed: 0,
              wishlist_status: "empty",
            },
          };
        }

        console.log("🔍 [CLEAR WISHLIST] Found wishlist items to remove:", {
          count: followedList.items.length,
          dataSource,
          items: followedList.items.map((item) => ({
            name: item.name,
            uid: item.uid,
          })),
        });

        // Remove all items from wishlist
        const removePromises = followedList.items.map(async (item) => {
          try {
            console.log(`🗑️ [CLEAR WISHLIST] Removing item: ${item.name}`);
            const result = await removeFromWishList(item);
            return { success: true, item: item.name, result };
          } catch (error) {
            console.error(
              `❌ [CLEAR WISHLIST] Failed to remove ${item.name}:`,
              error
            );
            return { success: false, item: item.name, error: error.message };
          }
        });

        const results = await Promise.all(removePromises);
        const successful = results.filter((r) => r.success);
        const failed = results.filter((r) => !r.success);

        console.log("✅ [CLEAR WISHLIST] Removal completed:", {
          total: results.length,
          successful: successful.length,
          failed: failed.length,
        });

        if (failed.length === 0) {
          return {
            success: true,
            message: `Successfully cleared your wishlist! Removed ${successful.length} item${successful.length !== 1 ? "s" : ""}.`,
            data: {
              items_removed: successful.length,
              wishlist_status: "cleared",
              removed_items: successful.map((r) => r.item),
              next_suggestions: [
                "Start shopping for new items",
                "Browse product categories",
                "Search for products",
              ],
            },
          };
        } else if (successful.length > 0) {
          return {
            success: true,
            message: `Partially cleared wishlist. Successfully removed ${successful.length} item${successful.length !== 1 ? "s" : ""}, but ${failed.length} item${failed.length !== 1 ? "s" : ""} could not be removed.`,
            data: {
              items_removed: successful.length,
              items_failed: failed.length,
              wishlist_status: "partially_cleared",
              removed_items: successful.map((r) => r.item),
              failed_items: failed.map((r) => ({
                item: r.item,
                error: r.error,
              })),
            },
          };
        } else {
          return {
            success: false,
            message: `Failed to clear wishlist. Could not remove any of the ${failed.length} item${failed.length !== 1 ? "s" : ""}.`,
            action_required: "system_error",
            data: {
              items_failed: failed.length,
              failed_items: failed.map((r) => ({
                item: r.item,
                error: r.error,
              })),
              suggestion: "Please try again or remove items individually",
            },
          };
        }
      } catch (error) {
        console.error("❌ [CLEAR WISHLIST] Error:", error);
        return {
          success: false,
          message: "Failed to clear wishlist. Please try again.",
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

export default wishlistActions;
