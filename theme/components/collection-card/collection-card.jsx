import React from "react";
import { FDKLink } from "fdk-core/components";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import placeholderImage from "../../assets/images/placeholder/collections-listing.png";
import styles from "./collection-card.less";

const CollectionCard = ({
  className = '',
  collectionName,
  collectionImage,
  collectionAction,
  buttonText,
  isNameOverImage = false,
  imageProps,
  ...rest
}) => {
  const { customClass, ...restImageProps } = imageProps;
  return (
    <div
      className={`${styles.collectionCard} ${isNameOverImage ? styles.inside : ""} ${className}`}
      {...rest}
    >
      <FDKLink action={collectionAction}>
        <FyImage
          customClass={`${styles.collectionImage} ${customClass}`}
          {...restImageProps}
          src={collectionImage || placeholderImage}
          alt={collectionName}
        />
      </FDKLink>
      <div className={styles.collectionTitleWrapper}>
        {!!collectionName && (
          <h3 className={styles.collectionTitle} title={collectionName}>
            {collectionName}
          </h3>
        )}
        {!!buttonText && (
          <FDKLink
            action={collectionAction}
            className={styles.collectionButton}
          >
            {buttonText}
          </FDKLink>
        )}
      </div>
    </div>
  );
};

export default CollectionCard;
