import React from "react";
import { useGlobalTranslation } from "fdk-core/utils";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import styles from "./product-combo-card.less";
import { getDiscountPercentage, getProductImgAspectRatio } from "../../../../../helper/utils";
import { Skeleton } from "../../../../../components/core/skeletons";

export default function ProductComboCard({
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
  ctaLabel = "ADD TO CART",
  onAddToCartClick,
}) {
  const { t } = useGlobalTranslation("translation");
  const discount = getDiscountPercentage({
    effectivePrice,
    markedPrice,
  });

  const isEffectivePrice = effectivePrice !== markedPrice;

  if (isLoading) {
    return (
      <div className={styles.productComboCard}>
        <Skeleton
          className={styles.productComboImage}
          width={150}
          aspectRatio={getProductImgAspectRatio(globalConfig)}
        />
        <div className={styles.productComboDetails}>
          {isBrand && <Skeleton className={styles.brand} width={"70px"} />}
          <div className={styles.title}>
            <Skeleton width={"70%"} lines={2} />
          </div>
          <div className={styles.priceBox}>
            <div className={styles.priceRow}>
              <Skeleton
                className={styles.marked}
                width={"50px"}
                lines={2}
                direction="row"
              />
            </div>
            <Skeleton className={styles.taxLabel} width={"100px"} />
          </div>
          <Skeleton className={styles.cta} height={"56px"} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.productComboCard}>
      <FyImage
        customClass={styles.productComboImage}
        src={imageUrl}
        sources={[{ width: 150 }]}
        isLazyLoaded={true}
        aspectRatio={getProductImgAspectRatio(globalConfig)}
        defer={true}
      />
      <div className={styles.productComboDetails}>
        {isBrand && <div className={styles.brand}>{brand}</div>}
        <div className={styles.title}>{title}</div>
        <div className={styles.priceBox}>
          <div className={styles.priceRow}>
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
          <div className={styles.taxLabel}>(inclusive of all taxes)</div>
        </div>
        <button className={styles.cta} onClick={onAddToCartClick}>
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
