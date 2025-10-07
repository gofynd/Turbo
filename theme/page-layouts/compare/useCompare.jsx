import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../components/loader/loader";
import { PRODUCT_COMPARISON, SEARCH_PRODUCT } from "../../queries/compareQuery";
import { useSnackbar } from "../../helper/hooks";
import { debounce } from "../../helper/utils";
import placeholder from "../../assets/images/placeholder3x4.png";
import {
  useNavigate,
  useGlobalTranslation,
  useGlobalStore,
} from "fdk-core/utils";

const useCompare = (fpi) => {
  const { t } = useGlobalTranslation("translation");
  const THEME = useGlobalStore(fpi.getters.THEME);
  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;

  const location = useLocation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const initializeSlugs = () => {
    try {
      const storedSlugs = JSON.parse(localStorage?.getItem("compare_slugs"));
      return Array.isArray(storedSlugs) ? storedSlugs : [];
    } catch (err) {
      return [];
    }
  };

  const {
    compare_product_data,
    compare_product_attribute,
    isCompareSsrFetched,
    compare_category_details,
  } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE);

  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [category, setCategory] = useState(compare_category_details || {});
  const [existingSlugs, setExistingSlugs] = useState(initializeSlugs);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isSsrFetched, setIsSsrFetched] = useState(isCompareSsrFetched);
  const [searchLoading, setSearchLoading] = useState(false);

  const latestRequest = useRef(0);
  const isFirstRender = useRef(true);
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const getCategoryKeyValue = (action) => {
    const key = Object.keys(action?.page?.query)?.[0];
    const value = action?.page?.query[key];
    return { key, value, firstValue: value?.[0] ?? "" };
  };

  const getCategoryUrl = (action) => {
    let url = `/${action?.page?.type}`;
    const { key, value } = getCategoryKeyValue(action);
    url = `${url}?${key}=${value?.join?.(`&${key}=`)}`;
    return url;
  };

  const fetchCompareProduct = (slugs = existingSlugs) => {
    setIsLoading(true);
    return fpi
      .executeGQL(PRODUCT_COMPARISON, { slug: slugs })
      .then((res) => {
        console.log(res, "ressssssss");

        if (res?.errors?.length) {
          const errorMsg =
            res.errors[0]?.message ?? t("resource.common.error_message");
          console.error(errorMsg);

          // show error in snackbar
          showSnackbar(errorMsg, "error");

          return false;
        }

        if (res?.data?.productComparison) {
          const items = res?.data?.productComparison?.items;
          const firstCategory = items[0]?.categories?.[0];
          let categoryDetails = {};

          if (Object.keys(firstCategory || {}).length) {
            categoryDetails = {
              url: getCategoryUrl(firstCategory?.action),
              name: firstCategory?.name,
              keyValue: getCategoryKeyValue(firstCategory?.action),
            };
          }

          setCategory(categoryDetails);

          const productItems = items ?? [];
          fpi.custom.setValue("compare_product_data", productItems);

          if (!productItems?.length) {
            setShowSearch(true);
          }
          fpi.custom.setValue(
            "compare_product_attribute",
            res?.data?.productComparison?.attributes_metadata
          );
          return true;
        } else {
          console.log(
            res?.errors?.[0]?.message ?? t("resource.common.error_message")
          );
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchSuggestions = async (searchQuery) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const requestId = Date.now();
    latestRequest.current = requestId;
    setSearchLoading(true);

    try {
      const values = { enableFilter: true };

      if (searchQuery && searchQuery.trim()) {
        values.search = searchQuery.trim();
      }

      if (category?.keyValue?.firstValue) {
        values.filterQuery = `${category.keyValue.key}:${category.keyValue.firstValue}`;
      }

      const res = await fpi.executeGQL(SEARCH_PRODUCT, values, {
        skipStoreUpdate: true,
        signal: abortControllerRef.current.signal,
      });

      if (
        latestRequest.current === requestId &&
        !abortControllerRef.current.signal.aborted
      ) {
        setSuggestions(res?.data?.products?.items || []);
        setSearchLoading(false);
      }
    } catch (error) {
      if (error.name !== "AbortError" && latestRequest.current === requestId) {
        showSnackbar(t("resource.compare.fetch_suggestion_failure"), "error");
        setSearchLoading(false);
      }
    }
  };

  const debouncedFetchSuggestions = useRef(
    debounce((searchQuery) => {
      fetchSuggestions(searchQuery);
    }, 400)
  ).current;

  const handleInputChange = (value) => {
    setSearchText(value);
  };

  const handleAdd = async (slug) => {
    setIsSsrFetched(false);
    const nextSlugs = [slug, ...(existingSlugs ?? [])];
    const res = await fetchCompareProduct(nextSlugs);
    if (res) {
      localStorage?.setItem("compare_slugs", JSON.stringify(nextSlugs));
      setExistingSlugs(nextSlugs);
      setShowSearch("");
      return true;
    }
    return false;
  };

  const handleRemove = (slug) => {
    setIsSsrFetched(false);
    const filteredSlug = existingSlugs?.filter((s) => s !== slug);
    localStorage?.setItem("compare_slugs", JSON.stringify(filteredSlug));
    setExistingSlugs(filteredSlug);
    setShowSearch("");

    if (compare_product_data?.length === 1) {
      setProducts([]);
      fpi.custom.setValue("compare_product_data", []);
      setShowSearch(true);
      setCategory({});
    }
  };

  const isDifferentAttr = (attr) => {
    const attributes = products.map((p) => p.attributes[attr.key]);
    const allEqual = attributes.every((a) => a === attributes[0]);
    return !allEqual;
  };

  const getAttribute = (cProduct, attribute) => {
    let value = cProduct?.attributes?.[attribute?.key];
    if (!value) {
      return "---";
    } else if (Array.isArray(value)) {
      value = value.join(", ");
    }
    return value;
  };

  const checkHtml = (string) => {
    return /<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(
      string
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isSsrFetched) {
      if (existingSlugs.length) {
        fetchCompareProduct();
      }
      const query = existingSlugs.join("&id=");
      navigate(`${location.pathname}${query ? `?id=${query}` : ""}`, {
        replace: true,
      });
    }
  }, [existingSlugs]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchLoading(true);
    debouncedFetchSuggestions(searchText.trim());
  }, [searchText]);

  useEffect(() => {
    if (category?.keyValue?.firstValue) {
      fetchSuggestions("");
    }
  }, [category?.keyValue?.firstValue]);

  useEffect(() => {
    const items = suggestions?.filter?.(
      (i) => !existingSlugs?.includes(i.slug)
    );
    setFilteredSuggestions(items);
  }, [suggestions, existingSlugs]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    products: compare_product_data,
    attributes: compare_product_attribute,
    category,
    showSearch,
    searchLoading,
    searchText,
    setSearchText: handleInputChange,
    filteredSuggestions,
    cardProps: {
      isSaleBadge: false,
      isWishlistIcon: false,
      isImageFill: globalConfig?.img_fill,
    },
    imagePlaceholder: placeholder,
    loader: <Loader />,
    setShowSearch,
    handleAdd,
    handleRemove,
    handleInputChange,
    isDifferentAttr,
    getAttribute,
    checkHtml,
  };
};

export default useCompare;
