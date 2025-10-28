import React from "react";
import { FDKLink } from "fdk-core/components";
import styles from "./share-item.less";
import { copyToClipboard } from "../../helper/utils";
import { useSnackbar } from "../../helper/hooks";
import PolygonIcon from "../../assets/images/polygon.svg";
import CloseIcon from "../../assets/images/close.svg";
import WhatsappShareIcon from "../../assets/images/wattsapp-share.svg";
import TwitterShareIcon from "../../assets/images/twitter-share.svg";
import FacebookShareIcon from "../../assets/images/facebook-share.svg";
import ContentCopy from "../../assets/images/content-copy.svg";
import MoreVertical from "../../assets/images/more-vertical.svg";
import CopyLink from "../../assets/images/copy-link.svg";
import { useGlobalTranslation } from "fdk-core/utils";

function ShareItem({ setShowSocialLinks, description, handleShare }) {
  const { t } = useGlobalTranslation("translation");
  const encodedUrl = encodeURIComponent(window?.location?.href);
  const { showSnackbar } = useSnackbar();
  const encodedDescription = encodeURIComponent(description);
  const shareUrl = window?.location?.href;
  const whatsappText = `${encodeURIComponent(shareUrl)}%0A${encodedDescription}`;

  const handleCopyToClipboard = (e) => {
    e.stopPropagation();
    copyToClipboard(shareUrl);
    showSnackbar(t("resource.common.link_copied"), "success");
  };

  const shareOptions = [
    {
      name: `${t("resource.common.copy_link")}`,
      icon: (
        <>
          <ContentCopy className={styles.desktopCopyIcon} />
          <CopyLink className={styles.mobileCopyIcon} />
        </>
      ),
      onClick: handleCopyToClipboard,
    },
    {
      name: "Facebook",
      icon: <FacebookShareIcon />,
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDescription}`,
    },
    {
      name: "X",
      icon: <TwitterShareIcon />,
      link: `https://twitter.com/share?url=${encodedUrl}&text=${encodedDescription}`,
    },
    {
      name: "WhatsApp",
      icon: <WhatsappShareIcon />,
      link: `https://wa.me/?text=${whatsappText}`,
    },
    {
      name: "More Apps",
      icon: <MoreVertical />,
      onClick: handleShare,
    },
  ];
  return (
    <>
      <div
        className={styles["overlay-share"]}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowSocialLinks(false);
        }}
      />

      <div className={styles["share-popup-overlay"]}>
        <span className={styles.upArrow}>
          <FDKLink
            to={`https://wa.me/?text=${encodedDescription} ${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <PolygonIcon className={styles.PolygonIcon} />
          </FDKLink>
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
            {shareOptions.map((option, index) => (
              <div
                key={index}
                className={`${styles.iconWrapper} ${
                  option.name === "More Apps" ? styles.moreApp : ""
                }`}
                onClick={option.onClick}
              >
                <span
                  className={`${styles.iconContainer} ${
                    option.onClick ? styles.circleIconContainer : ""
                  }`}
                >
                  {option.link ? (
                    <FDKLink
                      to={option.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {option.icon}
                    </FDKLink>
                  ) : (
                    option.icon
                  )}
                </span>
                <span className={styles.iconName}>{option.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default ShareItem;
