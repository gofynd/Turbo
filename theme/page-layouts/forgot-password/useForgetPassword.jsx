import { useState } from "react";
import { useAccounts } from "../../helper/hooks";

const useForgetPassword = ({ fpi }) => {
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
            err?.details?.error || err?.message || "Something went wrong",
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
