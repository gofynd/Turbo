/**
 * Copilot Utilities for E-commerce Integration (Optimized)
 *
 * This file contains utility functions for Copilot integration including
 * the enhanced addToCart functionality with comprehensive validation.
 * Optimized for performance while maintaining all functionality.
 */

import { GET_PRODUCT_DETAILS, ADD_TO_CART } from "../queries/pdpQuery.js";
import { FEATURE_PRODUCT_SIZE_PRICE } from "../queries/featureProductQuery.js";
import { LOCALITY } from "../queries/logisticsQuery.js";
import { fetchCartDetails } from "../page-layouts/cart/useCart.jsx";
import { translateDynamicLabel } from "./utils.js";

// Pre-compiled regex patterns for better performance
const PINCODE_REGEX = /^\d{6}$/;

// Cache for frequently accessed values to avoid repeated computations
const cache = {
  fpiState: null,
  pincodeValidation: new Map(),
  productDescriptions: new Map(),
  // Add cache metadata for intelligent management
  metadata: {
    fpiStateTimestamp: null,
    pincodeValidationTtl: 5 * 60 * 1000, // 5 minutes
    productDescriptionTtl: 30 * 60 * 1000, // 30 minutes
    maxPincodeEntries: 100,
    maxDescriptionEntries: 500,
    // Memory safety settings
    memoryCheckInterval: 5 * 60 * 1000, // Check memory every 5 minutes
    maxMemoryUsageMB: 30, // Maximum cache memory usage in MB
    emergencyCleanupThreshold: 0.9, // Clear cache when 90% of limit reached
    lastMemoryCheck: null,
  },
};

// Memory monitoring utilities
const getApproximateCacheSize = () => {
  try {
    // Estimate cache size (rough calculation)
    let size = 0;

    // FPI state size (if present)
    if (cache.fpiState) {
      size += JSON.stringify(cache.fpiState).length * 2; // rough estimate
    }

    // Pincode validation cache size
    for (const [key, value] of cache.pincodeValidation.entries()) {
      size += key.length * 2; // key size
      size += JSON.stringify(value).length * 2; // value size
    }

    // Product description cache size
    for (const [key, value] of cache.productDescriptions.entries()) {
      size += key.length * 2; // key size
      size += JSON.stringify(value).length * 2; // value size
    }

    return size / (1024 * 1024); // Convert to MB
  } catch (error) {
    console.warn("Cache size calculation failed:", error);
    return 0;
  }
};

const isMemoryPressure = () => {
  try {
    // Check if Performance memory API is available
    if (performance.memory) {
      const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
      const memoryUsageRatio = usedJSHeapSize / totalJSHeapSize;
      return memoryUsageRatio > 0.85; // 85% memory usage threshold
    }

    // Fallback: check cache size
    const cacheSize = getApproximateCacheSize();
    return cacheSize > cache.metadata.maxMemoryUsageMB;
  } catch (error) {
    return false; // Assume no pressure if we can't check
  }
};

// Enhanced memory-aware cache management
const performEmergencyCleanup = () => {
  console.warn("Emergency cache cleanup triggered due to memory pressure");

  // Clear 50% of cache entries (most aggressive)
  const pincodeEntries = Array.from(cache.pincodeValidation.entries());
  const descriptionEntries = Array.from(cache.productDescriptions.entries());

  // Sort by timestamp and remove older half
  pincodeEntries.sort((a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0));
  const pincodeToRemove = Math.ceil(pincodeEntries.length * 0.5);
  for (let i = 0; i < pincodeToRemove; i++) {
    cache.pincodeValidation.delete(pincodeEntries[i][0]);
  }

  descriptionEntries.sort(
    (a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0)
  );
  const descriptionToRemove = Math.ceil(descriptionEntries.length * 0.5);
  for (let i = 0; i < descriptionToRemove; i++) {
    cache.productDescriptions.delete(descriptionEntries[i][0]);
  }

  // Clear FPI state to free immediate memory
  cache.fpiState = null;
  cache.metadata.fpiStateTimestamp = null;
};

// Helper function to check if cache entry is expired
const isCacheExpired = (timestamp, ttl) => {
  return !timestamp || Date.now() - timestamp > ttl;
};

