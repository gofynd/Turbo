import React from "react";
import SharedCartItems from "@gofynd/theme-template/pages/shared-cart/shared-cart-items";
import useSharedCart from "../page-layouts/shared-cart/useSharedCart";
import { useFPI } from "fdk-core/utils";
import "@gofynd/theme-template/pages/shared-cart/shared-cart-items.css";
function Component() {
  const fpi = useFPI();
  const { bagItems } = useSharedCart(fpi);
  return (
    <div>
      <SharedCartItems bagItems={bagItems} />
    </div>
  );
}

export const settings = {
  label: "Shared Cart Items",
  props: [],
};

export default Component;
