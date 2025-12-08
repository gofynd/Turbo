import React from "react";
import styles from "./store-info-window.less";
import LocationIcon from "../../assets/images/store-card-location.svg";
import PhoneIcon from "../../assets/images/store-card-phone.svg";

function StoreInfoWindow({ store, onGetDirection }) {
  const handleGetDirection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onGetDirection) {
      onGetDirection();
    }
  };

  return (
    <div className={styles.infoWindowCard}>
      <div className={styles.storeHeader}>
        <p className={styles.storeName}>{store.name}</p>
        {store.distance && (
          <p className={styles.storeDistance}>{store.distance}</p>
        )}
      </div>
      <div className={styles.storeDetails}>
        <div className={styles.storeInfoAddress}>
          <div className={styles.iconWrapper}>
            <LocationIcon className={styles.infoIcon} aria-hidden="true" />
          </div>
          <p className={styles.storeText}>{store.address}</p>
        </div>
        {store._original.manager_contact && (
          <div className={styles.storeInfoPhone}>
            <div className={styles.iconWrapper}>
              <PhoneIcon className={styles.infoIcon} aria-hidden="true" />
            </div>
            <p className={styles.storeText}>
              {store._original.manager_contact}
            </p>
          </div>
        )}
        <div className={styles.buttonContainer}>
          <div
            className={styles.getDirectionButton}
            onClick={handleGetDirection}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleGetDirection(e);
              }
            }}
          >
            <p className={styles.getDirectionButtonText}>Get Direction</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreInfoWindow;
