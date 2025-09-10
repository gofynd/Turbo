import React from "react";
import Skeleton from "../../core/skeleton";
import styles from "./category-card-skeleton.less";

function CategoryCardSkeleton({
  className = "",
  aspectRatio = 0.8, // Match real categories card (same as real implementation)
  showCategoryName = true,
}) {
  return (
    <div className={`${styles.categoryCardSkeleton} ${className}`}>
      {/* Category Image */}
      <div className={styles.imageContainer}>
        <Skeleton type="box" aspectRatio={aspectRatio} borderRadius={0} />

        {/* Category Name overlay at bottom */}
        {showCategoryName && (
          <div className={styles.categoryOverlay}>
            <Skeleton width="70%" height={20} borderRadius={0} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryCardSkeleton;
