import React, { useId, useState } from "react";
import ForgetPassword from "@gofynd/theme-template/pages/forgot-password/forget-password";
import "@gofynd/theme-template/pages/forgot-password/forget-password.css";
import styles from "./forget-password-page.less";
import useForgetPassword from "./useForgetPassword";

function ForgetPasswordPage({ fpi }) {
  const forgotPasswordProps = useForgetPassword({ fpi });
  return <ForgetPassword {...forgotPasswordProps} />;
}

export default ForgetPasswordPage;
