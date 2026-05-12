import React, { useEffect, useRef } from "react";
import styles from "./modal.less";

function Modal({
  isOpen,
  isCancelable = true,
  childHandleFocus = false,
  modalType = "",
  closeDialog,
  children,
  dataModalType,
}) {
  const modalRef = useRef(null);
  const modalContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && !childHandleFocus && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen, childHandleFocus]);

  // Lock body scroll when modal is open to prevent scroll chaining to content behind
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

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
        {...(dataModalType && { [`data-${dataModalType}-modal`]: "true" })}
        {...(modalType === "order-filter" && {
          "data-order-filter-modal": "true",
        })}
        className={`${styles.modal} ${
          modalType === "right-modal"
            ? styles.rightModal
            : modalType === "mobile-fullscreen"
              ? styles.mobileFullscreen
              : modalType === "order-filter"
                ? styles.orderFilterModal
                : ""
        }`}
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
