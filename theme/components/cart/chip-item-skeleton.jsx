import React from "react";
import { Skeleton } from "../core/skeletons";
import styles from "./chip-item-skeleton.less";

const ChipItemSkeleton = ({ config, category, img, url, differ }) => {
  return (
    <div className={styles.cartItem}>
      <div className={styles.eachItemContainer}>
        <Skeleton width="100%" aspectRatio={2 / 3} />
        <div>
          <Skeleton width={50} />
          <Skeleton width={100} className={styles.topSpacing} />
          <Skeleton width={200} className={styles.topSpacing} />
          <div className={`${styles.itemWrapper} ${styles.topSpacing}`}>
            <Skeleton width={100} />
            <Skeleton width={120} />
          </div>
          <div className={`${styles.itemWrapper} ${styles.topSpacing}`}>
            <Skeleton width={40} />
            <Skeleton width={30} />
            <Skeleton width={50} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChipItemSkeleton;
