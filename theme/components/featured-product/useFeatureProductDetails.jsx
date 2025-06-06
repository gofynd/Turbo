import { useState, useEffect } from "react";
import { ADD_TO_CART } from "../../queries/pdpQuery";
import {
  ADD_WISHLIST,
  REMOVE_WISHLIST,
  FOLLOWED_PRODUCTS_IDS,
} from "../../queries/wishlistQuery";
import useHeader from "../header/useHeader";
import {
  useGlobalStore,
  useNavigate,
  useGlobalTranslation,
} from "fdk-core/utils";
import { useSnackbar } from "../../helper/hooks";
import { fetchCartDetails } from "../../page-layouts/cart/useCart";

const useFeatureProductDetails = ({
  fpi,
  moq,
  selectedSize,
  article_assignment,
  article_id,
  uid,
  seller,
  store,
  currentPincode,
}) => {
  const { t } = useGlobalTranslation("translation");
  const [followed, setFollowed] = useState(false);
  const [pincodeErrorMessage, setPincodeErrorMessage] = useState("");
  const { wishlistIds } = useHeader(fpi);
  const LoggedIn = useGlobalStore(fpi?.getters?.LOGGED_IN);
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  function getQty() {
    const moqValue = moq || false;

    const availableQty = selectedSize?.quantity;
    if (moqValue) {
      return availableQty > moqValue?.increment_unit
        ? moqValue?.increment_unit
        : (moqValue?.minimum ?? 1);
    }
  }

  function addProductForCheckout(event, size, buyNow) {
    if (event) {
      event.stopPropagation();
    }
    if (currentPincode?.length !== 6) {
      setPincodeErrorMessage("");
      showSnackbar(
        t("resource.product.enter_valid_pincode"),
        "error"
      );
      return;
    }

    if (!selectedSize) {
      showSnackbar(
        t("resource.product.select_size_first"),
        "error"
      );
      return;
    }
    const payload = {
      buyNow,
      areaCode: currentPincode?.toString(),
      addCartRequestInput: {
        items: [
          {
            article_assignment: {
              level: `${article_assignment?.level}`,
              strategy: `${article_assignment?.strategy}`,
            },
            article_id: article_id?.toString(),
            item_id: uid,
            item_size: size?.toString(),
            quantity: getQty(),
            seller_id: seller?.uid,
            store_id: store?.uid,
          },
        ],
      },
    };
    return fpi.executeGQL(ADD_TO_CART, payload).then((outRes) => {
      if (outRes?.data?.addItemsToCart?.success) {
        showSnackbar(
          outRes?.data?.addItemsToCart?.message ||
          t("resource.common.add_to_cart_success"),
          "success"
        );
        if (buyNow) {
          navigate(
            `/cart/checkout/?id=${outRes?.data?.addItemsToCart?.cart?.id}`
          );
        }
        fetchCartDetails(fpi, { buyNow });
      } else {
        showSnackbar(
          outRes?.data?.addItemsToCart?.message ||
          t("resource.common.add_cart_failure"),
          "error"
        );
      }
      return outRes;
    });
  }

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
      collectionId: uid?.toString(),
    };
    fpi.executeGQL(ADD_WISHLIST, values).then((OutRes) => {
      if (OutRes?.data?.followById?.message) {
        fpi.executeGQL(FOLLOWED_PRODUCTS_IDS, null).then((res) => {
          showSnackbar(t("resource.common.wishlist_add_success"), "success");
          setFollowed(true);
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
      collectionId: uid?.toString(),
    };
    fpi.executeGQL(REMOVE_WISHLIST, values).then((OutRes) => {
      if (OutRes?.data?.unfollowById?.message) {
        fpi.executeGQL(FOLLOWED_PRODUCTS_IDS, null).then((res) => {
          showSnackbar(t("resource.common.wishlist_remove_success"), "success");
          setFollowed(false);
        });
      }
    });
  }

  useEffect(() => {
    setFollowed(wishlistIds?.includes(uid));
  }, []);

  return {
    getQty,
    addProductForCheckout,
    pincodeErrorMessage,
    setPincodeErrorMessage,
    followed,
    removeFromWishlist,
    addToWishList,
  };
};

export default useFeatureProductDetails;
