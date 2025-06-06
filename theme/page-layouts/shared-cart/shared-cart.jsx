import React from "react";
import styles from "./shared-cart.less";
import SharedCartLib from "@gofynd/theme-template/pages/shared-cart/shared-cart";
import "@gofynd/theme-template/pages/shared-cart/shared-cart.css";
import useSharedCart from "./useSharedCart";
import Loader from "../../components/loader/loader";
import EmptyState from "../../components/empty-state/empty-state";
import EmptyCartIcon from "../../assets/images/empty-cart.svg";
import { useGlobalTranslation } from "fdk-core/utils";

function SharedCart({ fpi }) {
  const { t } = useGlobalTranslation("translation");
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
        title={t("resource.cart.no_items")}
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
