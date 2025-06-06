import React, { useState } from "react";
import { useGlobalStore } from "fdk-core/utils";
import styles from "./styles/shipment-breakup.less";
import { useGlobalTranslation } from "fdk-core/utils";

function ShipmentBreakup({ fpi, breakup, shipmentInfo }) {
  const { t } = useGlobalTranslation("translation");
  const [type, setType] = useState("my-orders");

  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const priceFormatCurrencySymbol = (symbol, price) => {
    const hasAlphabeticCurrency = /^[A-Za-z]+$/.test(symbol);

    const formattedValue = hasAlphabeticCurrency
      ? `${symbol} ${price}`
      : `${symbol}${price}`;

    return formattedValue;
  };
  const getPriceFormat = (symbol, price) => {
    return priceFormatCurrencySymbol(symbol, price);
  };
  const breakupValues = () => {
    const totalVal = breakup?.filter((item) => item.name === "total") || [];
    const restVal =
      breakup?.filter((item) => item.name !== "total" && item.value !== 0) ||
      [];
    return totalVal.concat(restVal);
  };
  return (
    <div className={`${styles.billing} ${styles.lightsm}`}>
      <div className={`${styles.title} ${styles.boldsm}`}>
        {t("resource.common.billing_caps")}
      </div>
      <>
        {breakupValues()?.map((item, index) => (
          <div key={index} className={`${styles.breakupItem}`}>
            {((index !== breakup.length - 1 && item.value !== "0") ||
              (index === breakup.length - 1 && item.value !== "0")) && (
                <>
                  {index !== breakup.length - 1 && (
                    <span>
                      <span>{item.display}</span>
                      <span className={`${styles.values}`}>
                        {getPriceFormat(
                          item.currency_symbol,
                          Number(item.value.toString().replace(/,/g, ""))
                        )}
                      </span>
                    </span>
                  )}
                  {index === breakup.length - 1 && (
                    <span>
                      <span>{item.display}</span>
                      <span className={`${styles.values}`}>
                        {getPriceFormat(
                          item.currency_symbol,
                          Number(item.value.toString().replace(/,/g, ""))
                        )}
                      </span>
                    </span>
                  )}
                </>
              )}
          </div>
        ))}
        {/* {isLoggedIn && type !== "tracking" && (
          <div className={`${styles.paymentDetails}`}>
            {shipmentInfo?.payment && (
              <div className={`${styles.paymentLogo} `}>
                <img
                  src={shipmentInfo.payment.logo}
                  alt={shipmentInfo.payment.display_name}
                />
              </div>
            )}
            {shipmentInfo?.payment?.display_name && (
              <div>{shipmentInfo?.payment?.display_name}</div>
            )}
            {shipmentInfo?.payment?.status && (
              <div className={`${styles.rightAlign} `}>
                {shipmentInfo?.payment?.status}
              </div>
            )}
          </div>
        )} */}
      </>
    </div>
  );
}

export default ShipmentBreakup;