// Helper function to get and cache FPI state with TTL and memory awareness
const getFpiState = () => {
  if (!window.fpi) return null;

  const now = Date.now();
  const { fpiStateTimestamp } = cache.metadata;

  // Check memory pressure before caching
  if (isMemoryPressure()) {
    // Under memory pressure, don't cache FPI state
    return window.fpi.store.getState();
  }

  // Refresh FPI state every 30 seconds or if not cached
  if (!cache.fpiState || isCacheExpired(fpiStateTimestamp, 30000)) {
    cache.fpiState = window.fpi.store.getState();
    cache.metadata.fpiStateTimestamp = now;
  }

  return cache.fpiState;
};

// Helper function to clear cache when needed
const clearCache = () => {
  cache.fpiState = null;
  cache.pincodeValidation.clear();
  cache.productDescriptions.clear();
  cache.metadata.fpiStateTimestamp = null;
  cache.metadata.lastMemoryCheck = null;
};

// Smart cache management with size limits, TTL, and memory monitoring
const manageCacheSize = () => {
  const {
    maxPincodeEntries,
    maxDescriptionEntries,
    pincodeValidationTtl,
    productDescriptionTtl,
    memoryCheckInterval,
    lastMemoryCheck,
  } = cache.metadata;
  const now = Date.now();

  // Periodic memory pressure check
  if (
    !lastMemoryCheck ||
    isCacheExpired(lastMemoryCheck, memoryCheckInterval)
  ) {
    cache.metadata.lastMemoryCheck = now;

    if (isMemoryPressure()) {
      performEmergencyCleanup();
      return; // Exit early after emergency cleanup
    }
  }

  // Clean expired pincode validations
  for (const [key, value] of cache.pincodeValidation.entries()) {
    if (
      value.timestamp &&
      isCacheExpired(value.timestamp, pincodeValidationTtl)
    ) {
      cache.pincodeValidation.delete(key);
    }
  }

  // Clean expired product descriptions
  for (const [key, value] of cache.productDescriptions.entries()) {
    if (
      value.timestamp &&
      isCacheExpired(value.timestamp, productDescriptionTtl)
    ) {
      cache.productDescriptions.delete(key);
    }
  }

  // Implement LRU eviction if cache is too large
  if (cache.pincodeValidation.size > maxPincodeEntries) {
    const entries = Array.from(cache.pincodeValidation.entries());
    entries.sort((a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0));

    // Remove oldest 20% of entries
    const toRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      cache.pincodeValidation.delete(entries[i][0]);
    }
  }

  if (cache.productDescriptions.size > maxDescriptionEntries) {
    const entries = Array.from(cache.productDescriptions.entries());
    entries.sort((a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0));

    // Remove oldest 20% of entries
    const toRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      cache.productDescriptions.delete(entries[i][0]);
    }
  }
};

// Auto-run cache management every 2 minutes
let cacheCleanupInterval;

// Memory-safe initialization with multiple cleanup handlers
const initializeCacheManagement = () => {
  if (typeof window === "undefined") return;

  // Primary cleanup interval
  cacheCleanupInterval = setInterval(manageCacheSize, 2 * 60 * 1000);

  // Multiple cleanup event handlers for robustness
  const cleanup = () => {
    if (cacheCleanupInterval) {
      clearInterval(cacheCleanupInterval);
      cacheCleanupInterval = null;
    }
    clearCache();
  };

  // Handle various page lifecycle events
  window.addEventListener("beforeunload", cleanup);
  window.addEventListener("unload", cleanup);

  // Handle visibility changes (tab switching, minimizing)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      // Reduce cache when tab is hidden to free memory
      if (isMemoryPressure()) {
        performEmergencyCleanup();
      }
    }
  });

  // Handle memory warnings (if supported)
  if ("memory" in performance) {
    const checkMemoryPeriodically = () => {
      if (isMemoryPressure()) {
        performEmergencyCleanup();
      }
    };

    // Check memory every 10 minutes
    setInterval(checkMemoryPeriodically, 10 * 60 * 1000);
  }

  // Cleanup on page navigation (for SPAs)
  if (window.navigation) {
    window.navigation.addEventListener("navigate", cleanup);
  }
};

// Initialize cache management
initializeCacheManagement();

