import React, { useState, useEffect, useRef } from "react";
import { useFPI } from "fdk-core/utils";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./mobile-navigation.less";
import { useThemeConfig } from "../../helper/hooks";
import useHeader from "../header/useHeader";
import HomeIcon from "../../assets/images/home-mobile-icon.svg";
import SearchIcon from "../../assets/images/search-mobile-icon.svg";
import CartIcon from "../../assets/images/single-row-cart-mobile-icon.svg";
import HeartIcon from "../../assets/images/wishlist-mobile-icon.svg";
import UserIcon from "../../assets/images/user-mobile-icon.svg";

const STICKY_BOTTOM_OFFSET_STYLES = `
  [data-mobile-footer="true"] [class*="stickyFooter"],
  [data-mobile-footer="true"] [class*="stickyBtnContainer"],
  [data-mobile-footer="true"] [class*="actionContainer"],
  [data-mobile-footer="true"] #sticky-add-to-cart,
  [data-mobile-footer="true"] [class*="mobileStickyButtonWrapper"],
  [data-mobile-footer="true"] [class*="stickyActionBar"],
  [data-mobile-footer="true"] [class*="modal"]:not([class*="modalContainer"]),
  [data-mobile-footer="true"] [data-order-status-modal="true"],
  [data-mobile-footer="true"] [data-order-filter-modal="true"],
  [data-mobile-footer="true"] [data-logout-modal="true"] {
    bottom: var(--mobile-nav-height, 56px) !important;
  }
  [data-mobile-footer="true"] [class*="modal"]:not([class*="modalContainer"]),
  [data-mobile-footer="true"] [data-order-status-modal="true"],
  [data-mobile-footer="true"] [data-logout-modal="true"] {

  }
  [data-mobile-footer="true"] [data-order-filter-modal="true"] {
    z-index: 1000 !important;
  }
  [data-mobile-footer="true"] [class*="stickyContainer"] {
    position: absolute !important;
    width: 100% !important;
    bottom: var(--mobile-nav-height, 56px) !important;
  }
  [data-mobile-footer="true"] [class*="deliveryAddressModal"] {
    align-self: flex-start !important;
  }
  [data-mobile-footer="true"] [class*="deliveryAddressModal"] [class*="deliveryAddressHeader"] {
    flex-shrink: 0 !important;
  }
  [data-mobile-footer="true"] [class*="addAddressModalContainer"],
  [data-mobile-footer="true"] [class*="addressModalContainer"] {
    max-height: calc(100dvh - var(--mobile-nav-height, 56px) - env(safe-area-inset-bottom, 0px)) !important;
    max-height: calc(100vh - var(--mobile-nav-height, 56px) - env(safe-area-inset-bottom, 0px)) !important;
  }
  
`;

const MOBILE_NAVIGATION_ICONS = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "search", label: "Search", Icon: SearchIcon },
  { id: "wishlist", label: "Wishlist", Icon: HeartIcon },
  { id: "cart", label: "Cart", Icon: CartIcon },
  { id: "account", label: "Account", Icon: UserIcon },
];

