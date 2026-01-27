import React from "react";
import styles from "./save-upi-item.less";
import RadioIcon from "../../assets/images/radio";
import UseUpiIcon from "../../assets/images/use-upi-icon.svg";

function SaveUpiItem({ upi, onChange, selectedUpi }) {
  const isSelected = selectedUpi?.id === upi.id;

  return (
    <div
      className={`${styles.upi} ${isSelected ? styles.selected : ""}`}
      onClick={() => onChange(upi)}
    >
      <div className={styles.upiName}>
        <div className={styles.upiImg}>
          <UseUpiIcon />
        </div>
        <p>{upi.vpa_address}</p>
      </div>

      <div
        className={`${styles.customRadio} ${upi.selected ? styles.checked : ""}`}
      >
        <RadioIcon width={24} checked={isSelected} />
      </div>
    </div>
  );
}

export default SaveUpiItem;
