import React from "react";
import styles from "./refund-summary.less";
import { useGlobalTranslation } from "fdk-core/utils";

const RefundSummary = ({
  refundBreakup,
  title = "Refund Summary",
  customClass = "",
  customTitleClass = "",
  amountFontClass = "",
  customSubTitleClass = "",
}) => {
  const { t } = useGlobalTranslation("translation");
  const breakup = refundBreakup || [];
  console.log(breakup,'breakupbreakupbreakupbreakup')
  const currency = breakup[0]?.currency_symbol || "₹";

  const refundAmountItem = breakup?.find(
    (item) => item.name === "refund_amount"
  );

  const remainingItems = breakup?.filter(
    (item) => item.name !== "refund_amount"
  );

  return (
    <div className={styles.mainRefundBreakupWrapper}>
      <h6 className={`${styles.refundSummaryTitle} ${customTitleClass}`}>
        {title}
      </h6>

      <div className={styles.acountBreakOut}>
        {/* Render all items except refund_amount */}
        {remainingItems.map((item, index) => {
          const isDeduction = item.name === "deduction_values";
          const sign = isDeduction ? "-" : "";

          return (
            <React.Fragment key={`refund-breakup-${index}`}>
              <div className={styles.amountContent}>
                <span className={amountFontClass}>{item.display}</span>
                <span
                  className={
                    isDeduction
                      ? `${styles.deductionAmount} ${amountFontClass}`
                      : amountFontClass
                  }
                >
                  {sign}
                  {currency}
                  {item.value}
                </span>
              </div>

              {/* Render sub deductions if available */}
              {isDeduction && item?.sub_values?.length > 0 && (
                <div className={styles.chargesContainer}>
                  {item.sub_values.map((subItem, subIndex) => (
                    <div
                      key={`sub-deduction-${subIndex}`}
                      className={styles.amountContent}
                    >
                      <span className={`${customClass} ${amountFontClass}`}>
                        {subItem.display}
                      </span>
                      <span
                        className={`${styles.deductionAmount} ${customClass}`}
                      >
                        -{currency}
                        {subItem.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <hr />

      {/* Final Refund Amount Display (bottom block) */}
      {refundAmountItem && (
        <div className={styles.TotalAmountContent}>
          <h6 className={customSubTitleClass}>{refundAmountItem.display}</h6>
          <h6 className={customSubTitleClass}>
            {currency}
            {refundAmountItem.value}
          </h6>
        </div>
      )}
    </div>
  );
};

export default RefundSummary;
