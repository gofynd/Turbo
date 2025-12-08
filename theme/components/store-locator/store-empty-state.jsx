import React from "react";
import styles from "./store-empty-state.less";
import EmptyStateIllustration from "../../assets/images/store-locator-empty-state.svg";

/**
 * StoreEmptyState Component
 *
 * Displays an empty state when no stores are found or available.
 * Shows an illustration, message, and keeps search/filter options visible.
 *
 * @param {string} title - Title text (default: "No Results Found")
 * @param {string} description - Description text (optional)
 * @param {string} className - Additional CSS classes
 */
function StoreEmptyState({
  title = "No Results Found",
  description = "There are no locations in your search area. Please try a different search area.",
  className = "",
}) {
  return (
    <div className={`${styles.emptyStateContainer} ${className}`}>
      <div className={styles.emptyStateContent}>
        <div className={styles.emptyStateIconWrapper}>
          <div className={styles.emptyStateIcon}>
            <EmptyStateIllustration
              aria-hidden="true"
              className={styles.emptyStateIllustration}
              focusable="false"
            />
          </div>
        </div>
        <div className={styles.emptyStateText}>
          <h3 className={styles.emptyStateTitle}>{title}</h3>
          {description && (
            <div className={styles.emptyStateDescription}>
              {description.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StoreEmptyState;
