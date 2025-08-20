import {
  GET_PRODUCT_DETAILS,
  ADD_TO_CART,
} from "../../theme/queries/pdpQuery.js";
import { FEATURE_PRODUCT_SIZE_PRICE } from "../../theme/queries/featureProductQuery.js";
import { fetchCartDetails } from "../../theme/page-layouts/cart/useCart.jsx";
import { translateDynamicLabel } from "../../theme/helper/utils.js";
import {
  getCachedPincodeValidation,
  getFpiState,
  createErrorResponse,
  createSuccessResponse,
  isValidPincodeFormat,
} from "./common-utils.js";
import { buildProductDescription } from "./product-utils.js";

export const addToCart = async ({
  product_id,
  quantity = 1,
  size,
  color,
  pincode: userProvidedPincode,
  ...extraParams // Capture any extra parameters to filter them out
}) => {
  console.log("🛒 [ADD TO CART] Starting add to cart process", {
    product_id,
    quantity,
    size,
    color,
    pincode: userProvidedPincode,
    timestamp: new Date().toISOString(),
  });

  try {
    // Step 0: Input Validation and Parameter Filtering
    const extraFields = Object.keys(extraParams);
    if (extraFields.length > 0) {
      console.warn(
        `Ignoring unauthorized parameters in addToCart: ${extraFields.join(", ")}`
      );
    }

    console.log("✅ [ADD TO CART] Input validation passed", {
      validQuantity: quantity > 0 ? Math.floor(quantity) : 1,
      extraFieldsIgnored: extraFields,
    });

    // Optimized quantity validation
    if (
      quantity !== undefined &&
      (!Number.isInteger(quantity) || quantity < 1)
    ) {
      return createErrorResponse(
        false,
        "Quantity must be a positive integer.",
        "invalid_quantity",
        {
          required_input: {
            field: "quantity",
            description: "Positive integer quantity",
            validation: "Must be an integer greater than 0",
            example: "2",
          },
        }
      );
    }

    const validQuantity = quantity > 0 ? Math.floor(quantity) : 1;

    // Check FPI availability
    if (!window.fpi) {
      return createErrorResponse(
        false,
        "Unable to access cart functionality. Please try again.",
        "system_error"
      );
    }

    // Step 1: Handle Pincode Validation
    console.log("📍 [ADD TO CART] Starting pincode validation");
    const state = getFpiState();
    const locationDetails = state?.LOCATION_DETAILS;
    const pincodeDetails = state?.PINCODE_DETAILS;
    const currentPincode =
      userProvidedPincode ||
      pincodeDetails?.localityValue ||
      locationDetails?.pincode ||
      "";

    console.log("📍 [ADD TO CART] Pincode resolution", {
      userProvidedPincode,
      pincodeFromStore: pincodeDetails?.localityValue,
      locationPincode: locationDetails?.pincode,
      finalPincode: currentPincode,
    });

    if (!currentPincode) {
      return createErrorResponse(
        false,
        "Please provide your delivery pincode to check if this product can be delivered to your location.",
        "pincode_required",
        {
          required_input: {
            field: "pincode",
            description: "6-digit delivery pincode",
            validation: "Must be exactly 6 digits",
          },
        }
      );
    }

    // Optimized pincode format validation
    if (!isValidPincodeFormat(currentPincode)) {
      return createErrorResponse(
        false,
        "Please provide a valid 6-digit delivery pincode.",
        "invalid_pincode",
        {
          required_input: {
            field: "pincode",
            description: "6-digit delivery pincode",
            validation: "Must be exactly 6 digits",
            example: "400001",
          },
        }
      );
    }

    // Step 2: Check Pincode Deliverability
    console.log("🚚 [ADD TO CART] Checking pincode deliverability", {
      pincode: currentPincode,
    });
    let pincodeValidation;
    try {
      pincodeValidation = await getCachedPincodeValidation(currentPincode);
      console.log("✅ [ADD TO CART] Pincode validation result", {
        pincode: currentPincode,
        isServiceable: !!pincodeValidation?.data?.locality,
        validationData: pincodeValidation?.data,
      });
    } catch (error) {
      console.error("❌ [ADD TO CART] Pincode validation failed", {
        pincode: currentPincode,
        error: error.message,
      });
      return createErrorResponse(
        false,
        `Unable to verify delivery for pincode ${currentPincode}. Please check your pincode or try again.`,
        "pincode_verification_failed"
      );
    }

    if (!pincodeValidation?.data?.locality) {
      return createErrorResponse(
        false,
        `Sorry, we don't deliver to pincode ${currentPincode}. Please try a different pincode or check if you entered it correctly.`,
        "pincode_not_serviceable",
        {
          required_input: {
            field: "pincode",
            description: "Alternative 6-digit delivery pincode",
            validation: "Must be a serviceable pincode",
          },
        }
      );
    }

    // Step 3: Fetch Product Details and Price Data in parallel for better performance
    console.log("🔍 [ADD TO CART] Fetching product details and pricing", {
      productId: product_id,
      size: size || "",
      pincode: currentPincode,
    });

    const [productDetails, productPriceData] = await Promise.all([
      window.fpi.executeGQL(GET_PRODUCT_DETAILS, { slug: product_id }),
      window.fpi.executeGQL(FEATURE_PRODUCT_SIZE_PRICE, {
        slug: product_id,
        size: size || "",
        pincode: currentPincode,
      }),
    ]);

    console.log("📦 [ADD TO CART] Product data fetched", {
      productFound: !!productDetails?.data?.product,
      productName: productDetails?.data?.product?.name,
      priceDataFound: !!productPriceData?.data?.productPrice,
      priceData: productPriceData?.data?.productPrice,
    });

    // If product not found, try to fetch it directly as it might be a variant slug
    if (!productDetails?.data?.product) {
      console.log(
        "🔍 [ADD TO CART] Product not found, trying as variant slug",
        {
          variantSlug: product_id,
        }
      );

      try {
        // Try to fetch the product directly using the provided slug (might be a variant slug)
        const [variantDetails, variantPriceData] = await Promise.all([
          window.fpi.executeGQL(GET_PRODUCT_DETAILS, { slug: product_id }),
          window.fpi.executeGQL(FEATURE_PRODUCT_SIZE_PRICE, {
            slug: product_id,
            size: size || "",
            pincode: currentPincode,
          }),
        ]);

        if (variantDetails?.data?.product) {
          console.log("✅ [ADD TO CART] Successfully fetched variant product", {
            variantSlug: product_id,
            productName: variantDetails.data.product.name,
          });

          // Use the variant product details directly
          productDetails = variantDetails;
          productPriceData = variantPriceData;
        }
      } catch (error) {
        console.warn("⚠️ [ADD TO CART] Error fetching variant slug:", error);
      }

      // If still no product found after trying variant slug
      if (!productDetails?.data?.product) {
        return createErrorResponse(
          false,
          `Product with ID "${product_id}" not found. Please check the product ID or try searching for the product.`,
          "product_not_found"
        );
      }
    }

    const { product } = productDetails.data;
    let selectedSize = size;
    let selectedColor = color;

    // Step 4: Handle Color Selection
    console.log("🎨 [ADD TO CART] Processing color selection", {
      requestedColor: color,
      hasVariants: !!product.variants?.length,
      variantCount: product.variants?.length || 0,
    });

    const productVariants = product.variants;
    let actualProductId = product_id; // This will be updated if we switch to a color variant
    let selectedVariant = null; // Track the selected variant for metadata

    if (productVariants?.length > 0) {
      const colorVariants = productVariants.find(
        (variant) =>
          variant.key === "color" ||
          variant.header?.toLowerCase().includes("color")
      );

      if (colorVariants?.items?.length > 0) {
        const colorItems = colorVariants.items;

        if (selectedColor) {
          // Optimized color validation with early exit
          const lowerSelectedColor = selectedColor.toLowerCase();
          const colorExists = colorItems.find(
            (item) =>
              item.color === selectedColor ||
              item.color_name?.toLowerCase() === lowerSelectedColor ||
              item.value === selectedColor
          );

          if (!colorExists) {
            const availableColors = colorItems
              .filter((item) => item.is_available)
              .map((item) => ({
                value: item.color || item.value,
                display: item.color_name || item.name,
                slug: item.slug,
                uid: item.uid,
              }));

            return createErrorResponse(
              false,
              `Color "${selectedColor}" is not available for ${product.name}. Available colors: ${availableColors.map((c) => c.display).join(", ")}`,
              "invalid_color",
              {
                required_input: {
                  field: "color",
                  description: "Valid product color",
                  options: availableColors,
                },
              }
            );
          }

          if (!colorExists.is_available) {
            return createErrorResponse(
              false,
              `Color "${selectedColor}" is currently not available for ${product.name}.`,
              "color_not_available"
            );
          }

          // CRUCIAL FIX: Switch to the color variant's specific product ID
          selectedVariant = colorExists;
          if (colorExists.slug) {
            actualProductId = colorExists.slug;
          } else if (colorExists.uid) {
            actualProductId = colorExists.uid;
          }

          console.log("🎨 [ADD TO CART] Color variant selected", {
            originalProductId: product_id,
            selectedColor: selectedColor,
            variantSlug: colorExists.slug,
            variantUid: colorExists.uid,
            newProductId: actualProductId,
          });
        } else {
          // Check if color selection is required
          const availableColors = colorItems
            .filter((item) => item.is_available)
            .map((item) => ({
              value: item.color || item.value,
              display: item.color_name || item.name,
              slug: item.slug,
              uid: item.uid,
            }));

          if (availableColors.length > 1) {
            return createErrorResponse(
              false,
              `Please select a color for ${product.name}.`,
              "color_required",
              {
                required_input: {
                  field: "color",
                  description: "Product color",
                  options: availableColors,
                  validation: "Must select one of the available colors",
                },
                product_info: {
                  name: product.name,
                  available_colors: availableColors,
                },
              }
            );
          } else if (availableColors.length === 1) {
            // Auto-select the only available color and switch to its product ID
            const onlyColor = availableColors[0];
            selectedColor = onlyColor.value;
            selectedVariant = colorItems.find(
              (item) =>
                item.slug === onlyColor.slug || item.uid === onlyColor.uid
            );

            if (onlyColor.slug) {
              actualProductId = onlyColor.slug;
            } else if (onlyColor.uid) {
              actualProductId = onlyColor.uid;
            }
          }
        }
      }
    }

    // Step 4.5: If we switched to a color variant, fetch its specific product details
    let finalProduct = product;
    let finalPriceData = productPriceData?.data?.productPrice;

    if (actualProductId !== product_id && selectedVariant) {
      try {
        // Fetch the specific color variant's product details and pricing
        const [variantDetails, variantPriceData] = await Promise.all([
          window.fpi.executeGQL(GET_PRODUCT_DETAILS, { slug: actualProductId }),
          window.fpi.executeGQL(FEATURE_PRODUCT_SIZE_PRICE, {
            slug: actualProductId,
            size: size || "",
            pincode: currentPincode,
          }),
        ]);

        if (variantDetails?.data?.product) {
          finalProduct = variantDetails.data.product;
          finalPriceData = variantPriceData?.data?.productPrice;
        } else {
          // Fallback to original product if variant fetch fails
          console.warn(
            `Failed to fetch variant details for ${actualProductId}, using original product`
          );
        }
      } catch (error) {
        console.warn(
          `Error fetching variant details for ${actualProductId}:`,
          error
        );
        // Continue with original product data
      }
    }

    // Step 5: Handle Size Selection
    console.log("📏 [ADD TO CART] Processing size selection", {
      requestedSize: selectedSize,
      productName: finalProduct.name,
      availableSizes:
        finalProduct.sizes?.sizes?.map((s) => ({
          value: s.value,
          display: s.display,
          available: s.is_available,
          quantity: s.quantity,
        })) || [],
      hasSizes: (finalProduct.sizes?.sizes || []).length > 0,
    });

    const productSizes = finalProduct.sizes?.sizes || [];
    const hasSizes = productSizes.length > 0;

    if (hasSizes) {
      if (!selectedSize) {
        // Get available sizes
        const availableSizes = productSizes
          .filter((s) => s.is_available && s.quantity > 0)
          .map((s) => ({
            value: s.value,
            display: s.display,
            quantity: s.quantity,
          }));

        if (availableSizes.length === 0) {
          return createErrorResponse(
            false,
            `${finalProduct.name} is currently out of stock in all sizes.`,
            "out_of_stock"
          );
        }

        return createErrorResponse(
          false,
          `Please select a size for ${finalProduct.name}.`,
          "size_required",
          {
            required_input: {
              field: "size",
              description: "Product size",
              options: availableSizes,
              validation: "Must select one of the available sizes",
            },
            product_info: {
              name: finalProduct.name,
              available_sizes: availableSizes,
            },
          }
        );
      }

      // Optimized size validation
      const sizeExists = productSizes.find((s) => s.value === selectedSize);
      if (!sizeExists) {
        const availableSizes = productSizes
          .filter((s) => s.is_available && s.quantity > 0)
          .map((s) => ({ value: s.value, display: s.display }));

        return createErrorResponse(
          false,
          `Size "${selectedSize}" is not available for ${finalProduct.name}. Available sizes: ${availableSizes.map((s) => s.display).join(", ")}`,
          "invalid_size",
          {
            required_input: {
              field: "size",
              description: "Valid product size",
              options: availableSizes,
            },
          }
        );
      }

      if (!sizeExists.is_available || sizeExists.quantity <= 0) {
        return createErrorResponse(
          false,
          `Size "${selectedSize}" is currently out of stock for ${finalProduct.name}.`,
          "size_out_of_stock"
        );
      }
    }

    // Step 6: Validate Product Price Data
    if (!finalPriceData) {
      return createErrorResponse(
        false,
        `Unable to get pricing information for ${finalProduct.name} at your location (${currentPincode}). This product may not be available for delivery to your pincode.`,
        "pricing_unavailable"
      );
    }

    const priceData = finalPriceData;

    // Step 7: Enhanced MOQ and Maximum Quantity Validation
    const moq = finalProduct.moq;
    const availableQty = priceData.quantity || 0;
    let finalQuantity = validQuantity;
    let quantityAdjusted = false;
    let adjustmentReason = "";

    // Check maximum quantity restrictions first
    const maxAllowedQuantity = moq?.maximum || Number.POSITIVE_INFINITY;

    if (validQuantity > maxAllowedQuantity) {
      return createErrorResponse(
        false,
        `Maximum ${maxAllowedQuantity} items allowed per user for ${finalProduct.name}. You requested ${validQuantity} items.`,
        "exceeds_max_user_limit",
        {
          max_allowed_quantity: maxAllowedQuantity,
          requested_quantity: validQuantity,
        }
      );
    }

    // Apply MOQ rules if present
    if (moq) {
      // Apply minimum quantity requirement
      if (moq.minimum && validQuantity < moq.minimum) {
        finalQuantity = moq.minimum;
        quantityAdjusted = true;
        adjustmentReason = `minimum order quantity is ${moq.minimum}`;
      }

      // Apply maximum quantity limit (considering available stock)
      if (moq.maximum && finalQuantity > moq.maximum) {
        finalQuantity = Math.min(moq.maximum, availableQty);
        quantityAdjusted = true;
        adjustmentReason = `maximum order quantity is ${moq.maximum}`;
      }

      // Apply increment unit requirements
      if (moq.increment_unit && moq.increment_unit > 1) {
        const minQty = moq.minimum || 1;
        const adjustedQty = Math.max(
          minQty,
          Math.floor(finalQuantity / moq.increment_unit) * moq.increment_unit
        );

        if (adjustedQty !== finalQuantity) {
          finalQuantity = adjustedQty;
          quantityAdjusted = true;
          adjustmentReason = `quantity must be in multiples of ${moq.increment_unit}`;
        }

        // If adjustment results in 0, use minimum increment
        if (finalQuantity === 0) {
          finalQuantity = Math.max(minQty, moq.increment_unit);
          quantityAdjusted = true;
        }
      }
    }

    // Final validation: ensure we don't exceed available stock or user limits
    const stockLimit = Math.min(maxAllowedQuantity, availableQty);
    if (finalQuantity > stockLimit) {
      finalQuantity = stockLimit;
      quantityAdjusted = true;
      adjustmentReason = "adjusted to available stock and user limits";
    }

    // Step 8: Final Stock Availability Check
    if (
      !finalProduct.custom_order?.is_custom_order &&
      availableQty < finalQuantity
    ) {
      const productDescription = buildProductDescription(
        finalProduct.name,
        selectedSize,
        selectedColor
      );

      if (availableQty === 0) {
        return createErrorResponse(
          false,
          `${productDescription} is currently out of stock at your location.`,
          "out_of_stock"
        );
      } else {
        return createErrorResponse(
          false,
          `Only ${availableQty} items available in stock for ${productDescription}. Please reduce the quantity to ${availableQty} or less.`,
          "insufficient_stock",
          {
            available_quantity: availableQty,
            max_available: availableQty,
          }
        );
      }
    }

    // Step 9: Create Cart Payload
    const cartPayload = {
      buyNow: false,
      areaCode: currentPincode,
      addCartRequestInput: {
        items: [
          {
            article_assignment: {
              level: String(priceData.article_assignment?.level || ""),
              strategy: String(priceData.article_assignment?.strategy || ""),
            },
            article_id: String(priceData.article_id || ""),
            item_id: finalProduct.uid,
            item_size: selectedSize ? String(selectedSize) : undefined,
            quantity: finalQuantity,
            seller_id: priceData.seller?.uid,
            store_id: priceData.store?.uid,
          },
        ],
      },
    };

    console.log("📋 [ADD TO CART] Cart payload created", {
      productName: finalProduct.name,
      productUid: finalProduct.uid,
      articleId: priceData.article_id,
      quantity: finalQuantity,
      size: selectedSize,
      color: selectedColor,
      pincode: currentPincode,
      sellerId: priceData.seller?.uid,
      storeId: priceData.store?.uid,
      payload: cartPayload,
    });

    // Step 10: Execute Add to Cart
    console.log("🚀 [ADD TO CART] Executing add to cart API call");
    const result = await window.fpi.executeGQL(ADD_TO_CART, cartPayload);

    console.log("📨 [ADD TO CART] API response received", {
      success: result?.data?.addItemsToCart?.success,
      message: result?.data?.addItemsToCart?.message,
      cartCount: result?.data?.addItemsToCart?.cart?.user_cart_items_count,
      fullResponse: result,
    });

    if (result?.data?.addItemsToCart?.success) {
      // Show success notification
      const message =
        result.data.addItemsToCart.message ||
        `Added ${finalQuantity} item(s) to cart successfully!`;

      // Try to show snackbar if available
      if (typeof window !== "undefined" && window.showSnackbar) {
        window.showSnackbar(message, "success");
      }

      // Refresh cart data asynchronously to not block response
      if (window.fpi && fetchCartDetails) {
        fetchCartDetails(window.fpi, { buyNow: false }).catch(console.error);
      }

      // Prepare success response
      const productDescription = buildProductDescription(
        finalProduct.name,
        selectedSize,
        selectedColor
      );
      const successResponse = createSuccessResponse(
        `Successfully added ${finalQuantity} ${productDescription} to cart!`,
        {
          product_name: finalProduct.name,
          quantity: finalQuantity,
          original_quantity: validQuantity,
          size: selectedSize,
          color: selectedColor,
          pincode: currentPincode,
          cart_count: result.data.addItemsToCart.cart?.user_cart_items_count,
          product_description: productDescription,
          // Include variant info if applicable
          ...(selectedVariant && {
            variant_info: {
              original_product_id: product_id,
              selected_variant_id: actualProductId,
              variant_type: "color",
              variant_value: selectedColor,
              variant_slug: selectedVariant.slug,
              variant_uid: selectedVariant.uid,
            },
          }),
        }
      );

      // Add quantity adjustment notice if applicable
      if (quantityAdjusted) {
        successResponse.message += ` (Quantity adjusted from ${validQuantity} to ${finalQuantity} because ${adjustmentReason})`;
        successResponse.data.quantity_adjusted = true;
        successResponse.data.adjustment_reason = adjustmentReason;
        successResponse.data.adjustment_details = {
          original_quantity: validQuantity,
          final_quantity: finalQuantity,
          reason: adjustmentReason,
        };
      }

      console.log("✅ [ADD TO CART] Successfully added to cart", {
        productName: finalProduct.name,
        quantity: finalQuantity,
        cartCount: result.data.addItemsToCart.cart?.user_cart_items_count,
        responseData: successResponse.data,
      });

      return successResponse;
    } else {
      // Handle add to cart failure
      const errorMessage = translateDynamicLabel
        ? translateDynamicLabel(
            result?.data?.addItemsToCart?.message,
            (key) => key
          )
        : result?.data?.addItemsToCart?.message;

      console.error("❌ [ADD TO CART] Add to cart failed", {
        errorMessage,
        apiResponse: result?.data?.addItemsToCart,
        productName: finalProduct.name,
      });

      return createErrorResponse(
        false,
        errorMessage || "Failed to add product to cart. Please try again.",
        "add_to_cart_failed"
      );
    }
  } catch (error) {
    console.error("❌ [ADD TO CART] Exception occurred:", {
      error: error.message,
      stack: error.stack,
      productId: product_id,
      timestamp: new Date().toISOString(),
    });
    return createErrorResponse(
      false,
      `Failed to add product to cart: ${error.message}`,
      "system_error"
    );
  }
};

