import React from "react";
import styles from "./link-expired.less";
import LinkExpiredSvg from "../../assets/images/link-expired.svg";
import { useGlobalTranslation } from "fdk-core/utils";
function LinkExpired() {
  const { t } = useGlobalTranslation("translation");
  return (
    <div className={styles.linkExpiredContainer}>
      <LinkExpiredSvg />
      <div className={styles.textContainer}>
        <h2 className="fontHeader">
          {t("resource.payment_link.expired_text")}
        </h2>
        <p className="fontBody">
          {t("resource.payment_link.expired_description")}
        </p>
      </div>
    </div>
  );
}

export default LinkExpired;
