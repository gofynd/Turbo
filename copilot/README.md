# Copilot Actions Module

This directory contains the modular structure for Copilot actions, organized for better maintainability and scalability.

## Structure

```
copilot/
├── actions/
│   ├── cart-actions.js       # Cart and checkout related actions
│   ├── product-actions.js    # Product information and listing actions
│   ├── redirect-actions.js   # Navigation and redirect actions
│   ├── search-actions.js     # Search functionality actions
│   ├── wishlist-actions.js   # Wishlist management actions
│   ├── order-actions.js      # Order tracking and status actions
│   └── index.js             # Main actions index - exports all actions
├── index.js                 # Main copilot index - exports registration function
└── README.md               # This documentation file
```

## Action Categories

### 1. Cart Actions (`cart-actions.js`)

- `add_to_cart` - Add products to cart with validation
- `add_to_cart_from_pdp` - Add current product from PDP page
- `add_product_from_listing` - Add products from listing/search results page by position (e.g., "add 3rd product to cart")
- `check_pincode_delivery` - Check delivery availability
- `redirect_to_cart` - Navigate to cart page

### 2. Product Actions (`product-actions.js`)

- `get_product_info` - Get detailed product information
- `list_products_on_page` - List all products on current page

### 3. Redirect Actions (`redirect-actions.js`)

- `redirect_to_products` - Navigate to product listings with filters
- `redirect_to_product` - Navigate to specific product page
- `redirect_to_home` - Navigate to home page
- `redirect_to_contact_support` - Navigate to contact page
- `redirect_to_policies` - Navigate to policy pages
- `redirect_to_checkout` - Navigate to checkout
- `redirect_to_collections` - Navigate to collections
- `redirect_to_categories` - Navigate to categories
- `redirect_to_blogs` - Navigate to blog pages
- `redirect_to_faq` - Navigate to FAQ page
- `redirect_to_brands` - Navigate to brand pages
- `redirect_to_orders` - Navigate to orders page
- `redirect_to_address` - Navigate to address management page with create/edit modes

### 4. Search Actions (`search-actions.js`)

- `search_product` - Search for products by name, brand, or type (e.g., "show me iphones", "search for nike shoes")

### 5. Wishlist Actions (`wishlist-actions.js`)

- `add_to_wishlist_from_pdp` - Add current product to wishlist from PDP page
- `add_to_wishlist_from_listing` - Add specific product to wishlist from listing page by position
- `remove_from_wishlist` - Remove product from wishlist by slug or current PDP product
- `toggle_wishlist` - Toggle product in/out of wishlist (smart add/remove)
- `redirect_to_wishlist` - Navigate to wishlist page
- `list_wishlist_products` - List all products in user's wishlist
- `add_to_cart_from_wishlist` - **NEW** Add products from wishlist to cart by position (ONLY when "wishlist" is mentioned, e.g., "add 3rd product FROM WISHLIST to cart")

### 6. Order Actions (`order-actions.js`)

- `get_latest_order_tracking` - **NEW** Handle "latest order tracking" requests with smart navigation and natural language selection
- `list_my_orders` - **NEW** Show user's orders list with filtering options
- `track_order_by_position` - **NEW** Track orders by position using natural language like "3rd order", "latest order"
- `share_order_tracking_details` - Extract and share detailed tracking information for the current order/shipment page
- `get_order_status` - Get current status of an order or shipment by ID
- `track_order_by_id` - Track an order by providing order ID and redirect to tracking page

## Usage

### Main Import (Recommended)

```javascript
// Import everything from the main copilot module
import { registerCopilotTools } from "./copilot/index.js";

// Register all tools
registerCopilotTools();
```

### Granular Imports (For custom setups)

```javascript
// Import specific action categories
import {
  cartActions,
  redirectActions,
  productActions,
  searchActions,
  wishlistActions,
  orderActions,
} from "./copilot/actions/index.js";

// Or import individual action files
import { cartActions } from "./copilot/actions/cart-actions.js";
import { redirectActions } from "./copilot/actions/redirect-actions.js";
import { wishlistActions } from "./copilot/actions/wishlist-actions.js";
import { orderActions } from "./copilot/actions/order-actions.js";
```

## Adding New Actions

### 1. Add to Existing Category

Add your new action to the appropriate existing file (e.g., `cart-actions.js` for cart-related actions).

### 2. Create New Category

1. Create a new file: `copilot/actions/your-category-actions.js`
2. Export your actions array: `export const yourCategoryActions = [...]`
3. Import and add to `copilot/actions/index.js`:

   ```javascript
   import { yourCategoryActions } from "./your-category-actions.js";

   export const allCopilotActions = [
     ...searchActions,
     ...cartActions,
     ...redirectActions,
     ...productActions,
     ...wishlistActions,
     ...orderActions,
     ...yourCategoryActions, // Add here
   ];
   ```

