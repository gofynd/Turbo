import React, { useId, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./styles/bank-form.less";
import useRefundDetails from "../../page-layouts/orders/useRefundDetails";
import { useGlobalTranslation } from "fdk-core/utils";
import Input from "@gofynd/theme-template/components/core/fy-input/fy-input";
import "@gofynd/theme-template/components/core/fy-input/fy-input.css";
import VerifiedTickIcon from "../../assets/images/verified-tick.svg";
import ButtonSpinnerIcon from "../../assets/images/button-spinner.svg";

function BankForm({
  loadSpinner,
  fpi,
  addBankAccount,
  setShowBeneficiaryAdditionPage,
  exisitingBankRefundOptions=[],
  footerClassName = "",
}) {
  const { t } = useGlobalTranslation("translation");
  const [inProgress, setInProgress] = useState(false);
  const [isValidIfsc, setIsValidIfsc] = useState(false);
  const [branchName, setBranchName] = useState(null);
  const [bankName, setBankName] = useState(false);
  const [value, setValue] = useState(null);
  const ifscCodeId = useId();
  const accountNoId = useId();
  const confirmedAccountNoId = useId();
  const accounHolderId = useId();
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ifscCode: "",
      accountNo: "",
      confirmedAccountNo: "",
      accounHolder: "",
    },
    mode: "onChange",
  });

  const { ifscDetails, verifyIfscCode } = useRefundDetails(fpi);

  const validateIfscCode = async (value) => {
    if (value.length !== 11) {
      setIsValidIfsc(false);
      setBranchName("");
      setBankName("");
      return t("resource.order.enter_valid_ifsc_code");
    }

    try {
      const data = await verifyIfscCode(value);
      const ifscDetails = data?.verify_IFSC_code;

      if (ifscDetails && Object.keys(ifscDetails).length) {
        setBranchName(ifscDetails.branch_name);
        setBankName(ifscDetails.bank_name);
        setIsValidIfsc(true);
        return true;
      } else {
        setIsValidIfsc(false);
        setBranchName("");
        setBankName("");
        return data?.message || t("resource.common.invalid_ifsc_code");
      }
    } catch (error) {
      setIsValidIfsc(false);
      setBranchName("");
      setBankName("");
      return t("resource.common.error_validating_ifsc");
    }
  };
  const handleFormSubmit = (formdata) => {
    addBankAccount(formdata, ifscDetails, { selectedBankCheck: false });
  };
  const validateAccounHolder = (value) => {
    if (!value || value.trim().length === 0) {
      return t("resource.refund_order.account_holder_required");
    }

    if (/\d/.test(value)) {
      return t("resource.refund_order.numbers_not_allowed_in_account_holder_name");
    }

    // Add validation for special characters (except spaces and common name characters)
    if (!/^[a-zA-Z\s.',-]+$/.test(value)) {
      return t("resource.refund_order.special_characters_not_allowed_in_account_holder_name");
    }

    // Minimum name length check
    if (value.trim().length <= 5) {
      return t("resource.refund_order.account_holder_name_should_be_more_than_5_characters");
    }

    // Maximum name length check (assuming a reasonable max)
    if (value.trim().length > 50) {
      return t("resource.refund_order.account_holder_name_should_not_exceed_50_characters");
    }

    return true;
  };

  const validateAccountNo = (value) => {
    if (!value || value.toString().trim().length === 0) {
      return t("resource.refund_order.account_number_is_required");
    }

    // Remove any spaces for validation
    const accountNumber = value.toString().replace(/\s/g, "");

    // Check if it contains only digits
    if (!/^\d+$/.test(accountNumber)) {
      return t("resource.refund_order.account_number_should_contain_only_numbers");
    }

    // Check minimum length (typical minimum for most banks)
    if (accountNumber.length < 9) {
      return t("resource.refund_order.account_number_should_be_at_least_9_digits");
    }

    // Check maximum length (typical maximum for most banks)
    if (accountNumber.length > 18) {
      return t("resource.refund_order.account_number_should_not_exceed_18_digits");
    }

    return true;
  };

  return (
    <div className={styles.formContainer}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className={styles.addAccountForm}
      >
        <div className={styles.formItem}>
          <Input
            label={t("resource.common.ifsc_code")}
            labelVariant="floating"
            showAsterik
            required
            id={ifscCodeId}
            maxLength={11}
            type="text"
            {...register("ifscCode", {
              validate: async (value) => validateIfscCode(value),
            })}
            error={!!errors?.ifscCode}
            errorMessage={errors?.ifscCode?.message || ""}
          />
          {isValidIfsc && (
            <div className={`${styles.branchName} ${styles.regularxs}`}>
              <VerifiedTickIcon className={`${styles.inlineSvg}`} />
              <p>{branchName}</p>
            </div>
          )}
        </div>
        <div className={styles.formItem}>
          <Input
            label={t("resource.order.account_number")}
            labelVariant="floating"
            inputClassName={styles.paymentInputSecurity}
            showAsterik
            required
            id={accountNoId}
            type="number"
            {...register("accountNo", {
              validate: (value) =>
                validateAccountNo(value) || t("resource.order.enter_valid_account_number"),
            })}
            error={!!errors?.accountNo}
            errorMessage={errors?.accountNo?.message || ""}
          />
        </div>
        <div className={styles.formItem}>
          <Input
            label={t("resource.order.confirm_account_number")}
            labelVariant="floating"
            showAsterik
            required
            id={confirmedAccountNoId}
            type="number"
            {...register("confirmedAccountNo", {
              validate: (value) =>
                value === getValues("accountNo") || t("resource.refund_order.account_numbers_do_not_match"),
            })}
            error={!!errors?.confirmedAccountNo}
            errorMessage={errors?.confirmedAccountNo?.message || ""}
          />
        </div>
        <div className={styles.formItem}>
          <Input
            label={t("resource.order.account_holder_name")}
            labelVariant="floating"
            showAsterik
            required
            id={accounHolderId}
            type="text"
            {...register("accounHolder", {
              validate: (value) =>
                validateAccounHolder(value) || t("resource.order.account_holder_name_validation"),
            })}
            error={!!errors?.accounHolder}
            errorMessage={errors?.accounHolder?.message || ""}
          />
        </div>
        {exisitingBankRefundOptions?.length === 0 ? (
          <div className={styles.footerSectionContinue}>
            <button className={`${styles.btn}`} type="submit">
              {t("resource.common.continue")}
            </button>
          </div>
        ) : (
          <div className={styles.footerSection}>
            <button
              className={`${styles.commonBtn} ${styles.btn} ${styles.modalBtn} ${styles.cancelButton}`}
              type="button"
              onClick={() => {
                if (exisitingBankRefundOptions.length > 0) {
                  setShowBeneficiaryAdditionPage(false);
                }
              }}
            >
              {t("resource.facets.cancel")}
            </button>
            <button
              className={`${styles.commonBtn} ${styles.btn} ${styles.modalBtn}`}
              type="submit"
            >
              {loadSpinner && (
                <ButtonSpinnerIcon
                  className={`${styles.spinner}`}
                />
              )}

              {!loadSpinner && <span>{t("resource.common.continue")}</span>}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default BankForm;
