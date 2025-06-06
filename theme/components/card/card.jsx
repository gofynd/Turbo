import React from "react";
import { FDKLink } from "fdk-core/components";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import styles from "./card.less";
import placeholder1X1 from "../../assets/images/placeholder1X1.png";
import placeholder3X4 from "../../assets/images/placeholder3x4.png";

function Card({ card, cardType, isImageFill, globalConfig, img_fill = false }) {
  function getCardLogo() {
    return card?.logo?.url || placeholder1X1;
  }
  function getImageURL() {
    let imageURL =
      card?.media?.url ||
      (Array.isArray(card?.media) && card.media[0]?.url) ||
      placeholder3X4;

    if (cardType === "COLLECTIONS") {
      imageURL = card?.banners?.portrait?.url || placeholder3X4;
    }
    if (cardType === "BRANDS" && card.banners) {
      imageURL = card?.banners?.portrait?.url || placeholder3X4;
    }
    if (cardType === "CATEGORIES" && card.banners) {
      imageURL = card?.banners?.portrait?.url || placeholder3X4;
    }
    return imageURL;
  }

  function getUrl() {
    if (cardType === "COLLECTIONS") {
      return `/collection/${card?.slug}`;
    }
    if (cardType === "PRODUCT") {
      return `/product/${card?.slug}`;
    }
    if (cardType === "BRANDS") {
      return `/products/?brand=${card?.slug}`;
    }
    if (cardType === "CATEGORIES") {
      return `/products?category=${card?.slug}&department=${card?.action?.page?.query?.department?.[0]
        }`;
    }
    return `/products/?${card?.slug}`;
  }

  return (
    <div>
      {card && (
        <div
          className={`${styles.cardItem} ${styles.groupItemBox} ${styles[`${cardType}`]
            }`}
        >
          <FDKLink className={styles.displayBlock} to={getUrl()}>
            <FyImage
              src={getImageURL()}
              isImageFill={isImageFill}
              aspectRatio="0.8"
              mobileAspectRatio="0.8"
              customClass={styles.cardImg}
              sources={[
                { breakpoint: { min: 768 }, width: 800 },
                { breakpoint: { max: 767 }, width: 700 },
              ]}
              placeholder={placeholder3X4}
              globalConfig={globalConfig}
            />
            <div
              className={`${styles.cardDesc} ${styles.flexAlignCenter} ${(cardType === "COLLECTIONS" || cardType === "CATEGORIES") &&
                styles.emergeCenter
                } ${cardType === "BRANDS" && styles.BRANDS}`}
            >
              {cardType === "BRANDS" && (
                <div className={styles.cardLogo}>
                  <FyImage
                    customClass={styles.imgWrapper}
                    isImageFill={img_fill}
                    src={getCardLogo()}
                    aspectRatio="1"
                    mobileAspectRatio="1"
                    placeholder={placeholder1X1}
                    sources={[
                      {
                        breakpoint: { max: 500 },
                        width: 50,
                      },
                      { width: 40 },
                    ]}
                  />
                </div>
              )}
              <h5
                className={`${styles.title} ${
                  cardType === "BRANDS" && styles.b1
                }`}
                title={card.name}
              >
                {card.name}
              </h5>
            </div>
          </FDKLink>
        </div>
      )}
    </div>
  );
}

export default Card;
