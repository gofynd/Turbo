import React from "react";
import { SectionRenderer } from "fdk-core/components";
import CartNew from "@gofynd/theme-template/pages/cart/cart";
import styles from "./cart.less";
import "@gofynd/theme-template/pages/cart/cart.css";
import Loader from "../../components/loader/loader";
import EmptyState from "../../components/empty-state/empty-state";
import useCart from "./useCart";
import useCartDeliveryLocation from "./useCartDeliveryLocation";
import useCartShare from "./useCartShare";
import useCartComment from "./useCartComment";
import useCartGst from "./useCartGst";
import useCartCoupon from "./useCartCoupon";

function Cart({ fpi, globalConfig, sections }) {
  const { isLoading, cartData, currencySymbol, ...restProps } = useCart(fpi);

  const cartDeliveryLocation = useCartDeliveryLocation({ fpi });
  const cartShare = useCartShare({ fpi, cartData });
  const cartComment = useCartComment({ fpi, cartData });
  const cartGst = useCartGst({ fpi, cartData });
  const cartCoupon = useCartCoupon({ fpi, cartData });

  if (isLoading) {
    return <Loader />;
  } else if (cartData?.items?.length === 0) {
    return <EmptyState title="Your Shopping Bag is empty" />;
  }

  return (
    <div className={`${styles.cart} basePageContainer margin0auto`}>
      <CartNew
        {...restProps}
        cartData={cartData}
        currencySymbol={currencySymbol}
        deliveryLocationProps={cartDeliveryLocation}
        cartCouponProps={{
          ...cartCoupon,
          currencySymbol,
        }}
        cartGstProps={{ ...cartGst, currencySymbol }}
        cartCommentProps={cartComment}
        cartShareProps={cartShare}
      />
      <SectionRenderer
        sections={sections}
        fpi={fpi}
        globalConfig={globalConfig}
      />
    </div>
  );
}

export default Cart;
