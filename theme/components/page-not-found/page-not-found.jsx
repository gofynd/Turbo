import React from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./page-not-found.less";
import FyButton from "@gofynd/theme-template/components/core/fy-button/fy-button";
import "@gofynd/theme-template/components/core/fy-button/fy-button.css";
import PageNotFoundIcon from "../../assets/images/not-found.svg";

function PageNotFound({ title }) {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.container}>
        <PageNotFoundIcon />
        <h3 className={`${styles.fontHeader} ${styles.title}`}>
          Oops! Looks like the page you&apos;re looking for doesn&apos;t exist
        </h3>
        <FDKLink to="/">
          <FyButton
            className={styles.btnPrimary}
            variant="outlined"
            size="large"
            color="secondary"
            fullWidth={true}
          >
            Return to Homepage
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
