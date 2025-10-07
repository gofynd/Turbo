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

  // Destructure everything used from globalConfig (with safe fallbacks)
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
    location.pathname.startsWith("/cart/") &&
    (typeof show_secondary_header_on_checkout === "boolean"
      ? show_secondary_header_on_checkout
      : false);
  const { activeLocale } = useLocale();
  const i18N_DETAILS = useGlobalStore(fpi.getters.i18N_DETAILS);
  const { supportedLanguages } = useGlobalStore(fpi.getters.CUSTOM_VALUE) || {};

  const [languageIscCode, setLanguageIscCode] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  const buyNow = searchParams?.get("buy_now") || false;

  const isListingPage = useMemo(() => {
    const regex = /^\/(products\/?|collection\/.+)$/;
    return regex.test(location?.pathname);
  }, [location?.pathname]);

  const isHeaderHidden = useMemo(() => {
    const regex = /^\/refund\/order\/([^/]+)\/shipment\/([^/]+)$/;
    return regex.test(location?.pathname);
  }, [location?.pathname]);

  const sections = useGlobalStore(fpi.getters.PAGE)?.sections || [];
  const isValidSection =
    sections[0]?.name === "application-banner" ||
    sections[0]?.name === "image-slideshow" ||
    sections[0]?.name === "hero-image" ||
    sections[0]?.name === "image-gallery";

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
    window.location.replace(window.location.href);
  }, [activeLocale]); // <-- only when the selected locale changes

  useEffect(() => {
    if (
      isEmptyOrNull(CART_ITEMS?.cart_items) &&
      location.pathname !== "/cart/bag/" &&
      !show_quantity_control
    ) {
      const payload = {
        includeAllItems: true,
        includeCodCharges: true,
        includeBreakup: true,
        buyNow: buyNow === "true",
      };
      fpi.executeGQL(CART_COUNT, payload);
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
    deliveryAddress,
    openServiceabilityModal,
    closeServiceabilityModal,
    handleLocationUpdate,
  } = useHyperlocal(fpi, "header");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isServiceabilityMandatory && !deliveryAddress) {
        openServiceabilityModal();
      }
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [deliveryAddress, isServiceabilityMandatory]);

  const query = new URLSearchParams(useLocation().search);
  const checkoutId = query.get("id");
  const defaultHeaderName =
    hideNavList && checkoutId ? "Select Address" : "My Cart";
  const cartBackNavigationList = ["Select Address", "Order Summary", "Payment"];

  return (
    <>
      {!isHeaderHidden && !shouldHide && (
        <div
          className={`${styles.ctHeaderWrapper} fontBody ${isListingPage ? styles.listing : ""} ${
            transparent_header && isValidSection && !sticky_header
              ? styles.transparentHeader
              : ""
          } ${transparent_header && isValidSection && sticky_header ? styles.stickyTransparentHeader : ""}`}
          ref={headerRef}
        >
          <header
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
                            {!!deliveryAddress
                              ? deliveryAddress
                              : t("resource.header.location_label")}
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
