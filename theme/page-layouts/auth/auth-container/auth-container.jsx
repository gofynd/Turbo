import React, { useMemo } from "react";
import styles from "./auth-container.less";

function AuthContainer({
  bannerAlignment = "no_banner",
  bannerImage = "",
  children,
}) {
  const isBanner = useMemo(
    () => bannerAlignment !== "no_banner" && !!bannerImage,
    [bannerAlignment, bannerImage]
  );

  return (
    <div className={styles.loginWrapper}>
      <div
        className={`${styles.loginCard} ${bannerAlignment === "right_banner" ? styles.cardReverse : ""}`}
      >
        {isBanner && (
          <div className={styles.loginBannerWrapper}>
            <img
              src={bannerImage}
              alt="brand banner"
              className={styles.bannerImg}
            />
          </div>
        )}
        <div className={styles.loginContent}>{children}</div>
      </div>
    </div>
  );
}

export default AuthContainer;
