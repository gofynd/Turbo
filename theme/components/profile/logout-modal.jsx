import React from "react";
import Modal from "../core/modal/modal";
import styles from "./logout-modal.less";

function LogoutModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} closeDialog={onClose} isCancelable={true}>
      <div className={styles.logoutModalContent}>
        <div className={styles.modalHeader}>
          <h2 id="logout-modal-title" className={styles.modalTitle}>
            Logout
          </h2>
          <p id="logout-modal-description" className={styles.modalMessage}>
            Are you sure you want to logout?
          </p>
        </div>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={`${styles.modalButton} ${styles.primaryButton}`}
            onClick={onClose}
            aria-label="Cancel logout"
          >
            NO
          </button>
          <button
            type="button"
            className={`${styles.modalButton} ${styles.secondaryButton}`}
            onClick={onConfirm}
            aria-label="Confirm logout"
          >
            YES
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default LogoutModal;
