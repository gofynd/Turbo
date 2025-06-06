import React, { useState, Suspense } from "react";
import Modal from "@gofynd/theme-template/components/core/modal/modal";
import "@gofynd/theme-template/components/core/modal/modal.css";
import { PRODUCT_COMPARISON } from "../../queries/compareQuery";
import { useSnackbar } from "../../helper/hooks";
import styles from "./compare.less";
import { useNavigate, useGlobalTranslation } from "fdk-core/utils";
import CompareWarningIcon from "../../assets/images/compare-warning.svg";
import CloseIcon from "../../assets/images/close.svg";
import CompareIcon from "../../assets/images/compare-icon.svg";
import { isRunningOnClient } from "../../helper/utils";

const ProductCompareButton = ({ slug, fpi, customClass }) => {
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [isOpen, setIsOpen] = useState(false);
  const [warning, setWarning] = useState("");

  const addCompareProducts = () => {
    if (!slug) return;
    const existingSlugs = isRunningOnClient()
    ? JSON.parse(localStorage?.getItem("compare_slugs") || "[]")
    : [];
  

    if (existingSlugs.includes(slug)) {
      navigate("/compare");
    } else if (existingSlugs.length < 4) {
      compareProducts({ existingSlugs });
    } else {
      setWarning(t("resource.compare.product_comparison_limit"));
      setIsOpen(true);
    }
  };

  const compareProducts = ({ existingSlugs = [], action = "" }) => {
    try {
      let productsToBeCompared = [];
      if (action === "remove") {
        if (isRunningOnClient()) {
          localStorage.removeItem("compare_slug");
        }        
        productsToBeCompared = [slug];
      } else if (action === "goToCompare") {
        navigate("/compare");
      } else {
        productsToBeCompared = [slug, ...existingSlugs];
        fpi
          .executeGQL(PRODUCT_COMPARISON, { slug: productsToBeCompared })
          .then(({ data, errors }) => {
            if (errors) {
              setWarning(t("resource.compare.cannot_compare_different_categories"));
              setIsOpen(true);
              return;
            }
            if (data?.productComparison) {
              if (isRunningOnClient()) {
                localStorage?.setItem(
                  "compare_slugs",
                  JSON.stringify(productsToBeCompared)
                );
              }
              navigate("/compare");
            }
          });
      }
    } catch (error) {
      showSnackbar(t("resource.common.error_message"), "error");
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
        {t("resource.compare.add_to_compare")}
      </button>
      <Suspense fallback={<div/>}>
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
                  {t("resource.facets.reset")}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className={`${styles.button} btnPrimary ${styles.btnNoBorder}`}
                  onClick={() => compareProducts({ action: "goToCompare" })}
                >
                  {t("resource.compare.go_to_compare")}
                </button>
              </div>
            </div>
          </div>
        </div >
      </Modal >
      </Suspense>
    </>
  );
};

export default ProductCompareButton;
