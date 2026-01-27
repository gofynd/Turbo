import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSnackbar } from "../../helper/hooks";
import {
  SHARED_CART_DETAILS,
  UPDATE_CART_WITH_SHARED_ITEMS,
} from "../../queries/sharedCartQuery";
import { CART_ITEMS_COUNT } from "../../queries/wishlistQuery";
import { useNavigate, useGlobalTranslation } from "fdk-core/utils";
import { isRunningOnClient } from "../../helper/utils";

// Module-level cache to prevent duplicate API calls
let sharedCartCache = null;
let cacheToken = null;

const useSharedCart = (fpi) => {
  const { t } = useGlobalTranslation("translation");
  const [cartItemCount, setCartItemCount] = useState(0);
  const params = useParams();
  const token = useRef(params.token);
  const [sharedCart, setSharedCart] = useState(sharedCartCache);
  const [isLoading, setIsLoading] = useState(!sharedCartCache || cacheToken !== token?.current);
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    // If data is already cached for this token, use it
    if (sharedCartCache && cacheToken === token?.current) {
      setSharedCart(sharedCartCache);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const payload = {
      token: token?.current?.toString(),
    };

    // Execute both queries and wait for both to complete
    const sharedCartPromise = fpi
      .executeGQL(SHARED_CART_DETAILS, payload)
      .then((res) => {
        const cartData = res?.data?.sharedCartDetails?.cart;
        setSharedCart(cartData);
        // Cache the data
        sharedCartCache = cartData;
        cacheToken = token?.current;
        
        const metaData = cartData?.shared_cart_details?.meta;

        // Parse meta if it's a JSON string, otherwise use as-is
        let parsedMeta = metaData;
        if (typeof metaData === "string") {
          try {
            parsedMeta = JSON.parse(metaData);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn(
              "Failed to parse shared_cart_details.meta as JSON:",
              e
            );
            parsedMeta = metaData;
          }
        }

        // Store the parsed meta data
        if (parsedMeta) {
          fpi.custom.setValue("shared_cart_staff_data", parsedMeta);
          // Persist to sessionStorage to survive page refreshes
          if (isRunningOnClient()) {
            try {
              sessionStorage.setItem(
                "shared_cart_staff_data",
                JSON.stringify(parsedMeta)
              );
            } catch (error) {
              // Silently fail if sessionStorage is unavailable
            }
          }
        }
      });

    const cartCountPromise = fpi
      .executeGQL(CART_ITEMS_COUNT, null, { skipStoreUpdate: false })
      .then((res) =>
        setCartItemCount(res?.data?.cart?.user_cart_items_count ?? 0)
      );

    // Wait for both queries to complete before hiding loader
    Promise.all([sharedCartPromise, cartCountPromise]).finally(() => {
      setIsLoading(false);
    });
  }, [fpi]);

  const bagItems = useMemo(() => {
    if (sharedCart && sharedCart?.items) {
      const allItems = sharedCart.items.map((item, index) => ({
        ...item,
        item_index: index,
      }));
      // return allItems;
      /* eslint no-param-reassign: "error" */
      const grpBySameSellerAndProduct = allItems.reduce((result, item) => {
        result[
          `${item.article.seller.uid}${item.article.store.uid}${item.product.uid}`
        ] = (
          result[
            `${item.article.seller.uid}${item.article.store.uid}${item.product.uid}`
          ] || []
        ).concat(item);
        return result;
      }, []);

      const updateArr = [];
      Object.entries(grpBySameSellerAndProduct).forEach(([key, value]) => {
        updateArr.push({
          item: value[0],
          articles: value,
        });
      });
      return updateArr;
    }
    return [];
  }, [sharedCart]);

  const showReplaceBtn = useMemo(() => {
    return cartItemCount > 0;
  }, [cartItemCount]);

  const updateCartWithSharedItem = (action, successInfo = null) => {
    try {
      const payload = {
        action,
        token: token?.current?.toString(),
      };
      fpi.executeGQL(UPDATE_CART_WITH_SHARED_ITEMS, payload).then((res) => {
        if (res?.errors) {
          showSnackbar(
            res?.errors?.message ||
              t("resource.cart.failed_to_action_cart", {
                action: t(`resource.cart.${action}`),
              }),
            "error"
          );
        } else {
          // Clear the cache when cart is updated
          sharedCartCache = null;
          cacheToken = null;
          // Note: shared_cart_staff_data is already stored in CUSTOM_VALUE store
          // and will persist automatically. No need to manually preserve it here.
          showSnackbar(
            successInfo ??
              t("resource.cart.cart_action_successful", {
                action: t(`resource.cart.${action}`),
              }),
            "success"
          );
          navigate("/cart/bag/");
        }
      });
    } catch (err) {
      showSnackbar(err?.message || t("resource.common.error_message"), "error");
    }
  };

  const onAddToBagClick = () => {
    const info = t("resource.cart.cart_item_addition_success");
    updateCartWithSharedItem("merge", info);
  };
  const onMergeBagClick = () => {
    updateCartWithSharedItem("merge");
  };
  const onReplaceBagClick = () => {
    updateCartWithSharedItem("replace");
  };

  return {
    sharedCartData: sharedCart,
    bagItems,
    showReplaceBtn,
    onMergeBagClick,
    onAddToBagClick,
    onReplaceBagClick,
    isLoading,
  };
};

export default useSharedCart;
