# Skeleton Components

This directory contains optimized skeleton/shimmer components for loading states in the React Starter theme.

## Components

### 1. `Skeleton` - Base Skeleton Component

The foundational skeleton component for individual elements.

```jsx
import { Skeleton } from '../components/core/skeletons';

// Basic usage
<Skeleton width="100px" height={20} />

// Multiple lines
<Skeleton lines={3} spacing={8} />

// Different types
<Skeleton type="box" aspectRatio={16/9} />
<Skeleton type="circle" width={40} height={40} />
```

### 2. `ProductCardSkeleton` - Individual Product Card

Skeleton for a single product card matching PLP layout.

```jsx
import { ProductCardSkeleton } from "../components/core/skeletons";

<ProductCardSkeleton
  aspectRatio={4 / 5}
  showWishlist={true}
  showSaleTag={true}
  showAddToCart={true}
/>;
```

### 3. `ProductGridShimmer` - Product Grid

Skeleton grid for multiple product cards without page elements.

```jsx
import { ProductGridShimmer } from "../components/core/skeletons";

<ProductGridShimmer
  gridDesktop={4}
  gridTablet={3}
  gridMobile={2}
  productCount={8}
/>;
```

### 4. `PLPShimmer` - Complete PLP Page

Full page skeleton for Product Listing Page with filters, sort, and pagination.

```jsx
import { PLPShimmer } from "../components/core/skeletons";

<PLPShimmer
  gridDesktop={4}
  gridTablet={3}
  gridMobile={2}
  showFilters={true}
  showSortBy={true}
  showPagination={true}
  productCount={12}
/>;
```

### 5. `CollectionCardSkeleton` - Individual Collection Card

Skeleton for a single collection card with image and title overlay.

```jsx
import { CollectionCardSkeleton } from "../components/core/skeletons";

<CollectionCardSkeleton aspectRatio={0.8} showTitle={true} />;
```

### 6. `CollectionsGridShimmer` - Collections Grid

Skeleton grid for multiple collection cards matching the 4-column layout.

```jsx
import { CollectionsGridShimmer } from "../components/core/skeletons";

<CollectionsGridShimmer collectionCount={8} />;
```

### 7. `CollectionsPageShimmer` - Complete Collections Page

Full page skeleton for Collections Page with breadcrumbs, title, description, and grid.

```jsx
import { CollectionsPageShimmer } from "../components/core/skeletons";

<CollectionsPageShimmer
  showTitle={true}
  showDescription={true}
  showBreadcrumbs={true}
  collectionCount={12}
/>;
```

### 8. `BrandCardSkeleton` - Individual Brand Card

Skeleton for a single brand card with image/logo and brand name.

```jsx
import { BrandCardSkeleton } from "../components/core/skeletons";

<BrandCardSkeleton
  aspectRatio={0.8}
  showLogo={false}
  logoSize={60}
  showBrandName={true}
/>;
```

### 9. `BrandsGridShimmer` - Brands Grid

Skeleton grid for multiple brand cards with mixed image/logo types.

```jsx
import { BrandsGridShimmer } from "../components/core/skeletons";

<BrandsGridShimmer brandCount={8} />;
```

### 10. `BrandsPageShimmer` - Complete Brands Page

Full page skeleton for Brands Page with breadcrumbs, title, description, and grid.

```jsx
import { BrandsPageShimmer } from "../components/core/skeletons";

<BrandsPageShimmer
  showTitle={true}
  showDescription={true}
  showBreadcrumbs={true}
  brandCount={12}
/>;
```

### 11. `CategoryCardSkeleton` - Individual Category Card

Skeleton for a single category card with product image and category name overlay.

```jsx
import { CategoryCardSkeleton } from "../components/core/skeletons";

<CategoryCardSkeleton aspectRatio={0.8} showCategoryName={true} />;
```

### 12. `CategoriesGridShimmer` - Categories Grid

Skeleton grid for multiple category cards matching the 4-column layout.

```jsx
import { CategoriesGridShimmer } from "../components/core/skeletons";

<CategoriesGridShimmer categoryCount={8} />;
```

### 13. `CategoriesPageShimmer` - Complete Categories Page

