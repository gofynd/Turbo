// Import all actions from the actions module
import { allCopilotActions } from "./actions/index.js";

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
    const { copilot } = window;

    // Check if copilot exists and is a function
    if (!copilot || typeof copilot !== "function") {
      throw new Error("Copilot is not available or not a function");
    }

    // Check if copilot.tools.add method exists
    if (!copilot.tools?.add || typeof copilot.tools.add !== "function") {
      throw new Error("Copilot tools.add method is not available");
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
      console.error(
        "❌ [COPILOT] Failed to register copilot tools after all retries",
        {
          error: error.message,
          totalAttempts: MAX_RETRIES,
          finalError: error,
        }
      );
      return false;
    }

    // Calculate delay with exponential backoff
    const baseDelay = INITIAL_DELAY * Math.pow(BACKOFF_FACTOR, retryCount);
    const delay = Math.min(baseDelay, MAX_DELAY);

    console.warn(
      `🔄 [COPILOT] Registration failed, retrying in ${delay}ms ${attemptInfo}`,
      {
        error: error.message,
        nextDelay: delay,
      }
    );

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
 */
const initializeCopilot = async () => {
  try {
    console.log("🚀 [COPILOT] Initializing copilot registration...");

    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      console.warn(
        "⚠️ [COPILOT] Not in browser environment, skipping registration"
      );
      return false;
    }

    const success = await registerCopilotTools();

    if (success) {
      console.log("🎉 [COPILOT] Copilot initialization completed successfully");
    } else {
      console.error("💥 [COPILOT] Copilot initialization failed");
    }

    return success;
  } catch (error) {
    console.error(
      "💥 [COPILOT] Critical error during copilot initialization:",
      error
    );
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
} from "./actions/index.js";
