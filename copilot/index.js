// Import all actions from the actions module
import { allCopilotActions } from "./actions/index.js";

/**
 * Function to register tools with Copilot
 * This function handles the registration logic and retry mechanism
 */
const registerCopilotTools = () => {
  console.log("🔧 [COPILOT] Attempting to register copilot tools");
  const { copilot } = window;

  console.log("🔧 [COPILOT] Copilot availability check", {
    hasCopilot: !!copilot,
    copilotType: typeof copilot,
    hasTools: !!(copilot && copilot.tools),
    hasAdd: !!(copilot && copilot.tools && copilot.tools.add),
    totalActions: allCopilotActions.length,
    cartActionsCount: allCopilotActions.filter((action) =>
      action.name?.includes("cart")
    ).length,
  });

  if (copilot && typeof copilot === "function") {
    try {
      if (copilot.tools && copilot.tools.add) {
        copilot.tools.add(allCopilotActions);
        console.log("✅ [COPILOT] Tools registered successfully");
        console.log(
          `📊 [COPILOT] Total tools registered: ${allCopilotActions.length}`
        );
        console.log(
          "🛒 [COPILOT] Cart actions registered:",
          allCopilotActions.map((action) => action.name)
        );
      } else {
        console.warn("❌ [COPILOT] Copilot tools.add method not available");
      }
    } catch (error) {
      console.error("❌ [COPILOT] Error registering copilot tools:", error);
    }
  } else {
    console.warn(
      "⏳ [COPILOT] Copilot is not available. Retrying in 1 second..."
    );
    // RETRY LOGIC HERE
    setTimeout(() => {
      registerCopilotTools();
    }, 1000);
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
