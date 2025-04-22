import React, { useEffect, useMemo, Suspense } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { FDKLink } from "fdk-core/components";
import { useGlobalStore } from "fdk-core/utils";
import { CART_COUNT } from "../../queries/headerQuery";
import { isRunningOnClient, isEmptyOrNull } from "../../helper/utils";
import Search from "./search";
import HeaderDesktop from "./desktop-header";
import Navigation from "./navigation";
import I18Dropdown from "./i18n-dropdown";
import useHeader from "./useHeader";
import styles from "./styles/header.less";
import fallbackLogo from "../../assets/images/logo.png";
import { useAccounts } from "../../helper/hooks";
import useHyperlocal from "./useHyperlocal";
import CartIcon from "../../assets/images/single-row-cart.svg";
import AngleDownIcon from "../../assets/images/header-angle-down.svg";
const LocationModal = React.lazy(
  () => import("@gofynd/theme-template/components/location-modal/location-modal")
);
import "@gofynd/theme-template/components/location-modal/location-modal.css";

function Header({ fpi }) {
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
        return () => {
          resizeObserver.disconnect();
        };
      }
    }
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
      {!isHeaderHidden && (
        <div
          className={`${styles.ctHeaderWrapper} fontBody ${isListingPage ? styles.listing : ""}`}
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
                  />
                  <FDKLink
                    to="/"
                    className={`${styles.middle} ${styles.flexAlignCenter}`}
                  >
                    <img
                      className={styles.logo}
                      src={getShopLogoMobile()}
                      alt="name"
                    />
                  </FDKLink>
                  <div className={styles.right}>
                    <div
                      className={`${styles.icon} ${styles["right__icons--search"]}`}
                    >
                      <Search globalConfig={globalConfig} fpi={fpi} />
                    </div>
                    <div>
                      <button
                        type="button"
                        className={`${styles.headerIcon} ${styles["right__icons--bag"]}`}
                        onClick={() => checkLogin("cart")}
                        aria-label={`${cartItemCount ?? 0} item in cart`}
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
                  </div>
                </div>
                {isHyperlocal && (
                  <button
                    className={styles.mobileBottom}
                    onClick={handleLocationModalOpen}
                  >
                    {isLoading ? (
                      "Fetching..."
                    ) : (
                      <>
                        <div className={styles.label}>
                          {pincode ? deliveryMessage : "Enter a pincode"}
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
              <I18Dropdown fpi={fpi}></I18Dropdown>
            </div>
          </header>
        </div>
      )}
      {isLocationModalOpen && (
        <Suspense>
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
