import React, { useId, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./styles/bank-form.less";
import ButtonSpinnerIcon from "../../assets/images/button-spinner.svg";
import { useGlobalTranslation } from "fdk-core/utils";

function OtpForm({ loadSpinner, verifyPayment }) {
  const { t } = useGlobalTranslation("translation");
  const otpId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: "",
    },
    mode: "onChange",
  });
  const validateOTP = (otp) => {
    if (otp.length === 0) return false;
    return true;
  };
  const handleOTPSubmit = (formdata) => {
    verifyPayment(formdata);
  };
  return (
    <div className={`${styles.formContainer} ${styles.lightxxs}`}>
      <form
        onSubmit={handleSubmit(handleOTPSubmit)}
        className={`${styles.formItem}`}
      >
        <div className={`${styles.formItem} ${errors.otp ? styles.error : ""}`}>
          <div className={styles.formTitle} htmlFor={otpId}>
            {t("resource.common.enter_otp")}{" "}
            <span className={`${styles.formReq}`}>*</span>
          </div>
          <div className={`${styles.formInput}`}>
            <input
              className={`${styles.paymentInput}`}
              id={otpId}
              type="text"
              {...register("otp", {
                validate: (value) =>
                  validateOTP(value) ||
                  t("resource.common.enter_valid_otp"),
              })}
            />
          </div>
          {errors.otp && <p className={styles.error}>{errors.otp.message}</p>}
        </div>

        <button
          className={`${styles.commonBtn} ${styles.btn} ${styles.modalBtn}`}
          type="submit"
        >
          {loadSpinner && <ButtonSpinnerIcon className={`${styles.spinner}`} />}

          {!loadSpinner && (
            <span>{t("resource.facets.verify")}</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default OtpForm;
