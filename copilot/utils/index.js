/**
 * Copilot Utils Index
 *
 * This file exports all utility functions in an organized manner,
 * making it easy to import specific utilities from their respective modules.
 */

// Cart-related utilities
export { addToCart, checkPincodeDelivery } from "./cart-utils.js";

// Product-related utilities
export {
  getProductInfo,
  extractProductsFromCurrentPage,
  buildProductDescription,
} from "./product-utils.js";

// Redirect and URL utilities
export {
  buildProductUrl,
  generateSuccessMessage,
  getStringParam,
  buildPriceFilter,
  getPriceText,
} from "./redirect-utils.js";

// Common utilities (shared across modules)
export {
  getFpiState,
  getCachedPincodeValidation,
  isValidPincodeFormat,
  createErrorResponse,
  createSuccessResponse,
  getCurrentPincodeFromStore,
} from "./common-utils.js";

// For backward compatibility, also export from legacy import path
// This allows gradual migration without breaking existing imports
export * as cartUtils from "./cart-utils.js";
export * as productUtils from "./product-utils.js";
export * as redirectUtils from "./redirect-utils.js";
export * as commonUtils from "./common-utils.js";
