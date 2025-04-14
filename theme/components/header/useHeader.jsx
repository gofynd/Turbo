import { useLocation } from "react-router-dom";
import { useGlobalStore } from "fdk-core/utils";
import { useEffect, useState, useMemo } from "react";
import { isRunningOnClient } from "../../helper/utils";
import { useThemeConfig } from "../../helper/hooks";

const useHeader = (fpi) => {
  const FOLLOWED_IDS = useGlobalStore(fpi.getters.FOLLOWED_LIST);
  const wishlistIds = FOLLOWED_IDS?.items?.map((m) => m?.uid);
  const wishlistCount = FOLLOWED_IDS?.page?.item_total;
  const NAVIGATION = useGlobalStore(fpi.getters.NAVIGATION);
  const CART_ITEMS = useGlobalStore(fpi.getters.CART);
  const CONTACT_INFO = useGlobalStore(fpi.getters.CONTACT_INFO);
  const SUPPORT_INFO = useGlobalStore(fpi.getters.SUPPORT_INFORMATION);
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const loggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const BUY_NOW = useGlobalStore(fpi.getters.BUY_NOW_CART_ITEMS);
  const { globalConfig } = useThemeConfig({ fpi });
  const HeaderNavigation =
    NAVIGATION?.items?.find((item) =>
      item.orientation.landscape.includes("top")
    )?.navigation || [];
  const FooterNavigation =
    NAVIGATION?.items?.find((item) =>
      item.orientation.landscape.includes("bottom")
    )?.navigation || [];

  const [buyNowParam, setBuyNowParam] = useState(null);
  const location = useLocation();
  useEffect(() => {
    if (isRunningOnClient()) {
      const queryParams = new URLSearchParams(location.search);
      setBuyNowParam((prev) => {
        if (prev === queryParams.get("buy_now")) return prev;
        return queryParams.get("buy_now");
      });
    }
  }, []);

  const cartItemCount = useMemo(() => {
    const bNowCount = BUY_NOW?.cart?.user_cart_items_count || 0;
    if (bNowCount && buyNowParam) {
      return bNowCount;
    } else {
      return CART_ITEMS?.cart_items?.user_cart_items_count || 0;
    }
  }, [CART_ITEMS, BUY_NOW, buyNowParam]);

  return {
    HeaderNavigation: HeaderNavigation?.filter((f) => f?.active) || [],
    // HeaderNavigation: navigation_data?.navigation,
    FooterNavigation: FooterNavigation?.filter((f) => f?.active) || [],
    cartItemCount,
    globalConfig,
    appInfo: CONFIGURATION.application,
    contactInfo: CONTACT_INFO,
    supportInfo: SUPPORT_INFO,
    wishlistIds,
    wishlistCount,
    loggedIn,
  };
};

export default useHeader;
