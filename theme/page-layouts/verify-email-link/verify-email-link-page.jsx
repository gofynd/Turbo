import React from "react";
import { useSearchParams } from "react-router-dom";
import { useAccounts } from "../../helper/hooks";
import AuthContainer from "../auth/auth-container/auth-container";
import styles from "./verify-email-link-page.less";
import FyButton from "@gofynd/theme-template/components/core/fy-button/fy-button";
import "@gofynd/theme-template/components/core/fy-button/fy-button.css";
import { useGlobalTranslation } from "fdk-core/utils";

function VerifyEmailLinkPage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const { openHomePage } = useAccounts({ fpi });

  return (
    <AuthContainer>
      <div>
        <div className={styles.verifyEmailLinkTxt}>
          {t("resource.auth.verification_link_sent_to")} {email}
        </div>
        <p className={styles.verifyEmailLinkDesc}>
          {t("resource.auth.click_link_to_verify_email")}
        </p>
        <FyButton
          variant="contained"
          size="large"
          color="primary"
          fullWidth={true}
          onClick={openHomePage}
        >
          {t("resource.common.continue")}
        </FyButton>
      </div>
    </AuthContainer>
  );
}

export default VerifyEmailLinkPage;
