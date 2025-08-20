import React, { useCallback, useMemo, useState, useEffect } from "react";
import { GET_QUICK_VIEW_PRODUCT_DETAILS } from "../../queries/plpQuery";
import { FEATURE_PRODUCT_SIZE_PRICE } from "../../queries/featureProductQuery";
import {
  useGlobalStore,
  useGlobalTranslation,
  useNavigate,
} from "fdk-core/utils";
import { LOCALITY } from "../../queries/logisticsQuery";
import { ADD_TO_CART } from "../../queries/pdpQuery";
import useCart, { fetchCartDetails } from "../cart/useCart";
import { useSnackbar, useHyperlocalTat } from "../../helper/hooks";
import { isEmptyOrNull, translateDynamicLabel } from "../../helper/utils";

const useAddToCartModal = ({ fpi, pageConfig }) => {
  const { t } = useGlobalTranslation("translation");
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const pincodeDetails = useGlobalStore(fpi?.getters?.PINCODE_DETAILS);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState({
    product: {},
    productPrice: {},
  });
  const [slug, setSlug] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [currentPincode, setCurrentPincode] = useState(
    (pincodeDetails?.localityValue ?? locationDetails?.pincode) || ""
  );
  const [pincodeErrorMessage, setPincodeErrorMessage] = useState("");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { isHyperlocal } = useHyperlocalTat({ fpi });

  const { onUpdateCartItems, isCartUpdating, cartItems } = useCart(fpi, false);

  const isMto = useMemo(
    () => productData?.product?.custom_order?.is_custom_order || false,
    [productData?.product]
  );

  const fetchProductPrice = useCallback(
    async (size, productSlug) => {
      try {
        const productPriceData = await fpi.executeGQL(
          FEATURE_PRODUCT_SIZE_PRICE,
          {
            slug: productSlug || slug,
            pincode: currentPincode || "",
            size:
              size ||
              selectedSize ||
              productData?.product?.sizes?.sizes[0]?.value,
          },
          { skipStoreUpdate: false }
        );

        if (isEmptyOrNull(productPriceData.data.productPrice)) {
          setPincodeErrorMessage(
            productPriceData?.errors?.[0]?.message ||
              t("resource.product.product_not_serviceable")
          );
        } else {
          setPincodeErrorMessage("");
        }

        return productPriceData;
      } catch (error) {
        console.error(error);
      }
    },
    [slug, currentPincode, selectedSize, productData?.product, fpi]
  );

  const fetchProductData = useCallback(
    async (productSlug) => {
      try {
        const productDetails = await fpi.executeGQL(
          GET_QUICK_VIEW_PRODUCT_DETAILS,
          { slug: productSlug },
          { skipStoreUpdate: false }
        );

        const isSingleSize =
          productDetails?.data?.product?.sizes?.sizes?.length === 1;
        const isSizeCollapsed = pageConfig?.hide_single_size && isSingleSize;
        const preSelectFirstOfMany = pageConfig?.preselect_size;
        if (
          isSizeCollapsed ||
          (preSelectFirstOfMany &&
            productDetails?.data?.product?.sizes !== undefined)
        ) {
          const productPriceData = await fetchProductPrice(
            productDetails?.data?.product?.sizes?.sizes[0]?.value,
            productDetails?.data?.product?.slug
          );
          setSelectedSize(
            productDetails?.data?.product?.sizes?.sizes[0]?.value
          );
          setProductData({
            productPrice: productPriceData?.data?.productPrice || {},
            product: productDetails?.data?.product,
          });
        } else {
          setProductData({
            productPrice: {},
            product: productDetails?.data?.product,
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    [fetchProductPrice, fpi]
  );

  const handleAddToCart = useCallback(
    async (productSlug) => {
      setIsLoading(true);
      setSlug(productSlug);
      await fetchProductData(productSlug);
      setIsOpen(true);
      setIsLoading(false);
    },
    [fetchProductData]
  );

  const onSizeSelection = useCallback(
    async (sizeValue) => {
      const size = productData?.product?.sizes?.sizes?.find(
        (size) => size.value === sizeValue
      );
      if (size?.quantity === 0 && !isMto) {
        return;
      }
      setSelectedSize(sizeValue);
      setSizeError(false);

      const productPriceData = await fetchProductPrice(sizeValue);
      setProductData((prevData) => ({
        ...prevData,
        productPrice: productPriceData?.data?.productPrice || {},
      }));
    },
    [isMto, fetchProductPrice]
  );

  const handleClose = useCallback(() => {
    if (!showSizeGuide) {
      setIsOpen(false);
      setIsLoading(false);
      setProductData({ product: {}, productPrice: {} });
      setSelectedSize("");
      setPincodeErrorMessage("");
      setSlug("");
    }
  }, [showSizeGuide]);

  const checkPincode = useCallback(
    async (postCode, productSlug) => {
      try {
        const localityData = await fpi.executeGQL(LOCALITY, {
          locality: `pincode`,
          localityValue: `${postCode}`,
        });

        if (localityData?.data?.locality) {
          const productPriceData = await fetchProductPrice("", productSlug);

          setProductData((prevData) => ({
            ...prevData,
            productPrice: productPriceData?.data?.productPrice || {},
          }));
        } else {
          setPincodeErrorMessage(
            localityData?.errors?.[0]?.message ||
              t("resource.common.address.pincode_verification_failure")
          );
        }
      } catch (error) {
        console.error(error);
      }
    },
    [fetchProductPrice, fpi]
  );

  const handleSlugChange = useCallback(
    async (productSlug) => {
      setSlug(productSlug);
      setSelectedSize("");
      await fetchProductData(productSlug, true);
    },
    [fetchProductData, currentPincode, checkPincode]
  );

  const handleViewMore = useCallback(() => {
    navigate(`/product/${productData?.product?.slug}`);
  }, [navigate, productData]);

  const updatePincode = useCallback((code) => {
    setPincodeErrorMessage("");
    setCurrentPincode(code);
  }, []);

  const handleCloseSizeGuide = useCallback((event) => {
    event?.preventDefault();
    event?.stopPropagation();
    setShowSizeGuide(false);
  }, []);

  const handleShowSizeGuide = useCallback(() => {
    setShowSizeGuide(true);
  }, []);

  const addProductForCheckout = useCallback(
    async (event, size, buyNow = false) => {
      if (event) {
        event.stopPropagation();
      }

      if (
        pageConfig?.mandatory_pincode &&
        (currentPincode?.length !== 6 || pincodeErrorMessage.length)
      ) {
        setPincodeErrorMessage(t("resource.product.enter_valid_pincode"));
        return;
      }
      if (
        !pageConfig?.mandatory_pincode &&
        ((currentPincode?.length > 0 && currentPincode?.length < 6) ||
          pincodeErrorMessage.length)
      ) {
        setPincodeErrorMessage(t("resource.product.enter_valid_pincode"));
        return;
      }
      if (
        !pageConfig?.mandatory_pincode &&
        (!currentPincode?.length || currentPincode?.length === 6) &&
        !pincodeErrorMessage.length
      ) {
        setPincodeErrorMessage("");
      }

      if (!size) {
        setSizeError(true);
        return;
      }

      if (productData?.productPrice !== null) {
        let quantity = "";

        const moq = productData?.product?.moq || false;
        const availableQty = selectedSize?.quantity;
        if (moq) {
          quantity =
            availableQty > moq?.increment_unit
              ? moq?.increment_unit
              : (moq?.minimum ?? 1);
        }

        const payload = {
          buyNow,
          areaCode: currentPincode?.toString(),
          addCartRequestInput: {
            items: [
              {
                article_assignment: {
                  level: `${productData?.productPrice?.article_assignment?.level}`,
                  strategy: `${productData?.productPrice?.article_assignment?.strategy}`,
                },
                article_id: productData?.productPrice?.article_id?.toString(),
                item_id: productData?.product?.uid,
                item_size: size?.toString(),
                quantity,
                seller_id: productData?.productPrice?.seller?.uid,
                store_id: productData?.productPrice?.store?.uid,
              },
            ],
          },
        };

        return fpi.executeGQL(ADD_TO_CART, payload).then((outRes) => {
          if (outRes?.data?.addItemsToCart?.success) {
            if (!buyNow) fetchCartDetails(fpi);
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
          } else {
            showSnackbar(
              translateDynamicLabel(outRes?.data?.addItemsToCart?.message, t) ||
                t("resource.common.add_cart_failure"),
              "error"
            );
          }
          return outRes;
        });
      }
    },
    [
      pageConfig,
      currentPincode,
      pincodeErrorMessage,
      sizeError,
      productData,
      selectedSize,
      fpi,
      fetchCartDetails,
      showSnackbar,
      navigate,
    ]
  );

  const selectedItemDetails = useMemo(() => {
    let currentItemDetails = {};

    if (selectedSize) {
      const cartItemsKey = Object.keys(cartItems || {});
      const selectedItemKey = `${productData?.product?.uid}_${selectedSize}_standard-delivery_${productData?.productPrice?.store?.uid}`;

      cartItemsKey.some((item, index) => {
        const itemKeyWithoutItemIndex = item.substring(
          0,
          item.lastIndexOf("_")
        );

        if (itemKeyWithoutItemIndex === selectedItemKey) {
          currentItemDetails = { ...cartItems[item], itemIndex: index };
          return true;
        }

        return false;
      });
    }

    return currentItemDetails;
  }, [selectedSize, cartItems, productData]);

  const selectedSizeDetails = useMemo(() => {
    return productData?.product?.sizes?.sizes?.find(
      ({ value }) => selectedSize === value
    );
  }, [selectedSize]);

  const moq = productData?.product?.moq;
  const incrementDecrementUnit = moq?.increment_unit ?? 1;
  const minCartQuantity = moq?.minimum || 1;
  const maxCartQuantity = Math.min(
    moq?.maximum || Number.POSITIVE_INFINITY,
    selectedSizeDetails?.quantity || 0
  );

  const cartUpdateHandler = async (event, quantity, operation) => {
    let totalQuantity = (selectedItemDetails?.quantity || 0) + quantity;

    if (operation === "edit_item") {
      totalQuantity = quantity;
    }

    if (!isMto) {
      if (totalQuantity > maxCartQuantity) {
        totalQuantity = maxCartQuantity;
        showSnackbar(
          `${t("resource.product.max_quantity")} ${maxCartQuantity}.`,
          "error"
        );
      }

      if (totalQuantity < minCartQuantity) {
        if (operation === "edit_item") {
          totalQuantity = minCartQuantity;
          showSnackbar(
            `${t("resource.product.min_quantity")} ${minCartQuantity}.`,
            "error"
          );
        } else if (selectedItemDetails?.quantity > minCartQuantity) {
          totalQuantity = minCartQuantity;
        } else {
          totalQuantity = 0;
        }
      }
    }

    if (selectedItemDetails?.quantity !== totalQuantity) {
      onUpdateCartItems(
        event,
        selectedItemDetails,
        selectedSize,
        totalQuantity,
        selectedItemDetails?.itemIndex,
        "update_item"
      );
    }
  };

  useEffect(() => {
    setCurrentPincode(
      (pincodeDetails?.localityValue ?? locationDetails?.pincode) || ""
    );
  }, [pincodeDetails, locationDetails]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentPincode(
        (pincodeDetails?.localityValue ?? locationDetails?.pincode) || ""
      );
    }
  }, [isOpen]);

  return {
    isOpen,
    isLoading,
    productData,
    pageConfig,
    slug,
    selectedSize,
    showSizeGuide,
    sizeError,
    deliverInfoProps: useMemo(
      () => ({
        pincode: currentPincode,
        tat: productData?.productPrice?.delivery_promise,
        pincodeErrorMessage,
        setCurrentPincode: updatePincode,
        checkPincode,
        fpi,
        setPincodeErrorMessage,
      }),
      [
        currentPincode,
        productData?.productPrice,
        pincodeErrorMessage,
        updatePincode,
        checkPincode,
        fpi,
      ]
    ),
    selectedItemDetails,
    isCartUpdating,
    isHyperlocal,
    cartUpdateHandler,
    maxCartQuantity,
    incrementDecrementUnit,
    minCartQuantity,
    handleClose,
    handleAddToCart,
    handleSlugChange,
    onSizeSelection,
    addProductForCheckout,
    handleViewMore,
    handleCloseSizeGuide,
    handleShowSizeGuide,
  };
};

export default useAddToCartModal;