// Enhanced cache-aware pincode validation with memory safety
const getCachedPincodeValidation = async (pincode) => {
  const now = Date.now();
  const cached = cache.pincodeValidation.get(pincode);

  // Return cached result if valid and not expired
  if (
    cached &&
    !isCacheExpired(cached.timestamp, cache.metadata.pincodeValidationTtl)
  ) {
    return cached.data;
  }

  // Fetch fresh data
  const result = await window.fpi.executeGQL(LOCALITY, {
    locality: "pincode",
    localityValue: pincode,
    country: "IN",
  });

  // Only cache if not under memory pressure
  if (!isMemoryPressure()) {
    cache.pincodeValidation.set(pincode, {
      data: result,
      timestamp: now,
    });
  }

  return result;
};

// Optimized product description builder with TTL caching and memory awareness
const buildProductDescription = (productName, size, color) => {
  const key = `${productName}|${size || ""}|${color || ""}`;
  const now = Date.now();
  const cached = cache.productDescriptions.get(key);

  // Return cached result if valid and not expired
  if (
    cached &&
    !isCacheExpired(cached.timestamp, cache.metadata.productDescriptionTtl)
  ) {
    return cached.data;
  }

  const description = `${productName}${size ? ` (Size: ${size})` : ""}${color ? ` (Color: ${color})` : ""}`;

  // Only cache if not under memory pressure
  if (!isMemoryPressure()) {
    cache.productDescriptions.set(key, {
      data: description,
      timestamp: now,
    });
  }

  return description;
};

// Optimized error response builders
const createErrorResponse = (
  success,
  message,
  actionRequired,
  additionalData = {}
) => ({
  success,
  message,
  action_required: actionRequired,
  ...additionalData,
});

const createSuccessResponse = (message, data) => ({
  success: true,
  message,
  data,
});

/**
 * Enhanced Add to Cart function for Copilot integration (Optimized)
 * Handles pincode validation, deliverability checks, and user input validation
 *
 * @param {Object} params - Add to cart parameters
 * @param {string} params.product_id - Product ID, SKU, or slug
 * @param {number} [params.quantity=1] - Quantity to add to cart (defaults to 1)
 * @param {string} [params.size] - Product size if applicable
 * @param {string} [params.color] - Product color if applicable
 * @param {string} [params.pincode] - 6-digit delivery pincode
 * @returns {Promise<Object>} Response object with success status and detailed information
 */
