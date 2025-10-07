import { useEffect, useState, useMemo, useRef } from "react";
import {
  useGlobalStore,
  useGlobalTranslation,
  useNavigate,
} from "fdk-core/utils";
import { useLocation, useSearchParams } from "react-router-dom";
import useSortModal from "./useSortModal";
import useFilterModal from "./useFilterModal";
import { PLP_PRODUCTS } from "../../queries/plpQuery";
import {
  getProductImgAspectRatio,
  isRunningOnClient,
} from "../../helper/utils";
import productPlaceholder from "../../assets/images/placeholder3x4.png";
import useAddToCartModal from "./useAddToCartModal";
import { useAccounts, useWishlist, useThemeConfig } from "../../helper/hooks";
import useInternational from "../../components/header/useInternational";
import useScrollRestoration from "./useScrollRestoration";

const INFINITE_PAGE_SIZE = 12;
const PAGES_TO_SHOW = 5;
const PAGE_OFFSET = 2;

// Helper functions for managing scroll state
const saveScrollState = (key, data) => {
  if (isRunningOnClient()) {
    sessionStorage.setItem(key, JSON.stringify(data));
  }
};

const getScrollState = (key) => {
  if (isRunningOnClient()) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

const clearScrollState = (key) => {
  if (isRunningOnClient()) {
    sessionStorage.removeItem(key);
  }
};

const useProductListing = ({ fpi, props }) => {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isInternational, i18nDetails, defaultCurrency } = useInternational({
    fpi,
  });

  const { globalConfig, listingPrice } = useThemeConfig({
    fpi,
    page: "product-listing",
  });
  const {
    desktop_banner = "",
    mobile_banner = "",
    banner_link = "",
    product_number = true,
    loading_options = "pagination",
    page_size = 12,
    back_top = true,
    in_new_tab = false,
    hide_brand = false,
    grid_desktop = 4,
    grid_tablet = 3,
    grid_mob = 1,
    description = "",
    show_add_to_cart = true,
    card_cta_text = t("resource.common.add_to_cart"),
    mandatory_pincode = true,
    hide_single_size = false,
    preselect_size = true,
    img_resize = 300,
    img_resize_mobile = 500,
    size_selection_style = "dropdown",
    tax_label = "",
    show_size_guide = false,
  } = Object.entries(props).reduce((acc, [key, { value }]) => {
    acc[key] = value;
    return acc;
  }, {});

  const pageSize =
    loading_options === "infinite" ? INFINITE_PAGE_SIZE : page_size;

  const addToCartConfigs = {
    mandatory_pincode,
    hide_single_size,
    preselect_size,
    size_selection_style,
    tax_label,
    show_size_guide,
  };
  const {
    headerHeight = 0,
    isPlpSsrFetched,
    customProductList: productsListData,
  } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);
  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const pincodeDetails = useGlobalStore(fpi?.getters?.PINCODE_DETAILS);

  const { filters = [], sort_on: sortOn, page, items } = productsListData || {};

  // Scroll restoration state - SSR-safe but functional
  const scrollStateKey = `plp_scroll_${location.pathname}${location.search}`;

  // SSR-safe scroll state detection
  const scrollStateInfo = useMemo(() => {
    if (!isRunningOnClient() || loading_options !== "infinite") {
      return { hasSavedState: false, savedState: null };
    }
    const state = getScrollState(scrollStateKey);
    if (state && Date.now() - state.timestamp <= 30 * 60 * 1000) {
      return { hasSavedState: true, savedState: state };
    } else if (state) {
      clearScrollState(scrollStateKey);
    }
    return { hasSavedState: false, savedState: null };
  }, [scrollStateKey, loading_options]);

  const { hasSavedState, savedState } = scrollStateInfo;

  // Initialize with proper defaults - this preserves the original functionality
  const [productList, setProductList] = useState(() => {
    // On client side, if we have saved state, use it immediately for better UX
    if (isRunningOnClient() && hasSavedState && savedState) {
      return savedState.productList;
    }
    return items || undefined;
  });

  const currentPage = productsListData?.page?.current ?? 1;
  const [apiLoading, setApiLoading] = useState(() => {
    if (isRunningOnClient() && hasSavedState) {
      return false;
    }
    return !isPlpSsrFetched;
  });

  const [isPageLoading, setIsPageLoading] = useState(() => {
    if (isRunningOnClient() && hasSavedState) {
      return false;
    }
    return !isPlpSsrFetched;
  });

  const {
    user_plp_columns = {
      desktop: Number(grid_desktop),
      tablet: Number(grid_tablet),
      mobile: Number(grid_mob),
    },
  } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE) ?? {};
  const [isResetFilterDisable, setIsResetFilterDisable] = useState(true);

  const hasRestoredScroll = useRef(false);
  const isRestoringFromPDP = useRef(hasSavedState);

  // Use scroll restoration hook to prevent auto-scroll to top
  useScrollRestoration(scrollStateKey, loading_options === "infinite");

  const isAlgoliaEnabled = globalConfig?.algolia_enabled;

  const breadcrumb = useMemo(
    () => [
      { label: t("resource.common.breadcrumb.home"), link: "/" },
      { label: t("resource.common.breadcrumb.products") },
    ],
    []
  );

  const isClient = useMemo(() => isRunningOnClient(), []);

  const addToCartModalProps = useAddToCartModal({
    fpi,
    pageConfig: addToCartConfigs,
  });

  const pincode = useMemo(() => {
    if (!isClient) {
      return "";
    }
    return (
      pincodeDetails?.localityValue ||
      locationDetails?.pincode ||
      locationDetails?.sector ||
      ""
    );
  }, [pincodeDetails, locationDetails, isClient]);

  // Handle scroll restoration - runs after hydration but preserves UX
  useEffect(() => {
    if (hasSavedState && savedState && !hasRestoredScroll.current) {
      // Store the saved data in global state to prevent refetching
      fpi.custom.setValue("customProductList", savedState.productsListData);

      // Restore scroll position smoothly
      const restoreScroll = () => {
        window.scrollTo(0, savedState.scrollPosition);
        hasRestoredScroll.current = true;
        clearScrollState(scrollStateKey);
      };

      // Use requestAnimationFrame for smooth restoration
      if (document.readyState === "complete") {
        requestAnimationFrame(restoreScroll);
      } else {
        window.addEventListener(
          "load",
          () => requestAnimationFrame(restoreScroll),
          { once: true }
        );
      }
    }
  }, [hasSavedState, savedState, scrollStateKey, fpi]);

  // Cleanup expired scroll states on mount
  useEffect(() => {
    if (isClient) {
      const cleanupExpiredStates = () => {
        const keys = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith("plp_scroll_")) {
            keys.push(key);
          }
        }

        keys.forEach((key) => {
          const state = getScrollState(key);
          if (state && Date.now() - state.timestamp > 30 * 60 * 1000) {
            clearScrollState(key);
          }
        });
      };

      cleanupExpiredStates();
    }
  }, [isClient]);

  useEffect(() => {
    fpi.custom.setValue("isPlpSsrFetched", false);
  }, []);

  useEffect(() => {
    // Skip API call if we're restoring from saved state
    if (isRestoringFromPDP.current) {
      isRestoringFromPDP.current = false;
      return;
    }

    if (!isPlpSsrFetched || locationDetails) {
      const searchParams = isClient
        ? new URLSearchParams(location?.search)
        : null;
      const pageNo = Number(searchParams?.get("page_no"));
      const payload = {
        pageType: "number",
        first: pageSize,
        filterQuery: appendDelimiter(searchParams?.toString()) || undefined,
        sortOn: searchParams?.get("sort_on") || undefined,
        search: searchParams?.get("q") || undefined,
      };

      if (loading_options === "pagination") payload.pageNo = pageNo || 1;

      fetchProducts(payload);

      const resetableFilterKeys =
        Array.from(searchParams?.keys?.() ?? [])?.filter?.(
          (i) => !["q", "sort_on", "page_no"].includes(i)
        ) ?? [];
      setIsResetFilterDisable(!resetableFilterKeys?.length);
    }
  }, [location?.search, pincode, locationDetails, pageSize]);

  const convertQueryParamsForAlgolia = () => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(location?.search);
    const filterParams = [];

    const skipKeys = new Set(["sort_on", "siteTheme", "page_no", "q"]);

    params.forEach((value, key) => {
      if (skipKeys.has(key)) return;

      const decodedValue = decodeURIComponent(value);

      // Check if the key already exists in the filterParams
      const existingParam = filterParams.find((param) =>
        param.startsWith(`${key}:`)
      );

      if (existingParam) {
        // If the key already exists, append the new value using "||"
        const updatedParam = `${existingParam}||${decodedValue}`;
        filterParams[filterParams.indexOf(existingParam)] = updatedParam;
      } else {
        // Otherwise, add the key-value pair
        filterParams.push(`${key}:${decodedValue}`);
      }
    });

    // Join all the filters with ":::"
    return filterParams.join(":::");
  };

  const fetchProducts = (payload, append = false) => {
    setApiLoading(true);

    if (isAlgoliaEnabled) {
      const BASE_URL = `${window.location.origin}/ext/algolia/application/api/v1.0/products`;

      const url = new URL(BASE_URL);
      url.searchParams.append(
        "page_id",
        payload?.pageNo === 1 || !payload?.pageNo ? "*" : payload?.pageNo - 1
      );
      url.searchParams.append("page_size", payload?.first);

      const filterQuery = convertQueryParamsForAlgolia();

      if (payload?.sortOn) {
        url.searchParams.append("sort_on", payload?.sortOn);
      }
      if (filterQuery) {
        url.searchParams.append("f", filterQuery);
      }
      if (payload?.search) {
        url.searchParams.append("q", payload?.search);
      }

      fetch(url, {
        headers: {
          "x-location-detail": JSON.stringify({
            country_iso_code: i18nDetails?.countryCode || "IN",
          }),
          "x-currency-code":
            i18nDetails?.currency?.code || defaultCurrency?.code,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const productDataNormalization = data.items?.map((item) => ({
            ...item,
            media: item.medias,
          }));

          data.page.current = payload?.pageNo;

          const productList = {
            filters: data?.filters,
            items: productDataNormalization,
            page: data?.page,
            sort_on: data?.sort_on,
          };
          setApiLoading(false);
          fpi.custom.setValue("customProductList", productList);
          if (append) {
            setProductList((prevState) => {
              return prevState.concat(productList?.items || []);
            });
          } else {
            setProductList(productList?.items || []);
          }
        })
        .finally(() => {
          setApiLoading(false);
          setIsPageLoading(false);
        });
    } else {
      fpi
        .executeGQL(PLP_PRODUCTS, payload, { skipStoreUpdate: false })
        .then((res) => {
          if (append) {
            setProductList((prevState) => {
              return prevState.concat(res?.data?.products?.items || []);
            });
          } else {
            setProductList(res?.data?.products?.items || []);
          }
          fpi.custom.setValue("customProductList", res?.data?.products);
          setApiLoading(false);
        })
        .finally(() => {
          setApiLoading(false);
          setIsPageLoading(false);
        });
    }
  };

  const handleLoadMoreProducts = () => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    const payload = {
      pageNo: currentPage + 1,
      pageType: "number",
      first: pageSize,
      filterQuery: appendDelimiter(searchParams?.toString()) || undefined,
      sortOn: searchParams?.get("sort_on") || undefined,
      search: searchParams?.get("q") || undefined,
    };
    fetchProducts(payload, true);
  };

  function appendDelimiter(queryString) {
    const searchParams = isClient ? new URLSearchParams(queryString) : null;
    const params = Array.from(searchParams?.entries() || []);

    const result = params.reduce((acc, [key, value]) => {
      if (key !== "page_no" && key !== "sort_on" && key !== "q") {
        acc.push(`${key}:${value}`);
      }
      return acc;
    }, []);
    // Append ::: to each parameter except the last one
    return result.join(":::");
  }

  const handleFilterUpdate = ({ filter, item }) => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    const {
      key: { name, kind },
    } = filter;
    const { value, is_selected } = item;
    if (kind === "range") {
      if (value) {
        searchParams?.set(name, value);
      } else {
        searchParams?.delete(name);
      }
    } else {
      const existingValues = searchParams?.getAll(name) || [];

      if (is_selected) {
        const newValues = existingValues.filter((v) => v !== value);
        searchParams.delete(name);
        newValues.forEach((v) => searchParams.append(name, v));
      } else {
        if (!existingValues.includes(value)) {
          searchParams.append(name, value);
        }
      }
    }
    searchParams?.delete("page_no");
    navigate?.({
      pathname: location?.pathname,
      search: searchParams?.toString(),
    });
  };

  const handleSortUpdate = (value) => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    if (value) {
      searchParams?.set("sort_on", value);
    } else {
      searchParams?.delete("sort_on");
    }
    searchParams?.delete("page_no");
    navigate?.(
      location?.pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    );
  };

  function resetFilters() {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    filters?.forEach((filter) => {
      searchParams?.delete(filter.key.name);
    });
    searchParams?.delete("page_no");
    navigate?.(
      location?.pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    );
  }

  const getPageUrl = (pageNo) => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    searchParams?.set("page_no", pageNo);
    return `${location?.pathname}?${searchParams?.toString()}`;
  };

  const getStartPage = ({ current, totalPageCount }) => {
    const index = Math.max(current - PAGE_OFFSET, 1);
    const lastIndex = Math.max(totalPageCount - PAGES_TO_SHOW + 1, 1);

    if (index <= 1) {
      return 1;
    } else if (index > lastIndex) {
      return lastIndex;
    } else {
      return index;
    }
  };

  const paginationProps = useMemo(() => {
    if (!productsListData?.page) {
      return;
    }
    const {
      current,
      has_next: hasNext,
      has_previous: hasPrevious,
      item_total,
    } = productsListData?.page || {};
    const totalPageCount = Math.ceil(item_total / pageSize);
    const startingPage = getStartPage({ current, totalPageCount });

    const displayPageCount = Math.min(totalPageCount, PAGES_TO_SHOW);

    const pages = [];
    for (let i = 0; i < displayPageCount; i++) {
      pages.push({
        link: getPageUrl(startingPage + i),
        index: startingPage + i,
      });
    }

    return {
      current: current || 1,
      hasNext,
      hasPrevious,
      prevPageLink: hasPrevious ? getPageUrl(current - 1) : "",
      nextPageLink: hasNext ? getPageUrl(current + 1) : "",
      pages,
    };
  }, [productsListData?.page]);

  const handleColumnCountUpdate = ({ screen, count }) => {
    fpi.custom.setValue("user_plp_columns", {
      ...user_plp_columns,
      [screen]: count,
    });
  };

  const { openSortModal, ...sortModalProps } = useSortModal({
    sortOn,
    handleSortUpdate,
  });

  const filterList = useMemo(() => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    return (filters ?? []).map((filter) => {
      const isNameInQuery =
        searchParams?.has(filter?.key?.name) ||
        filter?.values?.some(({ is_selected }) => is_selected);
      return { ...filter, isOpen: isNameInQuery };
    });
  }, [filters, location?.search]);

  const isFilterOpen = filterList.some((filter) => filter.isOpen);

  if (!isFilterOpen && filterList.length > 0) {
    filterList[0].isOpen = true;
  }

  const selectedFilters = useMemo(() => {
    const searchParams = isRunningOnClient()
      ? new URLSearchParams(location?.search)
      : null;

    return filterList?.reduce((acc, curr) => {
      const selectedValues = curr?.values?.filter(
        (filter) =>
          searchParams?.getAll(curr?.key?.name).includes(filter?.value) ||
          filter?.is_selected
      );

      if (selectedValues.length > 0) {
        return [...acc, { key: curr?.key, values: selectedValues }];
      }

      return acc;
    }, []);
  }, [filterList]);

  const { openFilterModal, ...filterModalProps } = useFilterModal({
    filters: filterList ?? [],
    resetFilters,
    handleFilterUpdate,
  });
  const { toggleWishlist, followedIdList } = useWishlist({ fpi });
  const { isLoggedIn, openLogin } = useAccounts({ fpi });

  const handleWishlistToggle = (data) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    toggleWishlist(data);
  };

  const imgSrcSet = useMemo(() => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 481 }, width: img_resize },
      { breakpoint: { max: 480 }, width: img_resize_mobile },
    ];
  }, [globalConfig?.img_hd, img_resize, img_resize_mobile]);

  // Function to save scroll state when navigating to PDP
  const handleProductNavigation = () => {
    if (
      isClient &&
      loading_options === "infinite" &&
      (productList?.length > 0 || items?.length > 0)
    ) {
      const scrollPosition =
        window.scrollY || document.documentElement.scrollTop;

      // Only save if we have meaningful scroll position and loaded products
      if (scrollPosition > 100 && (productList?.length || items?.length)) {
        const stateToSave = {
          scrollPosition,
          productList: productList || items || [],
          productsListData,
          timestamp: Date.now(),
          savedUrl: `${location.pathname}${location.search}`, // Store complete URL for validation
        };
        saveScrollState(scrollStateKey, stateToSave);
      }
    }
  };

  return {
    breadcrumb,
    isProductCountDisplayed: product_number,
    productCount: page?.item_total,
    isScrollTop: back_top,
    title: searchParams.get("q")
      ? `${t("resource.common.result_for")} "${searchParams.get("q")}"`
      : "",
    description: description,
    filterList,
    selectedFilters,
    sortList: sortOn,
    productList: productList || items || [],
    columnCount: user_plp_columns,
    isProductOpenInNewTab: in_new_tab,
    isBrand: !hide_brand,
    isSaleBadge: globalConfig?.show_sale_badge,
    isPrice: globalConfig?.show_price,
    globalConfig,
    imgSrcSet,
    isResetFilterDisable,
    aspectRatio: getProductImgAspectRatio(globalConfig),
    isWishlistIcon: true,
    followedIdList,
    isProductLoading: apiLoading,
    banner: {
      desktopBanner: desktop_banner,
      mobileBanner: mobile_banner,
      redirectLink: banner_link,
    },
    isPageLoading,
    listingPrice,
    loadingOption: loading_options,
    paginationProps,
    sortModalProps,
    filterModalProps,
    addToCartModalProps,
    isImageFill: globalConfig?.img_fill,
    imageBackgroundColor: globalConfig?.img_container_bg,
    showImageOnHover: globalConfig?.show_image_on_hover,
    imagePlaceholder: productPlaceholder,
    showAddToCart:
      !isInternational && show_add_to_cart && !globalConfig?.disable_cart,
    actionButtonText: card_cta_text
      ? card_cta_text
      : t("resource.common.add_to_cart"),
    stickyFilterTopOffset: headerHeight + 30,
    onResetFiltersClick: resetFilters,
    onColumnCountUpdate: handleColumnCountUpdate,
    onFilterUpdate: handleFilterUpdate,
    onSortUpdate: handleSortUpdate,
    onFilterModalBtnClick: openFilterModal,
    onSortModalBtnClick: openSortModal,
    onWishlistClick: handleWishlistToggle,
    onViewMoreClick: handleLoadMoreProducts,
    onLoadMoreProducts: handleLoadMoreProducts,
    // New function to handle product navigation
    onProductNavigation: handleProductNavigation,
    showColorVariants: globalConfig?.show_color_variants,
  };
};

export default useProductListing;
