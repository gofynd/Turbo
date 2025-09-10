import React, { useState } from "react";
import styles from "./fulfillment.less";
import RadioIcon from "../../../../assets/images/radio";
import TruckIcon from "../../../../assets/images/truck-icon.svg";
import FulfillmentStoreModal from "./fulfillment-store-modal";
import { useThemeFeature, useDeliverPromise } from "../../../../helper/hooks";

function Fulfillment(props) {
  const {
    fpi,
    soldBy,
    buybox,
    allStoresInfo,
    getProductSellers,
    currentFO,
    setCurrentFO,
    productPriceBySlug,
    setProductPriceBySlug,
    isAllowStoreSelection,
    fulfillmentOptions,
    setFulfillmentOptions,
    availableFOCount,
  } = props;
  const { isServiceability } = useThemeFeature({ fpi });
  const { getFormattedPromise } = useDeliverPromise({ fpi });

  const [showFOStoreModal, setShowFOStoreModal] = useState(false);

  const toggleFOStoreModal = () => {
    setShowFOStoreModal((modal) => {
      const updatedModal = !modal;

      if (typeof document !== "undefined") {
        const classList = document.body?.classList;

        if (updatedModal && classList) {
          classList.add("remove-scroll");
        } else {
          classList.remove("remove-scroll");
        }
      }

      return updatedModal;
    });
  };

  const onFOStoreClick = () => {
    if (isAllowStoreSelection) {
      toggleFOStoreModal();
      getProductSellers("", currentFO?.slug);
    }
  };

  const getDeliveryDate = (deliveryPromise) => {
    return getFormattedPromise(deliveryPromise);
  };

  return (
    <div className={styles.fulfillmentWrapper}>
      <div className={styles.deliveryBy}>
        Sold by:
        <span
          className={`${styles.storeSellerLabel} ${isAllowStoreSelection ? styles.selectable : ""}`}
          onClick={onFOStoreClick}
        >
          {soldBy?.name}
          {isAllowStoreSelection && soldBy?.count > 1
            ? ` & ${soldBy.count - 1} Other${soldBy.count > 2 ? "s" : ""}`
            : ""}
        </span>
      </div>
      {!!fulfillmentOptions.length && availableFOCount > 1 && (
        <div className={styles.foContainer}>
          <div className={styles.foList}>
            {fulfillmentOptions.map((foItem) => (
              <div
                className={`${styles.fulfillmentOption} ${fulfillmentOptions.length === 1 ? styles["fulfillmentOption--gap8"] : ""}`}
                onClick={() => setCurrentFO(foItem?.fulfillment_option || {})}
              >
                {fulfillmentOptions.length === 1 ? (
                  <TruckIcon className={styles.fulfillmentOption} />
                ) : (
                  <RadioIcon
                    checked={
                      foItem?.fulfillment_option?.slug === currentFO?.slug
                    }
                  />
                )}

                <div className={styles.foDetails}>
                  {!!getDeliveryDate(foItem?.delivery_promise) && (
                    <p className={styles.promiseLabel}>
                      {getDeliveryDate(foItem?.delivery_promise)}
                    </p>
                  )}
                  <p className={styles.foLabel}>
                    {foItem?.fulfillment_option?.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showFOStoreModal && (
        <FulfillmentStoreModal
          isOpen={showFOStoreModal}
          buybox={buybox}
          allStoresInfo={allStoresInfo}
          onCloseDialog={toggleFOStoreModal}
          fulfillmentOptions={fulfillmentOptions}
          currentFO={currentFO}
          setCurrentFO={setCurrentFO}
          productPriceBySlug={productPriceBySlug}
          setProductPriceBySlug={setProductPriceBySlug}
          getProductSellers={getProductSellers}
          setFulfillmentOptions={setFulfillmentOptions}
        />
      )}
    </div>
  );
}

export default Fulfillment;
