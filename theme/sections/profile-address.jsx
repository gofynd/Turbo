import React, { useMemo } from "react";
import { useFPI, useGlobalTranslation } from "fdk-core/utils";
import { useLocation } from "react-router-dom";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import ProfileAddressPage from "../page-layouts/profile-address/profile-address-page";
import "../page-layouts/profile-address/profile-address-page.less";

export function Component({ props, blocks, preset, globalConfig }) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();

  // Destructure props with defaults (if needed for future customization)
  const { title = "My Addresses" } = Object.fromEntries(
    Object.entries(props || {}).map(([key, obj]) => [key, obj?.value])
  );

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const isEditMode = searchParams.has("edit");
  const hasAddressId = searchParams.get("address_id");
  const addressCrumbLabel = isEditMode
    ? hasAddressId
      ? t("resource.common.address.edit_address")
      : t("resource.common.address.add_new_address")
    : "My Addresses";

  const breadcrumbItems = useMemo(
    () => [
      { label: t("resource.common.breadcrumb.home"), link: "/" },
      { label: t("resource.profile.profile"), link: "/profile/details" },
      {
        label: "My Addresses",
        link: "/profile/address",
      },
      ...(isEditMode ? [{ label: addressCrumbLabel }] : []),
    ],
    [t, isEditMode, addressCrumbLabel]
  );

  return (
    <>
      <Breadcrumb breadcrumb={breadcrumbItems} />
      <ProfileAddressPage fpi={fpi} />
    </>
  );
}

export const settings = {
  label: "Profile Addresses",
  props: [
    {
      type: "text",
      id: "title",
      label: "Section Title",
      default: "My Addresses",
    },
  ],
};

export default Component;
