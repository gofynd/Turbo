import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@gofynd/theme-template/components/core/modal/modal";
import "@gofynd/theme-template/components/core/modal/modal.css";
import { PRODUCT_COMPARISON } from "../../queries/compareQuery";
import { useSnackbar } from "../../helper/hooks";
import styles from "./compare.less";
import CompareWarningIcon from "../../assets/images/compare-warning.svg";
import CloseIcon from "../../assets/images/close.svg";
import CompareIcon from "../../assets/images/compare-icon.svg";

const ProductCompareButton = ({ slug, fpi, customClass }) => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [isOpen, setIsOpen] = useState(false);
  const [warning, setWarning] = useState("");

  const addCompareProducts = () => {
    if (!slug) return;
    const existingSlugs = JSON.parse(
      localStorage?.getItem("compare_slugs") || "[]"
    );
    if (existingSlugs.includes(slug)) {
      navigate("/compare");
    } else if (existingSlugs.length < 4) {
      compareProducts({ existingSlugs });
    } else {
      setWarning("You can only compare 4 products at a time");
      setIsOpen(true);
    }
  };

  const compareProducts = ({ existingSlugs = [], action = "" }) => {
    try {
      let productsToBeCompared = [];
      if (action === "remove") {
        localStorage.removeItem("compare_slug");
        productsToBeCompared = [slug];
      } else if (action === "goToCompare") {
        navigate("/compare");
      } else {
        productsToBeCompared = [slug, ...existingSlugs];
        fpi
          .executeGQL(PRODUCT_COMPARISON, { slug: productsToBeCompared })
          .then(({ data, errors }) => {
            if (errors) {
              setWarning("Can't compare products of different categories");
              setIsOpen(true);
              return;
            }
            if (data?.productComparison) {
              localStorage?.setItem(
                "compare_slugs",
                JSON.stringify(productsToBeCompared)
              );
              navigate("/compare");
            }
          });
      }
    } catch (error) {
      showSnackbar("Something went wrong!", "error");
      throw error;
    }
  };
  const closeDialog = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className={`${styles.button} btnPrimary ${styles.flexCenter} ${styles.addToCompare} ${customClass}`}
        onClick={addCompareProducts}
      >
        <CompareIcon className={styles.compareIcon} />
        Add to Compare
      </button>
      <Modal
        isOpen={isOpen}
        closeDialog={closeDialog}
        hideHeader
        modalType="center-modal"
        containerClassName={styles.modal}
      >
        <div className={styles.compareModal}>
          <button
            type="button"
            className={styles.crossBtn}
            onClick={closeDialog}
          >
            <CloseIcon />
          </button>
          <div className={styles.modalBody}>
            <div className={styles.modalContent}>
              <div className={styles.image}>
                <CompareWarningIcon />
              </div>
              <div className={`${styles["bold-md"]} ${styles["primary-text"]}`}>
                {warning}
              </div>
            </div>
            <div className={styles["button-container"]}>
              <div>
                <button
                  type="button"
                  className={`${styles.button} btnSecondary`}
                  onClick={() => compareProducts({ action: "reset" })}
                >
                  Reset
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className={`${styles.button} btnPrimary ${styles.btnNoBorder}`}
                  onClick={() => compareProducts({ action: "goToCompare" })}
                >
                  Go to Compare
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductCompareButton;
