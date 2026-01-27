import React from "react";
import styles from "./refund-message-card.less";

const MessageCard = ({ message, customClassName = "", isError = false }) => {
  return (
    <div className={`${styles.messageCardWrapper} ${customClassName} ${isError ? styles.errorContainer : ''}`}>
      <div className={`${styles.messageContent} ${customClassName} ${isError ? styles.errorMsg : ''}`}>{message}</div>
    </div>
  );
};

export default MessageCard;
