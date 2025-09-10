import React from "react";
import styles from "./empty-location.less";
import EmptyLocationIcon from "../../../../../assets/images/empty-location.svg";

const EmptyLocation = () => {
  return (
    <div className={styles.emptyLocationContainer}>
      <div className={styles.icon}>
        <EmptyLocationIcon />
      </div>
      <h3 className={styles.title}>Location not found</h3>
      <p className={styles.description}>Please search for different location</p>
    </div>
  );
};

export default EmptyLocation;