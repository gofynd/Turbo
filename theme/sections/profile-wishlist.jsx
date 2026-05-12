import React, { useMemo } from "react";
import useWishlist from "../page-layouts/wishlist/useWishlist";
import Wishlist from "@gofynd/theme-template/pages/wishlist/wishlist";
import "@gofynd/theme-template/pages/wishlist/wishlist.css";
import WishlistShimmer from "../components/shimmer/wishlist-shimmer";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import { useGlobalTranslation, useFPI } from "fdk-core/utils";
import styles from "../styles/canvas-profile.less";

export function Component({ props, blocks, preset, globalConfig }) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");
  const { loading, ...wishlistProps } = useWishlist({ fpi, globalConfig });

  // Destructure props with defaults
  const { title = "My Wishlist" } = Object.fromEntries(
    Object.entries(props || {}).map(([key, obj]) => [key, obj?.value])
  );
  const { totalCount = 0, ...wishlistData } = wishlistProps;
  const count = Number(totalCount) || 0;
  let countLabel = "";
  if (count === 1) {
    countLabel = `${count} ${t("resource.common.item")}`;
  } else if (count > 1) {
    countLabel = `${count} ${t("resource.common.items")}`;
  }

  const breadcrumbItems = useMemo(
    () => [
      { label: t("resource.common.breadcrumb.home"), link: "/" },
      { label: t("resource.profile.profile"), link: "/profile/details" },
      { label: t("resource.common.breadcrumb.wishlist") },
    ],
    [t]
  );

  if (loading) {
    return (
      <div className={styles.canvasSection}>
        <div className={styles.breadcrumbWrapper}>
          <Breadcrumb breadcrumb={breadcrumbItems} />
        </div>
        <div className={styles.wishlistTitleContainer}>
          <h1 className={styles.title}>
            {title}
            {countLabel && (
              <span className={styles.titleCount}>{`(${countLabel})`}</span>
            )}
          </h1>
        </div>
        <WishlistShimmer />
      </div>
    );
  }

  return (
    <div className={styles.canvasSection}>
      <div className={styles.breadcrumbWrapper}>
        <Breadcrumb breadcrumb={breadcrumbItems} />
      </div>
      <div className={styles.wishlistTitleContainer}>
        <h1 className={styles.title}>
          {title}
          {countLabel && (
            <span className={styles.titleCount}>{`(${countLabel})`}</span>
          )}
        </h1>
      </div>
      <Wishlist showHeader={false} totalCount={totalCount} {...wishlistData} />
    </div>
  );
}

export const settings = {
  label: "Profile Wishlist",
  props: [
    {
      type: "text",
      id: "title",
      label: "Section Title",
      default: "My Wishlist",
    },
  ],
};

export default Component;
