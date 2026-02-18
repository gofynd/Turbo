import { useLocation, useSearchParams } from "react-router-dom";
import React, { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { FDKLink } from "fdk-core/components";
import {
  useGlobalStore,
  useNavigate,
  useLocale,
  useGlobalTranslation,
} from "fdk-core/utils";
import { CART_COUNT } from "../../queries/headerQuery";
import {
  isRunningOnClient,
  isEmptyOrNull,
  isLocalePresent,
  getDefaultLocale,
} from "../../helper/utils";
import Search from "./search";
import HeaderDesktop from "./desktop-header";
import Navigation from "./navigation";
import useHeader from "./useHeader";
import styles from "./styles/header.less";
import fallbackLogo from "../../assets/images/logo-header.png";
import { useAccounts } from "../../helper/hooks";
import useHyperlocal from "./location-modal/useHyperlocal";
import CartIcon from "../../assets/images/single-row-cart.svg";
import AngleDownIcon from "../../assets/images/header-angle-down.svg";
import BackArrow from "../../assets/images/back.svg";
import { LANGUAGES } from "../../queries/languageQuery";
import I18Dropdown from "./i18n-dropdown";
import Shimmer from "../shimmer/shimmer";
import TruckIcon from "../../assets/images/truck.svg";

const LocationModal = React.lazy(
  () => import("./location-modal/location-modal")
);

function Header({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const CART_ITEMS = useGlobalStore(fpi?.getters?.CART);
  const { headerHeight = 0, currentStep = null } = useGlobalStore(
    fpi.getters.CUSTOM_VALUE
  );

  const {
    globalConfig,
    cartItemCount,
    appInfo,
    HeaderNavigation = [],
    wishlistCount,
    loggedIn,
  } = useHeader(fpi);

  // Destructure values used from globalConfig (with safe defaults)
  const {
    sticky_header = true,
    transparent_header = false,
    header_border = false,
    header_layout = "layout_1",
    logo_menu_alignment = "layout_1",
    show_secondary_header_on_checkout = false,
    mobile_logo_max_height_header = 38,
    disable_cart = false,
    button_options = "all",
    show_quantity_control = false,
  } = globalConfig || {};

  const { openLogin } = useAccounts({ fpi });
  const shouldHide = location.pathname.startsWith("/payment/link/");
  const hideNavList =
    location.pathname.startsWith("/cart/") && show_secondary_header_on_checkout;
  const { activeLocale } = useLocale();
  const i18N_DETAILS = useGlobalStore(fpi.getters.i18N_DETAILS);
  const { supportedLanguages } = useGlobalStore(fpi.getters.CUSTOM_VALUE) || {};

  const [languageIscCode, setLanguageIscCode] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const isHeaderHiddenForShipmentReattempt =
    /^\/reattempt\/shipment\/[^/]+$/.test(location.pathname);
  const buyNow = searchParams?.get("buy_now") || false;

  const isListingPage = useMemo(() => {
    const regex = /^\/(products\/?|collection\/.+)$/;
    return regex.test(location?.pathname);
  }, [location?.pathname]);

  const isHeaderHidden = useMemo(() => {
    const refundRegex = /^\/refund\/order\/([^/]+)\/shipment\/([^/]+)$/;
    const reattemptShipmentRegex = /^\/reattempt\/shipment\/[^/]+$/;

    return (
      refundRegex.test(location?.pathname) ||
      reattemptShipmentRegex.test(location?.pathname)
    );
  }, [location?.pathname]);

  const sections = useGlobalStore(fpi.getters.PAGE)?.sections || [];
  const isValidSection =
    sections[0]?.name === "application-banner" ||
    sections[0]?.name === "image-slideshow" ||
    sections[0]?.name === "hero-image" ||
    sections[0]?.name === "image-gallery" ||
    sections[0]?.name === "hero-video";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);

    if (sticky_header && transparent_header && isValidSection) {
      window.addEventListener("scroll", handleScroll);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent_header, sticky_header, isValidSection]);

  useEffect(() => {
    if (supportedLanguages?.items?.length > 0) {
      setLanguageIscCode(supportedLanguages?.items);
    } else {
      setLanguageIscCode([]);
    }

    const i18n = i18N_DETAILS;
    if (!i18n?.language?.locale) {
      fpi.setI18nDetails({
        ...i18n,
        language: {
          ...i18n.language,
          locale: "en",
        },
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const LOCALE_SYNC_FLAG = "localeSyncedTo";

  useEffect(() => {
    if (!isRunningOnClient()) return;
    if (!supportedLanguages?.items?.length || !i18N_DETAILS) return;

    const currentLocale = i18N_DETAILS.language?.locale;
    const validLocale = isLocalePresent(activeLocale, supportedLanguages.items)
      ? activeLocale
      : getDefaultLocale(supportedLanguages.items);

    if (!validLocale || currentLocale === validLocale) return;

    const alreadySyncedTo = sessionStorage.getItem(LOCALE_SYNC_FLAG);
    if (alreadySyncedTo === validLocale) return;

    fpi.setI18nDetails({
      ...i18N_DETAILS,
      language: {
        ...i18N_DETAILS.language,
        locale: validLocale,
      },
    });

    sessionStorage.setItem(LOCALE_SYNC_FLAG, validLocale);

    // If your app truly needs a full refresh to pick up the new i18n wiring, reload once.
    window.location.replace(window.location.href);
  }, [activeLocale]); // <-- only when the selected locale changes

  useEffect(() => {
    // Prevent race condition: Only call CART_COUNT if cart items array doesn't exist.
    // If items array exists, CART_DETAILS was already called and will update Redux with full data.
    const hasCartItemsArray = Array.isArray(CART_ITEMS?.cart_items?.items);
    const isCartPage =
      location.pathname === "/cart/bag/" || location.pathname === "/cart/bag";
    // Only fetch cart count if:
    // 1. Cart data is empty/null
    // 2. Items array doesn't exist (CART_DETAILS hasn't been called)
    // 3. Not on cart page (cart page calls CART_DETAILS which includes count)
    // 4. Quantity control is not enabled
    if (
      isEmptyOrNull(CART_ITEMS?.cart_items) &&
      !hasCartItemsArray &&
      !isCartPage &&
      !show_quantity_control
    ) {
      const payload = {
        includeAllItems: true,
        includeCodCharges: true,
        includeBreakup: true,
        buyNow: buyNow === "true",
      };

      // CART_COUNT only returns user_cart_items_count (no items array).
      // This prevents race condition where CART_COUNT response overwrites
      // CART_DETAILS response (which contains full cart data including items).
      // If CART_DETAILS finishes after CART_COUNT, it will overwrite with complete data.
      fpi.executeGQL(CART_COUNT, payload).catch(() => {
        // Silently handle errors - cart count is not critical for header display
        // and errors are already handled by the FPI layer
      });
    }

    const observers = [];

    if (isRunningOnClient()) {
      const header = document?.querySelector(".fdk-theme-header");
      if (header) {
        const resizeObserver = new ResizeObserver(() => {
          fpi.custom.setValue(
            `headerHeight`,
            header.getBoundingClientRect().height
          );
        });
        resizeObserver.observe(header);
        observers.push(resizeObserver);
      }

      if (headerRef.current) {
        const themeHeaderObserver = new ResizeObserver(() => {
          fpi.custom.setValue(
            `themeHeaderHeight`,
            headerRef.current.getBoundingClientRect().height
          );
        });
        themeHeaderObserver.observe(headerRef.current);
        observers.push(themeHeaderObserver);
      }
    }

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRunningOnClient()) {
      const header = document?.querySelector(".fdk-theme-header");
      if (transparent_header && sticky_header && isValidSection) {
        header.style.position = "fixed";
        header.style.width = "100%";
      } else if (sticky_header && !isValidSection) {
        header.style.position = "sticky ";
      } else if (!sticky_header) {
        header.style.position = "unset";
      } else {
        header.style.position = "sticky ";
      }
    }
  }, [sticky_header, transparent_header, isValidSection]);

  useEffect(() => {
    if (isRunningOnClient()) {
      setTimeout(() => {}, 1000);
      const cssVariables = {
        "--headerHeight": `${headerHeight}px`,
      };

      const styleElement = document.createElement("style");
      const variables = JSON.stringify(cssVariables)
        .replaceAll(",", ";")
        .replace(/"/g, "");
      const str = `:root, ::before, ::after${variables}`;
      styleElement.innerHTML = str;

      document.head.appendChild(styleElement);

      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, [headerHeight]);

  const getShopLogoMobile = () =>
    appInfo?.mobile_logo?.secure_url?.replace("original", "resize-h:165") ||
    appInfo?.logo?.secure_url?.replace("original", "resize-h:165") ||
    fallbackLogo;

  const checkLogin = (type) => {
    if (type === "cart") {
      navigate?.("/cart/bag/");
      return;
    }

    if (!loggedIn) {
      openLogin();
      return;
    }

    const routes = {
      profile: "/profile/details",
      profile_mobile: "/profile/profile-tabs",
      wishlist: "/wishlist",
    };

    if (routes[type]) {
      navigate?.(routes[type]);
    }
  };

  const {
    isHeaderServiceability,
    isServiceabilityMandatory,
    deliveryPromise,
    isLoading,
    isServiceabilityModalOpen,
    selectedAddress,
    deliveryAddress,
    openServiceabilityModal,
    closeServiceabilityModal,
    handleLocationUpdate,
  } = useHyperlocal(fpi, "header");

  const query = new URLSearchParams(useLocation().search);
  const checkoutId = query.get("id");

  // CRITICAL: Close modal immediately when navigating to checkout page
  // This ensures modal is closed even if it was open from another page
  useEffect(() => {
    const isCheckoutPage = location.pathname.includes("/cart/checkout");
    if (isCheckoutPage && isServiceabilityModalOpen) {
      closeServiceabilityModal();
    }
  }, [location.pathname, isServiceabilityModalOpen, closeServiceabilityModal]);

  useEffect(() => {
    // Wait for address loading to complete before checking
    if (isLoading) {
      return;
    }

    // Don't open address modal on:
    // 1. Order-status/order-tracking pages
    // 2. Checkout page (checkout page has its own address selection flow) - ALWAYS skip
    // 3. Cart page (cart page has its own address selection UI)
    const isOrderStatusPage =
      location.pathname.includes("/order-status") ||
      location.pathname.includes("/order-tracking");
    const isCheckoutPage = location.pathname.includes("/cart/checkout");
    const isCartPage =
      location.pathname === "/cart/bag" || location.pathname === "/cart/bag/";

    // CRITICAL: NEVER open modal on checkout page - checkout has its own address flow
    if (isCheckoutPage) {
      // Also close modal if it's already open (shouldn't happen, but safety check)
      if (isServiceabilityModalOpen) {
        closeServiceabilityModal();
      }
      return;
    }

    // Don't open modal on order-status or cart pages
    if (isOrderStatusPage || isCartPage) {
      return;
    }

    // Check if user has selected any address/pincode
    // selectedAddress can be:
    // 1. null/undefined - no selection
    // 2. Object with id - full address selected
    // 3. Object without id but with area_code/pincode - pincode-only selected (valid selection)
    const hasAnySelection =
      selectedAddress &&
      (selectedAddress.id ||
        selectedAddress.area_code ||
        selectedAddress.pincode);

    // Only open modal if:
    // 1. Serviceability is mandatory
    // 2. No address/pincode is selected (selectedAddress is null/undefined or has no area_code/pincode/id)
    // 3. Not on order-status page
    // 4. Not on checkout page (checkout has its own address selection)
    // 5. Not on cart page (cart has its own address selection UI)
    // 6. Modal is not already open
    if (
      isServiceabilityMandatory &&
      !hasAnySelection &&
      !isOrderStatusPage &&
      !isCheckoutPage &&
      !isCartPage &&
      !isServiceabilityModalOpen
    ) {
      openServiceabilityModal();
    }
  }, [
    isLoading,
    selectedAddress,
    isServiceabilityMandatory,
    location.pathname,
    isServiceabilityModalOpen,
    openServiceabilityModal,
    closeServiceabilityModal,
    searchParams,
  ]);
  const defaultHeaderName =
    hideNavList && checkoutId ? "Select Address" : "My Cart";
  const cartBackNavigationList = ["Select Address", "Order Summary", "Payment"];

  return (
    <>
      {!isHeaderHidden && (
        <div
          className={`${styles.ctHeaderWrapper} fontBody ${isListingPage ? styles.listing : ""} ${
            transparent_header && isValidSection && !sticky_header
              ? styles.transparentHeader
              : ""
          } ${transparent_header && isValidSection && sticky_header ? styles.stickyTransparentHeader : ""}`}
          ref={headerRef}
        >
          <header
            data-transparent-header={
              transparent_header && isValidSection && !scrolled
                ? "true"
                : "false"
            }
            className={`${styles.header} ${header_border ? styles.seperator : ""} ${
              transparent_header && isValidSection
                ? styles.transparentBackground
                : ""
            } ${scrolled ? styles.scrolled : ""}`}
          >
            <div
              className={`${styles.headerContainer} ${
                transparent_header && isValidSection ? styles.paddingMobile : ""
              } basePageContainer margin0auto `}
            >
              <div
                className={`${styles.desktop}  ${
                  transparent_header && isValidSection
                    ? styles.transparent_desktop
                    : ""
                }`}
              >
                <HeaderDesktop
                  checkLogin={checkLogin}
                  fallbackLogo={fallbackLogo}
                  cartItemCount={cartItemCount}
                  globalConfig={globalConfig}
                  LoggedIn={loggedIn}
                  appInfo={appInfo}
                  navigation={HeaderNavigation}
                  wishlistCount={wishlistCount}
                  fpi={fpi}
                  isPromiseLoading={isLoading}
                  languageIscCode={languageIscCode}
                  isServiceability={isHeaderServiceability}
                  deliveryAddress={deliveryAddress}
                  deliveryPromise={deliveryPromise}
                  onServiceabilityClick={openServiceabilityModal}
                  hideNavList={hideNavList}
                />
              </div>
              <div
                className={`${styles.mobile}  ${
                  transparent_header && isValidSection
                    ? styles.transparent_mobile
                    : ""
                }`}
              >
                <div
                  className={`${styles.mobileTop} ${styles[header_layout]} ${styles[logo_menu_alignment]}  ${
                    hideNavList &&
                    defaultHeaderName === "My Cart" &&
                    !cartBackNavigationList[currentStep] &&
                    logo_menu_alignment !== "layout_4"
                      ? styles.leftLogo
                      : ""
                  }  ${transparent_header && isValidSection ? styles.transparent_mobile : ""}`}
                >
                  {!hideNavList ? (
                    <Navigation
                      customClass={`${styles.left} ${styles.flexAlignCenter} ${styles[header_layout]}`}
                      fallbackLogo={fallbackLogo}
                      maxMenuLenght={12}
                      reset
                      isSidebarNav
                      LoggedIn={loggedIn}
                      navigationList={HeaderNavigation}
                      appInfo={appInfo}
                      globalConfig={globalConfig}
                      checkLogin={checkLogin}
                      languageIscCode={languageIscCode}
                      fpi={fpi}
                    />
                  ) : (
                    <div
                      className={`${styles.back_button_container} fontHeader`}
                    >
                      {checkoutId && (
                        <span
                          className={styles.iconWrapper}
                          onClick={() => {
                            if (currentStep > 0) {
                              fpi.custom.setValue(
                                "currentStep",
                                currentStep - 1
                              );
                            } else if (currentStep === 0) {
                              fpi.custom.setValue("currentStep", null);
                              navigate("/cart/bag");
                            }
                          }}
                        >
                          <BackArrow />
                        </span>
                      )}
                      <span
                        className={
                          defaultHeaderName === "My Cart"
                            ? styles.cartPadding
                            : ""
                        }
                      >
                        {cartBackNavigationList[currentStep] ??
                          defaultHeaderName}
                      </span>
                    </div>
                  )}

                  <FDKLink
                    to="/"
                    className={`${styles.middle} ${styles.flexAlignCenter} ${
                      hideNavList &&
                      !checkoutId &&
                      logo_menu_alignment === "layout_4" &&
                      hideNavList
                        ? styles.paddingRight
                        : ""
                    } ${hideNavList && checkoutId ? styles.visibilityNone : ""}`}
                  >
                    <img
                      style={{
                        maxHeight: `${mobile_logo_max_height_header || 38}px`,
                      }}
                      className={styles.logo}
                      src={getShopLogoMobile()}
                      alt={t("resource.refund_order.name_alt_text")}
                    />
                  </FDKLink>
                  {!hideNavList && (
                    <div className={styles.right}>
                      <div
                        className={`${styles.icon} ${styles["right__icons--search"]}`}
                      >
                        <Search globalConfig={globalConfig} fpi={fpi} />
                      </div>
                      {!disable_cart && button_options !== "none" && (
                        <div>
                          <button
                            type="button"
                            className={`${styles.headerIcon} ${styles["right__icons--bag"]}`}
                            onClick={() => checkLogin("cart")}
                            aria-label={`${cartItemCount ?? 0} ${t("resource.header.item_in_cart")}`}
                          >
                            <CartIcon
                              className={`${styles.cart} ${styles.mobileIcon} ${styles.headerIcon}`}
                            />
                            {cartItemCount > 0 && (
                              <span className={styles.cartCount}>
                                {cartItemCount}
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {isHeaderServiceability && !hideNavList && (
                  <button
                    className={styles.mobileBottom}
                    onClick={openServiceabilityModal}
                  >
                    {isLoading ? (
                      <Shimmer width="100%" height="16px" />
                    ) : (
                      <>
                        <TruckIcon className={styles.truckIcon} />
                        <div className={styles.locationMeta}>
                          {!!deliveryPromise && (
                            <div className={styles.promiseTat}>
                              {deliveryPromise}
                            </div>
                          )}
                          <div className={styles.label}>
                            {deliveryAddress ||
                              t("resource.header.location_label")}
                          </div>
                        </div>
                        <AngleDownIcon className={styles.angleDownIcon} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            {!hideNavList && (
              <div className={`${styles.mobile} ${styles.i18Wrapper}`}>
                <I18Dropdown
                  fpi={fpi}
                  languageIscCode={languageIscCode}
                ></I18Dropdown>
              </div>
            )}
          </header>
        </div>
      )}
      {isServiceabilityModalOpen && !hideNavList && (
        <Suspense fallback={<div />}>
          <LocationModal
            fpi={fpi}
            isOpen={isServiceabilityModalOpen}
            onClose={closeServiceabilityModal}
            onConfirm={handleLocationUpdate}
          />
        </Suspense>
      )}
    </>
  );
}

export default Header;
