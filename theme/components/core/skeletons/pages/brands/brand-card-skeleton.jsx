import React from "react";
import Skeleton from "../../core/skeleton";
import styles from "./brand-card-skeleton.less";

function BrandCardSkeleton({
  className = "",
  aspectRatio = 0.8,
  showLogo = false, // For logo-only brand cards
  logoSize = 60,
  showBrandName = true,
}) {
  return (
    <div className={`${styles.brandCardSkeleton} ${className}`}>
      {/* Brand Image/Background */}
      <div className={styles.imageContainer}>
        <Skeleton type="box" aspectRatio={aspectRatio} borderRadius={8} />

        {/* Logo overlay (for logo-based brands) */}
        {showLogo && (
          <div className={styles.logoOverlay}>
            <Skeleton width={logoSize} height={logoSize} borderRadius={8} />
          </div>
        )}
      </div>

      {/* Brand Name */}
      {showBrandName && (
        <div className={styles.brandInfo}>
          <div className={styles.logoIcon}>
            <Skeleton width={24} height={24} borderRadius={4} />
          </div>
          <div className={styles.brandName}>
            <Skeleton width="80%" height={18} borderRadius={4} />
          </div>
        </div>
      )}
    </div>
  );
}

export default BrandCardSkeleton;
