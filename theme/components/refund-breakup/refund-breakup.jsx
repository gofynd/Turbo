import React from "react";
import styles from "./refund-breakup.less";
import { useGlobalTranslation } from "fdk-core/utils";

const RefundBreakup = ({ shipmentDetails, onCloseRefundBreakupModal }) => {
  const { t } = useGlobalTranslation("translation");
  const breakup = shipmentDetails || [];

  const currency = breakup[0]?.currency_symbol || "₹";

  const refundAmountItem = breakup.find((item) => item.name === "refund_amount");

  const remainingItems = breakup.filter((item) => item.name !== "refund_amount");

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalBodyWrapper}>
        {remainingItems.map((item, index) => {
          const isDeduction = item.name === "deduction_values";

          return (
            <React.Fragment key={index}>
              <div className={styles.amountContent}>
                <span>{item.display}</span>
                <span className={isDeduction ? styles.deductionAmount : ""}>
                  {isDeduction ? "-" : ""}
                  {currency}
                  {item.value}
                </span>
              </div>

              {isDeduction && item.sub_values?.length > 0 && (
                <div className={styles.chargesSection}>
                  {item.sub_values.map((sub, subIndex) => (
                    <div key={subIndex} className={styles.amountContent}>
                      <span>{sub.display}</span>
                      <span className={styles.deductionAmount}>
                        -{currency}
                        {sub.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className={styles.refundBreakupFooter}>
        <hr />
        {refundAmountItem && (
          <div className={styles.refundAmountWrapper}>
            <span>{refundAmountItem.display}</span>
            <span className={styles.deductionAmount}>
              {currency}
              {refundAmountItem.value}
            </span>
          </div>
        )}
        <button className={styles.closeBtn} onClick={onCloseRefundBreakupModal}>
          {t("resource.refund_order.okay_caps")}
        </button>
      </div>
    </div>
  );
};

export default RefundBreakup;