export const addToCart = async ({
  product_id,
  quantity = 1,
  size,
  color,
  pincode: userProvidedPincode,
  ...extraParams // Capture any extra parameters to filter them out
}) => {
  try {
    // Step 0: Input Validation and Parameter Filtering (Optimized)
    const extraFields = Object.keys(extraParams);
    if (extraFields.length > 0) {
      console.warn(
        `Ignoring unauthorized parameters in addToCart: ${extraFields.join(", ")}`
      );
    }

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

    // Step 1: Handle Pincode Validation (Optimized with caching)
    const state = getFpiState();
    const locationDetails = state?.LOCATION_DETAILS;
    const pincodeDetails = state?.PINCODE_DETAILS;
    const currentPincode =
      userProvidedPincode ||
      pincodeDetails?.localityValue ||
      locationDetails?.pincode ||
      "";

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
    if (!PINCODE_REGEX.test(currentPincode)) {
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

    // Step 2: Check Pincode Deliverability (Optimized with caching)
    let pincodeValidation;
    try {
      pincodeValidation = await getCachedPincodeValidation(currentPincode);
    } catch (error) {
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
    const [productDetails, productPriceData] = await Promise.all([
      window.fpi.executeGQL(GET_PRODUCT_DETAILS, { slug: product_id }),
      window.fpi.executeGQL(FEATURE_PRODUCT_SIZE_PRICE, {
        slug: product_id,
        size: size || "",
        pincode: currentPincode,
      }),
    ]);

    if (!productDetails?.data?.product) {
      return createErrorResponse(
        false,
        `Product with ID "${product_id}" not found. Please check the product ID or try searching for the product.`,
        "product_not_found"
      );
    }

    const { product } = productDetails.data;
    let selectedSize = size;
    let selectedColor = color;

    // Step 4: Handle Color Selection (Optimized)
    const productVariants = product.variants;
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
        } else {
          // Check if color selection is required
          const availableColors = colorItems
            .filter((item) => item.is_available)
            .map((item) => ({
              value: item.color || item.value,
              display: item.color_name || item.name,
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
            // Auto-select the only available color
            selectedColor = availableColors[0].value;
          }
        }
      }
    }

    // Step 5: Handle Size Selection (Optimized)
    const productSizes = product.sizes?.sizes || [];
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
            `${product.name} is currently out of stock in all sizes.`,
            "out_of_stock"
          );
        }

        return createErrorResponse(
          false,
          `Please select a size for ${product.name}.`,
          "size_required",
          {
            required_input: {
              field: "size",
              description: "Product size",
              options: availableSizes,
              validation: "Must select one of the available sizes",
            },
            product_info: {
              name: product.name,
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
          `Size "${selectedSize}" is not available for ${product.name}. Available sizes: ${availableSizes.map((s) => s.display).join(", ")}`,
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
          `Size "${selectedSize}" is currently out of stock for ${product.name}.`,
          "size_out_of_stock"
        );
      }
    }

    // Step 6: Validate Product Price Data
    if (!productPriceData?.data?.productPrice) {
      return createErrorResponse(
        false,
        `Unable to get pricing information for ${product.name} at your location (${currentPincode}). This product may not be available for delivery to your pincode.`,
        "pricing_unavailable"
      );
    }

    const priceData = productPriceData.data.productPrice;

    // Step 7: Enhanced MOQ and Maximum Quantity Validation (Optimized)
    const moq = product.moq;
    const availableQty = priceData.quantity || 0;
    let finalQuantity = validQuantity;
    let quantityAdjusted = false;
    let adjustmentReason = "";

    // Check maximum quantity restrictions first
    const maxAllowedQuantity = moq?.maximum || Number.POSITIVE_INFINITY;

    if (validQuantity > maxAllowedQuantity) {
      return createErrorResponse(
        false,
        `Maximum ${maxAllowedQuantity} items allowed per user for ${product.name}. You requested ${validQuantity} items.`,
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
      !product.custom_order?.is_custom_order &&
      availableQty < finalQuantity
    ) {
      const productDescription = buildProductDescription(
        product.name,
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

    // Step 9: Create Cart Payload (Optimized object construction)
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
            item_id: product.uid,
            item_size: selectedSize ? String(selectedSize) : undefined,
            quantity: finalQuantity,
            seller_id: priceData.seller?.uid,
            store_id: priceData.store?.uid,
          },
        ],
      },
    };

    // Step 10: Execute Add to Cart
    const result = await window.fpi.executeGQL(ADD_TO_CART, cartPayload);

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

      // Prepare success response (optimized)
      const productDescription = buildProductDescription(
        product.name,
        selectedSize,
        selectedColor
      );
      const successResponse = createSuccessResponse(
        `Successfully added ${finalQuantity} ${productDescription} to cart!`,
        {
          product_name: product.name,
          quantity: finalQuantity,
          original_quantity: validQuantity,
          size: selectedSize,
          color: selectedColor,
          pincode: currentPincode,
          cart_count: result.data.addItemsToCart.cart?.user_cart_items_count,
          product_description: productDescription,
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

      return successResponse;
    } else {
      // Handle add to cart failure
      const errorMessage = translateDynamicLabel
        ? translateDynamicLabel(
            result?.data?.addItemsToCart?.message,
            (key) => key
          )
        : result?.data?.addItemsToCart?.message;

      return createErrorResponse(
        false,
        errorMessage || "Failed to add product to cart. Please try again.",
        "add_to_cart_failed"
      );
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    return createErrorResponse(
      false,
      `Failed to add product to cart: ${error.message}`,
      "system_error"
    );
  }
};

/**
 * Check if delivery is available for a specific pincode (Optimized)
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
    if (!PINCODE_REGEX.test(pincode)) {
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
 * Get detailed product information including availability, sizes, and pricing (Optimized)
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

    // Prepare product info (optimized object construction)
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

    // Add size information if available (optimized)
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

    // Add color information if available (optimized)
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

    // If pincode provided, get pricing and delivery info (optimized with parallel calls)
    if (pincode && PINCODE_REGEX.test(pincode)) {
      try {
        const promises = [
          window.fpi.executeGQL(LOCALITY, {
            locality: "pincode",
            localityValue: pincode,
            country: "IN",
          }),
        ];

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

// ===== OPTIMIZED HELPER FUNCTIONS FOR COPILOT ACTIONS =====

/**
 * Helper function to safely get trimmed string value (Optimized)
 * @param {any} value - Value to validate and trim
 * @returns {string|null} - Trimmed string or null if invalid
 */
export const getStringParam = (value) => {
  return (typeof value === "string" && value.trim()) || null;
};

