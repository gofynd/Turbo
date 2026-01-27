import { useState, useMemo, useRef } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import {
  ADD_WISHLIST,
  REMOVE_WISHLIST,
  FOLLOWED_PRODUCTS_ID,
} from "../../queries/wishlistQuery";
import { useSnackbar } from "./hooks";
import { WISHLIST_PAGE_SIZE } from "../constant";

export const useWishlist = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const [isLoading, setIsLoading] = useState(false);
  const pageSizeRef = useRef(WISHLIST_PAGE_SIZE);
  const followedList = useGlobalStore(fpi.getters.FOLLOWED_LIST);
  const { showSnackbar } = useSnackbar();

  function fetchFollowedProductsId() {
    const payload = {
      collectionType: "products",
      pageSize: pageSizeRef.current,
    };
    return fpi.executeGQL(FOLLOWED_PRODUCTS_ID, payload).then((res) => {
      return res;
    });
  }

  function addToWishList(product) {
    setIsLoading(true);
    const payload = {
      collectionType: "products",
      collectionId: product?.uid?.toString(),
    };
    return fpi
      .executeGQL(ADD_WISHLIST, payload)
      .then((res) => {
        if (res?.data?.followById?.message) {
          showSnackbar(t("resource.common.wishlist_add_success"), "success");
          return fetchFollowedProductsId().then(() => res?.data?.followById);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function removeFromWishlist(product, fromWishlist = false) {
    setIsLoading(true);
    const payload = {
      collectionType: "products",
      collectionId: product?.uid?.toString(),
    };
    if (fromWishlist) {
      return fpi.executeGQL(REMOVE_WISHLIST, payload).finally(() => {
        setIsLoading(false);
        showSnackbar(t("resource.wishlist.product_removed"), "success");
      });
    } else {
      return fpi
        .executeGQL(REMOVE_WISHLIST, payload)
        .then((res) => {
          if (res?.data?.unfollowById?.message) {
            showSnackbar(t("resource.wishlist.product_removed"), "success");
            return fetchFollowedProductsId().then(
              () => res?.data?.unfollowById
            );
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }

  function toggleWishlist({ product, isFollowed }) {
    if (isLoading) {
      return;
    }
    if (isFollowed) {
      removeFromWishlist(product);
    } else {
      addToWishList(product);
    }
  }

  const followedIdList = useMemo(() => {
    return followedList?.items?.map((item) => item.uid) || [];
  }, [followedList]);

  return {
    isLoading,
    followedIdList,
    followedCount: followedList?.page?.item_total || 0,
    addToWishList,
    removeFromWishlist,
    toggleWishlist,
  };
};
