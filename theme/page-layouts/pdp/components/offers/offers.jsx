import React from "react";
import styles from "./offers.less";
import { useGlobalTranslation } from "fdk-core/utils";

function Offers({
  couponsList,
  promotionsList,
  setShowMoreOffers,
  setSidebarActiveTab,
}) {
  const { t } = useGlobalTranslation("translation");
  //   useEffect(() => {
  //     const fetchCoupons = async () => {
  //       try {
  //         const response = await apiSDK.cart.getCoupons({});
  //         setCouponsList(response?.available_coupon_list || []);
  //       } catch (ex) {
  //         console.error('Error while fetching coupons:', ex);
  //       }
  //     };

  //     const fetchPromotions = async () => {
  //       try {
  //         const response = await apiSDK.cart.getPromotionOffers({
  //           slug: context.product.slug,
  //         });
  //         setPromotionsList(response?.available_promotions || []);
  //       } catch (ex) {
  //         console.error('Error while fetching promotions:', ex);
  //       }
  //     };

  //     fetchCoupons();
  //     fetchPromotions();
  //   }, [apiSDK.cart, context.product.slug]);

  const openMoreOffersSidebar = (offerType) => {
    setSidebarActiveTab(offerType);
    setShowMoreOffers(true);
  };

  return (
    <>
      {(couponsList?.length > 0 || promotionsList?.length > 0) && (
        <div className={styles.offersWrapper}>
          <div>
            <div className={styles.offersHeading}>
              <h5>{t("resource.product.best_offers_caps")}</h5>
            </div>
            <div className={styles.offersDetails}>
              {couponsList.length > 0 && (
                <div className={styles.offersDetailsBlock}>
                  {couponsList[0].coupon_code && (
                    <div
                      className={`${styles.sh4} ${styles.offersDetailsBlockCode}`}
                    >
                      {couponsList[0].coupon_code}
                    </div>
                  )}
                  {couponsList[0].title && (
                    <div
                      className={`${styles.b4} ${styles.offersDetailsBlockTitle}`}
                    >
                      {couponsList[0].title}
                    </div>
                  )}
                  <button
                    type="button"
                    className={`${styles.b5} ${styles.offersDetailsBlockViewAll}`}
                    onClick={() => openMoreOffersSidebar("coupons")}
                  >
                    {t("resource.facets.view_all")}
                  </button>
                </div>
              )}

              {promotionsList.length > 0 && (
                <div className={`${styles.offersDetailsBlock} ${styles.mt16}`}>
                  {promotionsList[0].promotion_name && (
                    <div
                      className={`${styles.sh4} ${styles.offersDetailsBlockCode}`}
                    >
                      {promotionsList[0].promotion_name}
                    </div>
                  )}
                  {promotionsList[0].offer_text && (
                    <div
                      className={`${styles.b4} ${styles.offersDetailsBlockTitle}`}
                    >
                      {promotionsList[0].offer_text}
                    </div>
                  )}
                  <button
                    type="button"
                    className={`${styles.b5} ${styles.offersDetailsBlockViewAll}`}
                    onClick={() => openMoreOffersSidebar("promotions")}
                  >
                    {t("resource.facets.view_all")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Offers;
