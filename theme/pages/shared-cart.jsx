import React from "react";
import SharedCart from "../page-layouts/shared-cart/shared-cart";

function SharedCartPage({ fpi }) {
  return <SharedCart fpi={fpi} />;
}

SharedCartPage.serverFetch = () => {};

export const sections = JSON.stringify([]);

export default SharedCartPage;
