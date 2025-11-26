import React, { Fragment, isValidElement } from "react";
import styles from "./message-card.less";
import ErrorRedIcon from "../../assets/images/info-red.svg";
import CheckGreenIcon from "../../assets/images/check-green.svg";
import InfoYellowIcon from "../../assets/images/yellow-info.svg";

const MessageCard = ({
  type,
  message,
  secondaryMessage,
  showReason = true,
  displayDate = "",
  customStyles = {},
}) => {
  const isEmptyFragment =
    isValidElement(secondaryMessage) &&
    secondaryMessage.type === Fragment &&
    (!secondaryMessage.props.children ||
      (Array.isArray(secondaryMessage.props.children) &&
        secondaryMessage.props.children.length === 0));

  return (
    <div className={`${styles.messageCardWrapper} ${styles[type]}`}>
      {/* <div className={styles.colorLine}></div> */}
      <div className={styles.infoContainer}>
        <div className={styles.infoIconContainer} style={{...customStyles?.infoIconContainer}}>
          {type === "success" && <CheckGreenIcon />}
          {type === "failure" && <ErrorRedIcon />}
          {type === "info" && <InfoYellowIcon />}
        </div>

        <div
          className={styles.messageContent}
          style={{
            ...customStyles?.messageContent,
          }}
        >
          <div
            className={styles.messageText}
            style={isEmptyFragment ? { paddingTop: "4px" } : {}}
          >
            {message}
          </div>
          <div className={styles.secondaryMessageText}>
            {showReason && <span>Reason: </span>}
            {secondaryMessage}
            <span>{displayDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MessageCard;
