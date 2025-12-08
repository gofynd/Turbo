import React from "react";
import Shimmer from "./shimmer";
import styles from "./store-locator-shimmer.less";

function StoreLocatorShimmer({ view = "list" }) {
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
    <div className={styles.storeLocatorShimmer}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.title}>
          <Shimmer height="40px" width="280px" />
        </div>
        <div className={styles.subtitle}>
          <Shimmer height="20px" width="340px" />
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className={styles.searchSection}>
        {/* Search Input */}
        <div className={styles.searchInput}>
          <Shimmer height="48px" width="100%" />
        </div>

        {/* Dropdowns */}
        <div className={styles.dropdowns}>
          <div className={styles.dropdown}>
            <Shimmer height="48px" width="100%" />
          </div>
          <div className={styles.dropdown}>
            <Shimmer height="48px" width="100%" />
          </div>
        </div>
      </div>

      {/* Toggle Buttons (Mobile Only) */}
      <div className={styles.toggleButtons}>
        <div className={styles.toggleButton}>
          <Shimmer height="40px" width="100%" />
        </div>
        <div className={styles.toggleButton}>
          <Shimmer height="40px" width="100%" />
        </div>
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        {/* Store List */}
        <div
          className={`${styles.storeList} ${
            view === "map" ? styles.hidden : ""
          }`}
        >
          <StoreCardShimmer />
          <StoreCardShimmer />
          <StoreCardShimmer />
          <StoreCardShimmer />
        </div>

        {/* Map Section */}
        <div
          className={`${styles.mapSection} ${
            view === "list" ? styles.hiddenMobile : ""
          }`}
        >
          <Shimmer height="100%" width="100%" />
        </div>
      </div>
    </div>
  );
}

export default StoreLocatorShimmer;

