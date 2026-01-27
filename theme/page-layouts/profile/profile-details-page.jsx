import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  useGlobalStore,
  useGlobalTranslation,
  useNavigate,
} from "fdk-core/utils";
import { useAccounts, useSnackbar } from "../../helper/hooks";
import { USER_DATA_QUERY } from "../../queries/libQuery";
import ProfileDetailsForm from "../../components/profile/profile-details-form";

function ProfileDetailsPage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const userDataStore = useGlobalStore(fpi.getters.USER_DATA);
  const { first_name, last_name, gender, user, emails, phone_numbers, dob } =
    userDataStore || {};

  const userInfo = useMemo(() => user || userDataStore, [user, userDataStore]);

  const primaryEmail = useMemo(
    () =>
      emails?.find((e) => e.primary) ||
      userInfo?.emails?.find((e) => e.primary),
    [emails, userInfo]
  );

  const primaryPhone = useMemo(
    () =>
      phone_numbers?.find((p) => p.primary) ||
      userInfo?.phone_numbers?.find((p) => p.primary),
    [phone_numbers, userInfo]
  );

  // Format phone number with country code
  const formatPhoneNumber = (phone, countryCode) => {
    if (!phone) return "";
    if (countryCode && !phone.startsWith("+")) {
      return `+${countryCode} ${phone}`;
    }
    return phone;
  };

  const userData = useMemo(
    () => ({
      firstName: first_name ?? userInfo?.first_name ?? "",
      lastName: last_name ?? userInfo?.last_name ?? "",
      gender: gender ?? userInfo?.gender ?? "male",
      email: primaryEmail?.email ?? "",
      mobileNumber: primaryPhone
        ? formatPhoneNumber(primaryPhone.phone, primaryPhone.country_code)
        : "",
      dob: dob ?? userInfo?.dob ?? "",
    }),
    [first_name, last_name, gender, userInfo, primaryEmail, primaryPhone, dob]
  );

  const { updateProfile } = useAccounts({ fpi });
  const { showSnackbar } = useSnackbar();

  const handleSave = async ({
    firstName,
    lastName,
    gender,
    mobileNumber,
    email,
    dob,
  }) => {
    setIsLoading(true);
    try {
      // Parse phone number to extract country code and mobile
      let phoneData = {};
      if (mobileNumber) {
        const phoneMatch = mobileNumber.match(/^\+?(\d+)\s*(.+)$/);
        if (phoneMatch) {
          phoneData = {
            countryCode: phoneMatch[1],
            mobile: phoneMatch[2].trim(),
          };
        } else {
          // If no country code, use existing or default
          phoneData = {
            countryCode: primaryPhone?.country_code || "91",
            mobile: mobileNumber.trim(),
          };
        }
      }

      const updateData = {
        firstName,
        lastName,
        gender,
      };

      // Add dob if provided (check for non-empty string or valid value)
      if (dob !== null && dob !== undefined && dob !== "") {
        updateData.dob = dob;
      }

      // Add email if provided
      if (email) {
        updateData.email = email;
      }

      // Add phone if provided
      if (phoneData.countryCode && phoneData.mobile) {
        updateData.phone = phoneData;
      }

      const res = await updateProfile(updateData);

      // Safely handle the response
      try {
        // Handle verification requirements from the response
        // Check explicitly for true values since response may have null values
        if (res) {
          const {
            verify_mobile_otp: verifyMobileOtp,
            verify_email_otp: verifyEmailOtp,
            verify_email_link: verifyEmailLink,
            email: responseEmail,
          } = res;

          // Handle email verification link (explicitly check for true)
          if (verifyEmailLink === true && responseEmail) {
            const queryParams = new URLSearchParams(location.search);
            queryParams.set("email", responseEmail);
            const queryString = queryParams?.toString()
              ? `?${queryParams.toString()}`
              : "";
            navigate(`/auth/verify-email-link${queryString}`);
            return;
          }

          // Handle mobile or email OTP verification (explicitly check for true)
          if (verifyMobileOtp === true || verifyEmailOtp === true) {
            // If verification is required, show message and stay on page
            // The user can verify through the profile section
            showSnackbar(
              t("resource.common.verification_required") ||
                "Verification required. Please verify your email/mobile.",
              "info",
              "top-center"
            );
            // Don't navigate away - let user complete verification on profile page
            return;
          }
        }

        // Refresh user data in the store after successful update
        // This ensures the component has the latest data and doesn't go blank
        try {
          await fpi.executeGQL(USER_DATA_QUERY);
        } catch (refreshError) {
          // If refresh fails, log but don't block the success message
          // The store might update automatically via the mutation response
        }

        // Show success message and remain on the edit profile page
        // This works for mobile, tablet, and desktop
        showSnackbar(t("resource.common.updated_success"), "success");
      } catch (responseError) {
        // Handle any errors in response processing
        // Still show success if the update itself succeeded
        showSnackbar(t("resource.common.updated_success"), "success");
      }
    } catch (error) {
      showSnackbar(
        error?.message ||
          t("resource.common.error_message") ||
          "Failed to update profile",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileDetailsForm
      userData={userData}
      onSave={handleSave}
      isLoading={isLoading}
    />
  );
}

export default ProfileDetailsPage;
