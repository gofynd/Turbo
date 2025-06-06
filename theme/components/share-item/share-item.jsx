import React, { useState } from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./share-item.less";
import { copyToClipboard } from "../../helper/utils";
import PolygonIcon from "../../assets/images/polygon.svg";
import CloseIcon from "../../assets/images/close.svg";
import WhatsappShareIcon from "../../assets/images/wattsapp-share.svg";
import TwitterShareIcon from "../../assets/images/twitter-share.svg";
import FacebookShareIcon from "../../assets/images/facebook-share.svg";
import { useGlobalTranslation } from "fdk-core/utils";

function ShareItom({ setShowSocialLinks, description }) {
  const { t } = useGlobalTranslation("translation");
  const [btnText, setBtnText] = useState(
    t("resource.common.copy_link")
  );

  const encodedDescription = encodeURIComponent(
    description
  );
  const encodedUrl = encodeURIComponent(window?.location?.href);

  const handleCopyToClipboard = (event) => {
    event.stopPropagation();
    const url = window.location.href;
    copyToClipboard(url);
    setBtnText(t("resource.common.copied"));
    setTimeout(() => {
      setBtnText(t("resource.common.copy_link"));
    }, 5000);
  };

  return (
    <>
      <div
        className={styles["overlay-share"]}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowSocialLinks(false);
        }}
      ></div>
      <div className={styles["share-popup-overlay"]}>
        <span className={styles.upArrow}>
          <PolygonIcon />
        </span>
        <div
          className={styles["share-popup"]}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`${styles["popup-title"]} fontHeader`}>
            {t("resource.common.share")}
            <span
              className={styles["close-icon"]}
              onClick={() => setShowSocialLinks(false)}
            >
              <CloseIcon />
            </span>
          </div>
          <div className={styles.icons}>
            {/* <div className="social-links"> */}
            <span>
              <FDKLink
                to={`https://wa.me/?text=${encodedDescription} ${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsappShareIcon />
              </FDKLink>
            </span>
            <span>
              <FDKLink
                to={`https://twitter.com/share?url=${encodedUrl}&text=${encodedDescription}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterShareIcon />
              </FDKLink>
            </span>

            <span>
              <FDKLink
                to={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookShareIcon />
              </FDKLink>
            </span>
          </div>
          <div className={styles["copy-input"]}>
            <input type="text" value={window?.location?.href} readOnly />
            <button
              onClick={handleCopyToClipboard}
              className={`${btnText === "Copied" ? styles["white-btn"] : ""}`}
            >
              {btnText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ShareItom;
