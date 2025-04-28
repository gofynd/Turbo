import React from "react";
import styles from "./loader.less";
import SpinLoader from "fdk-react-templates/components/loader/loader";
import "fdk-react-templates/components/loader/loader.css";

function Loader(props) {
  return (
    <div className={styles.loader}>
      <SpinLoader
        containerClassName={styles.loaderContainer}
        loaderClassName={styles.customLoader}
      />
    </div>
  );
}

export default Loader;
