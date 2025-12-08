import React from "react";
import Shimmer from "./shimmer";
import styles from "./store-list-shimmer.less";

function StoreListShimmer({ count = 4 }) {
  const StoreCardShimmer = () => (
    <div className={styles.storeCard}>
      {/* Store name */}
      <div className={styles.storeName}>
        <Shimmer height="24px" width="140px" />
      </div>

      {/* Address */}
      <div className={styles.storeInfo}>
        <div className={styles.icon}>
          <Shimmer height="20px" width="20px" />
        </div>
        <div className={styles.infoText}>
          <Shimmer height="16px" width="100%" />
        </div>
      </div>

      {/* Phone */}
      <div className={styles.storeInfo}>
        <div className={styles.icon}>
          <Shimmer height="20px" width="20px" />
        </div>
        <div className={styles.infoText}>
          <Shimmer height="16px" width="120px" />
        </div>
      </div>

      {/* Store hours */}
      <div className={styles.storeInfo}>
        <div className={styles.icon}>
          <Shimmer height="20px" width="20px" />
        </div>
        <div className={styles.infoText}>
          <Shimmer height="16px" width="180px" />
        </div>
      </div>

      {/* Pickup badge */}
      <div className={styles.pickupBadge}>
        <Shimmer height="32px" width="100px" />
      </div>
    </div>
  );

  return (
    <div className={styles.storeListShimmer}>
      {Array.from({ length: count }, (_, index) => (
        <StoreCardShimmer key={index} />
      ))}
    </div>
  );
}

export default StoreListShimmer;
