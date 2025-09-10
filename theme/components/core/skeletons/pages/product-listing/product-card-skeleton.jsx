import React from "react";
import Skeleton from "../../core/skeleton";
import styles from "./product-card-skeleton.less";

function ProductCardSkeleton({
  className = "",
  aspectRatio = 4 / 5,
  showWishlist = true,
  showSaleTag = true,
  showAddToCart = true,
}) {
  return (
    <div className={`${styles.productCardSkeleton} ${className}`}>
      {/* Product Image Container */}
      <div className={styles.imageContainer}>
        {/* Sale Tag Skeleton */}
        {showSaleTag && (
          <div className={styles.saleTag}>
            <Skeleton width={40} height={20} borderRadius={4} />
          </div>
        )}

        {/* Wishlist Icon Skeleton */}
        {showWishlist && (
          <div className={styles.wishlistIcon}>
            <Skeleton width={24} height={24} borderRadius="50%" />
          </div>
        )}

        {/* Main Product Image */}
        <Skeleton type="box" aspectRatio={aspectRatio} borderRadius={8} />
      </div>

      {/* Product Info Container */}
      <div className={styles.productInfo}>
        {/* Brand Name */}
        <div className={styles.brandName}>
          <Skeleton width="60%" height={16} borderRadius={4} />
        </div>

        {/* Product Title */}
        <div className={styles.productTitle}>
          <Skeleton lines={2} height={18} spacing={4} borderRadius={4} />
        </div>

        {/* Price Container */}
        <div className={styles.priceContainer}>
          <Skeleton width="40%" height={20} borderRadius={4} />
        </div>

        {/* Add to Cart Button */}
        {showAddToCart && (
          <div className={styles.addToCartButton}>
            <Skeleton width="100%" height={40} borderRadius={6} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCardSkeleton;
