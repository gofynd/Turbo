import { useEffect, useState, useMemo } from "react";
import useInternational from "../../../components/header/useInternational";
import {
  ADD_TO_CART,
  CHECK_PINCODE,
  GET_PRODUCT_DETAILS,
  OFFERS,
  PRODUCT_SIZE_PRICE,
  PRODUCT_SELLERS,
} from "../../../queries/pdpQuery";
import useHeader from "../../../components/header/useHeader";
import {
  ADD_WISHLIST,
  CART_ITEMS_COUNT,
  FOLLOWED_PRODUCTS_IDS,
  REMOVE_WISHLIST,
} from "../../../queries/wishlistQuery";
import { useSnackbar, usePincodeInput } from "../../../helper/hooks";
import { LOCALITY } from "../../../queries/logisticsQuery";
import { isEmptyOrNull } from "../../../helper/utils";
import { fetchCartDetails } from "../../cart/useCart";
import {
  useGlobalStore,
  useNavigate,
  useGlobalTranslation,
} from "fdk-core/utils";

const useProductDescription = ({ fpi, slug, props }) => {
  const { t } = useGlobalTranslation("translation");
  const { mandatory_pincode } = props;
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const PRODUCT = useGlobalStore(fpi.getters.PRODUCT);
  const LoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const COUPONS = useGlobalStore(fpi.getters.COUPONS);
  // const PROMOTION_OFFERS = useGlobalStore(fpi.getters.PROMOTION_OFFERS); // Currently not storing offers on PDP, using custom store for now
  const { isPdpSsrFetched, isI18ModalOpen, productPromotions } = useGlobalStore(
    fpi?.getters?.CUSTOM_VALUE
  );
  const { buybox } = useGlobalStore(fpi.getters.APP_FEATURES);

  const {
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
  const [coupons, setCoupons] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [allStoresInfo, setAllStoresInfo] = useState({});
  const [selectPincodeError, setSelectPincodeError] = useState(false);
  const [pincodeErrorMessage, setPincodeErrorMessage] = useState("");
  const { product_details, product_meta, product_price_by_slug } = PRODUCT;
  const { sizes, loading: productMetaLoading } = product_meta || {};
  const { loading: productDetailsLoading } = product_details || {};
  const [isPageLoading, setIsPageLoading] = useState(!isPdpSsrFetched);

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
  
  useEffect(() => {
    if (slug && (!isPdpSsrFetched || slug !== PRODUCT?.product_details?.slug)) {
      setIsLoading(true);
      const values = { slug };
      fpi
        .executeGQL(GET_PRODUCT_DETAILS, values)
        .then((res) => {
          if (res) {
            fpi.custom.setValue("isProductNotFound", false);
            fpi.custom.setValue(
              "productPromotions",
              res?.data?.promotions || {}
            );
          }
          if (res?.errors && res?.errors?.length) {
            fpi.custom.setValue("isProductNotFound", true);
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
  }, [slug, i18nDetails?.currency?.code]);

  useEffect(() => {
    fpi.custom.setValue("isPdpSsrFetched", false);
  }, []);

  useEffect(() => {
    setFollowed(wishlistIds?.includes(product_details?.uid));
  }, [LoggedIn, wishlistIds, product_details]);

  const updateIntlLocation = () => {
    // console.log("update country");
  };

  const fetchProductPrice = (pincode = "") => {
    if (!currentSize) return;
    const reqPincode = pincode || locationPincode;

    setIsLoadingPriceBySize(true);
    const payload = {
      slug,
      size: currentSize?.value.toString(),
      pincode: reqPincode.toString() || "",
    };
    fpi.executeGQL(PRODUCT_SIZE_PRICE, payload).then((res) => {
      setIsLoadingPriceBySize(false);
      if (isEmptyOrNull(res.data.productPrice) && isValidDeliveryLocation) {
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
    locationDetails,
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
          showSnackbar(t("resource.common.wishlist_add_success"), "success");
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
            errors?.[0]?.message || t("resource.common.address.pincode_verification_failure")
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

  const getProductSellers = (listingStrategy = "") => {
    setIsSellerLoading(true);

    const values = {
      size: currentSize?.value.toString(),
      slug,
      strategy: listingStrategy,
      pageNo: 1,
      pageSize: 100,
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
    itemDetails = product_price_by_slug
  ) {
    if (event) {
      event.stopPropagation();
    }
    if (isLoadingPriceBySize) {
      return;
    }
    if (mandatory_pincode?.value && !isValidDeliveryLocation) {
      if (isServiceabilityPincodeOnly) {
        setSelectPincodeError(true);
        setPincodeErrorMessage("");
        showSnackbar(
          t("resource.product.before_cart_validate_pincode", { displayName: pincodeInput.displayName }), "error"
        );
      } else {
        showSnackbar(t("resource.product.select_valid_delivery_location"), "error");
        fpi.custom.setValue("isI18ModalOpen", true);
      }
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
            outRes?.data?.addItemsToCart?.message || t("resource.common.add_to_cart_success"),
            "success"
          );
          if (buyNow) {
            navigate(
              `/cart/checkout/?buy_now=true&id=${outRes?.data?.addItemsToCart?.cart?.id}`
            );
          }
          // });
        } else {
          showSnackbar(
            outRes?.data?.addItemsToCart?.message || t("resource.common.add_cart_failure"),
            "error"
          );
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
    productDetails: product_details || {},
    productMeta: product_meta?.sizes || {},
    productPriceBySlug: product_price_by_slug || null,
    currentImageIndex,
    currentSize,
    pincode: locationPincode,
    coupons: COUPONS?.available_coupon_list || [],
    promotions: productPromotions?.available_promotions || [],
    isLoading,
    isPageLoading,
    isLoadingPriceBySize,
    followed,
    selectPincodeError,
    pincodeErrorMessage,
    buybox,
    pincodeInput,
    isValidDeliveryLocation,
    deliveryLocation: deliveryLocation.join(", "),
    isServiceabilityPincodeOnly,
    updateIntlLocation,
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
  };
};

export default useProductDescription;
