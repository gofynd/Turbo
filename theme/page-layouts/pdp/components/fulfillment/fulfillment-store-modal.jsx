import React, { useEffect, useState } from "react";
import FulfillmentStoreItem from "./fulfillment-store-item";
import styles from "./fulfillment-store-modal.less"; // Import the module CSS file
import Loader from "../../../../components/loader/loader";
import CloseIcon from "../../../../assets/images/close.svg";
import ArrowDownIcon from "../../../../assets/images/arrow-down.svg";

import FyButton from "@gofynd/theme-template/components/core/fy-button/fy-button";
import "@gofynd/theme-template/components/core/fy-button/fy-button.css";

function FulfillmentStoreModal({
  isOpen,
  buybox,
  allStoresInfo,
  onCloseDialog,
  fulfillmentOptions,
  currentFO,
  setCurrentFO,
  productPriceBySlug,
  setProductPriceBySlug,
  getProductSellers,
  isSellerLoading,
  setFulfillmentOptions,
}) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isViewMore, setIsViewMore] = useState(true);
  const pageSize = 4;
  const [selectedFO, setSelectedFO] = useState(currentFO);
  const [selectedStore, setSelectedStore] = useState(productPriceBySlug);

  const isDataLoading = !Object.keys(allStoresInfo || {}).length;
  const isSellerListing = buybox?.is_seller_buybox_enabled;

  const listingItems = allStoresInfo?.items || [];

  const getListingItems = isViewMore
    ? listingItems.slice(0, pageSize)
    : listingItems;

  const activeSortOption =
    fulfillmentOptions?.find(
      (foItem) => selectedFO?.slug === foItem?.fulfillment_option?.slug
    )?.fulfillment_option?.name || "";

  useEffect(() => {
    setSelectedFO(currentFO);
  }, [currentFO]);

  useEffect(() => {
    setSelectedStore(productPriceBySlug);
  }, [productPriceBySlug]);

  const closeSortDropdown = () => {
    setShowSortDropdown(false);
  };

  const selectionChange = (foItem) => {
    setSelectedFO(foItem?.fulfillment_option);
    getProductSellers("", foItem?.fulfillment_option?.slug);
    closeSortDropdown();
  };

  const storeSelected = (item) => {
    setSelectedStore(item);
  };

  const onViewMore = () => {
    setIsViewMore(false);
  };

  const closeDialog = () => {
    onCloseDialog();
    closeSortDropdown();
  };

  const onStoreSelectionConfirm = () => {
    setFulfillmentOptions((foItems) => {
      return foItems.map((foItem) => {
        if (foItem?.fulfillment_option?.slug === selectedFO?.slug) {
          return {
            ...foItem,
            delivery_promise: selectedStore?.delivery_promise,
          };
        }

        return foItem;
      });
    });

    setProductPriceBySlug(selectedStore);
    setCurrentFO(selectedFO);
    closeDialog();
  };

  const isStoreSelected = (storeitem) => {
    if (selectedStore) {
      return (
        selectedStore?.seller?.uid === storeitem?.seller?.uid &&
        selectedStore?.store?.uid === storeitem?.store?.uid
      );
    }

    return false;
  };

  return (
    <div>
      {isOpen && (
        <div className={`${styles.sidebarContainer} ${styles.fontBody}`}>
          <div className={styles.sidebarHeader}>
            <h3 className={`${styles.sellerLabel} ${styles.fontHeader}`}>
              Select {isSellerListing ? "Seller" : "Store"}
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
                {fulfillmentOptions.length > 1 && (
                  <div
                    className={`${styles.sortWrapper} ${styles.closeSortDropdown}`}
                  >
                    <button
                      type="button"
                      className={`${styles.sortButton} ${styles.flexAlignCenter} ${styles.justifyBetween} ${styles.fontBody}`}
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                    >
                      <p
                        className={styles.selectedOption}
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
                      {fulfillmentOptions?.map((foItem, index) => (
                        <li
                          key={index}
                          className={`b1 ${
                            selectedFO?.slug ===
                            foItem?.fulfillment_option?.slug
                              ? styles.selectedOption
                              : ""
                          }`}
                          onClick={() => selectionChange(foItem)}
                        >
                          {foItem?.fulfillment_option?.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {isSellerLoading ? (
                  <Loader />
                ) : (
                  <>
                    <div className={styles.storeItems}>
                      {getListingItems.map((item, index) => (
                        <FulfillmentStoreItem
                          key={index}
                          storeitem={item}
                          buybox={buybox}
                          onSelectStoreItem={(item) => storeSelected(item)}
                          isStoreSelected={isStoreSelected(item)}
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
                          View More
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <div className={styles.sidebarFooter}>
            <FyButton fullWidth={true} onClick={onStoreSelectionConfirm}>
              Confirm
            </FyButton>
          </div>
        </div>
      )}
      {/* eslint-disable jsx-a11y/no-static-element-interactions */}
      {isOpen && (
        <div
          className={`${styles.overlay} ${styles.show}`}
          onClick={closeDialog}
        />
      )}
    </div>
  );
}

export default FulfillmentStoreModal;
