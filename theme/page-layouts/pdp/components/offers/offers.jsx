import React from "react";
import styles from "./offers.less";
import { useGlobalTranslation } from "fdk-core/utils";

function OfferCard({ priceLabel, priceValue, codeLabel, codeValue, title }) {
  return (
    <div className={styles.offersDetailsBlock}>
      <div className={` ${styles.bestPriceContainer}`}>
        <p className={styles.bestPriceText}>
          {priceLabel}{" "}
          <span className={styles.price}>
            {priceValue && <span>&#8377;{priceValue}</span>}
          </span>
        </p>
      </div>
      {codeValue && (
        <div className={`${styles.sh4} ${styles.offersDetailsBlockCode}`}>
          {codeLabel}: <span className={styles.couponCode}>{codeValue}</span>
        </div>
      )}
      {title && (
        <div className={`${styles.b4} ${styles.offersDetailsBlockTitle}`}>
          {title}
        </div>
      )}
    </div>
  );
}

function Offers({
  couponsList,
  promotionsList,
  setShowMoreOffers,
  setSidebarActiveTab,
}) {
  const { t } = useGlobalTranslation("translation");
  const sortedCoupons = React.useMemo(() => {
    return [...couponsList].sort((a, b) => {
      const pA = a.rule?.[0]?.discounted_price ?? Number.MAX_VALUE;
      const pB = b.rule?.[0]?.discounted_price ?? Number.MAX_VALUE;
      return pA - pB; // ascending → best price first
    });
  }, [couponsList]);

  const OfferType = {
    COUPONS: "coupons",
    PROMOTION: "promotion",
  };
  const openMoreOffersSidebar = ({ offerType }) => {
    setSidebarActiveTab(offerType);
    setShowMoreOffers(true);
  };

  return (
    <>
      {(sortedCoupons?.length > 0 || promotionsList?.length > 0) && (
        <div className={styles.offersWrapper}>
          <div>
            <div className={styles.offersHeading}>
              <h5>{t("resource.product.best_offers_caps")}</h5>
              <button
                type="button"
                onClick={() =>
                  openMoreOffersSidebar({
                    offerType:
                      sortedCoupons?.length > 0
                        ? OfferType.COUPONS
                        : OfferType.PROMOTION,
                  })
                }
              >
                {t("resource.facets.view_all")}
              </button>
            </div>
            <div className={styles.offersDetails}>
              {sortedCoupons.length > 0 && (
                <OfferCard
                  priceLabel="Best price"
                  priceValue={sortedCoupons[0].rule?.[0]?.discounted_price}
                  codeLabel="Use Code"
                  codeValue={sortedCoupons[0].coupon_code}
                  title={sortedCoupons[0].offer_text}
                />
              )}
              {promotionsList.length > 0 && (
                <OfferCard
                  priceLabel="Get it for"
                  priceValue={
                    promotionsList[0].discount_rules?.[0]?.discounted_price
                  }
                  codeLabel="Use Code"
                  codeValue={promotionsList[0].offer_text}
                  title={promotionsList[0].offer_text}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Offers;
