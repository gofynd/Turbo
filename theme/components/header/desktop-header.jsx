import React, { useEffect, useState } from "react";
import {
  useGlobalStore,
  useGlobalTranslation,
  useLocale,
} from "fdk-core/utils";
import Navigation from "./navigation";
import I18Dropdown from "./i18n-dropdown";
import Search from "./search";
import styles from "./styles/desktop-header.less";
import AngleDownIcon from "../../assets/images/header-angle-down.svg";
import WishlistIcon from "../../assets/images/single-row-wishlist.svg";
import UserIcon from "../../assets/images/single-row-user.svg";
import CartIcon from "../../assets/images/single-row-cart.svg";
import { FDKLink } from "fdk-core/components";
import TruckIcon from "../../assets/images/truck.svg";
import Shimmer from "../shimmer/shimmer";
import { translateDynamicLabel } from "../../helper/utils";

function HeaderDesktop({
  checkLogin,
  fallbackLogo,
  cartItemCount,
  globalConfig,
  LoggedIn,
  appInfo,
  navigation,
  wishlistCount,
  fpi,
  isServiceability = false,
  isPromiseLoading = false,
  deliveryAddress = "",
  deliveryPromise = "",
  onServiceabilityClick = () => {},
  languageIscCode,
  hideNavList,
}) {
  const { t } = useGlobalTranslation("translation");
  const {
    profile_icon_text,
    wishlist_icon_text,
    cart_icon_text,
    show_icon_text_in_header = false,
  } = globalConfig || {};
  const isDoubleRowHeader = globalConfig?.header_layout === "double";

  const getMenuMaxLength = () => {
    if (isDoubleRowHeader) {
      return 50;
    }

    const logoMenuAlignment = globalConfig?.logo_menu_alignment;
    return {
      layout_1: 10,
      layout_2: 10,
      layout_3: 10,
      layout_4: 10,
    }[logoMenuAlignment];
  };

  const getShopLogo = () =>
    appInfo?.logo?.secure_url?.replace("original", "resize-h:165") ||
    fallbackLogo;

  const staticHeight =
    isDoubleRowHeader && globalConfig?.always_on_search
      ? 35.6
      : isDoubleRowHeader
        ? 121
        : 85;
  const desktopLogoHeight = globalConfig?.desktop_logo_max_height || 65;

  return (
    <div
      className={`${styles.headerDesktop}  ${
        styles[globalConfig.header_layout]
      } ${styles[globalConfig.logo_menu_alignment]}`}
    >
      <div
        className={`${styles.firstRow} ${
          isDoubleRowHeader && globalConfig?.always_on_search && hideNavList
            ? styles.increasePadding
            : ""
        }`}
      >
        <div className={`${styles.left}`}>
          {!isDoubleRowHeader && !hideNavList && (
            <Navigation
              customClass={`${styles.firstRowNav} ${
                styles[globalConfig?.header_layout]
              }`}
              maxMenuLength={getMenuMaxLength()}
              fallbackLogo={fallbackLogo}
              navigationList={navigation}
              appInfo={appInfo}
              globalConfig={globalConfig}
              reset
              checkLogin={checkLogin}
              languageIscCode={languageIscCode}
              fpi={fpi}
              staticHeight={staticHeight}
            />
          )}
          {isDoubleRowHeader &&
            globalConfig?.always_on_search &&
            !hideNavList && (
              <div
                className={styles.alwaysOnSearch}
                data-role="always-on-search"
              >
                <Search
                  customSearchClass={styles.customSearchClass}
                  customSearchWrapperClass={styles.customSearchWrapperClass}
                  showCloseButton={false}
                  alwaysOnSearch={true}
                  screen="desktop"
                  globalConfig={globalConfig}
                  fpi={fpi}
                />
              </div>
            )}
        </div>
        <div className={`${styles.middle} ${styles.flexCenter}`}>
          <FDKLink to="/">
            <div
              className={styles.logoShell}
              style={{ "--logo-height": `${desktopLogoHeight}px` }}
            >
              <img
                className={styles.logo}
                src={getShopLogo()}
                alt={t("resource.header.shop_logo_alt_text")}
              />
            </div>
          </FDKLink>
          {isServiceability &&
            globalConfig?.always_on_search &&
            ["layout_1", "layout_2", "layout_3"].includes(
              globalConfig?.logo_menu_alignment
            ) &&
            !hideNavList && (
              <ServiceabilityButton
                className={styles.hyperlocalSearchOn}
                {...{
                  isPromiseLoading,
                  deliveryAddress,
                  deliveryPromise,
                  onServiceabilityClick,
                }}
              />
            )}
        </div>
        <div className={`${styles.right} ${styles.right__icons}`}>
          {!hideNavList && (
            <I18Dropdown
              fpi={fpi}
              languageIscCode={languageIscCode}
            ></I18Dropdown>
          )}
          {isServiceability &&
            (!globalConfig?.always_on_search ||
              globalConfig?.logo_menu_alignment === "layout_4") &&
            !hideNavList && (
              <ServiceabilityButton
                {...{
                  isPromiseLoading,
                  deliveryAddress,
                  deliveryPromise,
                  onServiceabilityClick,
                }}
              />
            )}
          {(!isDoubleRowHeader || !globalConfig?.always_on_search) &&
            !hideNavList && (
              <div
                className={`${styles.icon} ${styles["right__icons--search"]}`}
              >
                <Search
                  customClass={`${styles[globalConfig?.header_layout]}-row-search`}
                  screen="desktop"
                  globalConfig={globalConfig}
                  fpi={fpi}
                />
              </div>
            )}
          {!hideNavList && (
            <button
              type="button"
              className={`${styles.icon} ${styles["right__icons--profile"]} ${show_icon_text_in_header ? styles.navButton : ""}`}
              aria-label={t("resource.profile.profile")}
              onClick={() => checkLogin("profile")}
            >
              <UserIcon
                className={`${styles.user} ${styles.headerIcon} ${styles.singleRowIcon}`}
              />
              {show_icon_text_in_header && (
                <span>
                  {profile_icon_text
                    ? translateDynamicLabel(profile_icon_text, t)
                    : t("resource.profile.profile_icon_default_text")}
                </span>
              )}
            </button>
          )}
          {!hideNavList && (
            <button
              type="button"
              className={` ${styles["right__icons--wishlist"]} ${show_icon_text_in_header ? styles.navButton : ""}`}
              aria-label="wishlist"
              onClick={() => checkLogin("wishlist")}
            >
              <div className={styles.icon}>
                <WishlistIcon
                  className={`${styles.wishlist} ${styles.singleRowIcon}`}
                />
                {wishlistCount > 0 && LoggedIn && (
                  <span className={styles.count}>{wishlistCount}</span>
                )}
              </div>
              {show_icon_text_in_header && (
                <span>
                  {wishlist_icon_text
                    ? translateDynamicLabel(wishlist_icon_text, t)
                    : t("resource.wishlist.wishlist_icon_default_text")}
                </span>
              )}
            </button>
          )}
          {!globalConfig?.disable_cart &&
            globalConfig?.button_options !== "none" && (
              <button
                type="button"
                className={`${styles.icon} ${styles["right__icons--bag"]} ${show_icon_text_in_header ? styles.navButton : ""}`}
                aria-label={`${cartItemCount ?? 0} item in cart`}
                onClick={() => checkLogin("cart")}
              >
                <div>
                  <CartIcon
                    className={`${styles.cart} ${styles.singleRowIcon}`}
                  />
                  {cartItemCount > 0 && (
                    <span className={styles.count}>{cartItemCount}</span>
                  )}
                </div>
                {show_icon_text_in_header && (
                  <span>
                    {cart_icon_text
                      ? translateDynamicLabel(cart_icon_text, t)
                      : t("resource.cart.cart_icon_default_text")}
                  </span>
                )}
              </button>
            )}
        </div>
      </div>
      {isDoubleRowHeader && !hideNavList && (
        <Navigation
          customClass={`${styles.secondRow}`}
          maxMenuLength={getMenuMaxLength()}
          fallbackLogo={fallbackLogo}
          navigationList={navigation}
          globalConfig={globalConfig}
          appInfo={appInfo}
          LoggedIn={LoggedIn}
          checkLogin={checkLogin}
          languageIscCode={languageIscCode}
          fpi={fpi}
          staticHeight={staticHeight}
        />
      )}
    </div>
  );
}

export default HeaderDesktop;

const ServiceabilityButton = ({
  className,
  isPromiseLoading = false,
  deliveryAddress = "",
  deliveryPromise = "",
  onServiceabilityClick = () => {},
}) => {
  const { t } = useGlobalTranslation("translation");
  return (
    <button
      className={`${styles.hyperlocalActionBtn} ${className}`}
      onClick={onServiceabilityClick}
    >
      {isPromiseLoading ? (
        <Shimmer width="150px" height="16px" />
      ) : (
        <>
          <TruckIcon className={styles.truckIcon} />
          <div className={styles.locationMeta}>
            {!!deliveryPromise && (
              <div className={styles.deliveryPromise}>{deliveryPromise}</div>
            )}
            <div
              className={`${styles.deliveryAddress} ${!!deliveryPromise && styles.promiseAddress}`}
            >
              {!!deliveryAddress
                ? deliveryAddress
                : t("resource.header.location_label")}
            </div>
          </div>
        </>
      )}
    </button>
  );
};
