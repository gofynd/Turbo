import React from "react";
import { useGlobalStore } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";

import { useThemeConfig } from "../helper/hooks";
import styles from "../styles/single-page-checkout.less";

function SingleCheckoutPage({ fpi }) {
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};

  return (
    <>
      {page?.value === "single-page-checkout" && (
        <div className={`basePageContainer margin0auto fontBody`}>
          <div className={styles.checkoutContainer}>
            <div className={styles.leftPanel}>
              <SectionRenderer
                sections={sections.filter(
                  (section) => section.canvas === "left_panel"
                )}
                fpi={fpi}
                globalConfig={globalConfig}
              />
            </div>
            <div className={styles.rightPanel}>
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
      )}
    </>
  );
}

export const sections = JSON.stringify([
  {
    canvas: {
      value: "left_panel",
      label: "Left Panel",
    },
    attributes: {
      page: "single-page-checkout",
    },
  },
  {
    canvas: {
      value: "right_panel",
      label: "Right Panel",
    },
    attributes: {
      page: "single-page-checkout",
    },
  },
]);

export default SingleCheckoutPage;
