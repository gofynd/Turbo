import React, { useState } from "react";
import styles from "./styles/beneficiary-list.less";
import BeneficiaryItem from "./beneficiary-list-item";

function BeneficiaryList({ beneficiaries, selectedBeneficiary, change }) {
  return (
    <div>
      {beneficiaries?.map((item, index) => (
        <BeneficiaryItem
          key={index}
          className={`${styles.beneficiaryItem}`}
          selectedBeneficiary={selectedBeneficiary}
          beneficiary={item}
          change={change}
        ></BeneficiaryItem>
      ))}
    </div>
  );
}

export default BeneficiaryList;
