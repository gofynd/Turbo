import React from "react";
import SetPassword from "@gofynd/theme-template/pages/set-password/set-password";
import "@gofynd/theme-template/pages/set-password/set-password.css";
import useSetPassword from "./useSetPassword";
import styles from "./set-password-page.less";

function SetPasswordPage({ fpi }) {
  const setPasswordProp = useSetPassword({ fpi });

  return (
    <SetPassword {...setPasswordProp} />
  );
}

export default SetPasswordPage;
