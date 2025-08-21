// Import all actions from the actions module
import { allCopilotActions } from "./actions/index.js";

/**
 * Function to register tools with Copilot
 * This function handles the registration logic and retry mechanism
 */
const registerCopilotTools = () => {
  const { copilot } = window;

  if (copilot && typeof copilot === "function") {
    try {
      if (copilot.tools && copilot.tools.add) {
        copilot.tools.add(allCopilotActions);
      } else {
        console.warn("❌ [COPILOT] Copilot tools.add method not available");
      }
    } catch (error) {
      console.error("❌ [COPILOT] Error registering copilot tools:", error);
    }
  } else {
    // RETRY LOGIC HERE
    setTimeout(() => {
      registerCopilotTools();
    }, 100000);
  }
};

// Export the registration function and actions for external use
export { registerCopilotTools, allCopilotActions };

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
