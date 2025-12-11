import React, { useEffect } from "react";
import { useGlobalStore, useNavigate,useGlobalTranslation } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";
import { useThemeConfig } from "../helper/hooks";
import styles from "../styles/cart-landing.less";
import { getHelmet } from "../providers/global-provider";

function CartPage({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const navigate = useNavigate();
  const { t } = useGlobalTranslation("translation");
  
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};

  useEffect(() => {
    if (globalConfig?.disable_cart) {
      navigate("/");
    }
  }, [globalConfig]);

  return (
    page?.value === "cart-landing" && (
      <>
        {getHelmet({
          title: "Cart",
          description: t("resource.cart_landing.seo_description"),
          robots: "noindex, nofollow",
          ogType: "website",
        })}
        <div className={`${styles.cart} basePageContainer margin0auto`}>
          <SectionRenderer
            sections={sections.filter((section) => !section.canvas)}
            fpi={fpi}
            globalConfig={globalConfig}
          />
          <div className={styles.cartContainer}>
            <div className={styles.leftPanel}>
              <SectionRenderer
                sections={sections.filter(
                  (section) => section.canvas === "left_panel"
                )}
                fpi={fpi}
                globalConfig={globalConfig}
              />
            </div>
            <div className={styles.rightPanel} id="cart-landing-right-panel">
              <SectionRenderer
                sections={sections.filter(
                  (section) => section.canvas === "right_panel"
                )}
                fpi={fpi}
                globalConfig={globalConfig}
              />
            </div>
          </div>
        </div>
      </>
    )
  );
}

export const settings = JSON.stringify({
  props: [],
});

// CartPage.authGuard = isLoggedIn;
export const sections = JSON.stringify([
  {
    canvas: {
      value: "left_panel",
      label: "Left Panel",
    },
    attributes: {
      page: "cart-landing",
    },
  },
  {
    canvas: {
      value: "right_panel",
      label: "Right Panel",
    },
    attributes: {
      page: "cart-landing",
    },
  },
]);

export default CartPage;