/**
 * Helper function to build price filter for product URLs (Optimized)
 * @param {number} min_price - Minimum price
 * @param {number} max_price - Maximum price
 * @returns {string|null} - Price filter string or null
 */
export const buildPriceFilter = (min_price, max_price) => {
  if (typeof min_price === "number" && typeof max_price === "number") {
    return `[${min_price},INR TO ${max_price},INR]`;
  }
  if (typeof max_price === "number") {
    return `[0,INR TO ${max_price},INR]`;
  }
  if (typeof min_price === "number") {
    return `[${min_price},INR TO 999999,INR]`;
  }
  return null;
};

/**
 * Helper function to build product URL with filters (Optimized)
 * @param {Object} params - URL parameters
 * @param {string} params.search - Search query
 * @param {string} params.department - Department filter
 * @param {string} params.category - Category filter
 * @param {number} params.min_price - Minimum price filter
 * @param {number} params.max_price - Maximum price filter
 * @param {string} params.sizes - Size filters
 * @param {string} params.color - Color filter
 * @param {string} params.brand - Brand filter
 * @returns {string} - Complete product URL with query parameters
 */
export const buildProductUrl = ({
  search,
  department,
  category,
  min_price,
  max_price,
  sizes,
  color,
  brand,
}) => {
  const params = new URLSearchParams();

  // Optimized parameter processing
  const stringParams = {
    q: getStringParam(search),
    category: getStringParam(category),
    department: getStringParam(department),
    brand: getStringParam(brand),
    color: getStringParam(color),
    sizes: getStringParam(sizes),
  };

  // Add non-null parameters
  for (const [key, value] of Object.entries(stringParams)) {
    if (value) params.set(key, value);
  }

  // Add price filter if needed
  const priceFilter = buildPriceFilter(min_price, max_price);
  if (priceFilter) {
    params.set("min_price_effective", priceFilter);
  }

  return params.size > 0 ? `/products?${params.toString()}` : "/products";
};

/**
 * Helper function to generate price text for messages (Optimized)
 * @param {number} min_price - Minimum price
 * @param {number} max_price - Maximum price
 * @returns {string} - Formatted price text
 */
export const getPriceText = (min_price, max_price) => {
  if (max_price && !min_price) return ` under ₹${max_price}`;
  if (min_price && !max_price) return ` above ₹${min_price}`;
  if (min_price && max_price) return ` between ₹${min_price}-₹${max_price}`;
  return "";
};

/**
 * Helper function to generate success message for product redirects (Optimized)
 * @param {Object} params - Message parameters
 * @param {string} params.search - Search query
 * @param {string} params.department - Department filter
 * @param {string} params.category - Category filter
 * @param {number} params.min_price - Minimum price filter
 * @param {number} params.max_price - Maximum price filter
 * @param {string} params.color - Color filter
 * @returns {string} - Generated success message
 */
export const generateSuccessMessage = ({
  search,
  department,
  category,
  min_price,
  max_price,
  color,
}) => {
  const priceText = getPriceText(min_price, max_price);

  if (search) return `Searching for "${search}"${priceText}...`;
  if (category && color) return `Showing ${color} ${category}${priceText}...`;
  if (category) return `Showing ${category}${priceText}...`;
  if (department) return `Browsing ${department} department${priceText}...`;
  if (priceText) return `Showing products${priceText}...`;
  return "Redirecting to products page...";
};

/**
 * Extract product information from the current product listing page using API calls (Optimized)
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

    // Determine the type of listing page and make appropriate API call (optimized routing)
    if (pathname.includes("/collection")) {
      const collectionSlug =
        pathname.split("/collection")[1]?.split("/")[1] ||
        pathname.split("/collections/")[1]?.split("/")[0];
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
 * Get products from search/filter API (Optimized)
 */