function MobileFooter({ fpi: fpiProp }) {
  const fpiFromContext = useFPI();
  const fpi = fpiProp ?? fpiFromContext;
  const { globalConfig } = useThemeConfig({ fpi });
  const { cartItemCount, wishlistCount, loggedIn } = useHeader(fpi);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const searchFocusTimer = useRef(null);
  // A permanent hidden input that's always part of the React tree (so iOS
  // has it laid out from the start). We focus this synchronously inside the
  // user gesture on Search tap to open the on-screen keyboard, then transfer
  // focus to the real search input once the overlay finishes animating in.
  const keyboardPrimerRef = useRef(null);

  const showMobileIcons = globalConfig?.show_mobile_icons ?? false;
  const isCartOrCheckout =
    pathname.startsWith("/cart/checkout") || pathname.startsWith("/payment/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(max-width: 767px)");
      setIsMobile(mq.matches);

      const handler = (e) => setIsMobile(e.matches);

      if (mq.addEventListener) {
        mq.addEventListener("change", handler);
      } else if (mq.addListener) {
        mq.addListener(handler);
      }

      return () => {
        if (mq.removeEventListener) {
          mq.removeEventListener("change", handler);
        } else if (mq.removeListener) {
          mq.removeListener(handler);
        }
      };
    }
  }, []);

  if (!isMobile || !showMobileIcons || isCartOrCheckout) {
    return null;
  }

  const getRouteForIcon = (id) => {
    switch (id) {
      case "home":
        return "/";
      case "cart":
        return "/cart/bag";
      case "wishlist":
        return "/wishlist";
      case "account":
        return "/profile/profile-tabs";
      default:
        return "/";
    }
  };

  // Cancel any pending focus-transfer from a previous search tap. Blur the
  // primer first so iOS doesn't carry a "pending focus" state into the next
  // user gesture (which would otherwise pop the keyboard at an unexpected
  // moment, e.g. when tapping Home immediately after Search).
  const cancelPendingSearchFocus = () => {
    if (!searchFocusTimer.current) return;
    clearTimeout(searchFocusTimer.current);
    searchFocusTimer.current = null;
    if (
      typeof document !== "undefined" &&
      keyboardPrimerRef.current &&
      document.activeElement === keyboardPrimerRef.current
    ) {
      keyboardPrimerRef.current.blur();
    }
  };

  // The Search component is rendered multiple times in the page (desktop
  // header + mobile header) and they all share id="searchInput", so plain
  // getElementById would return the FIRST match — usually the desktop one
  // hidden via display:none on mobile. Walk all matches and pick the one
  // that's actually rendered (offsetParent !== null is null only for
  // display:none ancestors, exactly the case for the hidden desktop copy).
  const findVisibleSearchInput = () => {
    if (typeof document === "undefined") return null;
    const candidates = document.querySelectorAll("#searchInput");
    for (let i = 0; i < candidates.length; i += 1) {
      if (candidates[i].offsetParent !== null) {
        return candidates[i];
      }
    }
    return candidates[0] || null;
  };

  const handleIconClick = (id) => {
    cancelPendingSearchFocus();

    if (id === "search") {
      // iOS Safari only opens the on-screen keyboard if focus() is called
      // synchronously inside a user gesture, on an element the browser
      // considers visible (opacity > 0, dimensions > 0, in layout, not
      // covered). The real search input sits inside a motion.div that's at
      // opacity:0 / scaleY:0 when closed, so focusing it directly is
      // silently ignored.
      //
      // Strategy: focus a tiny pre-rendered "keyboard primer" input that's
      // always part of the React tree (so iOS already has it laid out). We
      // force a reflow before focus to make absolutely sure iOS has its
      // bounding rect. Then trigger the overlay open. After the animation,
      // we transfer focus to the real (visible) search input — iOS keeps
      // the keyboard open across that input-to-input transfer.
      const primer = keyboardPrimerRef.current;
      if (primer) {
        // Force layout/reflow so iOS has registered the primer's bounds
        // before we call focus() inside the gesture. Without this, focus
        // can be silently dropped on some iOS versions.
        // eslint-disable-next-line no-unused-expressions
        primer.offsetHeight;
        primer.focus();
      }

      if (fpi?.custom?.setValue) {
        fpi.custom.setValue("openHeaderSearch", Date.now());
      }

      // Transfer focus to the real input after the overlay animates open.
      // 350ms is a small buffer over the 300ms motion.div animation so the
      // input is fully rendered (opacity:1, scaleY:1) when we focus it.
      const timerId = setTimeout(() => {
        const realInput = findVisibleSearchInput();
        if (realInput) {
          realInput.focus();
          // Place caret at end of any existing value
          if (typeof realInput.setSelectionRange === "function") {
            const len = (realInput.value || "").length;
            try {
              realInput.setSelectionRange(len, len);
            } catch (_) {
              // Some input types throw on setSelectionRange — safe to ignore
            }
          }
        }
        searchFocusTimer.current = null;
      }, 350);
      searchFocusTimer.current = timerId;
      return;
    }

    // For non-search icons, drop focus from any input that may have been left
    // focused (e.g. the keyboard primer or the real search input). On iOS, a
    // focused input combined with a fresh user gesture can pop the keyboard
    // unexpectedly.
    if (
      typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement &&
      (document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA")
    ) {
      document.activeElement.blur();
    }

    const to = getRouteForIcon(id);
    if (to) navigate(to);
  };

  return (
    <>
      <style>{STICKY_BOTTOM_OFFSET_STYLES}</style>
      {/* Permanent off-screen keyboard primer — focused synchronously inside
          a user gesture to wake up the iOS Safari on-screen keyboard before
          the real search input becomes visible. Pre-rendering it (instead of
          createElement-on-tap) ensures iOS has its layout box registered. */}
      <input
        ref={keyboardPrimerRef}
        type="text"
        inputMode="search"
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        style={{
          position: "fixed",
          top: "50%",
          left: 0,
          width: "1px",
          height: "1px",
          opacity: 0.01,
          fontSize: "16px", // prevents iOS auto-zoom on focus
          border: "none",
          outline: "none",
          padding: 0,
          margin: 0,
          zIndex: 2147483647,
        }}
      />
      <div className={styles.mobileFooter}>
        {MOBILE_NAVIGATION_ICONS.map(({ id, label, Icon }) => {
          const showCartCount = id === "cart" && cartItemCount > 0;
          const showWishlistCount =
            id === "wishlist" && wishlistCount > 0 && loggedIn;
          const showCount = showCartCount || showWishlistCount;
          const count =
            id === "cart"
              ? cartItemCount
              : id === "wishlist"
                ? wishlistCount
                : 0;

          return (
            <div
              key={id}
              className={styles.mobileFooter__icon}
              aria-label={`${label}${showCount ? ` (${count} items)` : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => handleIconClick(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleIconClick(id);
                }
              }}
            >
              <span className={styles.mobileFooter__iconWrapper}>
                <Icon />
                {showCount && (
                  <span className={styles.mobileFooter__count}>{count}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default MobileFooter;
