import React, { useState, useEffect } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./empty-state.less";
import { detectMobileWidth } from "../../helper/utils";

const EmptyState = ({
  title = "No Data Found",
  description,
  btnLink = "/",
  btnTitle = "RETURN TO HOMEPAGE",
  iconSrc,
  Icon = <></>,
  showButton = true,
  showTitle = true,
  customClassName = "",
  customHeaderClass = "",
}) => {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    setIsMobile(detectMobileWidth());
  }, []);
  return (
    <div className={`${styles.error} ${customClassName} fontBody`}>
      {iconSrc && <img src={iconSrc} alt="" />}
      {Icon && <div className={styles.icon}>{Icon}</div>}
      {showTitle && (
        <h3 className={`${styles.heading} ${customHeaderClass} fontHeader`}>
          {title}
        </h3>
      )}
      {description && (
        <div
          className={`${styles.description} ${isMobile ? styles.b2 : styles.b1}`}
        >
          <p>{description}</p>
        </div>
      )}
      {showButton && (
        <FDKLink to={btnLink} className={`${styles.button} btn-secondary`}>
          {btnTitle}
        </FDKLink>
      )}
    </div>
  );
};

export default EmptyState;
