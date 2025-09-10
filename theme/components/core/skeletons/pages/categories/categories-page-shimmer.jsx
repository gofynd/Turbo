import React from "react";
import Skeleton from "../../core/skeleton";
import CategoriesGridShimmer from "./categories-grid-shimmer";
import styles from "./categories-page-shimmer.less";

function CategoriesPageShimmer({
  showTitle = true,
  showDescription = true,
  showBreadcrumbs = true,
  categoryCount = 8,
  className = "",
}) {
  return (
    <div className={`${styles.categoriesPageShimmer} ${className}`}>
      {/* Breadcrumbs Skeleton */}
      {showBreadcrumbs && (
        <div className={styles.breadcrumbsContainer}>
          <Skeleton width="140px" height={16} />
        </div>
      )}

      {/* Page Title Skeleton */}
      {showTitle && (
        <div className={styles.titleContainer}>
          <Skeleton width="180px" height={36} />
        </div>
      )}

      {/* Page Description Skeleton */}
      {showDescription && (
        <div className={styles.descriptionContainer}>
          <Skeleton width="400px" height={16} />
        </div>
      )}

      {/* Categories Grid */}
      <div className={styles.categoriesContainer}>
        <CategoriesGridShimmer categoryCount={categoryCount} />
      </div>
    </div>
  );
}

export default CategoriesPageShimmer;
