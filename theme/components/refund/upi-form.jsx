import React, { useId, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./styles/bank-form.less";
import ButtonSpinnerIcon from "../../assets/images/button-spinner.svg";
import { useGlobalTranslation } from "fdk-core/utils";

function UpiForm({ loadSpinner, addvpa }) {
  const { t } = useGlobalTranslation("translation");
  const upiId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      upi: "",
    },
    mode: "onChange",
  });
  const validateVPA = (vpa) => {
    const validPattern = /^\w+@\w+$/;
    return validPattern.test(vpa);
  };
  const handleUPISubmit = (formdata) => {
    addvpa(formdata);
  };
  return (
    <div className={`${styles.formContainer} ${styles.lightxxs}`}>
      <form
        onSubmit={handleSubmit(handleUPISubmit)}
        className={`${styles.formItem}`}
      >
        <div className={`${styles.formItem} ${errors.upi ? styles.error : ""}`}>
          <div className={styles.formTitle} htmlFor={upiId}>
            {t("resource.common.enter_upi_id")}{" "}
            <span className={`${styles.formReq}`}>*</span>
          </div>
          <div className={`${styles.formInput}`}>
            <input
              className={`${styles.paymentInput}`}
              id={upiId}
              type="text"
              {...register("upi", {
                validate: (value) =>
                  validateVPA(value) ||
                  t("resource.order.enter_valid_upi_id"),
              })}
            />
          </div>
          {errors.upi && <p className={styles.error}>{errors.upi.message}</p>}
        </div>

        <button
          className={`${styles.commonBtn} ${styles.btn} ${styles.modalBtn}`}
          type="submit"
        >
          {loadSpinner && <ButtonSpinnerIcon className={`${styles.spinner}`} />}

          {!loadSpinner && (
            <span>{t("resource.facets.add")}</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default UpiForm;
