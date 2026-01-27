import React from "react";
import styles from "./bank-account-item.less";
import { useGlobalTranslation } from "fdk-core/utils";
import GreenCheck from "../../assets/images/green-check.svg";
import RadioIcon from "../../assets/images/radio";

const BankAccountItem = ({ bank, maskedAccount, selectedBank, onChange }) => {
  const { t } = useGlobalTranslation("translation");
  const isSelected = selectedBank?.id === bank.id;
  const maskedIFSC = bank?.ifsc_code ? `XXXXXX${bank.ifsc_code.slice(-2)}` : "";
  return (
    <div className={styles.bankAccountItem} onClick={() => onChange(bank)}>
      <div className={styles.bankInfo}>
        <div className={styles.logo}>
          <img src={bank.logo} alt={bank.logo} />
        </div>
        <div className={styles.details}>
          <h6>
            {bank.display_name}
            {bank?.is_verified && (
              <span className={styles.greenCheckBox}>
                <GreenCheck className={styles.greenCheckIcon} />
              </span>
            )}
          </h6>
          <span className={styles.bankName}>{bank.account_holder}</span>
          <span>
            {t("resource.refund_order.account_no")}: {maskedAccount}
          </span>
          <span>
            {t("resource.common.ifsc_code")} : {maskedIFSC}
          </span>
        </div>
      </div>
      <div
        className={`${styles.customRadio} ${isSelected ? styles.checked : ""}`}
      >
        <RadioIcon width={24} checked={isSelected} />
      </div>
    </div>
  );
};

export default BankAccountItem;
