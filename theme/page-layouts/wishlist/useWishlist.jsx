import React, { useEffect, useState, useMemo } from "react";
import {
  useGlobalStore,
  useGlobalTranslation,
  useNavigate,
} from "fdk-core/utils";
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
import { WISHLIST_PAGE_SIZE } from "../../helper/constant";
import ProfileEmptyState from "@gofynd/theme-template/pages/profile/components/empty-state/empty-state";
import "@gofynd/theme-template/pages/profile/components/empty-state/empty-state.css";

const useWishlistPage = ({ fpi }) => {
  const { t } = useGlobalTranslation("translation");
  const followedlList = useGlobalStore(fpi.getters.FOLLOWED_LIST);
  const [wishListData, setWishListData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);

  const { isInternational } = useInternational({
    fpi,
  });
  const navigate = useNavigate();

  const { globalConfig, pageConfig, listingPrice } = useThemeConfig({
    fpi,
    page: "wishlist",
  });

  const {
    show_add_to_cart = true,
    mandatory_pincode = true,
    hide_single_size = false,
    preselect_size = false,
  } = pageConfig || {};
  const card_cta_text =
    pageConfig?.card_cta_text?.value ?? t("resource.common.add_to_cart");
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
    () => [
      { label: t("resource.common.breadcrumb.home"), link: "/" },
      { label: t("resource.common.breadcrumb.wishlist") },
    ],
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
    fetchProducts()
      .then(() => {
        // Defer to next macrotask so full-list refresh runs after FETCH_FOLLOWED_PRODUCTS (pageSize: 12) store update.
        return new Promise((resolve) => {
          setTimeout(() => {
            fpi
              .executeGQL(FOLLOWED_PRODUCTS_IDS, {
                pageSize: WISHLIST_PAGE_SIZE,
              })
              .then(resolve)
              .catch(resolve);
          }, 0);
        });
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // SWR (stale-while-revalidate) in fdk-store resolves the executeGQL promise
  // immediately with cached stale data, then revalidates in the background and
  // updates the Redux store WITHOUT re-calling the promise .then(). This means
  // wishListData (local state set from the promise) can be stale while
  // followedlList (Redux store) correctly reflects the fresh data after revalidation.
  //
  // Two query types update followedlList differently:
  //   - FETCH_FOLLOWED_PRODUCTS: page includes `has_next` + full product data (media, etc.)
  //   - FOLLOWED_PRODUCTS_IDS: page only has `item_total`, no `has_next` + limited fields
  //
  // Strategy:
  //   1. When followedlList comes from FETCH_FOLLOWED_PRODUCTS (has_next is defined) and
  //      all items fit in one page (hasFullList=true), use its items directly to replace
  //      wishListData — this handles both additions and removals with full product data.
  //   2. When followedlList comes from FOLLOWED_PRODUCTS_IDS (has_next undefined), only
  //      filter out removed items (can't add — limited data, no media/images).
  //   3. Skip when Load More has been used and followedlList only has page-1 items
  //      (items.length < item_total), to avoid dropping already-loaded pages.
  useEffect(() => {
    if (!followedlList?.items) return;
    const itemTotal = followedlList.page?.item_total || 0;
    const hasFullList =
      // Full-list query (no has_next in page schema)
      followedlList.page?.has_next === undefined ||
      // Or all items fit within one page of FETCH_FOLLOWED_PRODUCTS
      (itemTotal > 0 && followedlList.items.length >= itemTotal);
    if (!hasFullList) return;

    const validUids = new Set(followedlList.items.map((item) => item.uid));
    // has_next present (true or false) means data came from FETCH_FOLLOWED_PRODUCTS
    // which includes full product fields (media, images, price, etc.)
    const fromFetchFollowedProducts =
      followedlList.page?.has_next !== undefined;

    setWishListData((prevState) => {
      const prevItems = prevState?.items || [];

      if (fromFetchFollowedProducts) {
        // Full product data available — sync wishListData directly if anything differs
        const wishUids = new Set(prevItems.map((i) => i.uid));
        const needsUpdate =
          followedlList.items.some((item) => !wishUids.has(item.uid)) ||
          prevItems.some((item) => !validUids.has(item.uid));
        if (!needsUpdate) return prevState;
        return {
          ...prevState,
          items: followedlList.items,
          page: followedlList.page,
        };
      }

      // Limited data from FOLLOWED_PRODUCTS_IDS — only filter removed items
      if (!prevItems.length) return prevState;
      const filtered = prevItems.filter((item) => validUids.has(item.uid));
      if (filtered.length === prevItems.length) return prevState;
      return { ...prevState, items: filtered };
    });
  }, [followedlList]);

  const EmptyStateComponent = () => (
    <ProfileEmptyState
      title={t("resource.wishlist.no_product_in_wishlist")}
      description={t("resource.wishlist.add_products_to_wishlist")}
      btnTitle={t("resource.common.continue_shopping")}
      onBtnClick={() => navigate("/")}
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

      fpi.executeGQL(FOLLOWED_PRODUCTS_IDS, { pageSize: WISHLIST_PAGE_SIZE });
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
    isCustomBadge: globalConfig?.show_custom_badge,
    isPrice: globalConfig?.show_price,
    showImageOnHover: globalConfig?.show_image_on_hover,
    imagePlaceholder: placeholder,
    imgSrcSet,
    aspectRatio: getProductImgAspectRatio(globalConfig),
    isProductOpenInNewTab: false,
    listingPrice,
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
