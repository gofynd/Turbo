import React, { useState, useEffect, Suspense, useMemo } from "react";
import PropTypes from "prop-types";
import styles from "./more-offers.less";
import { HTMLContent } from "../../../marketing/HTMLContent";
import Modal from "@gofynd/theme-template/components/core/modal/modal";
import "@gofynd/theme-template/components/core/modal/modal.css";
import { useGlobalTranslation } from "fdk-core/utils";

function MoreOffers({
  isOpen,
  couponsList,
  promotionsList,
  sidebarActiveTab,
  onCloseDialog,
}) {
  const { t } = useGlobalTranslation("translation");
  const [activeTab, setActiveTab] = useState("coupons");

  useEffect(() => {
    if (isOpen) {
      if (sidebarActiveTab === "coupons" && couponsList.length > 0) {
        setActiveTab("coupons");
      } else if (
        sidebarActiveTab === "promotions" &&
        promotionsList.length > 0
      ) {
        setActiveTab("promotions");
      } else {
        setActiveTab(couponsList.length > 0 ? "coupons" : "promotions");
      }
    }
  }, [isOpen, sidebarActiveTab, couponsList, promotionsList]);

  const closeDialog = () => {
    onCloseDialog();
  };

  const getListingItems = () => {
    if (activeTab === "coupons") {
      const sortedCoupons = [...couponsList].sort((a, b) => {
        const pA = a.rule?.[0]?.discounted_price ?? Number.MAX_VALUE;
        const pB = b.rule?.[0]?.discounted_price ?? Number.MAX_VALUE;
        return pA - pB; // ascending
      });
      return sortedCoupons.map((coupon) => ({
        ...coupon,
        title: coupon.coupon_code || "",
        subtitle: coupon.title || "",
        bodyText: coupon.description || "",
        discounted_price: coupon.rule?.[0]?.discounted_price,
      }));
    } else {
      return promotionsList.map((promo) => ({
        ...promo,
        title: promo.promotion_name || "",
        subtitle: promo.offer_text || "",
        bodyText: promo.description || "",
        discounted_price: promo.discount_rules?.[0]?.discounted_price,
      }));
    }
  };
  const getItemPrice = useMemo(
    () =>
      ({ discounted_price, discount_rules }) => {
        console.log({ discounted_price, discount_rules });
        const price =
          activeTab === "coupons"
            ? discounted_price
            : discount_rules?.[0]?.discounted_price;

        return price !== null && price !== undefined ? (
          <span>&#8377; {price}</span>
        ) : null;
      },
    [activeTab]
  );
  const priceLabel = useMemo(
    () => (activeTab === "coupons" ? "Best Price:" : "Get it For: "),
    [activeTab]
  );

  return (
    <Suspense>
      <Modal
        modalType="right-modal"
        isOpen={isOpen}
        title={t("resource.product.best_offers")}
        closeDialog={() => closeDialog(false)}
        headerClassName={styles.sidebarHeader}
        bodyClassName={styles.moreOffersContainer}
      >
        <div className={styles.sizeTabs}>
          {couponsList.length > 0 && (
            <button
              type="button"
              className={`b2 ${styles.tab} ${activeTab === "coupons" ? styles.active : ""}`}
              onClick={() => setActiveTab("coupons")}
            >
              {t("resource.product.coupons")}
            </button>
          )}
          {promotionsList.length > 0 && (
            <button
              type="button"
              className={`b2 ${styles.tab} ${activeTab === "promotions" ? styles.active : ""}`}
              onClick={() => setActiveTab("promotions")}
            >
              {t("resource.product.promotions")}
            </button>
          )}
        </div>

        <div className={styles.sidebarBody}>
          <div
            className={`${styles.sidebarBodyWrapper} ${!getListingItems().length ? styles.flexCenter : ""}`}
          >
            {getListingItems().length > 0 ? (
              getListingItems().map((item, index) => (
                <div className={styles.offerCard} key={index}>
                  {(!!item.title || !!item.subtitle) && (
                    <div className={styles.offerCardHead}>
                      {item.title && (
                        <h4 className={styles.offerCardCode}>
                          {priceLabel}
                          <span className={styles.price}>
                            {getItemPrice(item)}
                          </span>
                        </h4>
                      )}

                      {item.title && (
                        <div className={` ${styles.offerCardTitle}`}>
                          <p>Use Code: </p>
                          <span className={styles.couponCode}>
                            {item.title}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {item.offer_text && (
                    <HTMLContent
                      content={item.offer_text}
                      className={`${styles.offerCardDescription}`}
                    />
                  )}
                </div>
              ))
            ) : (
              <h3 className={styles.fontHeader}>
                {t("resource.product.no_items_available", {
                  activeTab: "products",
                })}
              </h3>
            )}
          </div>
        </div>
      </Modal>
    </Suspense>
  );
}

MoreOffers.propTypes = {
  isOpen: PropTypes.bool,
  couponsList: PropTypes.arrayOf(
    PropTypes.shape({
      coupon_code: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ),
  promotionsList: PropTypes.arrayOf(
    PropTypes.shape({
      promotion_name: PropTypes.string.isRequired,
      offer_text: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ),
  sidebarActiveTab: PropTypes.string,
  onCloseDialog: PropTypes.func,
};

export default MoreOffers;
