// Import all actions from the actions module
import { allCopilotActions } from "./actions/index";

/**
 * Configuration for Copilot registration
 */
const COPILOT_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 500, // Start with 500ms
  MAX_DELAY: 5000, // Cap at 5 seconds
  BACKOFF_FACTOR: 1.5, // Exponential backoff multiplier
};

/**
 * Enhanced function to register tools with Copilot
 * Uses exponential backoff and comprehensive error handling
 *
 * @param {number} retryCount - Current retry attempt (0-indexed)
 * @param {Object} config - Configuration object
 * @returns {Promise<boolean>} - Success status
 */
const registerCopilotTools = async (
  retryCount = 0,
  config = COPILOT_CONFIG
) => {
  const { MAX_RETRIES, INITIAL_DELAY, MAX_DELAY, BACKOFF_FACTOR } = config;

  try {
    // Strict SSR check - window must exist
    if (typeof window === "undefined") {
      throw new Error("Window is not available (SSR environment)");
    }

    // Strict check - window.copilot must exist
    if (!window.copilot) {
      throw new Error("window.copilot is not available");
    }

    const { copilot } = window;

    // Strict check - copilot must be a function
    if (typeof copilot !== "function") {
      throw new Error("Copilot is not a function");
    }

    // Strict check - copilot.tools must exist
    if (!copilot.tools) {
      throw new Error("copilot.tools is not available");
    }

    // Strict check - copilot.tools.add must exist and be a function
    if (typeof copilot.tools.add !== "function") {
      throw new Error("copilot.tools.add is not a function");
    }

    // Validate actions before registration
    if (!allCopilotActions || Object.keys(allCopilotActions).length === 0) {
      throw new Error("No copilot actions available to register");
    }

    // Attempt to register tools
    await copilot.tools.add(allCopilotActions);

    console.log("✅ [COPILOT] Copilot tools registered successfully", {
      actionsCount: Object.keys(allCopilotActions).length,
      attempt: retryCount + 1,
    });

    return true;
  } catch (error) {
    const isLastAttempt = retryCount >= MAX_RETRIES - 1;
    const attemptInfo = `(attempt ${retryCount + 1}/${MAX_RETRIES})`;

    if (isLastAttempt) {
      // Use console.debug instead of console.error to avoid unnecessary warnings
      // when Copilot is intentionally disabled or not loaded
      console.debug("ℹ️ [COPILOT] Copilot tools registration completed", {
        error: error.message,
        totalAttempts: MAX_RETRIES,
      });
      return false;
    }

    // Calculate delay with exponential backoff
    const baseDelay = INITIAL_DELAY * BACKOFF_FACTOR ** retryCount;
    const delay = Math.min(baseDelay, MAX_DELAY);

    // Only log debug messages on first few attempts
    if (retryCount < 2) {
      console.debug(`🔄 [COPILOT] Registration in progress ${attemptInfo}`, {
        nextDelay: delay,
      });
    }

    // Schedule retry with exponential backoff
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await registerCopilotTools(retryCount + 1, config);
        resolve(result);
      }, delay);
    });
  }
};

/**
 * Initialize Copilot registration with safety checks
 * This is the main entry point for copilot initialization
 * Auto-initializes if window.copilot is available
 * @param {Object} config - Configuration object (optional)
 * @param {boolean} config.storefrontCopilotActions - Whether to register Storefront Copilot Actions (defaults to false)
 */
const initializeCopilot = async (config = {}) => {
  try {
    // Strict SSR check - must be in browser environment
    if (typeof window === "undefined") {
      // Silently skip in SSR environment
      return false;
    }

    // Check if window.copilot is available - if not, silently return (no logs)
    if (!window.copilot) {
      // Silently skip if copilot is not available (no console logs)
      return false;
    }

    // Get storefront copilot actions configuration
    const storefrontCopilotActions = config?.storefrontCopilotActions ?? false;

    // If Storefront Copilot Actions is disabled, don't register storefront actions
    // The Copilot will use Backend API based results instead
    if (!storefrontCopilotActions) {
      console.log(
        "ℹ️ [COPILOT] Storefront Copilot Actions disabled. Copilot will use Backend API based results."
      );
      // Return true to indicate Copilot is available but using backend API
      return true;
    }

    console.log("🚀 [COPILOT] Initializing copilot registration...", {
      storefrontCopilotActions,
    });

    const success = await registerCopilotTools();

    if (success) {
      console.log("🎉 [COPILOT] Copilot initialization completed successfully");
    } else {
      console.debug(
        "ℹ️ [COPILOT] Copilot initialization completed (using backend API)"
      );
    }

    return success;
  } catch (error) {
    console.debug("ℹ️ [COPILOT] Copilot initialization note:", error.message);
    return false;
  }
};

// Export the registration function and actions for external use
export {
  registerCopilotTools,
  initializeCopilot,
  allCopilotActions,
  COPILOT_CONFIG,
};

// Export individual action categories for granular imports if needed
export {
  searchActions,
  cartActions,
  redirectActions,
  productActions,
  wishlistActions,
  orderActions,
  navigationActions,
} from "./actions/index";