/**
 * Check if delivery is available for a specific pincode
 *
 * @param {string} pincode - 6-digit pincode to check
 * @returns {Promise<Object>} Response object with deliverability information
 */
export const checkPincodeDelivery = async (pincode) => {
  try {
    if (!window.fpi) {
      return createErrorResponse(
        false,
        "Unable to check delivery availability. Please try again."
      );
    }

    // Optimized pincode validation
    if (!isValidPincodeFormat(pincode)) {
      return createErrorResponse(
        false,
        "Please provide a valid 6-digit pincode."
      );
    }

    // Check deliverability using cached function
    const pincodeValidation = await getCachedPincodeValidation(pincode);

    if (pincodeValidation?.data?.locality) {
      const localityData = pincodeValidation.data.locality;
      return createSuccessResponse(`Great! We deliver to pincode ${pincode}.`, {
        pincode,
        is_serviceable: true,
        location_info: {
          display_name: localityData.display_name,
          localities: localityData.localities,
        },
      });
    } else {
      return createErrorResponse(
        false,
        `Sorry, we don't deliver to pincode ${pincode} yet. Please try a different pincode.`,
        null,
        {
          data: {
            pincode,
            is_serviceable: false,
          },
        }
      );
    }
  } catch (error) {
    console.error("Pincode check error:", error);
    return createErrorResponse(
      false,
      `Unable to verify delivery for pincode ${pincode}. Please try again.`
    );
  }
};

