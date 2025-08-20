# Copilot Utils - Modular Utility Functions

This directory contains organized, scalable utility functions for the Copilot integration system. The utilities are separated into focused modules based on their functionality and usage patterns.

## 📁 Module Structure

### 🛒 Cart Utils (`cart-utils.js`)

**Used by:** `cart-actions.js`

Contains all cart-related functionality:

- `addToCart()` - Enhanced add to cart with validation, pincode checks, and MOQ handling
- `checkPincodeDelivery()` - Pincode deliverability validation

**Dependencies:** `common-utils.js`, `product-utils.js`

### 📦 Product Utils (`product-utils.js`)

**Used by:** `product-actions.js`, `cart-actions.js`, `wishlist-actions.js`

Contains all product-related functionality:

- `getProductInfo()` - Detailed product information retrieval
- `extractProductsFromCurrentPage()` - Extract products from current page using API calls
- `buildProductDescription()` - Format product descriptions
- Product listing extraction for various page types (collections, categories, brands, search)

**Dependencies:** `common-utils.js`

### 🔗 Redirect Utils (`redirect-utils.js`)

**Used by:** `redirect-actions.js`

Contains navigation and URL building utilities:

- `buildProductUrl()` - Build product URLs with filters
- `generateSuccessMessage()` - Generate user-friendly redirect messages
- `buildAddressUrl()` - Build address management URLs with validation
- `generateAddressMessage()` - Generate address redirect messages
- `buildPriceFilter()` - Format price filters for URLs
- `getPriceText()` - Format price text for display
- `getStringParam()` - Safe string parameter validation

**Dependencies:** None (standalone)

### 🔧 Common Utils (`common-utils.js`)

**Used by:** All action modules

Contains shared functionality used across multiple modules:

- FPI state handling
- Pincode validation via API calls
- Standardized response builders
- Current pincode retrieval from store

**Dependencies:** None (base module)

## 🚀 Usage Examples

### Basic Imports (Recommended)

```javascript
// Import specific functions from their modules
import { addToCart } from "../utils/cart-utils.js";
import { getProductInfo } from "../utils/product-utils.js";
import { buildProductUrl } from "../utils/redirect-utils.js";
import { getFpiState, createErrorResponse } from "../utils/common-utils.js";
```

### Namespace Imports

```javascript
// Import entire modules as namespaces
import { cartUtils, productUtils } from "../utils/index.js";

// Usage
await cartUtils.addToCart({ product_id: "example" });
const products = await productUtils.extractProductsFromCurrentPage();
```

### Index File Imports

```javascript
// Import everything from the main index
import {
  addToCart,
  getProductInfo,
  buildProductUrl,
  getFpiState,
} from "../utils/index.js";
```

## 📊 Direct API Integration

The utilities use direct API calls without caching for real-time data:

### API Operations

- **FPI State Access**: Direct access to current app state
- **Pincode Validation**: Real-time API calls for location validation
- **Product Information**: Fresh product data on each request

### Benefits

- Always up-to-date information
- Reduced memory usage
- Simplified logic without cache management
- No cache invalidation concerns

## 📊 Performance Optimizations

### 1. **Parallel API Calls**

Product and pincode validation calls are made in parallel where possible.

### 2. **Regex Pre-compilation**

Common patterns (pincode validation) are pre-compiled for better performance.

### 3. **Direct State Access**

Eliminates cache overhead for immediate data access.

### 3. **Optimized Object Construction**

Response objects are built efficiently without unnecessary spreading.

### 4. **Memory Monitoring**

Automatic detection of memory pressure using Performance API.

### 5. **Smart Cache Invalidation**

Context-aware cache clearing based on user actions:

```javascript
import { invalidateCache } from "../utils/common-utils.js";

// Clear cache when user logs out
invalidateCache("user_logout");

// Clear location cache when user changes pincode
invalidateCache("location_change");
```

## 🔧 Migration Guide

### From Legacy `copilot-utils.js`

**Before:**

```javascript
import { addToCart, getProductInfo } from "../../theme/helper/copilot-utils";
```

**After:**

