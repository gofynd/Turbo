import React from "react";
import Skeleton from "../../core/skeleton";
import BrandsGridShimmer from "./brands-grid-shimmer";
import styles from "./brands-page-shimmer.less";

function BrandsPageShimmer({
  showTitle = true,
  showDescription = true,
  showBreadcrumbs = true,
  brandCount = 8,
  className = "",
}) {
  return (
    <div className={`${styles.brandsPageShimmer} ${className}`}>
      {/* Breadcrumbs Skeleton */}
      {showBreadcrumbs && (
        <div className={styles.breadcrumbsContainer}>
          <Skeleton width="120px" height={16} />
        </div>
      )}

      {/* Page Title Skeleton */}
      {showTitle && (
        <div className={styles.titleContainer}>
          <Skeleton width="150px" height={36} />
        </div>
      )}

      {/* Page Description Skeleton */}
      {showDescription && (
        <div className={styles.descriptionContainer}>
          <Skeleton width="350px" height={16} />
        </div>
      )}

      {/* Brands Grid */}
      <div className={styles.brandsContainer}>
        <BrandsGridShimmer brandCount={brandCount} />
      </div>
    </div>
  );
}

export default BrandsPageShimmer;