/**
 * Clear all items from the shopping cart using API-based approach
 *
 * @returns {Promise<Object>} Response object with success status and message
 */
export const clearCart = async () => {
  console.log("🗑️ [CLEAR CART] Starting API-based clear cart process", {
    timestamp: new Date().toISOString(),
  });

  try {
    // Import required queries and functions
    const { CART_DETAILS, CART_UPDATE } = await import(
      "../../theme/queries/cartQuery.js"
    );

    // Step 1: Fetch current cart details from API
    console.log("📡 [CLEAR CART] Fetching cart details from API");

    const cartDetailsPayload = {
      buyNow: false,
      includeAllItems: true,
      includeBreakup: true,
    };

    const cartDetailsResult = await window.fpi.executeGQL(
      CART_DETAILS,
      cartDetailsPayload
    );

    console.log("📦 [CLEAR CART] Cart details API response", {
      success: cartDetailsResult?.data?.cart?.success,
      hasCart: !!cartDetailsResult?.data?.cart,
      hasItems: !!cartDetailsResult?.data?.cart?.items,
      fullResponse: cartDetailsResult,
    });

    if (!cartDetailsResult?.data?.cart) {
      return createErrorResponse(
        false,
        "Unable to fetch cart details. Please try again.",
        "cart_fetch_failed"
      );
    }

    const cartData = cartDetailsResult.data.cart;
    const cartItems = cartData.items || [];

    console.log("🛒 [CLEAR CART] API-based cart analysis", {
      cartId: cartData.id,
      cartUid: cartData.uid,
      itemCount: cartItems.length,
      items: cartItems.map((item, index) => ({
        index,
        key: item.key,
        productName: item.product?.name,
        productUid: item.product?.uid,
        quantity: item.quantity,
        articleSize: item.article?.size,
        articleUid: item.article?.uid,
        articleItemIndex: item.article?.item_index,
        identifier: item.identifiers?.identifier,
      })),
    });

    if (cartItems.length === 0) {
      return createSuccessResponse("Your cart is already empty!", {
        cart_cleared: true,
        items_removed: 0,
        cart_count: 0,
      });
    }

    // Step 2: Prepare items for removal using the exact API structure
    const itemsToRemove = cartItems.map((item) => {
      const articleId = `${item.product?.uid}_${item.article?.size || ""}`;

      console.log("🔧 [CLEAR CART] Processing item for removal", {
        productName: item.product?.name,
        productUid: item.product?.uid,
        articleSize: item.article?.size,
        articleId: articleId,
        articleItemIndex: item.article?.item_index,
        identifier: item.identifiers?.identifier,
      });

      return {
        article_id: articleId,
        item_id: item.product?.uid,
        item_size: item.article?.size || "",
        item_index: item.article?.item_index,
        quantity: 0, // Set to 0 to remove
        identifiers: {
          identifier: item.identifiers?.identifier || "",
        },
      };
    });

    // Step 3: Execute bulk remove operation
    const updatePayload = {
      b: true,
      i: true,
      buyNow: false,
      updateCartRequestInput: {
        items: itemsToRemove,
        operation: "remove_item",
      },
    };

    console.log("🚀 [CLEAR CART] Executing bulk remove API call", {
      itemsToRemove: itemsToRemove.length,
      updatePayload: updatePayload,
      detailedItems: itemsToRemove,
    });

    const updateResult = await window.fpi.executeGQL(
      CART_UPDATE,
      updatePayload,
      {
        skipStoreUpdate: false,
      }
    );

    console.log("📨 [CLEAR CART] Bulk remove API response", {
      success: updateResult?.data?.updateCart?.success,
      message: updateResult?.data?.updateCart?.message,
      fullResponse: updateResult,
    });

    if (updateResult?.data?.updateCart?.success) {
      // Show success notification
      const message =
        updateResult.data.updateCart.message ||
        `Successfully cleared all ${cartItems.length} items from your cart!`;

      // Try to show snackbar if available
      if (typeof window !== "undefined" && window.showSnackbar) {
        window.showSnackbar(message, "success");
      }

      // Step 4: Refresh cart data to ensure consistency
      console.log("🔄 [CLEAR CART] Refreshing cart data");
      try {
        await window.fpi.executeGQL(CART_DETAILS, cartDetailsPayload);
      } catch (refreshError) {
        console.warn(
          "⚠️ [CLEAR CART] Failed to refresh cart data:",
          refreshError
        );
        // Don't fail the operation if refresh fails
      }

      console.log("✅ [CLEAR CART] Successfully cleared cart", {
        itemsRemoved: cartItems.length,
      });

      return createSuccessResponse(
        `Successfully cleared all ${cartItems.length} items from your cart!`,
        {
          cart_cleared: true,
          items_removed: cartItems.length,
          cart_count: 0,
          cart_id: cartData.id,
          cleared_items: cartItems.map((item) => ({
            product_name: item.product?.name,
            product_uid: item.product?.uid,
            quantity: item.quantity,
            size: item.article?.size,
          })),
        }
      );
    } else {
      // Handle clear cart failure
      const errorMessage = updateResult?.data?.updateCart?.message;

      console.error("❌ [CLEAR CART] Bulk remove failed", {
        errorMessage,
        apiResponse: updateResult?.data?.updateCart,
      });

      return createErrorResponse(
        false,
        errorMessage ||
          "Failed to clear cart. Please try again or refresh the page.",
        "clear_cart_failed"
      );
    }
  } catch (error) {
    console.error("❌ [CLEAR CART] Exception occurred:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return createErrorResponse(
      false,
      `Failed to clear cart: ${error.message}`,
      "system_error"
    );
  }
};
