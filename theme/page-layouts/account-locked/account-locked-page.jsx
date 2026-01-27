import React from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useAccounts } from "../../helper/hooks";
import AccountLockedPage from "@gofynd/theme-template/page-layouts/auth/account-locked/account-locked";
import "@gofynd/theme-template/page-layouts/auth/account-locked/account-locked.css";
import styles from "./account-locked-page.less";

function AccountLocked({ fpi }) {
  const supportInfo = useGlobalStore(fpi.getters.SUPPORT_INFORMATION);
  const { openHomePage } = useAccounts({ fpi });

  const { email } = supportInfo?.contact ?? {};

  return (
    <div className={styles.accountLockWrapper}>
      <AccountLockedPage email={email} openHomePage={openHomePage} />
    </div>
  );
}

export default AccountLocked;
