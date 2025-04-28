import React, { useId, useState } from "react";
import ForgetPassword from "fdk-react-templates/pages/forgot-password/forget-password";
import "fdk-react-templates/pages/forgot-password/forget-password.css";
import styles from "./forget-password-page.less";
import AuthContainer from "../auth/auth-container/auth-container";
import useForgetPassword from "./useForgetPassword";

function ForgetPasswordPage({ fpi }) {
  const forgotPasswordProps = useForgetPassword({ fpi });
  return (
    <AuthContainer>
      <ForgetPassword {...forgotPasswordProps} />
    </AuthContainer>
  );
}

export default ForgetPasswordPage;
