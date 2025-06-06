import React from "react";
import styles from "./page-not-found.less";
import FyButton from "@gofynd/theme-template/components/core/fy-button/fy-button";
import "@gofynd/theme-template/components/core/fy-button/fy-button.css";
import { useGlobalTranslation } from "fdk-core/utils";
import { FDKLink } from "fdk-core/components";
import PageNotFoundIcon from "../../assets/images/not-found.svg";

function PageNotFound({ title }) {
  const { t } = useGlobalTranslation("translation");
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.container}>
        <PageNotFoundIcon />
        <h3 className={`${styles.fontHeader} ${styles.title}`}>
          {t("resource.common.not_found_error")}
        </h3>
        <FDKLink to="/">
          <FyButton
            className={styles.btnPrimary}
            variant="outlined"
            size="large"
            color="secondary"
            fullWidth={true}
          >
            {t("resource.common.return_home")}
          </FyButton>
        </FDKLink>
      </div>
    </div>
  );
}
PageNotFound.defaultProps = {
  title: "Page Not Found",
};

export default PageNotFound;
