import React from "react";
import Skeleton from "../../core/skeleton";
import CollectionsGridShimmer from "./collections-grid-shimmer";
import styles from "./collections-page-shimmer.less";

function CollectionsPageShimmer({
  showTitle = true,
  showDescription = true,
  showBreadcrumbs = true,
  collectionCount = 8,
  className = "",
}) {
  return (
    <div className={`${styles.collectionsPageShimmer} ${className}`}>
      {/* Breadcrumbs Skeleton */}
      {showBreadcrumbs && (
        <div className={styles.breadcrumbsContainer}>
          <Skeleton width="150px" height={16} />
        </div>
      )}

      {/* Page Title Skeleton */}
      {showTitle && (
        <div className={styles.titleContainer}>
          <Skeleton width="200px" height={36} />
        </div>
      )}

      {/* Page Description Skeleton */}
      {showDescription && (
        <div className={styles.descriptionContainer}>
          <Skeleton width="400px" height={16} />
        </div>
      )}

      {/* Collections Grid */}
      <div className={styles.collectionsContainer}>
        <CollectionsGridShimmer collectionCount={collectionCount} />
      </div>
    </div>
  );
}

export default CollectionsPageShimmer;
