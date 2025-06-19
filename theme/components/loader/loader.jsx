import React from "react";
import styles from "./loader.less";
import SpinLoader from "@gofynd/theme-template/components/loader/loader";
import "@gofynd/theme-template/components/loader/loader.css";

function Loader({ customClassName }) {
  return (
    <div className={`${styles.loader} ${customClassName}`}>
      <SpinLoader
        containerClassName={styles.loaderContainer}
        loaderClassName={styles.customLoader}
      />
    </div>
  );
}

export default Loader;
