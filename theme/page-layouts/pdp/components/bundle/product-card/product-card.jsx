import React from "react";
import { useGlobalTranslation } from "fdk-core/utils";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import styles from "./product-card.less";
import {
  getProductImgAspectRatio,
  getDiscountPercentage,
} from "../../../../../helper/utils";
import { Skeleton } from "../../../../../components/core/skeletons";

export default function ProductCardMini({
  fpi,
  globalConfig,
  isBrand,
  isLoading,
  brand,
  title,
  imageUrl,
  effectivePrice,
  markedPrice,
  currencySymbol = "",
  size,
}) {
  const { t } = useGlobalTranslation("translation");
  const discount = getDiscountPercentage({
    markedPrice,
    effectivePrice,
  });
  const isEffectivePrice = effectivePrice !== markedPrice;

  if (isLoading) {
    return (
      <div className={styles.productCard}>
        <div className={styles.productContent}>
          <Skeleton
            className={styles.productImage}
            width={84}
            aspectRatio={getProductImgAspectRatio(globalConfig)}
          />

          <div className={styles.productDetails}>
            {isBrand && (
              <div className={styles.brand}>
                <Skeleton width={"70px"} />
              </div>
            )}
            <h5 className={styles.title}>
              <Skeleton width={"50%"} />
            </h5>

            <div className={styles.productPrice}>
              <div className={styles.effective}>
                <Skeleton width={"50px"} />
              </div>
              <div className={styles.marked}>
                <Skeleton width={"50px"} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.productSize}>
          <Skeleton width={"70px"} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.productCard}>
      <div className={styles.productContent}>
        <FyImage
          customClass={styles.productImage}
          src={imageUrl}
          sources={[{ width: 84 }]}
          isLazyLoaded={true}
          aspectRatio={getProductImgAspectRatio(globalConfig)}
          defer={true}
        />

        <div className={styles.productDetails}>
          {isBrand && <div className={styles.brand}>{brand}</div>}
          <h5 className={styles.title} title={title}>
            {title}
          </h5>

          <div className={styles.productPrice}>
            {isEffectivePrice && (
              <div
                className={styles.effective}
              >{`${currencySymbol}${effectivePrice}`}</div>
            )}
            <div
              className={`${isEffectivePrice ? styles.marked : styles.effective}`}
            >{`${t("resource.common.mrp")} ${currencySymbol}${markedPrice}`}</div>
            {discount > 0 && (
              <span className={styles.discount}>{`${discount}% Off`}</span>
            )}
          </div>
        </div>
      </div>
      <div className={styles.productSize}>{`Size: ${size}`}</div>
    </div>
  );
}
