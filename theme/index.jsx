import FPIClient from "@gofynd/fdk-store-gql";
import customTemplates from "./custom-templates";
import "./styles/base.global.less";
import sections from "./sections";

import Header from "./components/header/header";
import { globalDataResolver, pageDataResolver } from "./helper/lib";
import Loader from "./components/loader/loader";
import Footer from "./components/footer/footer";
import { ThemeProvider } from "./providers/global-provider";

export default async ({
  applicationID,
  applicationToken,
  domain,
  storeInitialData,
}) => {
  const proxyDomain = domain;

  const fpiOptions = {
    applicationID,
    applicationToken,
    domain: proxyDomain,
    storeInitialData,
  };
  const { client } = new FPIClient(fpiOptions);

  return {
    globalDataResolver,
    pageDataResolver,
    fpi: client,
    sections,
    customTemplates,
    getHeader: () => Header,
    getFooter: () => Footer,
    getGlobalProvider: () => ThemeProvider,
    getComponentLoader: () => Loader,
    getHome: () => import(/* webpackChunkName:"getHome" */ "./pages/home"),
    getLogin: () => import(/* webpackChunkName:"getLogin" */ "./pages/login"),
    getEditProfile: () =>
      import(/* webpackChunkName:"getEditProfile" */ "./pages/edit-profile"),
    getRegister: () =>
      import(/* webpackChunkName:"getRegister" */ "./pages/register"),
    getAccountLocked: () =>
      import(
        /* webpackChunkName:"getAccountLocked" */ "./pages/account-locked"
      ),
    getSetPassword: () =>
      import(/* webpackChunkName:"getSetPassword" */ "./pages/set-password"),
    getNotFound: () =>
      import(
        /* webpackChunkName:"getNotFound" */ "./components/page-not-found/page-not-found"
      ),
    getBrands: () =>
      import(/* webpackChunkName:"getBrands" */ "./pages/brands"),

    getCategories: () =>
      import(/* webpackChunkName:"getCategories" */ "./pages/categories"),
    getCollections: () =>
      import(/* webpackChunkName:"getCollections" */ "./pages/collections"),
    getCollectionListing: () =>
      import(
        /* webpackChunkName:"getCollectionListing" */ "./pages/collection-listing"
      ),
    getProductListing: () =>
      import(
        /* webpackChunkName:"getProductListing" */ "./pages/product-listing"
      ),
    getProductDescription: () =>
      import(
        /* webpackChunkName:"getProductDescription" */ "./pages/product-description"
      ),
    getCart: () =>
      import(/* webpackChunkName:"getCart" */ "./pages/cart-landing"),
    getSharedCart: () =>
      import(/* webpackChunkName:"getSharedCart" */ "./pages/shared-cart"),
    getWishlist: () =>
      import(/* webpackChunkName:"getWishlist" */ "./pages/wishlist"),
    getSinglePageCheckout: () =>
      import(
        /* webpackChunkName:"getSinglePageCheckout" */ "./pages/single-page-checkout"
      ),
    getOrderStatus: () =>
      import(/* webpackChunkName:"getOrderStatus" */ "./pages/order-status"),
    getForgotPassword: () =>
      import(
        /* webpackChunkName:"getForgotPassword" */ "./pages/forgot-password"
      ),
    getMarketing: () =>
      import(
        /* webpackChunkName:"getMarketing" */ "./page-layouts/marketing/markting-page"
      ),
    getProfileDetails: () =>
      import(
        /* webpackChunkName:"getProfileDetails" */ "./pages/profile-details"
      ),
    getProfileAddress: () =>
      import(
        /* webpackChunkName:"getProfileAddress" */ "./pages/profile-address"
      ),
    getProfile: () =>
      import(
        /* webpackChunkName:"getProfile" */ "./page-layouts/profile/profile-tabs"
      ),
    getOrdersList: () =>
      import(/* webpackChunkName:"getOrdersList" */ "./pages/orders-list"),
    getShipmentDetails: () =>
      import(
        /* webpackChunkName:"getShipmentDetails" */ "./pages/shipment-details"
      ),
    getShipmentUpdate: () =>
      import(
        /* webpackChunkName:"getShipmentUpdate" */ "./page-layouts/profile/profile-shipment-update-page"
      ),
    getProfilePhone: () =>
      import(
        /* webpackChunkName:"getProfilePhone" */ "./page-layouts/profile/phone"
      ),
    getFaq: () => import(/* webpackChunkName:"getFaq" */ "./pages/faq"),
    getProfileEmail: () =>
      import(
        /* webpackChunkName:"getProfileEmail" */ "./page-layouts/profile/email"
      ),
    getVerifyEmail: () =>
      import(/* webpackChunkName:"getVerifyEmail" */ "./pages/verify-email"),
    getVerifyEmailLink: () =>
      import(
        /* webpackChunkName:"getVerifyEmailLink" */ "./pages/verify-email-link"
      ),
    getTnc: () => import(/* webpackChunkName:"getTnc" */ "./pages/tnc"),
    getPrivacyPolicy: () =>
      import(/* webpackChunkName:"getPrivacyPolicy" */ "./pages/policy"),
    getShippingPolicy: () =>
      import(
        /* webpackChunkName:"getShippingPolicy" */ "./pages/shipping-policy"
      ),
    getReturnPolicy: () =>
      import(/* webpackChunkName:"getReturnPolicy" */ "./pages/return-policy"),
    getCompareProducts: () =>
      import(
        /* webpackChunkName:"getCompareProducts" */ "./page-layouts/compare/compare"
      ),
    getBlog: () => import(/* webpackChunkName:"getBlog" */ "./pages/blog"),
    getBlogPage: () =>
      import(/* webpackChunkName:"getBlogPage" */ "./components/blog/BlogPage"),
    getContactUs: () =>
      import(/* webpackChunkName:"getContactUs" */ "./pages/contact-us"),
    getFormItem: () =>
      import(/* webpackChunkName:"getFormItem" */ "./components/FormItem"),
    getOrderTracking: () =>
      import(
        /* webpackChunkName:"getOrderTracking" */ "./pages/order-tracking"
      ),
    getOrderTrackingDetails: () =>
      import(
        /* webpackChunkName:"getOrderTrackingDetails" */ "./pages/order-tracking-details"
      ),
    getSections: () =>
      import(
        /* webpackChunkName:"getSections" */ "./page-layouts/section-render/section-page"
      ),
    getRefund: () =>
      import(/* webpackChunkName:"getRefund" */ "./pages/refund-order"),
    getAboutUs: () =>
      import(/* webpackChunkName:"getAboutUs" */ "./pages/about-us"),
    getLocateUs: () =>
      import(/* webpackChunkName:"getLocateUs" */ "./pages/locate-us"),
  };
};
