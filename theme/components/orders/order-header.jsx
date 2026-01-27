import React, { useState } from "react";
import styles from "./styles/order-header.less";
import { useGlobalTranslation } from "fdk-core/utils";
import FilterIcon from "../../assets/images/filter-orders.svg";
import OrderFilterModal from "./order-filter-modal";

function OrdersHeader({
  title,
  subtitle,
  filters,
  flag = false,
  onFilterClick,
}) {
  const { t } = useGlobalTranslation("translation");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const handleFilterClick = () => {
    if (onFilterClick) {
      onFilterClick();
    } else if (!flag) {
      setShowFilterModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowFilterModal(false);
  };

  return (
    <>
      <div className={styles.orderHeaderContainer}>
        {/* Title and Filter Row */}
        <div className={styles.titleFilterRow}>
          <div className={`${styles.title} ${styles.boldmd}`}>
            {title}
            {subtitle && <span className={styles.subTitle}>{subtitle}</span>}
          </div>

          <button
            className={styles.filterButton}
            onClick={handleFilterClick}
            aria-label="Filter orders"
            type="button"
            disabled={flag}
          >
            <FilterIcon className={styles.filterIcon} />
          </button>
        </div>

        {/* Divider */}
        <div className={styles.headerDivider}></div>
      </div>

      {/* Filter Modal */}
      {!flag && (
        <OrderFilterModal
          isOpen={showFilterModal}
          onClose={handleCloseModal}
          filters={filters}
        />
      )}
    </>
  );
}

export default OrdersHeader;
