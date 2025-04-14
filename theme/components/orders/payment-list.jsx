import React, { useState } from "react";
import styles from "./styles/payment-list.less";
import PlusIcon from "../../assets/images/plus-black.svg";

function PaymentList({ payments, selectpayment }) {
  return (
    <div className={`${styles.paymentList}`}>
      {payments?.map((payment, index) => (
        <div key={index}>
          {Array.isArray(payment?.items) && payment.items.length > 1 && (
            <p
              className={`${styles.paymentListItem} ${styles.nohover} ${styles.noborder} ${styles.darkersm}`}
            >
              {payment?.display_name}
            </p>
          )}
          <ul>
            {payment?.items?.map((item, index) => (
              <li
                key={index}
                className={`${styles.paymentListItem}`}
                onClick={() => selectpayment(item.display_name)}
              >
                <div className={`${styles.paymentDetails}`}>
                  <img
                    className={`${styles.paymentLogo}`}
                    src={item?.logo_small}
                    alt=""
                  />
                  <span className={`${styles.darkerxs}`}>
                    {item?.display_name}
                  </span>
                </div>
                <PlusIcon />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default PaymentList;
