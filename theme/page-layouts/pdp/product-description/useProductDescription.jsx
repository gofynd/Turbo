import { useEffect, useState, useMemo } from "react";
import useInternational from "../../../components/header/useInternational";
import {
  ADD_TO_CART,
  CHECK_PINCODE,
  GET_PRODUCT_DETAILS,
  GET_PRODUCT_PROMOTIONS,
  OFFERS,
  PRODUCT_SELLERS,
  FULFILLMENT_OPTIONS,
  PRODUCT_DETAILS_WITH_SIZE,
  BUNDLE_ITEMS,
  BUNDLES_BY_CHILD,
} from "../../../queries/pdpQuery";
import useHeader from "../../../components/header/useHeader";
import {
  ADD_WISHLIST,
  CART_ITEMS_COUNT,
  FOLLOWED_PRODUCTS_IDS,
  REMOVE_WISHLIST,
} from "../../../queries/wishlistQuery";
import {
  useSnackbar,
  usePincodeInput,
  useThemeFeature,
} from "../../../helper/hooks";
import { LOCALITY } from "../../../queries/logisticsQuery";
import { isEmptyOrNull, translateDynamicLabel } from "../../../helper/utils";
import { fetchCartDetails } from "../../cart/useCart";
import {
  useGlobalStore,
  useNavigate,
  useGlobalTranslation,
} from "fdk-core/utils";

