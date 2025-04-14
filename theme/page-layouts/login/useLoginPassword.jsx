import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAccounts } from "../../helper/hooks";
import { isRunningOnClient } from "../../helper/utils";

const useLoginPassword = ({ fpi }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [passwordError, setPasswordError] = useState(null);

  const { openForgotPassword, signIn } = useAccounts({ fpi });

  const handleForgotPasswordClick = () => {
    openForgotPassword();
  };

  const handleLoginWthPassword = ({ username, password }) => {
    if (!username || !password) {
      return;
    }

    const payload = {
      username,
      password,
      isRedirection: true,
    };
    signIn(payload)
      .then(() => {})
      .catch((err) => {
        if (isRunningOnClient() && err?.details?.meta?.is_deleted) {
          navigate({
            pathname: "/auth/account-locked",
            search: location.search,
          });
        }
        setPasswordError({ message: err?.message || "Something went wrong" });
      });
  };
  return {
    passwordError,
    setPasswordError,
    onForgotPasswordClick: handleForgotPasswordClick,
    handleLoginWthPassword,
  };
};

export default useLoginPassword;
