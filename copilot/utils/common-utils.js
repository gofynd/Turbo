import { LOCALITY } from "../../theme/queries/logisticsQuery.js";

const PINCODE_REGEX = /^\d{6}$/;

/**
 * Helper function to get FPI state without caching
 * @returns {Object|null} FPI state or null if not available
 */
export const getFpiState = () => {
  if (!window.fpi) return null;
  return window.fpi.store.getState();
};

/**
 * Validate pincode with API call (no caching)
 * @param {string} pincode - 6-digit pincode to validate
 * @returns {Promise<Object>} Validation result
 */
export const getCachedPincodeValidation = async (pincode) => {
  const result = await window.fpi.executeGQL(LOCALITY, {
    locality: "pincode",
    localityValue: pincode,
    country: "IN",
  });

  return result;
};

/**
 * Validate pincode format
 * @param {string} pincode - Pincode to validate
 * @returns {boolean} True if valid format
 */
export const isValidPincodeFormat = (pincode) => {
  return PINCODE_REGEX.test(pincode);
};

/**
 * Create standardized error response
 * @param {boolean} success - Success status
 * @param {string} message - Error message
 * @param {string} actionRequired - Action required type
 * @param {Object} additionalData - Additional data to include
 * @returns {Object} Standardized error response
 */
export const createErrorResponse = (
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

/**
 * Create standardized success response
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @returns {Object} Standardized success response
 */
export const createSuccessResponse = (message, data) => ({
  success: true,
  message,
  data,
});

/**
 * Get current pincode from store without requiring user input
 * @returns {string|null} Current pincode from store or null if not available
 */
export const getCurrentPincodeFromStore = () => {
  try {
    console.log("📍 [COMMON UTILS] Getting pincode from store");
    const state = getFpiState();
    if (!state) {
      console.log("📍 [COMMON UTILS] No FPI state available");
      return null;
    }

    // const locationDetails = state?.LOCATION_DETAILS;
    const pincodeCodeDetails = state?.custom?.locationDetailsKey;

    console.log("📍 [COMMON UTILS] Store state for pincode", {
      hasCustom: !!state?.custom,
      hasLocationDetailsKey: !!pincodeCodeDetails,
      pincodeCodeDetails,
      statKeys: Object.keys(state || {}),
    });

    // Return pincode in priority order
    const currentPincode = pincodeCodeDetails?.pincode || null;

    // Validate format before returning
    if (currentPincode && isValidPincodeFormat(currentPincode)) {
      console.log("✅ [COMMON UTILS] Valid pincode found in store", {
        pincode: currentPincode,
      });
      return currentPincode;
    }

    console.log("❌ [COMMON UTILS] No valid pincode found in store", {
      currentPincode,
    });
    return null;
  } catch (error) {
    console.warn("❌ [COMMON UTILS] Failed to get pincode from store:", error);
    return null;
  }
};
