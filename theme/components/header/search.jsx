import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  isRunningOnClient,
  debounce,
  getProductImgAspectRatio,
} from "../../helper/utils";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import SearchIcon from "../../assets/images/single-row-search.svg";
import CloseIcon from "../../assets/images/close.svg";
import InputSearchIcon from "../../assets/images/search.svg";
import styles from "./styles/search.less";
import { AUTOCOMPLETE } from "../../queries/headerQuery";
import OutsideClickHandler from "react-outside-click-handler";
import { FDKLink } from "fdk-core/components";
import { useGlobalTranslation, useNavigate } from "fdk-core/utils";
import SearchSuggestionsShimmer from "../shimmer/search-suggestions-shimmer";

function Search({
  screen,
  globalConfig,
  fpi,
  customSearchClass = "",
  customSearchWrapperClass = "",
  showCloseButton = true,
  alwaysOnSearch = false,
}) {
  const { t } = useGlobalTranslation("translation");
  const [searchData, setSearchData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showSearch, setShowSearch] = useState(alwaysOnSearch);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hasInputValue, setHasInputValue] = useState(false); // Track if input has text immediately
  const [collectionsData, setCollectionsData] = useState([]);
  const [querySuggestions, setQuerySuggestions] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const isDoubleRowHeader = globalConfig?.header_layout === "double";
  const isAlgoliaEnabled = globalConfig?.algolia_enabled;

  useEffect(() => {
    if (showSearch) {
      document.body.classList.add("noscroll");
    } else {
      document.body.classList.remove("noscroll");
    }
    // Cleanup function to remove the class if the component unmounts while search is open
    return () => {
      document.body.classList.remove("noscroll");
    };
  }, [showSearch]);

  const openSearch = () => {
    setShowSearch(!showSearch);

    if (!showSearch) {
      setTimeout(() => {
        if (isRunningOnClient()) {
          const existingValue = inputRef.current?.value || searchText || "";
          inputRef.current?.focus();
          const len = existingValue.length;
          inputRef.current?.setSelectionRange?.(len, len);
          if (existingValue.length > 2) getEnterSearchData(existingValue);
        }
      }, 100);
    }
  };

  const collapseSearch = () => {
    setShowSearch(false);
    setIsSearchFocused(false);
    setShowSearchSuggestions(false);
    setSearchData([]);
    setCollectionsData([]);
    setQuerySuggestions([]);
    setTotalCount(0);
  };
  const clearAll = () => {
    setSearchText("");
    setIsSearchFocused(false);
    setHasInputValue(false);
    setShowSearchSuggestions(false);
    setSearchData([]);
    setCollectionsData([]);
    setQuerySuggestions([]);
    setTotalCount(0);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };
  const closeSearch = () => {
    collapseSearch();
    clearAll();
  };

  const handleOutsideClick = () => {
    if (showSearch) {
      closeSearch();
    }
  };

  const getEnterSearchData = (searchText) => {
    setShowSearchSuggestions(false);

    if (isAlgoliaEnabled) {
      const BASE_URL = `${window.location.origin}/ext/search/application/api/v1.0/products`;
      const url = new URL(BASE_URL);
      url.searchParams.append("page_size", "4");
      url.searchParams.append("q", searchText);

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const productDataNormalization = data.items?.map((item) => ({
            ...item,
            media: item.medias,
          }));
          if (productDataNormalization.length) {
            setSearchData(productDataNormalization);
            setTotalCount(data.page?.item_total || 0);
            setQuerySuggestions([]);
          } else {
            setSearchData([]);
            setTotalCount(0);
            setQuerySuggestions([]);
          }
        })
        .finally(() => {
          setShowSearchSuggestions(searchText?.length > 2);
        });
    } else {
      // Use only AUTOCOMPLETE API and handle products from the response
      fpi
        .executeGQL(AUTOCOMPLETE, { query: searchText })
        .then((res) => {
          const { items } = res?.data?.searchProduct || {};

          // Separate products from brands/categories based on type
          const products =
            items?.filter((item) => item.type === "product") || [];
          const collections =
            items?.filter(
              (item) =>
                item.type === "brand" ||
                item.type === "category" ||
                item.type === "collection"
            ) || [];

          // Set product data (limit to 4 for consistency with UI)
          const limitedProducts = products.slice(0, 4);
          setSearchData(limitedProducts);
          setTotalCount(products.length); // Total product count for "See all" link

          // Set collections data
          setCollectionsData(
            collections.map((item) => ({
              ...item,
              action: item.action,
            }))
          );
          // Current AUTOCOMPLETE response does not return separate query suggestions,
          // so we clear any previous suggestions.
          setQuerySuggestions([]);
        })
        .catch((error) => {
          console.error("Search API error:", error);
          // Fallback: clear data on error
          setSearchData([]);
          setTotalCount(0);
          setCollectionsData([]);
          setQuerySuggestions([]);
        })
        .finally(() => {
          setShowSearchSuggestions(searchText?.length > 2);
        });
    }
  };
  const groupedCollections = collectionsData.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const setEnterSearchData = useCallback(
    debounce((e) => {
      if (!showSearch) {
        setShowSearch(true);
      }
      setSearchText(e.target.value);
      getEnterSearchData(e.target.value);
    }, 400),
    []
  );

  const handleInputChange = (e) => {
    // Immediately update hasInputValue for label animation (no delay)
    setHasInputValue(e.target.value.length > 0);
    // Call debounced search function
    setEnterSearchData(e);
  };
  const redirectToProduct = (link = "/") => {
    if (link) navigate(link);
    collapseSearch();
  };

  const getProductSearchSuggestions = (results) => results?.slice(0, 4);
  const checkInput = () => {
    // Check the actual input value, not the debounced searchText state
    if (inputRef.current?.value) {
      return;
    }
    setIsSearchFocused(false);
    setHasInputValue(false);
  };

  const getDisplayData = (product) => {
    // Handle both name (from products API) and display (from autocomplete API)
    const productName = product.display || product.name || "";
    let displayName;

    if (screen === "mobile" && productName.length > 40) {
      displayName = `${productName.substring(0, 40)}...`;
    } else if (productName.length > 95) {
      displayName = `${productName.substring(0, 95)}...`;
    } else {
      displayName = productName;
    }

    // Use displayName in your JSX
    return <div>{displayName}</div>;
  };

  const getImage = (product) => {
    // Handle both media array (from products API) and logo object (from autocomplete API)
    if (Array.isArray(product?.media)) {
      return product.media?.find((item) => item.type === "image") || "";
    }
    // For autocomplete API products, check logo field
    if (product?.logo && product.logo.type === "image") {
      return product.logo;
    }
    return "";
  };

  return (
    <div
      className={
        isDoubleRowHeader
          ? styles["double-row-search"]
          : styles["single-row-search"]
      }
    >
      <button
        className={styles.searchIcon}
        onClick={openSearch}
        aria-label="search"
        type="button"
        style={{
          display: alwaysOnSearch ? "none" : "block",
        }}
      >
        <SearchIcon className={`${styles.searchIcon} ${styles.headerIcon}`} />
      </button>
      <OutsideClickHandler onOutsideClick={handleOutsideClick}>
        <motion.div
          className={`${styles.search} ${customSearchClass}`}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{
            scaleY: showSearch ? 1 : 0,
            opacity: showSearch ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            transformOrigin: "top",
          }}
        >
          <div
            className={`${styles.search__wrapper} ${customSearchWrapperClass}`}
          >
            <div className={styles.search__input}>
              <input
                ref={inputRef}
                className={`${styles["search__input--text"]} ${isSearchFocused ? styles["search__input--removeSpace"] : ""}`.trim()}
                type="text"
                id="searchInput"
                autoComplete="off"
                defaultValue={searchText}
                placeholder={
                  isDoubleRowHeader ? t("resource.facets.search") : ""
                }
                onChange={handleInputChange}
                onKeyUp={(e) =>
                  e.key === "Enter" &&
                  e.target?.value &&
                  redirectToProduct(`/products/?q=${e.target?.value}`)
                }
                onFocus={() => setIsSearchFocused(true)}
                onBlur={checkInput}
                aria-labelledby="search-input-label"
                aria-label="search-input-label"
              />
              {!isSearchFocused && (
                <InputSearchIcon
                  className={styles["search__input--search-icon"]}
                  onClick={() => getEnterSearchData(searchText)}
                />
              )}
              {(hasInputValue || inputRef.current?.value) && (
                <button
                  type="button"
                  className={`${styles.clearAllBtn} fontHeader`}
                  aria-label="Clear search"
                  title="Clear"
                  onMouseDown={(e) => e.preventDefault()} // prevents blur
                  onClick={clearAll}
                >
                  Clear All
                </button>
              )}
              {/* eslint-disable jsx-a11y/label-has-associated-control */}
              <label
                htmlFor="searchInput"
                id="search-input-label"
                className={`${styles["search__input--label"]} b1 ${
                  styles.fontBody
                } ${isSearchFocused || hasInputValue ? styles.active : ""}`}
                style={{ display: !isDoubleRowHeader ? "block" : "none" }}
              >
                {t("resource.facets.search")}
              </label>
            </div>
            {showCloseButton && (
              <CloseIcon
                className={`${styles["search--closeIcon"]} ${styles.headerIcon}`}
                onClick={closeSearch}
              />
            )}
            <div
              className={styles.search__suggestions}
              style={{ display: searchText?.length > 2 ? "block" : "none" }}
            >
              <div className={styles["search__suggestions--products"]}>
                {showSearchSuggestions ? (
                  <>
                    {/* Query Suggestions Section */}
                    {querySuggestions.length > 0 && (
                      <div
                        className={`${styles.collectionsSection} ${styles.querySuggestionsSection}`.trim()}
                      >
                        <div
                          className={`b1 ${styles["search__suggestions--title"]} fontBody`}
                        >
                          Suggestions
                        </div>
                        <ul>
                          {querySuggestions.map((item, index) => (
                            <li
                              key={index}
                              className={styles["search__suggestions--item"]}
                            >
                              <FDKLink
                                action={item.action}
                                className={styles.linkButton}
                                title={item.display}
                                onClick={() =>
                                  redirectToProduct(item.action?.path || "/")
                                }
                              >
                                {item.display}
                              </FDKLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Collections Section */}
                    {Object.keys(groupedCollections).length > 0 && (
                      <div className={styles.collectionsSection}>
                        {Object.entries(groupedCollections).map(
                          ([type, items]) => (
                            <div key={type} className={styles.collectionGroup}>
                              <div
                                className={styles["search__suggestions--title"]}
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </div>
                              <ul>
                                {items.map((item, index) => (
                                  <li
                                    key={index}
                                    className={
                                      styles["search__suggestions--item"]
                                    }
                                  >
                                    <FDKLink
                                      action={item.action}
                                      className={styles.linkButton}
                                      title={item.display}
                                      onClick={() =>
                                        redirectToProduct(
                                          item.action?.path || "/"
                                        )
                                      }
                                    >
                                      {item.display}
                                    </FDKLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {searchData?.length > 0 && (
                      <>
                        <div
                          className={`b1 ${styles["search__suggestions--title"]} fontBody`}
                        >
                          Products
                        </div>
                        <ul>
                          {getProductSearchSuggestions(searchData)?.map(
                            (product, index) => {
                              const productUrl = `/product/${product.action?.page?.params?.slug}`;
                              return (
                                <FDKLink
                                  key={index}
                                  action={product.action}
                                  onClick={() => redirectToProduct(productUrl)}
                                  className={
                                    styles["search__suggestions--item-link"]
                                  }
                                >
                                  <li
                                    className={`${styles["search__suggestions--item"]} ${styles.flexAlignCenter}`}
                                  >
                                    <div className={styles.productThumb}>
                                      <FyImage
                                        src={getImage(product)?.url}
                                        alt={getImage(product)?.alt}
                                        sources={[{ width: 100 }]}
                                        globalConfig={globalConfig}
                                        aspectRatio={getProductImgAspectRatio(
                                          globalConfig
                                        )}
                                      />
                                    </div>
                                    <div
                                      className={`${styles.productTitle} b1 ${styles.fontBody}`}
                                    >
                                      {getDisplayData(product)}
                                    </div>
                                  </li>
                                </FDKLink>
                              );
                            }
                          )}
                        </ul>
                      </>
                    )}
                    {searchData?.length > 0 && totalCount > 4 && (
                      <div className={styles["search__suggestions--button"]}>
                        <FDKLink
                          to={`/products/?q=${searchText}`}
                          onClick={() => redirectToProduct()}
                          className="btnLink fontBody"
                          title={`See all ${totalCount} products`}
                        >
                          <span>SEE ALL {totalCount} PRODUCTS</span>
                        </FDKLink>
                      </div>
                    )}
                    {/* No Result Fallback */}
                    {searchData?.length === 0 &&
                      collectionsData?.length === 0 && (
                        <ul>
                          <li
                            className={`${styles.flexAlignCenter} ${styles.noResult} fontBody`}
                          >
                            <ul className={styles.noResultContainer}>
                              <li className={styles.noResultMessage}>
                                <div>
                                  Sorry, nothing found for{" "}
                                  <strong>{searchText}</strong>
                                </div>

                                <FDKLink
                                  to="/products"
                                  onClick={() => redirectToProduct("/products")}
                                  className={`${styles.noResultLink} btnPrimary `}
                                  title="See all products"
                                >
                                  SEE ALL PRODUCTS &rarr;
                                </FDKLink>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      )}
                  </>
                ) : (
                  <SearchSuggestionsShimmer />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </OutsideClickHandler>
    </div>
  );
}

export default Search;
