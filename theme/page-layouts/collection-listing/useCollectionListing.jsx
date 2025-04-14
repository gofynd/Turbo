import React, { useMemo, useState, useEffect } from "react";
import { useGlobalStore } from "fdk-core/utils";
import { useLocation, useNavigate } from "react-router-dom";
import useSortModal from "./useSortModal";
import useFilterModal from "./useFilterModal";
import {
  COLLECTION_DETAILS,
  COLLECTION_WITH_ITEMS,
} from "../../queries/collectionsQuery";
import {
  getProductImgAspectRatio,
  isRunningOnClient,
} from "../../helper/utils";
import productPlaceholder from "../../assets/images/placeholder3x4.png";
import useAddToCartModal from "../plp/useAddToCartModal";
import { useWishlist, useAccounts, useThemeConfig } from "../../helper/hooks";
import useInternational from "../../components/header/useInternational";

const PAGE_SIZE = 12;
const PAGES_TO_SHOW = 5;
const PAGE_OFFSET = 2;

const useCollectionListing = ({ fpi, slug, props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleWishlist, followedIdList } = useWishlist({ fpi });
  const { isInternational, i18nDetails, defaultCurrency } = useInternational({
    fpi,
  });
  const { globalConfig, listingPrice } = useThemeConfig({
    fpi,
    page: "collection-listing",
  });
  const {
    product_number = true,
    loading_options = "pagination",
    back_top = true,
    in_new_tab = true,
    hide_brand = false,
    grid_desktop = 4,
    grid_tablet = 3,
    grid_mob = 1,
    show_add_to_cart = true,
    desktop_banner,
    mobile_banner,
    button_link,
    img_resize = 300,
    img_resize_mobile = 500,
  } = Object.fromEntries(
    Object.entries(props).map(([key, obj]) => [key, obj.value])
  );

  const addToCartConfigs = {
    mandatory_pincode: props.mandatory_pincode?.value,
    hide_single_size: props.hide_single_size?.value,
    preselect_size: props.preselect_size?.value,
    show_size_guide: props.show_size_guide?.value,
    tax_label: props.tax_label?.value,
    size_selection_style: props.size_selection_style?.value,
  };

  const {
    headerHeight = 0,
    isCollectionsSsrFetched,
    customCollectionList,
    customCollection,
  } = useGlobalStore(fpi.getters.CUSTOM_VALUE);

  const {
    name: collectionName,
    description: collectionDesc,
    seo,
  } = customCollection || {};
  const {
    filters = [],
    sort_on: sortOn,
    page: pageInfo,
    items,
  } = customCollectionList || {};

  const [productList, setProductList] = useState(items || undefined);
  const currentPage = pageInfo?.current ?? 1;
  const [apiLoading, setApiLoading] = useState(!isCollectionsSsrFetched);
  const [isPageLoading, setIsPageLoading] = useState(!isCollectionsSsrFetched);

  const locationDetails = useGlobalStore(fpi?.getters?.LOCATION_DETAILS);
  const {
    user_plp_columns = {
      desktop: Number(grid_desktop),
      tablet: Number(grid_tablet),
      mobile: Number(grid_mob),
    },
  } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE) ?? {};

  const isAlgoliaEnabled = globalConfig?.algolia_enabled || false;

  const [isResetFilterDisable, setIsResetFilterDisable] = useState(false);

  const addToCartModalProps = useAddToCartModal({
    fpi,
    pageConfig: addToCartConfigs,
  });

  const breadcrumb = useMemo(
    () => [
      { label: "Home", link: "/" },
      { label: "Collections", link: "/collections" },
      { label: collectionName },
    ],
    [collectionName]
  );

  const isClient = useMemo(() => isRunningOnClient(), []);

  useEffect(() => {
    fpi.custom.setValue("isCollectionsSsrFetched", false);
  }, []);

  useEffect(() => {
    if (!isCollectionsSsrFetched && isAlgoliaEnabled) {
      fpi
        .executeGQL(COLLECTION_DETAILS, { slug }, { skipStoreUpdate: true })
        .then((res) => {
          fpi.custom.setValue("customCollection", res?.data?.collection);
        });
    }
  }, [isAlgoliaEnabled]);

  useEffect(() => {
    if (!isCollectionsSsrFetched) {
      const searchParams = isClient
        ? new URLSearchParams(location?.search)
        : null;

      const pageNo = Number(searchParams?.get("page_no"));

      const payload = {
        slug,
        pageType: "number",
        first: PAGE_SIZE,
        search: appendDelimiter(searchParams?.toString()) || undefined,
        sortOn: searchParams?.get("sort_on") || undefined,
      };

      if (loading_options === "pagination") payload.pageNo = pageNo || 1;
      fetchProducts(payload);

      const resetableFilterKeys =
        Array.from(searchParams?.keys?.() ?? [])?.filter?.(
          (i) => !["q", "sort_on", "page_no"].includes(i)
        ) ?? [];
      setIsResetFilterDisable(!resetableFilterKeys?.length);
    }
  }, [location?.search, locationDetails, slug]);

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
      const BASE_URL = `${window.location.origin}/ext/algolia/application/api/v1.0/collections/${slug}/items`;

      const url = new URL(BASE_URL);
      url.searchParams.append(
        "page_id",
        payload?.pageNo === 1 || !payload?.pageNo ? "*" : payload?.pageNo - 1
      );
      url.searchParams.append("page_size", "12");

      const filterQuery = convertQueryParamsForAlgolia();

      if (payload?.sortOn) {
        url.searchParams.append("sort_on", payload?.sortOn);
      }
      if (filterQuery) {
        url.searchParams.append("f", filterQuery);
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
          fpi.custom.setValue("customCollectionList", productList);
          if (append) {
            setProductList((prevState) => {
              return prevState.concat(productList?.items || []);
            });
          } else {
            setProductList(productList?.items || []);
          }
        })
        .finally(() => {
          setIsPageLoading(false);
          setApiLoading(false);
        });
    } else {
      fpi
        .executeGQL(COLLECTION_WITH_ITEMS, payload, { skipStoreUpdate: true })
        .then((res) => {
          if (res.errors) {
            throw res.errors[0];
          }
          fpi.custom.setValue(
            "customCollectionList",
            res?.data?.collectionItems
          );
          fpi.custom.setValue("customCollection", res?.data?.collection);
          if (append) {
            setProductList((prevState) => {
              return prevState.concat(res?.data?.collectionItems?.items || []);
            });
          } else {
            setProductList(res?.data?.collectionItems?.items || []);
          }
          setApiLoading(false);
        })
        .finally(() => {
          setIsPageLoading(false);
          setApiLoading(false);
        });
    }
  };

  const handleLoadMoreProducts = () => {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    const payload = {
      slug,
      pageNo: currentPage + 1,
      pageType: "number",
      first: PAGE_SIZE,
      search: appendDelimiter(searchParams?.toString()) || undefined,
      sortOn: searchParams?.get("sort_on") || undefined,
    };
    fetchProducts(payload, true);
  };

  function appendDelimiter(queryString) {
    const searchParams = isClient ? new URLSearchParams(queryString) : null;
    const params = Array.from(searchParams?.entries() || []);

    const result = params.reduce((acc, [key, value]) => {
      if (key !== "page_no" && key !== "sort_on") {
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
      if (value) searchParams?.set(name, value);
      else searchParams?.delete(name);
    } else if (!searchParams?.has(name, value) && !is_selected) {
      searchParams?.append(name, value);
    } else {
      searchParams?.delete(name, value);
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
    navigate?.({
      pathname: location?.pathname,
      search: searchParams?.toString(),
    });
  };

  function resetFilters() {
    const searchParams = isClient
      ? new URLSearchParams(location?.search)
      : null;
    filters.forEach((filter) => {
      searchParams?.delete(filter.key.name);
    });
    searchParams?.delete("page_no");
    navigate?.({
      pathname: location?.pathname,
      search: searchParams?.toString(),
    });
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
    }
    if (index > lastIndex) {
      return lastIndex;
    }
    return index;
  };

  const paginationProps = useMemo(() => {
    if (!pageInfo) {
      return;
    }
    const {
      current,
      has_next: hasNext,
      has_previous: hasPrevious,
      item_total,
    } = pageInfo || {};
    const totalPageCount = Math.ceil(item_total / PAGE_SIZE);
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
  }, [pageInfo]);

  const handleColumnCountUpdate = ({ screen, count }) => {
    fpi.custom.setValue("user_plp_columns", {
      ...user_plp_columns,
      [screen]: count,
    });
  };

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

  const { openSortModal, ...sortModalProps } = useSortModal({
    sortOn,
    handleSortUpdate,
  });
  const { openFilterModal, ...filterModalProps } = useFilterModal({
    filters: filterList,
    resetFilters,
    handleFilterUpdate,
  });
  const { isLoggedIn, openLogin } = useAccounts({ fpi });

  const handleWishlistToggle = (data) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    toggleWishlist(data);
  };

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

  const imgSrcSet = useMemo(() => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 481 }, width: img_resize },
      { breakpoint: { max: 480 }, width: img_resize_mobile },
    ];
  }, [globalConfig?.img_hd, img_resize, img_resize_mobile]);

  return {
    seo,
    isProductCountDisplayed: product_number,
    isScrollTop: back_top,
    isBrand: !hide_brand,
    isSaleBadge: globalConfig?.show_sale_badge,
    isPrice: globalConfig?.show_price,
    imgSrcSet,
    isResetFilterDisable,
    isProductOpenInNewTab: in_new_tab,
    breadcrumb,
    title: collectionName,
    description: collectionDesc || "",
    productCount: pageInfo?.item_total,
    columnCount: user_plp_columns,
    filterList,
    selectedFilters,
    sortList: sortOn,
    productList: productList || items || [],
    isProductLoading: apiLoading,
    banner: {
      desktopBanner: desktop_banner,
      mobileBanner: mobile_banner,
      redirectLink: button_link,
    },
    isPageLoading,
    loadingOption: loading_options,
    listingPrice,
    paginationProps,
    sortModalProps,
    filterModalProps,
    followedIdList,
    isImageFill: globalConfig?.img_fill,
    imageBackgroundColor: globalConfig?.img_container_bg,
    showImageOnHover: globalConfig?.show_image_on_hover,
    imagePlaceholder: productPlaceholder,
    showAddToCart:
      !isInternational && show_add_to_cart && !globalConfig?.disable_cart,
    addToCartModalProps,
    stickyFilterTopOffset: headerHeight + 30,
    globalConfig,
    aspectRatio: getProductImgAspectRatio(globalConfig),
    onResetFiltersClick: resetFilters,
    onColumnCountUpdate: handleColumnCountUpdate,
    onSortUpdate: handleSortUpdate,
    onFilterUpdate: handleFilterUpdate,
    onFilterModalBtnClick: openFilterModal,
    onSortModalBtnClick: openSortModal,
    onWishlistClick: handleWishlistToggle,
    onViewMoreClick: handleLoadMoreProducts,
    onLoadMoreProducts: handleLoadMoreProducts,
  };
};

export default useCollectionListing;
