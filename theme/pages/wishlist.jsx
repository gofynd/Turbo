import React from "react";
import useWishlist from "../page-layouts/wishlist/useWishlist";
import styles from "../styles/wishlist.less";
import { isLoggedIn } from "../helper/auth-guard";
import Wishlist from "@gofynd/theme-template/pages/wishlist/wishlist";
import "@gofynd/theme-template/pages/wishlist/wishlist.css";
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
      label: "Show Add to Cart button",
      info: "Not Applicable for International Websites",
      default: true,
    },
    {
      type: "checkbox",
      id: "mandatory_pincode",
      label: "Mandatory Delivery check",
      info: "Mandatory delivery check in Add to Cart popup. Not applicable for international websites",
      default: false,
    },
    {
      type: "checkbox",
      id: "hide_single_size",
      label: "Hide single size",
      info: "Hide single size in Add to Cart popup. Not applicable for international websites",
      default: false,
    },
    {
      type: "checkbox",
      id: "preselect_size",
      label: "Preselect size",
      info: "Preselect size in Add to Cart popup. Applicable only for multi-sized products. Not applicable for international websites",
      default: false,
    },
  ],
});

export const sections = JSON.stringify([]);

export default WishlistPage;
