import React, { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
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
import useHyperlocal from "./useHyperlocal";
import CartIcon from "../../assets/images/single-row-cart.svg";
import AngleDownIcon from "../../assets/images/header-angle-down.svg";
import "@gofynd/theme-template/components/location-modal/location-modal.css";
import { LANGUAGES } from "../../queries/languageQuery";
import I18Dropdown from "./i18n-dropdown";

const LocationModal = React.lazy(
  () =>
    import("@gofynd/theme-template/components/location-modal/location-modal")
);

function Header({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const CART_ITEMS = useGlobalStore(fpi?.getters?.CART);
  const { headerHeight = 0 } = useGlobalStore(fpi.getters.CUSTOM_VALUE);
  const {
    globalConfig,
    cartItemCount,
    appInfo,
    HeaderNavigation = [],
    wishlistCount,
    loggedIn,
  } = useHeader(fpi);
  const { openLogin } = useAccounts({ fpi });
  const shouldHide = location.pathname.startsWith("/payment/link/");
  const { activeLocale } = useLocale();
  const i18N_DETAILS = useGlobalStore(fpi.getters.i18N_DETAILS);
  const { supportedLanguages } = useGlobalStore(fpi.getters.CUSTOM_VALUE) || {};
  const [languageIscCode, setLanguageIscCode] = useState([]);

  const buyNow = searchParams?.get("buy_now") || false;

  const isListingPage = useMemo(() => {
    const regex = /^\/(products\/?|collection\/.+)$/;
    return regex.test(location?.pathname);
  }, [location?.pathname]);

  const isHeaderHidden = useMemo(() => {
    const regex = /^\/refund\/order\/([^/]+)\/shipment\/([^/]+)$/;
    return regex.test(location?.pathname);
  }, [location?.pathname]);

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
  }, []);

  useEffect(() => {
    if (!isRunningOnClient()) return;

    const currentLocale = i18N_DETAILS?.language?.locale;
    const validLocale = isLocalePresent(activeLocale, supportedLanguages?.items)
      ? activeLocale
      : getDefaultLocale(supportedLanguages?.items);

    if (!i18N_DETAILS || currentLocale === validLocale) return;

    fpi.setI18nDetails({
      ...i18N_DETAILS,
      language: {
        ...i18N_DETAILS.language,
        locale: validLocale || "en",
      },
    });
    window.location.reload();
  }, [activeLocale, i18N_DETAILS, supportedLanguages]);

  useEffect(() => {
    if (
      isEmptyOrNull(CART_ITEMS?.cart_items) &&
      location.pathname !== "/cart/bag/"
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
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

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

      // Append the <style> element to the document's head
      document.head.appendChild(styleElement);

      // Clean up the <style> element on component unmount
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
    isHyperlocal,
    isLoading,
    pincode,
    deliveryMessage,
    servicibilityError,
    isCurrentLocButton,
    isLocationModalOpen,
    handleLocationModalOpen,
    handleLocationModalClose,
    handleCurrentLocClick,
    handlePincodeSubmit,
  } = useHyperlocal(fpi);

  return (
    <>
      {!isHeaderHidden && !shouldHide && (
        <div
          className={`${styles.ctHeaderWrapper} fontBody ${isListingPage ? styles.listing : ""}`}
          ref={headerRef}
        >
          <header
            className={`${styles.header} ${globalConfig?.header_border ? styles.seperator : ""}`}
          >
            <div
              className={`${styles.headerContainer} basePageContainer margin0auto `}
            >
              <div className={styles.desktop}>
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
                  isHyperlocal={isHyperlocal}
                  isPromiseLoading={isLoading}
                  pincode={pincode}
                  deliveryMessage={deliveryMessage}
                  onDeliveryClick={handleLocationModalOpen}
                  languageIscCode={languageIscCode}
                />
              </div>
              <div className={styles.mobile}>
                <div
                  className={`${styles.mobileTop} ${
                    styles[globalConfig.header_layout]
                  } ${styles[globalConfig.logo_menu_alignment]}`}
                >
                  <Navigation
                    customClass={`${styles.left} ${styles.flexAlignCenter} ${
                      styles[globalConfig.header_layout]
                    }`}
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
                  <FDKLink
                    to="/"
                    className={`${styles.middle} ${styles.flexAlignCenter}`}
                  >
                    <img
                     style={{
                      maxHeight: `${globalConfig?.mobile_logo_max_height_header || 38}px`,
                    }}
                      className={styles.logo}
                      src={getShopLogoMobile()}
                      alt={t("resource.refund_order.name_alt_text")}
                    />
                  </FDKLink>
                  <div className={styles.right}>
                    <div
                      className={`${styles.icon} ${styles["right__icons--search"]}`}
                    >
                      <Search globalConfig={globalConfig} fpi={fpi} />
                    </div>
                    {!globalConfig?.disable_cart &&
                      globalConfig?.button_options !== "none" && (
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
                </div>
                {isHyperlocal && (
                  <button
                    className={styles.mobileBottom}
                    onClick={handleLocationModalOpen}
                  >
                    {isLoading ? (
                      t("resource.header.fetching")
                    ) : (
                      <>
                        <div className={styles.label}>
                          {pincode
                            ? deliveryMessage
                            : t("resource.header.pin_code")}
                        </div>
                        {pincode && (
                          <div className={styles.pincode}>
                            <span>{pincode}</span>
                            <AngleDownIcon
                              className={styles.headerAngleDownIcon}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className={`${styles.mobile} ${styles.i18Wrapper}`}>
              <I18Dropdown
                fpi={fpi}
                languageIscCode={languageIscCode}
              ></I18Dropdown>
            </div>
          </header>
        </div>
      )}
      {isLocationModalOpen && !shouldHide && (
        <Suspense fallback={<div />}>
          <LocationModal
            isOpen={isLocationModalOpen}
            pincode={pincode}
            error={servicibilityError}
            isLocationButton={isCurrentLocButton}
            onClose={handleLocationModalClose}
            onSubmit={handlePincodeSubmit}
            onCurrentLocationClick={handleCurrentLocClick}
          />
        </Suspense>
      )}
    </>
  );
}

export default Header;
