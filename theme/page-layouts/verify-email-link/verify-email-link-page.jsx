import React from "react";
import { useSearchParams } from "react-router-dom";
import { useAccounts } from "../../helper/hooks";
import AuthContainer from "../auth/auth-container/auth-container";
import styles from "./verify-email-link-page.less";
import FyButton from "@gofynd/theme-template/components/core/fy-button/fy-button";
import "@gofynd/theme-template/components/core/fy-button/fy-button.css";

function VerifyEmailLinkPage({ fpi }) {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const { openHomePage } = useAccounts({ fpi });

  return (
    <AuthContainer>
      <div>
        <div className={styles.verifyEmailLinkTxt}>
          A verification link has been sent to {email}
        </div>
        <p className={styles.verifyEmailLinkDesc}>
          Please click on the link that has been sent to your email account to
          verify your email and continue with the registration process.
        </p>
        <FyButton
          variant="contained"
          size="large"
          color="primary"
          fullWidth={true}
          onClick={openHomePage}
        >
          Continue
        </FyButton>
      </div>
    </AuthContainer>
  );
}

export default VerifyEmailLinkPage;
