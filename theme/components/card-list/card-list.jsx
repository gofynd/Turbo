import React from "react";
import CardLogo from "../card-logo/card-logo";
import Card from "../card/card";
import styles from "./card-list.less";
import CategoriesCard from "../categories-card/categories-card";
import { convertActionToUrl } from "@gofynd/fdk-client-javascript/sdk/common/Utility";

function CardList({
  cardList,
  cardType,
  showOnlyLogo,
  isImageFill,
  globalConfig,
  pageConfig,
}) {
  return (
    <div className={styles.grpListWrap}>
      <div
        className={`${styles.groupCards} ${
          showOnlyLogo ? styles.logoOnlyGroup : ""
        }`}
        data-card={cardType}
      >
        {showOnlyLogo
          ? cardList.map((item, index) => (
              <CardLogo
                key={`group-item-logo${index}`}
                card={item}
                cardType={cardType}
                globalConfig={globalConfig}
              />
            ))
          : cardList?.map((item, index) =>
              cardType === "CATEGORIES" ? (
                <CategoriesCard
                  config={pageConfig}
                  url={convertActionToUrl(item?.action)}
                  category={item}
                  img={{
                    src: item?.banners?.portrait?.url,
                    srcSet: [
                      { breakpoint: { min: 768 }, width: 800 },
                      { breakpoint: { max: 767 }, width: 700 },
                    ],
                  }}
                  differ={index > 7}
                />
              ) : (
                <Card
                  key={`${cardType}${index}`}
                  card={item}
                  cardType={cardType}
                  isImageFill={isImageFill}
                  globalConfig={globalConfig}
                />
              )
            )}
      </div>
    </div>
  );
}

export default CardList;
