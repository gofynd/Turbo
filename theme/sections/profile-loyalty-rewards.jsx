import React, { useMemo } from "react";
import { useGlobalTranslation } from "fdk-core/utils";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import styles from "../styles/canvas-profile.less";

export function Component({ props, globalConfig }) {
  const { t } = useGlobalTranslation("translation");

  const { title = "My Loyalty Points" } = Object.fromEntries(
    Object.entries(props || {}).map(([key, obj]) => [key, obj?.value])
  );
  const loyaltyPointsLabel =
    globalConfig?.loyalty_points_label || "My Loyalty Points";
  const loyaltyNotConfiguredMessage = `${loyaltyPointsLabel} is not configured.`;
  const breadcrumbItems = useMemo(
    () => [
      { label: t("resource.common.breadcrumb.home"), link: "/" },
      { label: t("resource.profile.profile"), link: "/profile/details" },
      { label: title },
    ],
    [t, title]
  );

  return (
    <div className={styles.canvasSection}>
      <div className={styles.breadcrumbWrapper}>
        <Breadcrumb breadcrumb={breadcrumbItems} />
      </div>
      <h1 className={styles.sectionTitle}>{title}</h1>
      <div
        className={`${styles.emptyProfileState} loyalty-rewards-empty-state`}
      >
        {loyaltyNotConfiguredMessage}
      </div>
    </div>
  );
}

export const settings = {
  label: "Profile Loyalty Rewards",
  props: [
    {
      type: "text",
      id: "title",
      label: "Section Title",
      default: "My Loyalty Rewards",
    },
  ],
};

export default Component;
