import React from "react";
import FyImage from "../core/fy-image/fy-image";
import styles from "./card-logo.less";
import { FDKLink } from "fdk-core/components";

function CardLogo({ card, cardType, globalConfig }) {
  const getTitle = () => {
    let title = card.name;
    if (card.product_name) {
      title += ` ${card.product_name}`;
    }
    return title;
  };

  const getCardLogo = () =>
    card.logo?.url ||
    "https://boltagency.ca/content/images/2020/03/placeholder-images-product-1_large.png";

  const generateLink = () => {
    if (cardType === "COLLECTIONS") {
      return `/collection/${card.slug}`;
    }
    if (cardType === "PRODUCT") {
      return `/product/${card.slug}`;
    }
    if (cardType === "BRANDS") {
      return `/products/?brand=${card.slug}`;
    }
    return `/products/?${card?.action?.page?.url?.split("?")?.[1]}`;
  };

  return (
    <div
      className={`${styles.cardItem} ${styles.groupItemLogo}`}
      title={getTitle()}
    >
      <FDKLink to={generateLink()}>
        <FyImage
          src={getCardLogo()}
          customClass={styles.logoCard}
          sources={[{ width: 200 }]}
          globalConfig={globalConfig}
        />
      </FDKLink>
    </div>
  );
}

export default CardLogo;
