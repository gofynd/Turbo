import React from "react";
import styles from "./styles/beneficiary-list-item.less";
import { useGlobalTranslation } from "fdk-core/utils";
import RadioIcon from "../../assets/images/radio";

function BeneficiaryItem({ beneficiary, selectedBeneficiary, change }) {
  const { t } = useGlobalTranslation("translation");
  const getTitle = () => {
    return beneficiary.title;
  };
  const getSubtitle = () => {
    return beneficiary.transfer_mode === "bank"
      ? `${t("resource.order.account_details")}: ${beneficiary.account_holder} | ${beneficiary.account_no
      } ${beneficiary.bank_name ? `| ${beneficiary.bank_name}` : ""}`
      : beneficiary.subtitle;
  };

  return (
    <div className={`${styles.beneficiaryItem}`}>
      <div>
        <div className={`${styles.beneficiaryContent}`}>
          {(!selectedBeneficiary ||
            selectedBeneficiary.beneficiary_id !==
              beneficiary.beneficiary_id) && (
            <RadioIcon onClick={() => change(beneficiary)} />
          )}
          {selectedBeneficiary &&
            selectedBeneficiary.beneficiary_id ===
              beneficiary.beneficiary_id && <RadioIcon checked={true} />}
          <div className={`${styles.text}`}>
            <div className={`${styles.beneficiaryTitle} ${styles.boldxs}`}>
              {getTitle()}
            </div>
            <div
              className={`${styles.beneficiarySubtitle} ${styles.regularxs}`}
            >
              {getSubtitle()}
            </div>
            {beneficiary.transfer_mode === "bank" && beneficiary.ifsc_code && (
              <div
                className={`${styles.beneficiarySubtitle} ${styles.regularxs}`}
              >
                {t(
                  "resource.common.ifsc_code"
                )}
                : {beneficiary.ifsc_code}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BeneficiaryItem;