Full page skeleton for Categories Page with breadcrumbs, title, description, and grid.

```jsx
import { CategoriesPageShimmer } from "../components/core/skeletons";

<CategoriesPageShimmer
  showTitle={true}
  showDescription={true}
  showBreadcrumbs={true}
  categoryCount={12}
/>;
```

## Key Features

### ✅ Optimized Performance

- Uses same shimmer animation from PDP page
- Minimal re-renders with proper prop handling
- Responsive grid layouts

### ✅ Realistic Layout Matching

- Product cards match actual content dimensions
- Includes sale tags, wishlist icons, and buttons
- Proper spacing and typography rhythm

### ✅ Responsive Design

- Desktop, tablet, and mobile grid layouts
- Adaptive spacing and sizing
- Mobile-first approach

### ✅ Configurable Options

- Grid layouts (1-4 columns)
- Show/hide optional elements
- Custom aspect ratios
- Flexible product counts

## Usage in PLP

The PLP section now automatically uses `PLPShimmer` instead of the basic shimmer:

## Usage in Collections

The Collections section now automatically uses optimized shimmer:

## Usage in Brands

The Brands section now automatically uses optimized shimmer:

## Usage in Categories

The Categories section now automatically uses optimized shimmer:

```jsx
// Before (basic shimmer)
if (isPageLoading) {
  return <Shimmer />;
}

// After (optimized PLP shimmer)
if (isPageLoading) {
  return (
    <PLPShimmer
      gridDesktop={props?.grid_desktop?.value || 4}
      gridTablet={props?.grid_tablet?.value || 3}
      gridMobile={props?.grid_mob?.value || 2}
      showFilters={true}
      showSortBy={true}
      showPagination={props?.loading_options?.value === "pagination"}
      productCount={props?.page_size?.value || 12}
    />
  );
}
```

```jsx
// Collections Page - Initial Loading
if (isLoading && !collections?.length) {
  return (
    <CollectionsPageShimmer
      showTitle={!!title}
      showDescription={!!description}
      showBreadcrumbs={true}
      collectionCount={12}
    />
  );
}

// Collections Page - Load More (Infinite Scroll)
{
  isLoading && collections?.length > 0 && (
    <CollectionsGridShimmer collectionCount={4} />
  );
}
```

```jsx
// Brands Page - Initial Loading
if (isLoading && !brands?.length) {
  return (
    <BrandsPageShimmer
      showTitle={!!title}
      showDescription={!!description}
      showBreadcrumbs={true}
      brandCount={12}
    />
  );
}

// Brands Page - Load More (Infinite Scroll)
{
  isLoading && brands?.length > 0 && <BrandsGridShimmer brandCount={4} />;
}
```

```jsx
// Categories Page - Initial Loading
if (isLoading && !sortedCategories?.length) {
  return (
    <CategoriesPageShimmer
      showTitle={!!heading}
      showDescription={!!description}
      showBreadcrumbs={true}
      categoryCount={12}
    />
  );
}

// Categories Page - In Content Area
{
  isLoading ? (
    <CategoriesPageShimmer
      showTitle={!!heading}
      showDescription={!!description}
      showBreadcrumbs={false}
      categoryCount={12}
    />
  ) : (
    <CategoryList categories={sortedCategories} />
  );
}
```

## Animation Details

All components use the same shimmer animation as the PDP page:

- 1.5s duration with smooth wave effect
- Uses theme accent colors for consistency
- Hardware-accelerated transforms for performance

## Usage in Sections

The shimmer components are used in various sections:

- **PLP (Product Listing Page)**: `sections/product-listing.jsx` uses `PLPShimmer`
- **Collection Listing Page**: `sections/collection-listing.jsx` uses `PLPShimmer`
- **Collections Page**: `sections/collections.jsx` uses `CollectionsPageShimmer`
- **Brands Page**: `sections/brands-landing.jsx` uses `BrandsPageShimmer`
- **Categories Page**: `sections/categories.jsx` uses `CategoriesPageShimmer`

## Browser Support

- Modern browsers with CSS Grid support
- Fallback layouts for older browsers
- Optimized for mobile performance
