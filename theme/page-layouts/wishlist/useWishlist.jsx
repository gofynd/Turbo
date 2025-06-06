import React, { useEffect, useState, useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import {
  FETCH_FOLLOWED_PRODUCTS,
  FOLLOWED_PRODUCTS_IDS,
} from "../../queries/wishlistQuery";
import { useThemeConfig, useWishlist } from "../../helper/hooks/index";
import EmptyState from "../../components/empty-state/empty-state";
import { getProductImgAspectRatio } from "../../helper/utils";
import placeholder from "../../assets/images/placeholder3x4.png";
import useAddToCartModal from "../plp/useAddToCartModal";
import useInternational from "../../components/header/useInternational";

const useWishlistPage = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const followedlList = useGlobalStore(fpi.getters.FOLLOWED_LIST);
  const [wishListData, setWishListData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);

  const { isInternational } = useInternational({
    fpi,
  });

  const { globalConfig, pageConfig } = useThemeConfig({
    fpi,
    page: "wishlist",
  });

  const {
    show_add_to_cart = true,
    card_cta_text = t("resource.common.add_to_cart"),
    mandatory_pincode = false,
    hide_single_size = false,
    preselect_size = false,
  } = pageConfig || {};

  const addToCartConfigs = {
    mandatory_pincode,
    hide_single_size,
    preselect_size,
  };

  const addToCartModalProps = useAddToCartModal({
    fpi,
    pageConfig: addToCartConfigs,
  });

  const breadcrumb = useMemo(
    () => [{ label: t("resource.common.breadcrumb.home"), link: "/" }, { label: t("resource.common.breadcrumb.wishlist") }],
    []
  );

  const fetchProducts = (payload = {}, append = false) => {
    setIsFetchingProducts(true);
    const wishlistPayload = {
      ...payload,
      collectionType: "products",
      pageSize: 12,
    };
    return fpi
      .executeGQL(FETCH_FOLLOWED_PRODUCTS, wishlistPayload)
      .then((res) => {
        if (res?.errors) {
          throw res?.errors?.[0];
        }
        if (append) {
          setWishListData((prevState) => {
            return {
              ...prevState,
              ...res?.data?.followedListing,
              items: prevState?.items?.concat(
                res?.data?.followedListing?.items || []
              ),
            };
          });
        } else {
          setWishListData(res?.data?.followedListing);
        }

        return res?.data?.followedListing;
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsFetchingProducts(false);
      });
  };

  const handleLoadmore = () => {
    fetchProducts(
      {
        pageId: wishListData?.page?.next_id,
      },
      true
    );
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts().finally(() => {
      setLoading(false);
    });
  }, []);

  const EmptyStateComponent = () => (
    <EmptyState
      title={t("resource.wishlist.no_product_in_wishlist")}
      description={t("resource.wishlist.add_products_to_wishlist")}
      btnTitle={t("resource.common.continue_shopping")}
    />
  );

  const { removeFromWishlist } = useWishlist({ fpi });

  const handleRemoveClick = ({ product }, index) => {
    removeFromWishlist(product, true).then(() => {
      const updatedProductList = [...wishListData?.items];
      updatedProductList.splice(index, 1);

      setWishListData((prevState) => ({
        ...prevState,
        items: updatedProductList,
      }));

      fpi.executeGQL(FOLLOWED_PRODUCTS_IDS);
    });
  };

  const imgSrcSet = useMemo(() => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 1024 }, width: 600 },
      { breakpoint: { min: 768 }, width: 300 },
      { breakpoint: { min: 481 }, width: 300 },
      { breakpoint: { max: 390 }, width: 300 },
      { breakpoint: { max: 480 }, width: 300 },
    ];
  }, [globalConfig?.img_hd]);

  return {
    loading,
    breadcrumb,
    productList: wishListData?.items,
    title: t("resource.common.breadcrumb.wishlist"),
    totalCount: followedlList?.page?.item_total || 0,
    isImageFill: globalConfig?.img_fill,
    imageBackgroundColor: globalConfig?.img_container_bg,
    isBrand: true,
    isSaleBadge: globalConfig?.show_sale_badge,
    isPrice: globalConfig?.show_price,
    showImageOnHover: globalConfig?.show_image_on_hover,
    imagePlaceholder: placeholder,
    imgSrcSet,
    aspectRatio: getProductImgAspectRatio(globalConfig),
    isProductOpenInNewTab: false,
    listingPrice: "range",
    hasNext: !!wishListData?.page?.has_next,
    isLoading: isFetchingProducts,
    onLoadMore: handleLoadmore,
    EmptyStateComponent,
    onRemoveClick: handleRemoveClick,
    addToCartModalProps,
    showAddToCart:
      !isInternational && show_add_to_cart && !globalConfig?.disable_cart,
    actionButtonText: card_cta_text,
    globalConfig,
  };
};

export default useWishlistPage;
