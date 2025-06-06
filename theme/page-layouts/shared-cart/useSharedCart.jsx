import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSnackbar } from "../../helper/hooks";
import {
  SHARED_CART_DETAILS,
  UPDATE_CART_WITH_SHARED_ITEMS,
} from "../../queries/sharedCartQuery";
import { CART_ITEMS_COUNT } from "../../queries/wishlistQuery";
import { useNavigate, useGlobalTranslation } from "fdk-core/utils";

const useSharedCart = (fpi) => {
  const { t } = useGlobalTranslation("translation");
  const [cartItemCount, setCartItemCount] = useState(0);
  const params = useParams();
  const token = useRef(params.token);
  const [sharedCart, setSharedCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);

    const payload = {
      token: token?.current?.toString(),
    };

    fpi
      .executeGQL(SHARED_CART_DETAILS, payload)
      .then((res) => {
        setSharedCart(res?.data?.sharedCartDetails?.cart);
      })
      .finally(() => {
        setIsLoading(false);
      });
    fpi
      .executeGQL(CART_ITEMS_COUNT, null, { skipStoreUpdate: false })
      .then((res) =>
        setCartItemCount(res?.data?.cart?.user_cart_items_count ?? 0)
      );
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
            res?.errors?.message || t('resource.cart.failed_to_action_cart', { action: action }),
            "error"
          );
        } else {
          showSnackbar(
            successInfo ?? t('resource.cart.cart_action_successful', { action: action }),
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