## Order Tracking Features

The order actions module provides comprehensive order tracking functionality:

### Key Features:

- **Automatic Context Detection**: Automatically detects order/shipment IDs from the current page URL
- **Real-time Status Updates**: Fetches live order and shipment status information
- **Detailed Tracking History**: Provides complete tracking timeline with status updates
- **Smart Formatting**: Formats tracking information in a user-friendly way with emojis and clear structure
- **Multiple Input Methods**: Supports tracking by order ID, shipment ID, or automatic detection from current page

### Usage Examples:

When user asks naturally:

- **"Tell me my latest order tracking details"** → Uses `get_latest_order_tracking` (redirects to orders page, fetches latest order, shows tracking)
- **"Track my 3rd order"** → Uses `track_order_by_position` with natural language parsing
- **"Show me my recent orders"** → Uses `list_my_orders`
- **"What's my last order status?"** → Uses `get_latest_order_tracking` with "last" selection
- **"Share my tracking details"** → Uses `share_order_tracking_details` (when on order page)
- **"Track order FY12345"** → Uses `track_order_by_id`

### Wishlist to Cart Usage Examples:

- **"Add 3rd product from wishlist to cart"** → Uses `add_to_cart_from_wishlist` with position 3
- **"Add first wishlist item to cart"** → Uses `add_to_cart_from_wishlist` with position 1
- **"Add 2nd product from my wishlist to cart with size M"** → Uses `add_to_cart_from_wishlist` with position 2 and size M
- **"Move the 5th wishlist product to cart"** → Uses `add_to_cart_from_wishlist` with position 5

### Product Listing to Cart vs Wishlist to Cart:

**From Product Listing/Search Page:**

- **"Add 3rd product to cart"** → Uses `add_product_from_listing` (when on PLP/search page)
- **"Add first product to cart"** → Uses `add_product_from_listing` (when on PLP/search page)
- **"Add 2 products to cart"** → Uses `add_product_from_listing` (when on PLP/search page)

**From Wishlist (must mention "wishlist"):**

- **"Add 3rd product FROM WISHLIST to cart"** → Uses `add_to_cart_from_wishlist`
- **"Add first WISHLIST item to cart"** → Uses `add_to_cart_from_wishlist`
- **"Move 2nd product from my wishlist to cart"** → Uses `add_to_cart_from_wishlist`

### Product Search Usage Examples:

- **"Show me iphones"** → Uses `search_product` with query "iphones"
- **"Search for nike shoes"** → Uses `search_product` with query "nike shoes"
- **"Find samsung phones"** → Uses `search_product` with query "samsung phones"
- **"Look for laptops"** → Uses `search_product` with query "laptops"

### Natural Language Support:

The enhanced order tracking supports these natural language references:

- **Position**: "latest", "newest", "recent", "last", "first", "oldest", "second", "2nd", "third", "3rd", "fourth", "4th", "fifth", "5th", or numbers like "1", "2", "3"
- **General**: "my orders", "order list", "track order", "order status", "where is my order"

### Smart Navigation Flow:

1. **User Request**: "Tell me my latest order tracking details"
2. **Auto-Redirect**: If not on orders page → navigates to `/profile/orders`
3. **Fetch Orders**: Gets user's order list from API
4. **Parse Selection**: Understands "latest" means first order in list
5. **Get Tracking**: Fetches detailed tracking for all shipments in that order
6. **Format Response**: Shows comprehensive tracking with items, status, delivery info

The copilot can intelligently extract order information from:

- Order tracking pages (`/order-tracking/{orderId}`)
- Shipment detail pages (`/profile/orders/shipment/{shipmentId}`)
- Order listing pages (`/profile/orders`)
- React router state and URL parameters

## Dependencies

All action files depend on utility functions from:

- `../theme/helper/copilot-utils.js` - Core copilot utilities
- `../theme/helper/utils.js` - General utilities (spaNavigate, etc.)
- `../theme/queries/wishlistQuery.js` - Wishlist GraphQL queries (for wishlist actions)

## Backward Compatibility

The main `copilot-actions.js` file in the root maintains backward compatibility by simply importing and re-exporting the registration function from this modular structure.

## Benefits of This Structure

1. **Maintainability** - Actions are logically grouped and easier to maintain
2. **Scalability** - Easy to add new action categories without bloating single file
3. **Reusability** - Individual action categories can be imported separately if needed
4. **Organization** - Clear separation of concerns
5. **Debugging** - Easier to locate and fix issues in specific action categories
