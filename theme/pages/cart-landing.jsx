import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalStore } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";

function CartPage({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);
  const navigate = useNavigate();

  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};

  useEffect(() => {
    if (globalConfig?.disable_cart) {
      navigate("/");
    }
  }, [globalConfig]);

  return (
    page?.value === "cart-landing" && (
      <SectionRenderer
        sections={sections}
        fpi={fpi}
        globalConfig={globalConfig}
      />
    )
  );
}

export const settings = JSON.stringify({
  props: [],
});

// CartPage.authGuard = isLoggedIn;
export const sections = JSON.stringify([
  {
    attributes: {
      page: "cart-landing",
    },
  },
]);

export default CartPage;
