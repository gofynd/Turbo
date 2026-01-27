import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CART_DETAILS,
  CART_UPDATE,
  CART_META_UPDATE,
  APPLY_REWARD_POINTS,
} from "../../queries/cartQuery";
import { useAccounts, useWishlist, useSnackbar } from "../../helper/hooks";
import useInternational from "../../components/header/useInternational";
import useHeader from "../../components/header/useHeader";
import {
  FULFILLMENT_OPTIONS,
  PRODUCT_SIZE_PRICE,
} from "../../queries/pdpQuery";
import {
  useGlobalStore,
  useNavigate,
  useGlobalTranslation,
} from "fdk-core/utils";
import { translateDynamicLabel } from "../../helper/utils";

/**
 * Generates a consistent key for cart items to ensure reliable item identification
 * @param {Object} item - The cart item object
 * @param {number} index - The array index as fallback
 * @returns {string} A unique key for the cart item
 */
function generateCartItemKey(item, index = 0) {
  const itemIndex = item?.article?.item_index ?? index;
  const storeUid = item?.article?.store?.uid ?? "";
  
  // Primary: Use the key from API if available
  if (item?.key) {
    return `${item.key}_${storeUid}_${itemIndex}`;
  }
  
  // Fallback: Construct key from product and article data
  if (item?.product?.uid && item?.article?.size) {
    const fulfillmentSlug = item?.article?.fulfillment_option?.slug || "standard-delivery";
    const fallbackKey = `${item.product.uid}_${item.article.size}_${fulfillmentSlug}`;
    return `${fallbackKey}_${storeUid}_${itemIndex}`;
  }
  
  // Last resort: Use index-based key to ensure item is always included
  return `item_${index}_${storeUid}_${itemIndex}`;
}

export function fetchCartDetails(fpi, payload = {}) {
  const defaultPayload = {
    buyNow: false,
    includeAllItems: true,
    includeBreakup: true,
    ...payload,
  };
  return fpi?.executeGQL?.(CART_DETAILS, defaultPayload);
}

