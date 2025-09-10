import React, { useEffect } from "react";
import styles from "./pincode-input.less";
import { useForm } from "react-hook-form";
import FyInput from "@gofynd/theme-template/components/core/fy-input/fy-input.js";
import "@gofynd/theme-template/components/core/fy-input/fy-input.css";
import FyButton from "@gofynd/theme-template/components/core/fy-button/fy-button.js";
import "@gofynd/theme-template/components/core/fy-button/fy-button.css";

const PincodeInput = ({
  className = "",
  pincode = "",
  onSubmit = () => {},
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      pincode,
    },
  });

  const currentPincode = watch("pincode");

  useEffect(() => {
    reset({ pincode });
  }, [pincode, reset]);

  useEffect(() => {
    clearErrors("root");
  }, [currentPincode, clearErrors]);

  return (
    <form
      className={`${styles.locationInputForm} ${className}`}
      onSubmit={handleSubmit((e) => onSubmit(e, { setError, clearErrors }))}
    >
      <FyInput
        autoComplete="off"
        placeholder="Enter Pincode"
        containerClassName={styles.pincodeInputWrapper}
        inputClassName={`b2`}
        type="text"
        maxLength="6"
        {...register("pincode", {
          required: "Please enter a valid 6-digit pincode",
          pattern: {
            value: /^\d{6}$/,
            message: "Pincode must be exactly 6 digits long",
          },
        })}
        error={!!errors.pincode || !!errors.root}
        errorMessage={errors.pincode?.message || errors.root?.message}
      />
      <FyButton
        className={styles.applyPincode}
        type="submit"
        disabled={!isValid}
      >
        APPLY
      </FyButton>
    </form>
  );
};

export default PincodeInput;
