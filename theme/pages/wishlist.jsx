import React from "react";
import useWishlist from "../page-layouts/wishlist/useWishlist";
import styles from "../styles/wishlist.less";
import { isLoggedIn } from "../helper/auth-guard";
import Wishlist from "fdk-react-templates/pages/wishlist/wishlist";
import "fdk-react-templates/pages/wishlist/wishlist.css";
import Shimmer from "../components/shimmer/shimmer";

function WishlistPage({ fpi }) {
  const { loading, ...wishlistProps } = useWishlist({ fpi });

  if (loading) {
    return <Shimmer />;
  }

  return (
    <div className="basePageContainer margin0auto">
      <div className={`${styles.wishlistWrap} ${styles.flexColumn}`}>
        <Wishlist {...wishlistProps} />
      </div>
    </div>
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