const useCart = (fpi, isActive = true) => {
  const { t } = useGlobalTranslation("translation");
  const [searchParams] = useSearchParams();
  const CART = useGlobalStore(fpi.getters.CART);
  const appFeatures = useGlobalStore(fpi.getters.APP_FEATURES);
  const buybox = appFeatures?.buybox;
  const { i18nDetails, countryDetails, deliveryLocationStr } = useInternational(
    { fpi }
  );
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const { sections = [] } = page || {};
  const { cartItemCount } = useHeader(fpi);
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { selectedAddress } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE) || {};
  const [isLoading, setIsLoading] = useState(true);
  const [isCartUpdating, setIsCartUpdating] = useState(false);
  const [modeLoading, setIsModeLoading] = useState(false);
  const [applyRewardResponse, setApplyRewardResponse] = useState(null);
  const [currentCartId, setCurrentCartId] = useState(null); 
  const [isRewardApplied, setIsRewardApplied] = useState(false); // ← NEW
  


  const { buy_now_cart_items, cart_items, cart_items_count } = CART || {};
  const {
    breakup_values,
    loading: cartItemsLoading,
    items,
    id: cartId,
  } = cart_items || {};
  const { loading: buyNowCartItemsLoading } = buy_now_cart_items || {};
  const { loading: cartItemsCountLoading } = cart_items_count || {};
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [customerCheckoutMode, setCustomerCheckoutMode] = useState("");

  const { openLogin } = useAccounts({ fpi });
  const { addToWishList } = useWishlist({ fpi });

  const buyNow = JSON.parse(searchParams?.get("buy_now") || "false");

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const hasRightPanelCartItemsSection = sections
      ?.filter((section) => section.canvas === "right_panel")
      ?.some(({ name }) => name === "cart-items");

    if (!hasRightPanelCartItemsSection) {
      return;
    }

    const element = document.getElementById("cart-landing-right-panel");
    if (!element) {
      return;
    }

    const shouldHideRightPanel = cart_items?.items?.length === 0;

    // Hide right panel only while cart is truly empty, and re-show it once items are loaded.
    // This prevents the panel from staying hidden when cart data arrives slightly later
    // (e.g., in incognito or slower environments).
    element.style.display = shouldHideRightPanel ? "none" : "";
  }, [sections, cart_items]);

  useEffect(() => {
    if (isActive) {
      // Only show full loading state on initial load (no cart items yet)
      // For subsequent refetches (e.g., after pincode change), keep showing existing cart
      // This prevents the "flash of empty cart" issue after login
      const hasExistingCartData = items && items.length > 0;
      if (!hasExistingCartData) {
        setIsLoading(true);
      }
      fetchCartDetails(fpi, { buyNow }).then(() => setIsLoading(false));
    }
  }, [fpi, i18nDetails?.currency?.code, deliveryLocationStr]);

  const isAnonymous = appFeatures?.landing_page?.continue_as_guest;
  const isGstInput =
    appFeatures?.cart?.gst_input && countryDetails?.iso2 === "IN";
  // disabling isPlacingForCustomer feature now as flow is not decided yet, please remove && false once need to be enabled.
  const isPlacingForCustomer = appFeatures?.cart?.placing_for_customer;
  const checkoutMode = cart_items?.checkout_mode ?? "";

  useEffect(() => {
    setCustomerCheckoutMode(checkoutMode);
  }, [cart_items]);

  useEffect(() => {
    if (cartId && cartId !== currentCartId) {
      setCurrentCartId(cartId);
      setIsRewardApplied(false);
      localStorage.removeItem(`loyaltyToastShown_${cartId}`);
    }
  }, [cartId]);

  const cartItemsByItemId = useMemo(() => {
    if (!items || items.length === 0) {
      return {};
    }

    const cartItemsObj = {};
    items.forEach((singleItem, index) => {
      const finalKey = generateCartItemKey(singleItem, index);
      cartItemsObj[finalKey] = singleItem;
    });

    return cartItemsObj;
  }, [items]);

  const isOutOfStock = useMemo(() => {
    const outofstock = items?.find(
      (item) => item?.availability?.out_of_stock === true
    );
    return !!outofstock;
  }, [items]);

  const isNotServicable = useMemo(() => {
    const notservicable = items?.find(
      (item) => item?.availability?.deliverable === false
    );
    return !!notservicable;
  }, [items]);

  const currencySymbol = useMemo(
    () => cart_items?.currency?.symbol || "₹",
    [cart_items]
  );
   
  
  const onApplyLoyaltyPoints = async (isChecked, showToast = true) => {
    setIsLoyaltyLoading(true);
    setIsCartUpdating(true);
  
    const payload = {
      includeItems: true,
      includeBreakup: true,
      cartId: cartId,
      redeemPoints: { redeem_points: isChecked },
    };
  
    try {
      const res = await fpi.executeGQL(APPLY_REWARD_POINTS, payload, {
        skipStoreUpdate: false,
      });
  
      const data = res?.data?.applyLoyaltyPoints;
      setApplyRewardResponse(data);
  
      if (data?.success) {
        setIsRewardApplied(isChecked);
  
        const toastKey = `loyaltyToastShown_${cartId}`;
  
        if (isChecked) {
          if (showToast && !localStorage.getItem(toastKey)) {
            showSnackbar(data.message || "Reward points applied successfully", "success");
            localStorage.setItem(toastKey, "true");
          }
        } else {
          if (showToast) {
            showSnackbar("Reward points removed", "success");
          }
          localStorage.removeItem(toastKey);
        }
  
        await fetchCartDetails(fpi);
      } else {
        let errorMsg = "Could not update reward points";
        if (Array.isArray(res?.errors) && res.errors.length > 0) {
          errorMsg = res.errors[0]?.message || errorMsg;
        } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
          errorMsg = data.errors[0]?.message || errorMsg;
        }
        showSnackbar(errorMsg, "error");
      }
    } catch (err) {
      console.error("ApplyRewardPoints error", err);
      showSnackbar("Something went wrong", "error");
    } finally {
      setIsCartUpdating(false);
      setIsLoyaltyLoading(false);
    }
  };
  
  
  function updateCartItems(
    event,
    itemDetails,
    itemSize,
    totalQuantity,
    itemIndex,
    operation,
    moveToWishList = false,
    isSizeUpdate = false,
    foSlug = ""
  ) {
    if (event) {
      event.stopPropagation();
    }
    setIsCartUpdating(true);
  
    try {
      const payload = {
        b: true,
        i: true,
        buyNow,
        updateCartRequestInput: {
          items: [
            {
              article_id: `${itemDetails?.product?.uid}_${itemSize}`,
              item_id: itemDetails?.product?.uid,
              item_size: itemSize,
              item_index: itemIndex,
              quantity: totalQuantity,
              identifiers: {
                identifier: itemDetails?.identifiers?.identifier,
              },
              fulfillment_option_slug:
                foSlug || itemDetails?.article?.fulfillment_option?.slug,
            },
          ],
          operation,
        },
      };
  
      return fpi
        .executeGQL(CART_UPDATE, payload, { skipStoreUpdate: false })
        .then((res) => {
          return res;
        })
        .then(async (res) => {
          const updateResponse = res?.data?.updateCart;

          if (updateResponse?.success) {
            if (!moveToWishList) {
              showSnackbar(
                translateDynamicLabel(updateResponse?.message, t) ||
                  t("resource.cart.cart_update_success"),
                "success"
              );
            }
        
            await fetchCartDetails(fpi, { buyNow });

            if (isRewardApplied) {
              await onApplyLoyaltyPoints(true, false); 
            }
        
          } else if (!isSizeUpdate) {
            showSnackbar(
              translateDynamicLabel(updateResponse?.message, t) ||
                t("resource.cart.cart_update_success"),
              "error"
            );
          }

          return updateResponse;
        })
        
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsCartUpdating(false);
        });
    } catch (error) {
      console.log(error);
      setIsCartUpdating(false);
    }
  }
  
  function gotoCheckout() {
    if (cart_items?.id) {
      // Get selected address ID from global store if available
      // This is updated when address is applied via applyAddressToCart
      const addressId = selectedAddress?.id || cart_items?.address_id || "";
      const checkoutUrl = `/cart/checkout?id=${cart_items.id}${addressId ? `&address_id=${addressId}` : ""}`;
      navigate(checkoutUrl);
    } else {
      navigate("/cart/bag");
    }
  }

  function openRemoveModal() {
    setIsRemoveModalOpen(true);
  }

  function closeRemoveModal() {
    setIsRemoveModalOpen(false);
    setIsRemoving(false);
  }

  function handleRemoveItem(data, moveToWishList) {
    if (!data) {
      return;
    }
    const { item, size, index } = data;

    // Set removing state to show "Removing..." text and trigger shimmer immediately
    setIsRemoving(true);

    // Close modal after brief delay to show "Removing..." text
    setTimeout(() => {
      closeRemoveModal();

      // Start API call in background
      // Note: updateCartItems will set isCartUpdating to true again, but it's already true
      // This ensures shimmer stays visible throughout the API call
      updateCartItems(
        null,
        item,
        size,
        0,
        index,
        "remove_item",
        moveToWishList
      ).finally(() => {
        setIsRemoving(false);
        setIsCartUpdating(true);
        // isCartUpdating will be reset by updateCartItems in its finally block
      });
    }, 150); // 150ms delay to show "Removing..." text
  }
  const handleMoveToWishlist = (data) => {
    if (!data) {
      return;
    }

    if (isLoggedIn) {
      addToWishList(data.item.product).then(() => {
        handleRemoveItem(data, true);
      });
    } else {
      closeRemoveModal();
      openLogin();
    }
  };

  const [isLoyaltyLoading, setIsLoyaltyLoading] = useState(false);



  function onOpenPromoModal() {
    setIsPromoModalOpen(true);
  }
  function onClosePromoModal(e) {
    setIsPromoModalOpen(false);
  }

  function onPriceDetailsClick() {
    const element = document.getElementById("price-breakup-container-id");
    if (element) {
      element.scrollIntoView?.({
        behavior: "smooth",
        block: "center",
      });
    }
  }

  const updateCartCheckoutMode = async (mode) => {
    const checkout_mode =
      mode || (customerCheckoutMode === "other" ? "self" : "other");
    const payload = {
      cartMetaRequestInput: {
        checkout_mode,
      },
      buyNow,
    };
    setCustomerCheckoutMode(checkout_mode);
    await fpi.executeGQL(CART_META_UPDATE, payload);
    fetchCartDetails(fpi, { buyNow });
  };

  const getFulfillmentOptions = async (slug, selectedSize, pincode) => {
    const values = {
      slug,
      size: selectedSize,
      pincode: pincode?.toString() || "",
    };

    const res = await fpi.executeGQL(FULFILLMENT_OPTIONS, values);

    return res?.data?.productsPriceWithFulfillmentOption?.items || [];
  };

  const fetchProductPrice = async (slug, selectedSize, pincode, foSlug) => {
    const payload = {
      slug,
      size: selectedSize,
      pincode: pincode.toString() || "",
      fulfillmentOptionSlug: foSlug || "",
    };

    const res = await fpi.executeGQL(PRODUCT_SIZE_PRICE, payload, {
      skipStoreUpdate: true,
    });

    return res?.data?.productPrice || {};
  };

  return {
    onApplyLoyaltyPoints,
    isLoyaltyLoading,
    isLoading,
    isCartUpdating,
    isLoggedIn,
    cartData: cart_items,
    checkoutMode,
    cartItems: cartItemsByItemId,
    cartItemsWithActualIndex: items,
    breakUpValues: breakup_values,
    cartItemCount,
    currencySymbol,
    isAnonymous,
    isValid: cart_items?.is_valid,
    isNotServicable,
    isOutOfStock,
    isGstInput,
    isPlacingForCustomer,
    isRemoveModalOpen,
    isRemoving,
    isPromoModalOpen,
    buybox,
    applyRewardResponse,
    availableFOCount: appFeatures?.fulfillment_option?.count || 1,
    onUpdateCartItems: updateCartItems,
    onGotoCheckout: gotoCheckout,
    onRemoveIconClick: openRemoveModal,
    onRemoveButtonClick: handleRemoveItem,
    onWishlistButtonClick: handleMoveToWishlist,
    onCloseRemoveModalClick: closeRemoveModal,
    onPriceDetailsClick,
    updateCartCheckoutMode,
    onOpenPromoModal,
    onClosePromoModal,
    customerCheckoutMode,
    getFulfillmentOptions,
    fetchProductPrice,
  };
};

export default useCart;
