import React from "react";
import CollectionCardSkeleton from "./collection-card-skeleton";
import styles from "./collections-grid-shimmer.less";

function CollectionsGridShimmer({ collectionCount = 8, className = "" }) {
  const renderCollectionGrid = () => {
    return Array.from({ length: collectionCount }, (_, index) => (
      <CollectionCardSkeleton
        key={index}
        aspectRatio={0.8} // Matches the card aspect ratio from the image
        showTitle={true}
      />
    ));
  };

  return (
    <div className={`${styles.collectionsGridShimmer} ${className}`}>
      {renderCollectionGrid()}
    </div>
  );
}

export default CollectionsGridShimmer;
