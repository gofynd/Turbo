import { useState } from "react";
import { useAccounts } from "../../helper/hooks";
import { useGlobalTranslation } from "fdk-core/utils";
import { translateDynamicLabel } from "../../helper/utils";
import { VERIFY_FORGOT_OTP_MOBILE } from "../../queries/authQuery";
import { useSnackbar } from "../../helper/hooks";

const useForgetPassword = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const [isFormSubmitSuccess, setIsFormSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { showSnackbar } = useSnackbar();

  const {
    openLogin,
    sendResetPasswordEmail,
    sendResetPasswordMobile,
    sendMobileResetPassword,
    forgotPasswordData,
    isResetSuccess,
    openForgotPassword,
  } = useAccounts({ fpi });

  const handleForgotPasswordSubmit = ({ email, phone, action }) => {
    const isNumber = /^\d+$/.test(email); // checks if email contains only digits

    const sendResetPaaswordLink = isNumber
      ? sendResetPasswordMobile
      : sendResetPasswordEmail;
    console.log(action, "phone");

    const payload = isNumber
      ? {
          country_code: phone?.countryCode,
          mobile: phone?.mobile,
          action: action ?? "send",
          token: forgotPasswordData?.resend_token ?? "",
        }
      : { email };
    sendResetPaaswordLink(payload)
      .then(() => {
        setIsFormSubmitSuccess(true);
      })
      .catch((err) => {
        setIsFormSubmitSuccess(false);
        setError({
          message:
            translateDynamicLabel(err?.details?.error, t) ||
            err?.message ||
            t("resource.common.error_message"),
        });
      });
  };

  const handleSubmitMobileResetPassword = ({ otp, password }) => {
    const id = window.APP_DATA.applicationID;
    fpi
      .executeGQL(VERIFY_FORGOT_OTP_MOBILE, {
        platform: id,
        verifyMobileForgotOtpRequestSchemaInput: {
          otp: otp,
          request_id: forgotPasswordData?.request_id,
        },
      })
      .then((res) => {
        if (res?.data?.verifyMobileForgotOTP?.success) {
          const payload = {
            code: res?.data?.verifyMobileForgotOTP?.forgot_token,
            password: password,
          };
          sendMobileResetPassword(payload);
        } else {
          showSnackbar(res?.errors?.[0]?.message, "error");
          setError({
            message:
              res?.errors?.[0]?.message || t("resource.common.error_message"),
          });
          throw res?.errors?.[0];
        }
      });
  };

  const handleBackToLogin = () => {
    openLogin();
  };

  return {
    isFormSubmitSuccess,
    isResetSuccess,
    error,
    onForgotPasswordSubmit: handleForgotPasswordSubmit,
    onResendEmailClick: handleForgotPasswordSubmit,
    onBackToLoginClick: handleBackToLogin,
    handleSubmitMobileResetPassword,
    forgotPasswordData,
    handleForgotPasswordSubmit,
    openForgotPassword,
    setIsFormSubmitSuccess,
  };
};

export default useForgetPassword;
