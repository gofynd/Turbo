import React, { useId, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./styles/bank-form.less";
import useRefundDetails from "../../page-layouts/orders/useRefundDetails";
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
      return "Please Enter Valid IFSC Code";
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
        return data?.message || "Invalid IFSC Code";
      }
    } catch (error) {
      setIsValidIfsc(false);
      setBranchName("");
      setBankName("");
      return "Error While Validating IFSC Code";
    }
  };
  const handleFormSubmit = (formdata) => {
    addBankAccount(formdata, ifscDetails, { selectedBankCheck: false });
  };
  const validateAccounHolder = (value) => {
    if (!value || value.trim().length === 0) {
      return "Account Holder Name is Required";
    }

    if (/\d/.test(value)) {
      return "Numbers Are Not Allowed in Account Holder Name";
    }

    // Add validation for special characters (except spaces and common name characters)
    if (!/^[a-zA-Z\s.',-]+$/.test(value)) {
      return "Special Characters Are Not Allowed in Account Holder Name";
    }

    // Minimum name length check
    if (value.trim().length <= 5) {
      return "Account Holder Name Should Be More than 5 Characters";
    }

    // Maximum name length check (assuming a reasonable max)
    if (value.trim().length > 50) {
      return "Account Holder Name Should Not Exceed 50 Characters";
    }

    return true;
  };

  const validateAccountNo = (value) => {
    if (!value || value.toString().trim().length === 0) {
      return "Account Number is Required";
    }

    // Remove any spaces for validation
    const accountNumber = value.toString().replace(/\s/g, "");

    // Check if it contains only digits
    if (!/^\d+$/.test(accountNumber)) {
      return "Account Number Should Contain Only Numbers";
    }

    // Check minimum length (typical minimum for most banks)
    if (accountNumber.length < 9) {
      return "Account Number Should Be At Least 9 Digits";
    }

    // Check maximum length (typical maximum for most banks)
    if (accountNumber.length > 18) {
      return "Account Number Should Not Exceed 18 Digits";
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
            label="IFSC Code"
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
            label="Account Number"
            labelVariant="floating"
            inputClassName={styles.paymentInputSecurity}
            showAsterik
            required
            id={accountNoId}
            type="number"
            {...register("accountNo", {
              validate: (value) =>
                validateAccountNo(value) || "Please Enter Valid Account Number",
            })}
            error={!!errors?.accountNo}
            errorMessage={errors?.accountNo?.message || ""}
          />
        </div>
        <div className={styles.formItem}>
          <Input
            label="Confirm Account Number"
            labelVariant="floating"
            showAsterik
            required
            id={confirmedAccountNoId}
            type="number"
            {...register("confirmedAccountNo", {
              validate: (value) =>
                value === getValues("accountNo") ||
                "Account Numbers Do Not Match",
            })}
            error={!!errors?.confirmedAccountNo}
            errorMessage={errors?.confirmedAccountNo?.message || ""}
          />
        </div>
        <div className={styles.formItem}>
          <Input
            label="Account Holder Name"
            labelVariant="floating"
            showAsterik
            required
            id={accounHolderId}
            type="text"
            {...register("accounHolder", {
              validate: (value) =>
                validateAccounHolder(value) ||
                "Please Enter Valid Account Holder Name",
            })}
            error={!!errors?.accounHolder}
            errorMessage={errors?.accounHolder?.message || ""}
          />
        </div>
        {exisitingBankRefundOptions?.length === 0 ? (
          <div className={styles.footerSectionContinue}>
            <button className={`${styles.btn}`} type="submit">
              Continue
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
              Cancel
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

              {!loadSpinner && <span>Continue</span>}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default BankForm;
