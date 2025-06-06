import React from "react";
import styles from "./styles/payment-detail-card.less";
import { useGlobalTranslation } from "fdk-core/utils";

function PaymentDetailCard({ breakup, paymentInfo }) {
  const { t } = useGlobalTranslation("translation");
  const totalVal = breakup?.find((item) => item.name === "total") || 0;
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
  return (
    <div className={`${styles.paymentMode}`}>
      <div className={`${styles.header} ${styles.boldsm}`}>
        {t("resource.common.payment_mode")}
      </div>
      <div className={`${styles.info}`}>
        <div className={`${styles.wrapperflex}`}>
          <span className={`${styles.icon}`}>
            <img src={paymentInfo.logo} alt={paymentInfo.display_name} />
          </span>
          <span className={`${styles.desc}`}>
            <span className={`${styles.text} ${styles.regularxs}`}>
              {paymentInfo.display_name}
            </span>
          </span>
        </div>
        <div className={`${styles.wrapperflex}`}>
          <span className={`${styles.values} ${styles.lightsm}`}>
            {paymentInfo.amount &&
              getPriceFormat(
                "₹",
                Number(paymentInfo.amount.toString().replace(/,/g, ""))
              )}
            {!paymentInfo.amount &&
              totalVal &&
              getPriceFormat(
                totalVal.currency_symbol,
                Number(totalVal.value.toString().replace(/,/g, ""))
              )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PaymentDetailCard;
