import { useState } from "react";
import { useAccounts } from "../../helper/hooks";
import { useGlobalTranslation } from "fdk-core/utils";

const useForgetPassword = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const [isFormSubmitSuccess, setIsFormSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);

  const { openLogin, sendResetPasswordEmail } = useAccounts({ fpi });

  const handleForgotPasswordSubmit = ({ email }) => {
    const payload = { email };
    sendResetPasswordEmail(payload)
      .then(() => {
        setIsFormSubmitSuccess(true);
      })
      .catch((err) => {
        setIsFormSubmitSuccess(false);
        setError({
          message:
            err?.details?.error || err?.message || t("resource.common.error_message"),
        });
      });
  };

  const handleBackToLogin = () => {
    openLogin();
  };

  return {
    isFormSubmitSuccess,
    error,
    onForgotPasswordSubmit: handleForgotPasswordSubmit,
    onResendEmailClick: handleForgotPasswordSubmit,
    onBackToLoginClick: handleBackToLogin,
  };
};

export default useForgetPassword;
