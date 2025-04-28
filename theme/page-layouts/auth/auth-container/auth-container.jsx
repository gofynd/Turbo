import React, { useMemo } from "react";
import styles from "./auth-container.less";
import { useGlobalTranslation } from "fdk-core/utils";

function AuthContainer({
  bannerAlignment = "no_banner",
  bannerImage = "",
  children,
}) {
  const { t } = useGlobalTranslation("translation");
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
              alt={t("resource.auth.alt_brand_banner")}
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
