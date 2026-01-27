import React, { useMemo } from "react";
import styles from "./shared-cart.less";
import useSharedCart from "./useSharedCart";
import Loader from "../../components/loader/loader";
import EmptyState from "../../components/empty-state/empty-state";
import EmptyCartIcon from "../../assets/images/empty-cart.svg";
import { useGlobalTranslation } from "fdk-core/utils";
import { SectionRenderer } from "fdk-core/components";
import { useThemeConfig } from "../../helper/hooks";
import { useGlobalStore } from "fdk-core/utils";
function SharedCart({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const sharedCartProps = useSharedCart(fpi);
  const { isLoading, bagItems, sharedCartData } = sharedCartProps;
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { globalConfig } = useThemeConfig({ fpi });
  const { sections = [] } = page || {};
  const getPieces = useMemo(() => {
    return (
      sharedCartData?.items?.reduce(
        (total, item) => total + item.quantity,
        0
      ) || 0
    );
  }, [sharedCartData]);
  // Only render sections if the page value matches this component's expected page
  if (page?.value !== "shared-cart") {
    return <Loader />;
  }

  const leftSections = sections.filter(
    (section) =>
      section.canvas === "left_panel" || section.canvas?.value === "left_panel"
  );
  const rightSections = sections.filter(
    (section) =>
      section.canvas === "right_panel" ||
      section.canvas?.value === "right_panel"
  );
  console.log(leftSections, rightSections);

  const itemCountLabel = useMemo(() => {
    let itmStrng =
      bagItems.length > 1
        ? t("resource.common.item_simple_text_plural")
        : t("resource.common.item_simple_text");
    return `(${bagItems.length} ${itmStrng} | ${getPieces} ${t("resource.common.qty")})`;
  }, [bagItems, getPieces, t]);

  // Show loader until:
  // 1. Data is still loading, OR
  // 2. Data loaded but sections not ready, OR
  // 3. Data loaded but sharedCartData.items not populated yet
  const sectionsReady = leftSections.length > 0 || rightSections.length > 0;
  const hasCartItems = sharedCartData?.items && sharedCartData.items.length > 0;
  const shouldShowLoader =
    isLoading ||
    (!isLoading && !hasCartItems) ||
    (!isLoading && hasCartItems && !sectionsReady);

  if (shouldShowLoader) {
    return <Loader />;
  } else if (bagItems?.length === 0 || !hasCartItems) {
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
      <div className={styles.cardContainer}>
        <div className={styles.sharedCartContainer}>
          <div className={styles.title}>
            {t("resource.cart.shared_bag")}
            <span className={styles.subTitle}>{itemCountLabel}</span>
          </div>
          <div className={styles.sharedCart}>
            <div className={styles.itemsContainer}>
              <SectionRenderer
                sections={leftSections}
                fpi={fpi}
                globalConfig={globalConfig}
              />
            </div>
            <div className={styles.breakUpContainer}>
              <SectionRenderer
                sections={rightSections}
                fpi={fpi}
                globalConfig={globalConfig}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SharedCart;
