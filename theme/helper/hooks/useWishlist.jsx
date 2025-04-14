import { useState, useMemo, useRef } from "react";
import { useGlobalStore } from "fdk-core/utils";
import {
  ADD_WISHLIST,
  REMOVE_WISHLIST,
  FOLLOWED_PRODUCTS_ID,
} from "../../queries/wishlistQuery";
import { useSnackbar } from "./hooks";

export const useWishlist = ({ fpi }) => {
  const [isLoading, setIsLoading] = useState(false);
  const pageSizeRef = useRef(500);
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
          showSnackbar("Product Added to wishlist", "success");
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
        showSnackbar("Product Removed From Wishlist", "success");
      });
    } else {
      return fpi
        .executeGQL(REMOVE_WISHLIST, payload)
        .then((res) => {
          if (res?.data?.unfollowById?.message) {
            showSnackbar("Product Removed From Wishlist", "success");
            return fetchFollowedProductsId().then(
              () => res?.data?.unfollowById
            );
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    return fpi
      .executeGQL(REMOVE_WISHLIST, payload)
      .then((res) => {
        if (res?.data?.unfollowById?.message) {
          showSnackbar(
            res?.data?.unfollowById?.message ||
              "Products Removed From Wishlist",
            "success"
          );
          return fetchFollowedProductsId().then(() => res?.data?.unfollowById);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
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
