import React from "react";
import styles from "./payment-link-loader.less";
import Loader from "../loader/loader";
import { useGlobalTranslation } from "fdk-core/utils";
function PaymentLinkLoader() {
  const { t } = useGlobalTranslation("translation");
  return (
    <div className={styles.mainContainer}>
      <Loader customClassName={styles.loader} />
      <div className={styles.textBox}>
        <h2 className={`${styles.loadingText} fontHeader`}>
          {t("resource.payment_link.loading_text")}
        </h2>
        <p className={`${styles.loadingSubText} fontBody`}>
          {t("resource.payment_link.loading_sub_text")}
        </p>
      </div>
    </div>
  );
}

export default PaymentLinkLoader;
