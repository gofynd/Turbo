import React from "react";
import styles from "./list-renderer.less";

function ListRenderer({
  className = '',
  isTitle = false,
  title = "Results",
  list = [],
  getIcon = () => {},
  onSelect = () => {},
  getKey,
  getPrimaryText = () => "",
  getSecondaryText = () => "",
}) {

  const resolveKey = (item, index) => {
    if (typeof getKey === "function") return getKey(item);
    return index;
  };

  if (!list?.length) {
    return null;
  }

  return (
    <div className={`${styles.placePredictionsWrapper} ${className}`}>
      {isTitle && <h4 className={styles.predictionHeading}>{title}</h4>}
      <div className={styles.predictionList}>
        {list.map((item) => (
          <div
            key={resolveKey(item)}
            className={styles.predictionItem}
            onClick={() => onSelect(item)}
          >
            {getIcon(item)}
            <div className={styles.predictionItemInfo}>
              <div className={styles.mainText}>{getPrimaryText(item)}</div>
              <div className={styles.secondaryText}>
                {getSecondaryText(item)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListRenderer;
