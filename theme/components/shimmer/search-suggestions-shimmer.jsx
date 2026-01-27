import React from "react";
import Shimmer from "./shimmer";
import styles from "./search-suggestions-shimmer.less";

const DEFAULT_CONFIG = {
  pillCount: 4,
  productCount: 4,
};

function SearchSuggestionsShimmer({
  pillCount = DEFAULT_CONFIG.pillCount,
  productCount = DEFAULT_CONFIG.productCount,
}) {
  const chipPlaceholders = Array.from({ length: pillCount });
  const productPlaceholders = Array.from({ length: productCount });

  const renderPills = () => (
    <div className={styles.searchSuggestionsShimmerPills}>
      {chipPlaceholders.map((_, index) => (
        <div
          key={`chip-${index}`}
          className={styles.searchSuggestionsShimmerPill}
        >
          <Shimmer height="32px" width="96px" />
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.searchSuggestionsShimmer}>
      <div className={styles.searchSuggestionsShimmerSection}>
        <div className={styles.searchSuggestionsShimmerTitle}>Collection</div>
        {renderPills()}
      </div>

      <div className={styles.searchSuggestionsShimmerSection}>
        <div className={styles.searchSuggestionsShimmerTitle}>Brand</div>
        {renderPills()}
      </div>

      <div className={styles.searchSuggestionsShimmerSection}>
        <div className={styles.searchSuggestionsShimmerTitle}>Category</div>
        {renderPills()}
      </div>

      <div className={styles.searchSuggestionsShimmerSection}>
        <div className={styles.searchSuggestionsShimmerTitle}>Products</div>
        <ul className={styles.searchSuggestionsShimmerProducts}>
          {productPlaceholders.map((_, index) => (
            <li
              key={`product-${index}`}
              className={styles.searchSuggestionsShimmerProductItem}
            >
              <div className={styles.searchSuggestionsShimmerThumb}>
                <Shimmer height="56px" width="56px" />
              </div>
              <div className={styles.searchSuggestionsShimmerProductMeta}>
                <Shimmer height="16px" width="80%" />
                <Shimmer height="12px" width="55%" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SearchSuggestionsShimmer;
