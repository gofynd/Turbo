import React from "react";
import SharedCart from "../page-layouts/shared-cart/shared-cart";

function SharedCartPage({ fpi }) {
  return <SharedCart fpi={fpi} />;
}

SharedCartPage.serverFetch = () => {};

export const sections = JSON.stringify([
  {
    canvas: {
      value: "left_panel",
      label: "Left Panel",
    },
    attributes: {
      page: "shared-cart",
    },
    blocks: [
      {
        type: "shared-cart-items",
        name: "Shared Cart Items",
        props: [],
      },
    ],
  },
  {
    canvas: {
      value: "right_panel",
      label: "Right Panel",
    },
    attributes: {
      page: "shared-cart",
    },
    blocks: [
      {
        type: "shared-cart-breakup",
        name: "Shared Cart Breakup",
        props: [],
      },
    ],
  },
]);

export default SharedCartPage;
