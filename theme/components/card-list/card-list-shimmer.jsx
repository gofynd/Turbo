import React from "react";
import { CollectionCardSkeleton } from "../core/skeletons";
import styles from "./card-list.less";

function CardListShimmer({
  cardType = "COLLECTIONS",
  cardCount = 8,
  className = "",
}) {
  const renderShimmerCards = () => {
    return Array.from({ length: cardCount }, (_, index) => (
      <CollectionCardSkeleton
        key={`shimmer-${cardType}-${index}`}
        aspectRatio={0.8}
        showTitle={true}
      />
    ));
  };

  return (
    <div className={`${styles.grpListWrap} ${className}`}>
      <div className={styles.groupCards} data-card={cardType}>
        {renderShimmerCards()}
      </div>
    </div>
  );
}

export default CardListShimmer;
