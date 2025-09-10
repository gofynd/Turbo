import React from "react";
import useWishlist from "../page-layouts/wishlist/useWishlist";
import styles from "../styles/wishlist.less";
import { isLoggedIn } from "../helper/auth-guard";
import Wishlist from "@gofynd/theme-template/pages/wishlist/wishlist";
import "@gofynd/theme-template/pages/wishlist/wishlist.css";
import WishlistShimmer from "../components/shimmer/wishlist-shimmer";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { getHelmet } from "../providers/global-provider";
import { sanitizeHTMLTag } from "../helper/utils";

function WishlistPage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);
  const { loading, ...wishlistProps } = useWishlist({ fpi });

  const seoData = page?.seo || {};
  const title = sanitizeHTMLTag(
    seoData?.title || t("resource.common.page_titles.wishlist")
  );
  const description = sanitizeHTMLTag(
    seoData?.description || t("resource.wishlist.seo_description")
  );

  const mergedSeo = { ...seoData, title, description };

  if (loading) {
    return <WishlistShimmer />;
  }

  return (
    <>
      {getHelmet({ seo: mergedSeo })}
      <div className="basePageContainer margin0auto">
        <div className={`${styles.wishlistWrap} ${styles.flexColumn}`}>
          <Wishlist {...wishlistProps} />
        </div>
      </div>
    </>
  );
}

WishlistPage.authGuard = isLoggedIn;

export const settings = JSON.stringify({
  props: [
    {
      type: "checkbox",
      id: "show_add_to_cart",
      label: "t:resource.pages.wishlist.show_add_to_cart",
      info: "t:resource.common.not_applicable_international_websites",
      default: true,
    },
    {
      type: "text",
      id: "card_cta_text",
      label: "t:resource.common.button_text",
      default:
        "t:resource.settings_schema.cart_and_button_configuration.add_to_cart",
    },
    {
      type: "checkbox",
      id: "mandatory_pincode",
      label: "t:resource.common.mandatory_delivery_check",
      info: "t:resource.pages.wishlist.mandatory_delivery_check_info",
      default: false,
    },
    {
      type: "checkbox",
      id: "hide_single_size",
      label: "t:resource.common.hide_single_size",
      info: "t:resource.pages.wishlist.hide_single_size_info",
      default: false,
    },
    {
      type: "checkbox",
      id: "preselect_size",
      label: "t:resource.common.preselect_size",
      info: "t:resource.pages.wishlist.preselect_size_info",
      default: false,
    },
  ],
});

export const sections = JSON.stringify([]);

export default WishlistPage;
