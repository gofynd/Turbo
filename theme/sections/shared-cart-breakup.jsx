import React from "react";
import SharedCartBreakupContainer from "@gofynd/theme-template/pages/shared-cart/shared-cart-breakup";
import useSharedCart from "../page-layouts/shared-cart/useSharedCart";
import { useFPI } from "fdk-core/utils";
import "@gofynd/theme-template/pages/shared-cart/shared-cart-breakup.css";

function Component() {
  const fpi = useFPI();
  const sharedCartProps = useSharedCart(fpi);
  const {
    sharedCartData,
    couponProps,
    bagItems,
    showReplaceBtn,
    onMergeBagClick,
    onAddToBagClick,
    onReplaceBagClick,
  } = sharedCartProps;
  return (
    <SharedCartBreakupContainer
      sharedCartData={sharedCartData}
      couponProps={couponProps}
      bagItems={bagItems}
      showReplaceBtn={showReplaceBtn}
      onMergeBagClick={onMergeBagClick}
      onAddToBagClick={onAddToBagClick}
      onReplaceBagClick={onReplaceBagClick}
    />
  );
}

export const settings = {
  label: "Shared Cart Breakup",
  props: [],
};

export default Component;