```javascript
import { addToCart } from "../utils/cart-utils.js";
import { getProductInfo } from "../utils/product-utils.js";
```

### Benefits of Migration

1. **Better Performance**: Smaller bundle sizes due to tree-shaking
2. **Clearer Dependencies**: Easy to see what each action uses
3. **Easier Testing**: Mock specific utility modules
4. **Better Caching**: Module-specific cache management
5. **Scalability**: Easy to add new utilities to appropriate modules

## 🔍 Utility Function Reference

### Cart Utils

| Function               | Description                         | Parameters                                     | Returns             |
| ---------------------- | ----------------------------------- | ---------------------------------------------- | ------------------- |
| `addToCart`            | Add product to cart with validation | `{product_id, quantity, size, color, pincode}` | `Promise<Response>` |
| `checkPincodeDelivery` | Check pincode deliverability        | `pincode: string`                              | `Promise<Response>` |

### Product Utils

| Function                         | Description                | Parameters                   | Returns             |
| -------------------------------- | -------------------------- | ---------------------------- | ------------------- |
| `getProductInfo`                 | Get product details        | `{product_id, pincode?}`     | `Promise<Response>` |
| `extractProductsFromCurrentPage` | Extract products from page | None                         | `Promise<Array>`    |
| `buildProductDescription`        | Format product description | `productName, size?, color?` | `string`            |

### Redirect Utils

| Function                 | Description                       | Parameters                              | Returns        |
| ------------------------ | --------------------------------- | --------------------------------------- | -------------- |
| `buildProductUrl`        | Build filtered product URL        | `{search?, category?, min_price?, ...}` | `string`       |
| `generateSuccessMessage` | Generate redirect message         | `{search?, category?, min_price?, ...}` | `string`       |
| `buildAddressUrl`        | Build address management URL      | `{action?, address_id?}`                | `Object`       |
| `generateAddressMessage` | Generate address redirect message | `{action?, address_id?}`                | `string`       |
| `buildPriceFilter`       | Format price filter               | `min_price?, max_price?`                | `string\|null` |

### Common Utils

| Function                     | Description               | Parameters                        | Returns           |
| ---------------------------- | ------------------------- | --------------------------------- | ----------------- |
| `getFpiState`                | Get cached FPI state      | None                              | `Object\|null`    |
| `getCachedPincodeValidation` | Cached pincode validation | `pincode: string`                 | `Promise<Object>` |
| `createErrorResponse`        | Standard error response   | `success, message, action, data?` | `Object`          |
| `createSuccessResponse`      | Standard success response | `message, data`                   | `Object`          |

## 🎯 Best Practices

### 1. **Import Only What You Need**

```javascript
// ✅ Good - specific imports
import { addToCart } from "../utils/cart-utils.js";

// ❌ Avoid - importing everything
import * as utils from "../utils/index.js";
```

### 2. **Use Appropriate Cache Invalidation**

```javascript
// When user changes location
invalidateCache("location_change");

// When product data might be stale
invalidateCache("product_update");
```

### 3. **Handle Memory Pressure**

The system automatically handles memory pressure, but you can monitor:

```javascript
const stats = getCacheStats();
if (stats.health.status === "warning") {
  console.warn("Memory pressure detected, consider reducing cache usage");
}
```

### 4. **Error Handling**

Use standardized response builders:

```javascript
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/common-utils.js";

// Consistent error responses
return createErrorResponse(false, "Product not found", "product_not_found");

// Consistent success responses
return createSuccessResponse("Product added successfully", { product_id });
```

## 🔬 Testing

Each module can be tested independently:

```javascript
// Test cart utils
import { addToCart } from "../utils/cart-utils.js";

// Mock only the dependencies you need
jest.mock("../utils/common-utils.js", () => ({
  getFpiState: jest.fn(),
  getCachedPincodeValidation: jest.fn(),
}));
```

## 📈 Monitoring

The cache system provides comprehensive statistics:

```javascript
import { getCacheStats } from "../utils/common-utils.js";

const stats = getCacheStats();
// Monitor cache efficiency, memory usage, and health
```

This modular structure provides better maintainability, performance, and scalability for the Copilot integration system.
