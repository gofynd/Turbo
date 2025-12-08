import React from "react";
import styles from "./store-card.less";
import { formatOrderAcceptanceTiming } from "../../helper/utils";

// Local image assets as inline SVG components
import LocationIcon from "../../assets/images/store-card-location.svg";
import PhoneIcon from "../../assets/images/store-card-phone.svg";
import ScheduleIcon from "../../assets/images/store-card-schedule.svg";
import PickupBadgeIcon from "../../assets/images/store-card-badge-pickup.svg";
import OpenBadgeIcon from "../../assets/images/store-card-badge-open.svg";
import AccessibleBadgeIcon from "../../assets/images/store-card-badge-accessible.svg";

const badgeIcons = {
  Pickup: PickupBadgeIcon,
  "Open Now": OpenBadgeIcon,
  Accessible: AccessibleBadgeIcon,
};

function StoreCard({ store, isSelected, onClick, _original }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  // Format order acceptance timing
  // Check both _original and store for order_acceptance_timing
  const timingData =
    _original?.order_acceptance_timing || store?.order_acceptance_timing;
  const orderTiming = timingData
    ? formatOrderAcceptanceTiming(timingData)
    : null;

  return (
    <div
      className={`${styles.storeCard} ${isSelected ? styles.selectedStore : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.storeHeader}>
        <h3 className={styles.storeName}>{store.name}</h3>
        <span className={styles.storeDistance}>{store.distance}</span>
      </div>
      <div className={styles.storeDetails}>
        <div className={styles.storeInfo}>
          <LocationIcon className={styles.infoIcon} aria-hidden="true" />
          <p className={styles.storeText}>{store.address}</p>
        </div>
        {_original?.manager_contact && (
          <div className={styles.storeInfo}>
            <PhoneIcon className={styles.infoIcon} aria-hidden="true" />
            <p className={styles.storeText}>{_original.manager_contact}</p>
          </div>
        )}
        {orderTiming && (
          <div className={styles.storeInfo}>
            <ScheduleIcon className={styles.infoIcon} aria-hidden="true" />
            <p className={styles.storeHours}>{orderTiming}</p>
          </div>
        )}
        <div className={styles.storeBadges}>
          {store.badges?.map((badge) => {
            const BadgeIcon = badgeIcons[badge];
            return (
              <div key={badge} className={styles.badge}>
                {BadgeIcon && (
                  <BadgeIcon className={styles.badgeIcon} aria-hidden="true" />
                )}
                <span className={styles.badgeText}>{badge}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StoreCard;
