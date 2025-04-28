// StoreModal.js
import React, { useState } from "react";
import PropTypes from "prop-types";
import StoreItem from "./store-item";
import styles from "./store-modal.less"; // Import the module CSS file
import { useGlobalTranslation } from "fdk-core/utils";
import Loader from "../../../../components/loader/loader";
import CloseIcon from "../../../../assets/images/close.svg";
import ArrowDownIcon from "../../../../assets/images/arrow-down.svg";

function StoreModal({
  isOpen,
  buybox,
  allStoresInfo,
  onCloseDialog,
  addItemForCheckout,
  getProductSellers,
  isSellerLoading,
}) {
  const { t } = useGlobalTranslation("translation");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isViewMore, setIsViewMore] = useState(true);
  const pageSize = 4;

  const isDataLoading = !Object.keys(allStoresInfo || {}).length;
  const isSellerListing = buybox?.is_seller_buybox_enabled;
  const availableCounts = `${t("resource.common.available")} ${t("resource.common.in")} ${allStoresInfo?.items?.length} ${
    isSellerListing 
      ? t("resource.common.seller") 
      : t("resource.common.store")
    }${allStoresInfo?.items?.length > 1 ? "s" : ""}`;

  const listingItems = allStoresInfo?.items || [];
  const getListingItems = isViewMore
    ? listingItems.slice(0, pageSize)
    : listingItems;
  const activeSortOption =
    allStoresInfo?.sort_on?.find((option) => option.is_selected)?.name || "";

  const closeSortDropdown = () => {
    setShowSortDropdown(false);
  };

  const selectionChange = (selected) => {
    getProductSellers(selected);
    closeSortDropdown();
  };

  const storeSelected = (event, item, isBuyNow) => {
    addItemForCheckout(event, isBuyNow, item);
  };

  const onViewMore = () => {
    setIsViewMore(false);
  };

  const closeDialog = () => {
    onCloseDialog();
    closeSortDropdown();
  };

  return (
    <div>
      {isOpen && (
        <div className={`${styles.sidebarContainer} ${styles.fontBody}`}>
          <div className={styles.sidebarHeader}>
            <h3 className={`${styles.sellerLabel} ${styles.fontHeader}`}>
              {isSellerListing ? t("resource.common.seller") : t("resource.common.store")}
            </h3>
            <span onClick={closeDialog}>
              <CloseIcon className={styles.closeIcon} />
            </span>
          </div>

          <div className={styles.sidebarBody}>
            {isDataLoading ? (
              <Loader />
            ) : (
              <>
                <div
                  className={`${styles.sortWrapper} ${styles.closeSortDropdown}`}
                >
                  <button
                    type="button"
                    className={`${styles.sortButton} ${styles.flexAlignCenter} ${styles.justifyBetween} ${styles.fontBody}`}
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                  >
                    <p
                      className={`b1 ${styles.selectedOption}`}
                      title={activeSortOption}
                    >
                      {activeSortOption}
                    </p>
                    <ArrowDownIcon
                      className={`${styles.dropdownArrow} ${showSortDropdown ? styles.rotateArrow : ""}`}
                    />
                  </button>
                  <ul
                    className={styles.sortDropdown}
                    style={{ display: showSortDropdown ? "block" : "none" }}
                  >
                    {allStoresInfo?.sort_on?.map((opt, index) => (
                      <li
                        key={index}
                        className={`b1 ${opt.is_selected ? styles.selectedOption : ""
                          }`}
                        onClick={() => selectionChange(opt.value)}
                      >
                        {opt.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <h5 className={styles.storeCounts}>{availableCounts}</h5>

                {isSellerLoading ? (
                  <Loader />
                ) : (
                  <>
                    <div className={styles.data}>
                      {getListingItems?.map((item, index) => (
                        <StoreItem
                          key={index}
                          storeitem={item}
                          buybox={buybox}
                          onSelectStoreItem={(event, item, isBuyNow) =>
                            storeSelected(event, item, isBuyNow)
                          }
                        />
                      ))}
                    </div>
                    {isViewMore && listingItems?.length > pageSize && (
                      <div
                        className={`${styles.viewMoreWrapper} ${styles.flexCenter}`}
                      >
                        <button
                          type="button"
                          onClick={onViewMore}
                          className={styles.viewMoreBtn}
                        >
                          {t("resource.facets.view_more")}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div >
        </div >
      )}
      {/* eslint-disable jsx-a11y/no-static-element-interactions */}
      {
        isOpen && (
          <div
            className={`${styles.overlay} ${styles.show}`}
            onClick={closeDialog}
          />
        )
      }
    </div >
  );
}

StoreModal.propTypes = {
  isOpen: PropTypes.bool,
  onCloseDialog: PropTypes.func,
};

export default StoreModal;