const useProductDescription = ({
  fpi,
  slug,
  size,
  props,
  cachedProductData,
}) => {
  const { t } = useGlobalTranslation("translation");
  const { mandatory_pincode } = props;
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const PRODUCT = useGlobalStore(fpi.getters.PRODUCT);
  const LoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const { isPdpSsrFetched, isI18ModalOpen, ssrProductInfo } = useGlobalStore(
    fpi?.getters?.CUSTOM_VALUE
  );
  const { app_features } = useGlobalStore(fpi.getters.CONFIGURATION) || {};
  const { order = {} } = app_features || {};
  const { buybox, fulfillment_option } = useGlobalStore(
    fpi.getters.APP_FEATURES
  );
  const { bundles: ssrBundles, bundleProducts: ssrBundleProducts } =
    ssrProductInfo || {};

  const { isServiceability } = useThemeFeature({ fpi });
  const {
    isLoading: isCountryDetailsLoading,
    i18nDetails,
    isValidDeliveryLocation,
    deliveryLocation,
    isServiceabilityPincodeOnly,
  } = useInternational({
    fpi,
  });
  const pincodeInput = usePincodeInput();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentSize, setCurrentSize] = useState(null);
  const [followed, setFollowed] = useState(false);
  const [offers, setOffers] = useState({});
  const [allStoresInfo, setAllStoresInfo] = useState({});
  const [selectPincodeError, setSelectPincodeError] = useState(false);
  const [pincodeErrorMessage, setPincodeErrorMessage] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(!isPdpSsrFetched);
  const [bundleProducts, setBundleProducts] = useState(ssrBundleProducts);
  const [bundles, setBundles] = useState(ssrBundles);
  const [isBundlesLoading, setIsBundlesLoading] = useState(false);

  const isProductDataLoading = useMemo(
    () => isPageLoading && isEmptyOrNull(cachedProductData),
    [isPageLoading, cachedProductData]
  );

  const product_details =
    isPageLoading && !isEmptyOrNull(cachedProductData)
      ? cachedProductData
      : PRODUCT?.product_details || {};

  const product_meta =
    isPageLoading && !isEmptyOrNull(cachedProductData)
      ? cachedProductData
      : PRODUCT?.product_meta || {};

  const { product_price_with_fullfillment } = PRODUCT;

  const foItems = product_price_with_fullfillment?.items || [];

  const selectedFO =
    foItems.find((foItem) => foItem?.fulfillment_option?.is_default) ||
    foItems[0];

  const [currentFO, setCurrentFO] = useState(
    selectedFO?.fulfillment_option || {}
  );
  const [fulfillmentOptions, setFulfillmentOptions] = useState(foItems);

  const [productPriceBySlug, setProductPriceBySlug] = useState(
    selectedFO || {}
  );
  const { wishlistIds } = useHeader(fpi);
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSellerLoading, setIsSellerLoading] = useState(false);
  const [isLoadingPriceBySize, setIsLoadingPriceBySize] = useState(false);
  const locationPincode = locationDetails?.pincode || "";
  // const isLoading =
  //   productMetaLoading ||
  //   productDetailsLoading ||
  //   productPriceBySlugLoading ||
  //   false;

  const fetchBundlesByChild = async ({ size }) => {
    setIsBundlesLoading(true);
    try {
      const { data } = await fpi.executeGQL(BUNDLES_BY_CHILD, {
        slug,
        size,
      });
      if (data?.bundlesByChild?.items) {
        setBundles(data.bundlesByChild.items);
      }
    } catch (error) {
    } finally {
      setIsBundlesLoading(false);
    }
  };

  useEffect(() => {
    if (slug && productPriceBySlug?.store?.uid) {
      const values = {
        slug,
        storeIdInt: productPriceBySlug?.store?.uid,
        storeIdString: productPriceBySlug?.store?.uid?.toString(),
      };
      fpi.executeGQL(GET_PRODUCT_PROMOTIONS, values).then((res) => {
        setOffers({
          coupons: res.data?.coupons?.available_coupon_list || [],
          promotions: res.data?.promotions?.available_promotions || [],
        });
      });
    }
  }, [slug, productPriceBySlug?.store?.uid]);

  useEffect(() => {
    if (slug && (!isPdpSsrFetched || slug !== PRODUCT?.product_details?.slug)) {
      let sizeToSelect;
      setIsLoading(true);
      setIsPageLoading(true);
      setCurrentSize(null);
      setPincodeErrorMessage("");

      const values = { slug };
      if (size) {
        values.size = size;
      }
      const query = size ? PRODUCT_DETAILS_WITH_SIZE : GET_PRODUCT_DETAILS;
      fpi
        .executeGQL(query, values)
        .then((res) => {
          const product = res?.data?.product;
          if (
            product == null ||
            (typeof product === "object" && Object.keys(product).length === 0)
          ) {
            fpi.custom.setValue("isProductNotFound", true);
          } else {
            fpi.custom.setValue("isProductNotFound", false);
            fpi.custom.setValue(
              "productPromotions",
              res?.data?.promotions || {}
            );
            const productSizes = product?.sizes?.sizes || [];
            sizeToSelect = productSizes?.find((item) => item?.value === size);
            if (!sizeToSelect && productSizes.length > 0) {
              const isMto = product?.custom_order?.is_custom_order || false;
              const firstAvailableSize = productSizes.find(
                (sizeOption) => sizeOption.quantity > 0 || isMto
              );
              sizeToSelect = firstAvailableSize || productSizes[0];
            }
            if (sizeToSelect?.value) {
              setCurrentSize(sizeToSelect);
              if (sizeToSelect?.is_bundle_item) {
                fetchBundlesByChild({
                  size: sizeToSelect?.value,
                });
              } else {
                // Clear bundles when switching to non-bundle size
                setBundles([]);
              }
            }
            if (
              product.item_type === "virtual_bundle" ||
              product.item_type === "physical_bundle"
            ) {
              fpi
                .executeGQL(BUNDLE_ITEMS, { slug })
                .then(({ data, errors }) => {
                  if (data?.bundleItems?.items) {
                    setBundleProducts(data.bundleItems.items);
                  }
                })
                .catch((err) => {});
            }
          }
        })
        .catch(() => {
          fpi.custom.setValue("isProductNotFound", true);
        })
        .finally(() => {
          setIsLoading(false);
          setIsPageLoading(false);
        });
    }
    return () => {
      setBundles([]);
      setBundleProducts([]);
    };
  }, [slug, i18nDetails?.currency?.code]);

  useEffect(() => {
    const { size, bundles, bundleProducts } = ssrProductInfo || {};
    if (size) {
      setCurrentSize(size);
    }
    setBundles(bundles);
    setBundleProducts(bundleProducts);
  }, []);

  useEffect(() => {
    if (!isEmptyOrNull(product_price_with_fullfillment)) {
      const foItems = product_price_with_fullfillment?.items || [];

      const selectedFO =
        foItems.find((foItem) => foItem?.fulfillment_option?.is_default) ||
        foItems[0];

      setCurrentFO(selectedFO?.fulfillment_option || {});
      setFulfillmentOptions(foItems);

      setProductPriceBySlug(selectedFO || {});
    }
  }, [product_price_with_fullfillment]);

  useEffect(() => {
    if (fulfillmentOptions?.length && currentFO?.slug) {
      const currentProductPrice = fulfillmentOptions.find(
        (foItem) => foItem?.fulfillment_option?.slug === currentFO?.slug
      );

      setProductPriceBySlug(currentProductPrice);
    }
  }, [currentFO?.slug]);

  useEffect(() => {
    setFollowed(wishlistIds?.includes(product_details?.uid));
  }, [LoggedIn, wishlistIds, product_details]);

  const fetchProductPrice = (pincode = "") => {
    if (!currentSize?.value) return;
    const reqPincode = pincode || locationPincode;

    setIsLoadingPriceBySize(true);
    const payload = {
      slug,
      size: currentSize?.value.toString(),
      pincode: reqPincode.toString() || "",
    };
    fpi.executeGQL(FULFILLMENT_OPTIONS, payload).then((res) => {
      setIsLoadingPriceBySize(false);

      const foItems =
        res?.data?.productsPriceWithFulfillmentOption?.items || [];

      const selectedFO =
        foItems.find((foItem) => foItem?.fulfillment_option?.is_default) ||
        foItems[0];

      if (isEmptyOrNull(selectedFO)) {
        setPincodeErrorMessage(
          res?.errors?.[0]?.message ||
            t("resource.product.product_not_serviceable")
        );
      } else {
        setSelectPincodeError(false);
        setPincodeErrorMessage("");
      }
    });
  };

  useEffect(() => {
    if (
      Object.keys?.(PRODUCT?.product_details)?.length &&
      slug === PRODUCT?.product_details?.slug
    ) {
      fetchProductPrice();
    }
  }, [
    slug,
    PRODUCT?.product_details?.slug,
    currentSize?.value,
    locationDetails?.pincode,
    i18nDetails?.currency?.code,
  ]);

  function addToWishList(event) {
    if (event) {
      event.stopPropagation();
    }
    if (!LoggedIn) {
      showSnackbar(t("resource.auth.login.please_login_first"));
      navigate("/auth/login");
      return;
    }
    const values = {
      collectionType: "products",
      collectionId: product_details?.uid?.toString(),
    };
    fpi.executeGQL(ADD_WISHLIST, values).then((OutRes) => {
      if (OutRes?.data?.followById?.message) {
        fpi.executeGQL(FOLLOWED_PRODUCTS_IDS, null).then((res) => {
          showSnackbar(t("resource.common.wishlist_add_success"), "success");
        });
      }
    });
  }

  function removeFromWishlist(event) {
    if (event) {
      event.stopPropagation();
    }
    const values = {
      collectionType: "products",
      collectionId: product_details?.uid?.toString(),
    };
    fpi.executeGQL(REMOVE_WISHLIST, values).then((OutRes) => {
      if (OutRes?.data?.unfollowById?.message) {
        fpi.executeGQL(FOLLOWED_PRODUCTS_IDS, null).then((res) => {
          showSnackbar(t("resource.common.wishlist_remove_success"), "success");
        });
      }
    });
  }

  const checkPincode = (postCode) => {
    fpi
      .executeGQL(LOCALITY, {
        locality: `pincode`,
        localityValue: `${postCode}`,
      })
      .then(({ data, errors }) => {
        if (errors) {
          setPincodeErrorMessage(
            errors?.[0]?.message ||
              t("resource.common.address.pincode_verification_failure")
          );
        }
        if (data?.locality && postCode === locationPincode) {
          fetchProductPrice(postCode);
        }
      });
  };

  function getQty() {
    const moq = product_details?.moq || false;

    // const availableQty = currentSize?.quantity;
    if (moq) {
      return moq?.minimum ?? 1;
    }
  }

  const getProductSellers = (
    listingStrategy = "",
    fulfillmentOptionSlug = ""
  ) => {
    setIsSellerLoading(true);

    const values = {
      size: currentSize?.value.toString(),
      slug,
      strategy: listingStrategy,
      pageNo: 1,
      pageSize: 100,
      fulfillmentOptionSlug,
    };

    fpi
      .executeGQL(PRODUCT_SELLERS, values)
      .then((res) => {
        setAllStoresInfo(res.data?.productSellers || {});
      })
      .finally(() => {
        setIsSellerLoading(false);
      });
  };

  function addProductForCheckout(
    event,
    size,
    buyNow = false,
    itemDetails = productPriceBySlug
  ) {
    if (event) {
      event.stopPropagation();
    }
    if (!order?.enabled) {
      showSnackbar(
        translateDynamicLabel(order?.message, t) ||
          t("resource.common.order_not_accepting"),
        "error"
      );

      return;
    }
    if (isLoadingPriceBySize) {
      return;
    }
    if (mandatory_pincode?.value && !isValidDeliveryLocation) {
      if (isServiceabilityPincodeOnly) {
        setSelectPincodeError(true);
        setPincodeErrorMessage("");
      } else if (isServiceability) {
        fpi.custom.setValue("isServiceabilityModalOpen", true);
      } else {
        fpi.custom.setValue("isI18ModalOpen", true);
      }
      showSnackbar(t("resource.product.enter_valid_location"), "error");
      return;
    }
    if (!size) {
      showSnackbar(t("resource.product.select_size_first"), "error");
      return;
    }
    if (itemDetails !== null) {
      const payload = {
        buyNow,
        areaCode: locationPincode.toString(),
        addCartRequestInput: {
          items: [
            {
              article_assignment: {
                level: `${itemDetails?.article_assignment?.level}`,
                strategy: `${itemDetails?.article_assignment?.strategy}`,
              },
              article_id: itemDetails?.article_id?.toString(),
              item_id: product_details?.uid,
              item_size: size?.toString(),
              quantity: getQty(),
              seller_id: itemDetails?.seller?.uid,
              store_id: itemDetails?.store?.uid,
              fulfillment_option_slug: currentFO?.slug || "",
            },
          ],
        },
      };
      return fpi.executeGQL(ADD_TO_CART, payload).then((outRes) => {
        if (outRes?.data?.addItemsToCart?.success) {
          // fpi.executeGQL(CART_ITEMS_COUNT, null).then((res) => {
          if (!buyNow) {
            fetchCartDetails(fpi);
          }
          showSnackbar(
            translateDynamicLabel(outRes?.data?.addItemsToCart?.message, t) ||
              t("resource.common.add_to_cart_success"),
            "success"
          );
          if (buyNow) {
            navigate(
              `/cart/checkout/?buy_now=true&id=${outRes?.data?.addItemsToCart?.cart?.id}`
            );
          }
          // });
        } else {
          const errorMessage =
            translateDynamicLabel(outRes?.errors?.[0]?.message, t) ||
            t("resource.common.add_cart_failure");
          showSnackbar(errorMessage, "error");
        }
        return outRes;
      });
    }
  }

  const moq = product_details?.moq;
  const incrementDecrementUnit = moq?.increment_unit ?? 1;
  const maxCartQuantity = Math.min(
    moq?.maximum || Number.POSITIVE_INFINITY,
    currentSize?.quantity || 0
  );
  const minCartQuantity = moq?.minimum || 1;

  return {
    isProductDataLoading,
    productDetails: product_details || {},
    productMeta: product_meta?.sizes || {},
    productPriceBySlug,
    setProductPriceBySlug,
    currentImageIndex,
    currentSize,
    pincode: locationPincode,
    coupons: offers?.coupons || [],
    promotions: offers?.promotions || [],
    isLoading,
    isPageLoading,
    isLoadingPriceBySize,
    followed,
    selectPincodeError,
    pincodeErrorMessage,
    buybox,
    pincodeInput,
    isCountryDetailsLoading,
    isValidDeliveryLocation,
    deliveryLocation: deliveryLocation.join(", "),
    isServiceabilityPincodeOnly,
    setCurrentSize,
    setCurrentImageIndex,
    addToWishList,
    removeFromWishlist,
    addProductForCheckout,
    checkPincode,
    setPincodeErrorMessage,
    isI18ModalOpen,
    incrementDecrementUnit,
    maxCartQuantity,
    minCartQuantity,
    allStoresInfo,
    getProductSellers,
    isSellerLoading,
    currentFO,
    setCurrentFO,
    fulfillmentOptions,
    setFulfillmentOptions,
    availableFOCount: fulfillment_option?.count || 1,
    bundleProducts,
    isBundlesLoading,
    bundles,
    setBundles,
    fetchBundlesByChild,
  };
};

export default useProductDescription;
