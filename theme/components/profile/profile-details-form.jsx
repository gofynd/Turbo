import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useGlobalTranslation } from "fdk-core/utils";
import FyInput from "@gofynd/theme-template/components/core/fy-input/fy-input";
import "@gofynd/theme-template/components/core/fy-input/fy-input.css";
import FyButton from "@gofynd/theme-template/components/core/fy-button/fy-button";
import "@gofynd/theme-template/components/core/fy-button/fy-button.css";
import FyDatePicker from "@gofynd/theme-template/components/date-picker/fy-date-picker/fy-date-picker";
import "@gofynd/theme-template/components/date-picker/fy-date-picker/fy-date-picker.css";
import styles from "./profile-details-form.less";
import RadioIcon from "../../assets/images/radio";
import { convertISOToDDMMYYYY, convertDDMMYYYYToISO } from "../../helper/utils";

function ProfileDetailsForm({ userData, onSave, isLoading }) {
  const { t } = useGlobalTranslation("translation");

  // Check if email and phone are verified
  const isEmailVerified = useMemo(() => {
    const emailsList = userData?.emails || userData?.email_list || [];
    const primaryEmail = emailsList.find((e) => e.primary) || {};
    const verified = primaryEmail?.verified || false;
    // If email exists, treat as verified (can't edit)
    return verified;
  }, [userData?.emails, userData?.email_list, userData?.email]);

  const isPhoneVerified = useMemo(() => {
    const phonesList = userData?.phoneNumbers || userData?.phone_numbers || [];
    const primaryPhone = phonesList.find((p) => p.primary) || {};
    const verified = primaryPhone?.verified || false;
    // If mobile number exists, treat as verified (can't edit)
    return verified;
  }, [userData?.phoneNumbers, userData?.phone_numbers, userData?.mobileNumber]);

  // Upper bound: must be at least 18 years old
  const maxAllowedDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  }, []);

  // Lower bound: not older than 100 years
  const minAllowedDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 100);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  }, []);

  // Validation function to check if user age is between 18 and 100 years
  const validateAge = (dobValue) => {
    if (!dobValue || typeof dobValue !== "string" || !dobValue.trim()) {
      return true; // Allow empty DOB, only validate if provided
    }

    if (!dobValue.match(/^\d{2}-\d{2}-\d{4}$/)) {
      return true; // Format validation handled elsewhere
    }

    const [day, month, year] = dobValue.split("-").map(Number);
    const dobDate = new Date(year, month - 1, day);
    const today = new Date();

    const minDate = new Date(
      today.getFullYear() - 100,
      today.getMonth(),
      today.getDate()
    );
    const maxDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );

    if (dobDate > maxDate) {
      return "You must be at least 18 years old";
    }
    if (dobDate < minDate) {
      return "Age cannot exceed 100 years";
    }
    return true;
  };

  const defaultValues = useMemo(
    () => ({
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      mobileNumber: userData?.mobileNumber || "",
      email: userData?.email || "",
      gender: userData?.gender || "male",
      dob: userData?.dob ? convertISOToDDMMYYYY(userData.dob) : "",
    }),
    [userData]
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const formatDobValue = (value) => {
    if (typeof value === "string" && value.includes("T")) {
      return convertISOToDDMMYYYY(value) || "";
    }
    if (value instanceof Date && !isNaN(value.getTime())) {
      // Extract local date components directly to avoid timezone shift issues
      const day = String(value.getDate()).padStart(2, "0");
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const year = value.getFullYear();
      return `${day}-${month}-${year}`;
    }
    if (typeof value === "string" && value.match(/^\d{2}-\d{2}-\d{4}$/)) {
      return value;
    }
    return "";
  };

  const onSubmit = (data) => {
    if (onSave) {
      const hasDob = typeof data.dob === "string" && data.dob.trim().length > 0;
      const dobValue =
        hasDob && data.dob.match(/^\d{2}-\d{2}-\d{4}$/)
          ? convertDDMMYYYYToISO(data.dob)
          : null;

      onSave({
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        mobileNumber: data.mobileNumber,
        email: data.email,
        dob: dobValue,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.profileForm}>
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>My Profile</h1>
      </div>

      <div className={styles.formDivider}></div>

      <div className={styles.formFields}>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <Controller
              name="firstName"
              control={control}
              rules={{ required: "First name is required" }}
              render={({ field }) => (
                <div className={styles.inputWrapper}>
                  <FyInput
                    {...field}
                    label="First Name"
                    labelVariant="floating"
                    labelClassName={styles.inputLabel}
                    inputClassName={styles.inputField}
                    inputVariant="outlined"
                    error={!!errors.firstName}
                    errorMessage={errors.firstName?.message}
                  />
                </div>
              )}
            />
          </div>

          <div className={styles.formField}>
            <Controller
              name="lastName"
              control={control}
              rules={{ required: "Last name is required" }}
              render={({ field }) => (
                <div className={styles.inputWrapper}>
                  <FyInput
                    {...field}
                    label="Last Name"
                    labelVariant="floating"
                    labelClassName={styles.inputLabel}
                    inputClassName={styles.inputField}
                    inputVariant="outlined"
                    error={!!errors.lastName}
                    errorMessage={errors.lastName?.message}
                  />
                </div>
              )}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div
            className={
              styles.formField +
              " " +
              styles.inputWrapper +
              " " +
              styles.datePickerWrapper
            }
          >
            <Controller
              name="dob"
              control={control}
              rules={{
                validate: validateAge,
              }}
              render={({ field }) => {
                const dobValue = formatDobValue(field.value);
                return (
                  <FyDatePicker
                    key={dobValue || "empty-dob"}
                    preselectedDate={dobValue}
                    ref={field.ref}
                    onChange={(date) => {
                      const formattedDob = formatDobValue(date);
                      field.onChange(formattedDob);
                    }}
                    placeholderText="DD-MM-YYYY"
                    dateFormat="DD-MM-YYYY"
                    error={!!errors.dob}
                    errorMessage={errors.dob?.message}
                    inputLabel="Date of Birth"
                    className={styles.datePicker}
                    isLabelFloating
                    enableMonthYearSelection
                    minInactiveDate={maxAllowedDate}
                    maxInactiveDate={minAllowedDate}
                    readOnly
                  />
                );
              }}
            />
          </div>

          <div className={styles.formField}>
            <Controller
              name="mobileNumber"
              control={control}
              rules={{ required: "Mobile number is required" }}
              render={({ field }) => (
                <div
                  className={`${styles.inputWrapper} ${isPhoneVerified ? styles.verifiedField : ""}`}
                >
                  <FyInput
                    {...field}
                    label="Mobile Number"
                    labelVariant="floating"
                    labelClassName={styles.inputLabel}
                    inputClassName={`${styles.inputField} ${isPhoneVerified ? styles.verifiedInput : ""}`}
                    inputVariant="outlined"
                    error={!!errors.mobileNumber}
                    errorMessage={errors.mobileNumber?.message}
                    readOnly={!!userData?.mobileNumber}
                    disabled={isPhoneVerified}
                  />
                  {isPhoneVerified && (
                    <div className={styles.verifiedIcon}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="10" cy="10" r="10" fill="#4CAF50" />
                        <path
                          d="M6 10L8.5 12.5L14 7"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {userData?.email && (
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <div
                    className={`${styles.inputWrapper} ${isEmailVerified ? styles.verifiedField : ""}`}
                  >
                    <FyInput
                      {...field}
                      label="Email Address"
                      labelVariant="floating"
                      labelClassName={styles.inputLabel}
                      inputClassName={`${styles.inputField} ${isEmailVerified ? styles.verifiedInput : ""}`}
                      inputVariant="outlined"
                      error={!!errors.email}
                      errorMessage={errors.email?.message}
                      readOnly={!!userData?.email}
                      disabled={isEmailVerified}
                    />
                    {isEmailVerified && (
                      <div className={styles.verifiedIcon}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="10" cy="10" r="10" fill="#4CAF50" />
                          <path
                            d="M6 10L8.5 12.5L14 7"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        )}

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <div className={styles.genderSection}>
              <p className={styles.genderLabel}>Gender</p>
              <div className={styles.genderOptions}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <>
                      <label className={styles.radioOption}>
                        <input
                          type="radio"
                          value="male"
                          checked={field.value === "male"}
                          onChange={() => field.onChange("male")}
                          className={styles.radioInput}
                        />
                        <RadioIcon checked={field.value === "male"} />
                        <span className={styles.radioLabel}>Male</span>
                      </label>

                      <label className={styles.radioOption}>
                        <input
                          type="radio"
                          value="female"
                          checked={field.value === "female"}
                          onChange={() => field.onChange("female")}
                          className={styles.radioInput}
                        />
                        <RadioIcon checked={field.value === "female"} />
                        <span className={styles.radioLabel}>Female</span>
                      </label>

                      <label className={styles.radioOption}>
                        <input
                          type="radio"
                          value="other"
                          checked={field.value === "other"}
                          onChange={() => field.onChange("other")}
                          className={styles.radioInput}
                        />
                        <RadioIcon checked={field.value === "other"} />
                        <span className={styles.radioLabel}>Other</span>
                      </label>
                    </>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <FyButton
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
        fullWidth
      >
        {t("resource.facets.update") || "UPDATE"}
      </FyButton>
    </form>
  );
}

export default ProfileDetailsForm;
