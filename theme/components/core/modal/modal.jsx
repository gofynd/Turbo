import React, { useEffect, useRef } from "react";
import styles from "./modal.less";

function Modal({
  isOpen,
  isCancelable = true,
  childHandleFocus = false,
  modalType = "",
  closeDialog,
  children,
}) {
  const modalRef = useRef(null);
  const modalContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && !childHandleFocus && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen, childHandleFocus]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalContainerRef.current &&
        !modalContainerRef.current.contains(event.target)
      ) {
        closeDialog();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDialog]);

  return (
    isOpen && (
      <div
        role="button"
        className={`${styles.modal} ${modalType === "right-modal" ? styles.rightModal : ""}`}
        ref={modalRef}
        tabIndex="0"
        onKeyDown={(e) => e.key === "Escape" && isCancelable && closeDialog()}
      >
        <div className={styles.modalContainer} ref={modalContainerRef}>
          {children}
        </div>
      </div>
    )
  );
}

export default Modal;
