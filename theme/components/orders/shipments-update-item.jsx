import React, { useState } from "react";
import styles from "./styles/shipments-update-item.less";
import QuantityCtrl from "./quantity-ctrl";

function ShipmentUpdateItem({ selectedBagId, item }) {
  const [showQuantityError, setShowQuantityError] = useState(false);
  const [showQuantity, setshowQuantity] = useState(true);
  const [currQuantity, setcurrQuantity] = useState(item.quantity);

  const numberWithCommas = (number) => {
    if (number === 0 || number == null) {
      return "";
    }

    let num = number;
    if (!Number.isInteger(Number(num))) {
      num = num.toFixed(2);
    }

    const no = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return no;
  };

  const priceFormatCurrencySymbol = (symbol, price) => {
    const hasAlphabeticCurrency = /^[A-Za-z]+$/.test(symbol);
    return hasAlphabeticCurrency ? `${symbol} ${price}` : `${symbol}${price}`;
  };

  const getPriceFormat = (symbol, price) => {
    return priceFormatCurrencySymbol(symbol, price);
  };

  const getCurrencySymbol = (item) => {
    return item?.prices?.currency_symbol || "₹";
  };

  const getItemValue = (num) => {
    return numberWithCommas(num);
  };

  const incrDecrQuantity = (val) => {
    const total = currQuantity + val;
    changeQuantity(total);
  };

  const changeQuantity = (total) => {
    if (total > item.quantity) {
      //   this.$refs["qty"].resetQuantity(this.item.quantity);
      setShowQuantityError(true);
    } else if (total < 0) {
      setShowQuantityError(true);
    } else {
      //   this.$emit("UpdatedQuantity", total);
      setcurrQuantity(total);
      setShowQuantityError(false);
    }
  };

  const getUpdatedBags = () => {
    return currQuantity > 0 ? item?.bag_ids?.slice(0, currQuantity) : [];
  };

  //   useImperativeHandle(ref, () => ({
  //     getUpdatedBags,
  //   }));

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {item?.bag_ids?.includes(selectedBagId) && (
        <div className={`${styles.updateItem}`}>
          <div className={`${styles.bagImg}`}>
            <img src={item?.item?.image[0]} alt={item?.item?.name} />
          </div>
          <div className={`${styles.bagInfo}`}>
            <div>
              <div className={`${styles.brandName} ${styles.boldxxxs}`}>
                {item?.item?.brand?.name}
              </div>
              <div className={`${styles.lightxxxs}`}>{item?.item?.name}</div>
            </div>
            <div className={`${styles.sizeQuantityContainer}`}>
              <div className={`${styles.sizeContainer} ${styles.regularxxs}`}>
                <span className={`${styles.boldxxs}`}>{item.item.size}</span>
              </div>
              {showQuantity && (
                <div className={`${styles.qtyCtrl}`}>
                  <QuantityCtrl
                    currquantity={currQuantity}
                    incDecQuantity={incrDecrQuantity}
                    changeQty={changeQuantity}
                  />
                  {showQuantityError && (
                    <div className={`${styles.maxAvail} ${styles.regularxxxs}`}>
                      {currQuantity > 0 && (
                        <span>Max quantity: {currQuantity}</span>
                      )}
                      {currQuantity === 0 && <span>Min quantity: 0</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className={`${styles.priceContainer}`}>
              <span className={`${styles.darklg}`}>
                {getPriceFormat(
                  getCurrencySymbol(item),
                  getItemValue(item?.prices.price_effective)
                )}
              </span>
              <span className={`${styles.lightxxs}`}>
                ({item?.quantity}
                {item?.quantity === 1 ? "Piece" : "Pieces"})
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ShipmentUpdateItem;