const getProductsFromSearch = async (searchParams) => {
  try {
    // Import the query
    const { PLP_PRODUCTS } = await import("../queries/plpQuery.js");

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
 * Get products from collection API (Optimized)
 */
const getCollectionProducts = async (collectionSlug, searchParams) => {
  try {
    // Import the collection query
    const { COLLECTION_ITEMS } = await import("../queries/collectionsQuery.js");

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
 * Get products for category (using product search with category filter) (Optimized)
 */
const getCategoryProducts = async (categorySlug, searchParams) => {
  try {
    const { PLP_PRODUCTS } = await import("../queries/plpQuery.js");

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
 * Get products for brand (using product search with brand filter) (Optimized)
 */
const getBrandProducts = async (brandSlug, searchParams) => {
  try {
    const { PLP_PRODUCTS } = await import("../queries/plpQuery.js");

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
 * Get products from React state (fallback method) (Optimized)
 */
const getProductsFromReactState = async () => {
  try {
    if (!window.fpi?.store) return [];

    const state = window.fpi.store.getState();
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

// ===== CACHE MANAGEMENT FUNCTIONS =====

/**
 * Clear only pincode validation cache
 * Use this when user changes location or pincode context
 */
export const clearPincodeCache = () => {
  cache.pincodeValidation.clear();
};

/**
 * Clear only product description cache
 * Use this when product information might have changed
 */
export const clearProductCache = () => {
  cache.productDescriptions.clear();
};

/**
 * Get comprehensive cache statistics for debugging and monitoring
 */
export const getCacheStats = () => {
  const cacheSize = getApproximateCacheSize();
  const memoryPressure = isMemoryPressure();

  return {
    // Cache counts
    pincodeValidations: cache.pincodeValidation.size,
    productDescriptions: cache.productDescriptions.size,

    // Memory usage
    estimatedSizeMB: cacheSize,
    memoryPressure,
    maxMemoryLimitMB: cache.metadata.maxMemoryUsageMB,

    // Age information
    fpiStateAge: cache.metadata.fpiStateTimestamp
      ? Date.now() - cache.metadata.fpiStateTimestamp
      : null,
    lastMemoryCheck: cache.metadata.lastMemoryCheck
      ? Date.now() - cache.metadata.lastMemoryCheck
      : null,

    // Configuration
    limits: {
      maxPincodeEntries: cache.metadata.maxPincodeEntries,
      maxDescriptionEntries: cache.metadata.maxDescriptionEntries,
    },
    ttl: {
      pincodeValidation: cache.metadata.pincodeValidationTtl,
      productDescription: cache.metadata.productDescriptionTtl,
    },

    // Browser memory info (if available)
    browserMemory: performance.memory
      ? {
          usedJSHeapSize: Math.round(
            performance.memory.usedJSHeapSize / (1024 * 1024)
          ),
          totalJSHeapSize: Math.round(
            performance.memory.totalJSHeapSize / (1024 * 1024)
          ),
          jsHeapSizeLimit: Math.round(
            performance.memory.jsHeapSizeLimit / (1024 * 1024)
          ),
          memoryUsageRatio:
            performance.memory.usedJSHeapSize /
            performance.memory.totalJSHeapSize,
        }
      : null,

    // Health indicators
    health: {
      status: memoryPressure ? "warning" : "healthy",
      cacheEfficiency:
        cacheSize > 0
          ? (cache.pincodeValidation.size + cache.productDescriptions.size) /
            cacheSize
          : 0,
      memoryUtilization: cacheSize / cache.metadata.maxMemoryUsageMB,
    },
  };
};

/**
 * Smart cache invalidation based on context
 * This function determines what to clear based on the situation
 *
 * @param {string} context - The context that triggered the invalidation
 * @param {Object} options - Additional options for cache invalidation
 */
export const invalidateCache = (context, options = {}) => {
  switch (context) {
    case "user_login":
    case "user_logout":
      // Clear all cache as user context has changed
      clearUtilsCache();
      break;

    case "location_change":
    case "pincode_change":
      // Clear pincode-related cache only
      clearPincodeCache();
      break;

    case "product_update":
    case "inventory_change":
      // Clear product-related cache only
      clearProductCache();
      break;

    case "route_change":
      // Selective clearing based on route type
      if (options.clearLocation) {
        clearPincodeCache();
      }
      if (options.clearProducts) {
        clearProductCache();
      }
      break;

    case "api_error":
      // Clear relevant cache based on error type
      if (options.errorType === "pincode" || options.errorType === "location") {
        clearPincodeCache();
      } else if (
        options.errorType === "product" ||
        options.errorType === "inventory"
      ) {
        clearProductCache();
      } else {
        // Unknown error, clear all to be safe
        clearUtilsCache();
      }
      break;

    case "session_timeout":
    case "network_reconnect":
      // Clear all cache to ensure fresh data
      clearUtilsCache();
      break;

    default:
      console.warn(`Unknown cache invalidation context: ${context}`);
      break;
  }
};
