import React, { useMemo } from "react";
import { useFPI } from "fdk-core/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import ProfileDetailsPage from "../page-layouts/profile/profile-details-page";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import styles from "../styles/canvas-profile.less";

export function Component({ props, blocks, preset, globalConfig }) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");

  // Destructure props with defaults
  const { title = "Profile Details" } = Object.fromEntries(
    Object.entries(props || {}).map(([key, obj]) => [key, obj?.value])
  );

  const breadcrumbItems = useMemo(
    () => [
      { label: t("resource.common.breadcrumb.home"), link: "/" },
      { label: t("resource.profile.profile"), link: "/profile/details" },
    ],
    [t]
  );

  return (
    <div className={styles.canvasSection}>
      <Breadcrumb breadcrumb={breadcrumbItems} />
      <ProfileDetailsPage fpi={fpi} />
    </div>
  );
}

export const settings = {
  label: "Profile Details Form",
  props: [
    {
      type: "text",
      id: "title",
      label: "Section Title",
      default: "Profile Details",
    },
  ],
};

export default Component;
