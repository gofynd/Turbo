import React, { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowLeft from "../../assets/images/slide-arrow-left.svg";
import ArrowRight from "../../assets/images/slide-arrow-right.svg";
import styles from "./styles/pagination.less";

const Pagination = ({
  current = 1,
  hasPrevious = false,
  hasNext = false,
  totalPages = 1,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToTop = useCallback(() => {
    if (window) {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);
    }
  }, []);

  const getPageUrl = (pageNo) => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("page_no", pageNo.toString());
    return `/profile/orders?${queryParams.toString()}`;
  };

  const handlePageChange = (pageNo) => {
    scrollToTop();
    navigate(getPageUrl(pageNo));
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={styles.pagination}>
      <button
        className={`${styles.pageButton} ${styles.prevButton} ${
          !hasPrevious ? styles.disabled : ""
        }`}
        onClick={() => hasPrevious && handlePageChange(current - 1)}
        disabled={!hasPrevious}
        aria-label={"Previous"}
        type="button"
      >
        <ArrowLeft className={styles.arrowIcon} />
      </button>

      <div className={styles.pageInfo}>
        <span className={styles.pageText}>
          {"Page"} {current} {"of"} {totalPages}
        </span>
      </div>

      <button
        className={`${styles.pageButton} ${styles.nextButton} ${
          !hasNext ? styles.disabled : ""
        }`}
        onClick={() => hasNext && handlePageChange(current + 1)}
        disabled={!hasNext}
        aria-label={"Next"}
        type="button"
      >
        <ArrowRight className={styles.arrowIcon} />
      </button>
    </div>
  );
};

export default Pagination;
