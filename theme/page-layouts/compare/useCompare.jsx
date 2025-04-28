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
  const [searchLoading, setSearchLoading] = useState(true);
  const latestRequest = useRef(0);
  const isFirstRender = useRef(true);

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

  const fetchCompareProduct = () => {
    setIsLoading(true);
    return fpi
      .executeGQL(PRODUCT_COMPARISON, { slug: existingSlugs })
      .then((res) => {
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
          // setProducts(productItems);
          fpi.custom.setValue("compare_product_data", productItems);

          if (!productItems?.length) {
            setShowSearch(true);
          }
          fpi.custom.setValue(
            "compare_product_attribute",
            res?.data?.productComparison?.attributes_metadata
          );
          // setAttributes(res?.data?.productComparison?.attributes_metadata);
        } else {
          showSnackbar(
            res?.errors?.[0]?.message ?? t("resource.common.error_message"),
            "error"
          );
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const fetchSuggestions = () => {
    const requestId = Date.now(); // Generate a unique ID for request
    latestRequest.current = requestId;
    setSearchLoading(true);

    try {
      const values = { enableFilter: true };
      if (searchText) values.search = searchText;
      if (category?.keyValue?.firstValue)
        values.filterQuery = `${category.keyValue.key}:${category.keyValue.firstValue}`;

      fpi
        .executeGQL(SEARCH_PRODUCT, values, { skipStoreUpdate: true })
        .then((res) => {
          if (latestRequest.current === requestId) {
            setSuggestions(res?.data?.products?.items);
          }
        });
    } catch (error) {
      showSnackbar(
        t("resource.compare.fetch_suggestion_failure"),
        "error"
      );
    }
  };

  const handleInputChange = debounce((t) => {
    setSearchText(t);
  }, 200);

  const handleAdd = (slug) => {
    setIsSsrFetched(false);
    const items = [slug, ...(existingSlugs ?? [])];
    localStorage?.setItem("compare_slugs", JSON.stringify(items));
    setExistingSlugs(items);
    setShowSearch("");
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
    fetchSuggestions();
  }, [category?.keyValue?.firstValue, searchText]);

  useEffect(() => {
    const items = suggestions?.filter?.(
      (i) => !existingSlugs?.includes(i.slug)
    );
    setFilteredSuggestions(items);
  }, [suggestions, existingSlugs]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSearchLoading(false);
  }, [filteredSuggestions]);

  return {
    isLoading,
    products: compare_product_data,
    attributes: compare_product_attribute,
    category,
    showSearch,
    searchLoading,
    searchText,
    setSearchText,
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
