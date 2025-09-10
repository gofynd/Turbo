import React from "react";
import Skeleton from "../../core/skeleton";
import styles from "./collection-card-skeleton.less";

function CollectionCardSkeleton({
  className = "",
  aspectRatio = 0.8,
  showTitle = true,
}) {
  return (
    <div className={`${styles.collectionCardSkeleton} ${className}`}>
      {/* Collection Image */}
      <div className={styles.imageContainer}>
        <Skeleton type="box" aspectRatio={aspectRatio} borderRadius={8} />

        {/* Title overlay area (for collections with text on image) */}
        {showTitle && (
          <div className={styles.titleOverlay}>
            <Skeleton width="80%" height={24} borderRadius={4} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectionCardSkeleton;
