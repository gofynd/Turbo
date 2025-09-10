import React, { useMemo } from "react";
import PropTypes from "prop-types";

import styles from "./fulfillment-store-item.less";
import { currencyFormat } from "../../../../helper/utils";

function FulfillmentStoreItem({
  storeitem,
  buybox,
  onSelectStoreItem,
  isStoreSelected,
}) {
  const getStoreLabel = () => {
    const isSellerListing = buybox?.is_seller_buybox_enabled;

    return isSellerListing ? storeitem?.seller?.name : storeitem?.store?.name;
  };

  const getDeliveryDate = () => {
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };

    const { max } = storeitem?.delivery_promise || {};

    if (!max) return "";

    const dateFormatter = new Intl.DateTimeFormat(undefined, options);
    const maxDate = dateFormatter.format(new Date(max));

    return `Get it by ${maxDate}`;
  };

  const getProductPrice = (key) => {
    if (storeitem && storeitem.price) {
      const { is_set } = storeitem;
      if (is_set) {
        const pricePerPiece = storeitem?.price_per_piece;
        return currencyFormat(
          pricePerPiece[key],
          pricePerPiece?.currency_symbol
        );
      }
      return currencyFormat(
        storeitem.price[key],
        storeitem.price.currency_symbol
      );
    }
  };

  const selectStoreItem = () => {
    onSelectStoreItem(storeitem);
  };

  const getStoreAddress = useMemo(() => {
    const addressFields = storeitem?.store?.address;

    if (!addressFields) return "";

    const { address1, address2, landmark, city, state, country } =
      addressFields;

    return [address1, address2, landmark, city, state, country]
      .filter(Boolean)
      .join(", ");
  }, [storeitem]);

  return (
    <div
      className={`${styles.storeItemWrapper} ${isStoreSelected ? styles["storeItemWrapper--selected"] : ""}`}
      onClick={selectStoreItem}
    >
      <p className={styles.sellerStoreName}>{getStoreLabel()}</p>
      <div className={styles.storeAddress}>{getStoreAddress}</div>
      <div className={styles.priceWrapper}>
        <span className={styles.effective}>{getProductPrice("effective")}</span>
        {getProductPrice("effective") !== getProductPrice("marked") && (
          <span className={styles.marked}>{getProductPrice("marked")}</span>
        )}
        <span className={styles.discount}>{storeitem.discount}</span>
      </div>

      {getDeliveryDate() && (
        <p className={styles.deliveryPromise}>{getDeliveryDate()}</p>
      )}
    </div>
  );
}

FulfillmentStoreItem.propTypes = {
  onSelectStoreItem: PropTypes.func,
};

export default FulfillmentStoreItem;
