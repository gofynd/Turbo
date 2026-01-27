import React from "react";
import useHeader from "../header/useHeader";
import styles from "./contact-refund-support.less";
import { useGlobalTranslation, useFPI } from "fdk-core/utils";

function ContacRefundSupport({
  customClassName = "",
  paymentMode = "",
  refundAmount = "",
  showRefundToSourceMsg = false,
}) {
  const fpi = useFPI();
  const { supportInfo } = useHeader(fpi);
  const { t } = useGlobalTranslation("translation");
  const { email, phone } = supportInfo?.contact ?? {};
  const { email: emailArray = [], active: emailActive = false } = email ?? {};
  const { phone: phoneArray = [], active: phoneActive = false } = phone ?? {};

  const emailAddress =
    emailActive && emailArray.length > 0 ? emailArray[0]?.value : null;
  const phoneNumber =
    phoneActive && phoneArray.length > 0
      ? `${phoneArray[0]?.code ? `+${phoneArray[0].code}-` : ""}${
          phoneArray[0]?.number
        }`
      : null;

  const shouldShowRefundToSourceMsg =
    paymentMode?.toLowerCase() === "prepaid" && showRefundToSourceMsg;

  const hasEmail = Boolean(emailAddress);
  const hasPhone = Boolean(phoneNumber);
  const hasMerchantSupportDetails = hasEmail || hasPhone;

  return (
    <div className={`${styles.refundBox} ${customClassName}`}>
      {shouldShowRefundToSourceMsg ? (
        <p className={styles.text}>
          <strong>₹{refundAmount}</strong> will be refunded to your original
          payment method
        </p>
      ) : (
        <p className={styles.text}>
          Your refund will be processed as per the applicable policy.
          {hasMerchantSupportDetails ? (
            <>
              {" "}
              If you face any issues, you can reach out to customer support{" "}
              {hasEmail && (
                <>
                  at{" "}
                  <a className={styles.link} href={`mailto:${emailAddress}`}>
                    {emailAddress}
                  </a>
                </>
              )}
              {hasEmail && hasPhone && " or "}
              {hasPhone && !hasEmail && " at "}
              {hasPhone && (
                <a className={styles.link} href={`tel:${phoneNumber}`}>
                  {phoneNumber}
                </a>
              )}
              .
            </>
          ) : (
            <> For any issues, please reach out to customer support.</>
          )}
        </p>
      )}
    </div>
  );
}

export default ContacRefundSupport;
