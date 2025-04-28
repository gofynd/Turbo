import React, { useState, useEffect } from "react";
import styles from "./empty-state.less";
import { detectMobileWidth } from "../../helper/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import { FDKLink } from "fdk-core/components";

const EmptyState = ({
  title,
  description,
  btnLink = "/",
  btnTitle,
  iconSrc,
  Icon = <></>,
  showButton = true,
  showTitle = true,
  customClassName = "",
  customHeaderClass = "",
}) => {
  const { t } = useGlobalTranslation("translation");
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
          {title || t("resource.common.no_data_found")}
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
          {btnTitle || t("resource.common.return_home")}
        </FDKLink>
      )}
    </div>
  );
};

export default EmptyState;
