// Import all action modules
import { searchActions } from "./search-actions.js";
import { cartActionsV2 } from "./cart-actions-v2.js"; // NEW: Advanced cart actions with data chaining
import { redirectActions } from "./redirect-actions.js";
import { productActions } from "./product-actions.js";
import wishlistActions from "./wishlist-actions.js";
import { orderActions } from "./order-actions.js";
import { navigationActions } from "./navigation-actions.js";
import { checkoutActions } from "./checkout-actions.js";
import { paymentActions } from "./payment-actions.js";

// Combine all action arrays into a single tools array
export const allCopilotActions = [
  ...searchActions,
  ...cartActionsV2, // NEW: Advanced cart actions with intelligent data flow
  ...productActions,
  ...wishlistActions,
  ...orderActions,
  ...navigationActions,
  ...checkoutActions,
  ...paymentActions,
];

// Export individual action arrays for granular control if needed
export {
  searchActions,
  cartActionsV2, // NEW: Export the new cart actions
  redirectActions,
  productActions,
  wishlistActions,
  orderActions,
  navigationActions,
  checkoutActions,
  paymentActions, // Export the new payment actions
};
