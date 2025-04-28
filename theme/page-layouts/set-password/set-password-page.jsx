import React from "react";
import SetPassword from "fdk-react-templates/pages/set-password/set-password";
import "fdk-react-templates/pages/set-password/set-password.css";
import useSetPassword from "./useSetPassword";
import AuthContainer from "../auth/auth-container/auth-container";
import styles from "./set-password-page.less";

function SetPasswordPage({ fpi }) {
  const setPasswordProp = useSetPassword({ fpi });

  return (
    <AuthContainer>
      <SetPassword {...setPasswordProp} />
    </AuthContainer>
  );
}

export default SetPasswordPage;
