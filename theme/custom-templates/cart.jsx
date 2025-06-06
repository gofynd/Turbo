import React from "react";
import { useGlobalTranslation } from "fdk-core/utils";

function Cart({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  return (
    <>
      <h1 style={{ color: "red" }}>
        {t("resource.cart.custom_page_description")}
      </h1>
      <hr />
    </>
  );
}

Cart.serverFetch = ({ router }) => { };

export default Cart;
