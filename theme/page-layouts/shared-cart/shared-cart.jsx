import React from "react";
import SharedCartLib from "@gofynd/theme-template/pages/shared-cart/shared-cart";
import styles from "./shared-cart.less";
import "@gofynd/theme-template/pages/shared-cart/shared-cart.css";
import useSharedCart from "./useSharedCart";
import Loader from "../../components/loader/loader";
import EmptyState from "../../components/empty-state/empty-state";
import EmptyCartIcon from "../../assets/images/empty-cart.svg";

function SharedCart({ fpi }) {
  const sharedCartProps = useSharedCart(fpi);

  const { isLoading, bagItems } = sharedCartProps;

  if (isLoading) {
    return <Loader />;
  } else if (bagItems?.length === 0) {
    return (
      <EmptyState
        Icon={
          <div>
            <EmptyCartIcon />
          </div>
        }
        title="There are no items in cart"
      />
    );
  }

  return (
    <div className={styles.sharedCartPageWrapper}>
      <SharedCartLib {...sharedCartProps} />
    </div>
  );
}

export default SharedCart;
