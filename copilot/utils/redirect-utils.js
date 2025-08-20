/**
 * Redirect Utilities for Copilot Integration
 *
 * This module contains all redirect and URL building utility functions
 * for navigation and product filtering.
 */

/**
 * Helper function to safely get trimmed string value
 * @param {any} value - Value to validate and trim
 * @returns {string|null} - Trimmed string or null if invalid
 */
export const getStringParam = (value) => {
  return (typeof value === "string" && value.trim()) || null;
};

/**
 * Helper function to build price filter for product URLs
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
 * Helper function to build product URL with filters
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
 * Helper function to generate price text for messages
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
 * Helper function to generate success message for product redirects
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
 * Helper function to build address management URL with query parameters
 * @param {Object} params - URL parameters
 * @param {string} params.action - Action type: 'create', 'edit', or 'list'
 * @param {string} params.address_id - Address ID for edit mode
 * @returns {Object} - URL and validation result
 */
export const buildAddressUrl = ({ action = "list", address_id }) => {
  const baseUrl = "/profile/address";
  const params = new URLSearchParams();

  // Validate parameters
  if (action === "edit" && !getStringParam(address_id)) {
    return {
      success: false,
      error: "Address ID is required when editing an address",
    };
  }

  // Build URL based on action
  if (action === "create") {
    params.set("edit", "true");
  } else if (action === "edit") {
    params.set("edit", "true");
    params.set("address_id", address_id);
  }

  const url = params.size > 0 ? `${baseUrl}?${params.toString()}` : baseUrl;

  return {
    success: true,
    url,
  };
};

/**
 * Helper function to generate success message for address redirects
 * @param {Object} params - Message parameters
 * @param {string} params.action - Action type: 'create', 'edit', or 'list'
 * @param {string} params.address_id - Address ID for edit mode
 * @returns {string} - Generated success message
 */
export const generateAddressMessage = ({ action = "list", address_id }) => {
  const actionMessages = {
    create: "Redirecting to create new address...",
    edit: `Redirecting to edit address: ${address_id}...`,
    list: "Redirecting to address management page...",
  };

  return actionMessages[action] || actionMessages.list;
};
