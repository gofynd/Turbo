import React, { useEffect } from "react";
import { useGlobalStore, useNavigate } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";
import { useThemeConfig } from "../helper/hooks";

function CartPage({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const navigate = useNavigate();
  const { globalConfig } = useThemeConfig({ fpi });
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
