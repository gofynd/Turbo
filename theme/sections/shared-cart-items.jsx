import React from "react";
import ChipReviewItem from "@gofynd/theme-template/components/chip-review-item/chip-review-item";
import FreeGiftItem from "@gofynd/theme-template/page-layouts/cart/Components/free-gift-item/free-gift-item";
import useSharedCart from "../page-layouts/shared-cart/useSharedCart";
import { useFPI } from "fdk-core/utils";
import "@gofynd/theme-template/components/chip-review-item/chip-review-item.css";
import "@gofynd/theme-template/page-layouts/cart/Components/free-gift-item/free-gift-item.css";
import "@gofynd/theme-template/pages/shared-cart/shared-cart-items.css";
import styles from "../styles/sections/shared-cart-items.less";

function Component() {
  const fpi = useFPI();
  const { bagItems } = useSharedCart(fpi);

  const hasFreeGift = (item) =>
    Array.isArray(item?.promotions_applied) &&
    item.promotions_applied.some(
      (promo) =>
        promo?.promotion_type === "free_gift_items" &&
        promo?.applied_free_articles?.length > 0
    );

  return (
    <div>
      {bagItems?.map((bagItem, index) => (
        <div key={index} className={styles.bagItemWrapper}>
          <ChipReviewItem item={bagItem.item} articles={bagItem.articles} />
          {hasFreeGift(bagItem.item) && (
            <div className={styles.freeGiftAligned}>
              <FreeGiftItem
                item={bagItem.item}
                currencySymbol={
                  bagItem?.item?.price?.converted?.currency_symbol ?? "₹"
                }
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export const settings = {
  label: "Shared Cart Items",
  props: [],
};

export default Component;
