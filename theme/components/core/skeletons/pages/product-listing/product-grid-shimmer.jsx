import React from "react";
import ProductCardSkeleton from "./product-card-skeleton";
import styles from "./product-grid-shimmer.less";

function ProductGridShimmer({
  gridDesktop = 4,
  gridTablet = 3,
  gridMobile = 2,
  productCount = 8,
  className = "",
  aspectRatio = 4 / 5,
  showWishlist = true,
  showSaleTag = true,
  showAddToCart = true,
}) {
  const renderProductGrid = () => {
    return Array.from({ length: productCount }, (_, index) => (
      <ProductCardSkeleton
        key={index}
        aspectRatio={aspectRatio}
        showWishlist={showWishlist}
        showSaleTag={showSaleTag && Math.random() > 0.6} // Randomly show sale tags
        showAddToCart={showAddToCart}
      />
    ));
  };

  return (
    <div
      className={`${styles.productGridShimmer} ${className}`}
      data-grid-desktop={gridDesktop}
      data-grid-tablet={gridTablet}
      data-grid-mobile={gridMobile}
    >
      {renderProductGrid()}
    </div>
  );
}

export default ProductGridShimmer;
