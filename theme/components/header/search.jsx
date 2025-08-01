import React, { useState, useRef, useCallback } from "react";
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
import { SEARCH_PRODUCT, AUTOCOMPLETE } from "../../queries/headerQuery";
import OutsideClickHandler from "react-outside-click-handler";
import { FDKLink } from "fdk-core/components";
import { useGlobalTranslation, useNavigate } from "fdk-core/utils";

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
  const [collectionsData, setCollectionsData] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const isDoubleRowHeader = globalConfig?.header_layout === "double";
  const isAlgoliaEnabled = globalConfig?.algolia_enabled;

  const openSearch = () => {
    setShowSearch(!showSearch);

    if (!showSearch) {
      setTimeout(() => {
        if (isRunningOnClient()) {
          inputRef.current?.focus();
          inputRef.current?.setSelectionRange?.(
            searchText.length,
            searchText.length
          );
        }
      }, 100);
    }
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchText("");
    setIsSearchFocused(false);
    if (inputRef?.current) inputRef.current.value = "";
  };

  const handleOutsideClick = () => {
    if (showSearch) {
      closeSearch();
    }
  };

  const getEnterSearchData = (searchText) => {
    setShowSearchSuggestions(false);

    if (isAlgoliaEnabled) {
      const BASE_URL = `${window.location.origin}/ext/algolia/application/api/v1.0/products`;
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
          } else {
            setSearchData([]);
            setTotalCount(0);
          }
        })
        .finally(() => {
          setShowSearchSuggestions(searchText?.length > 2);
        });
    } else {
      const payload = {
        pageNo: 1,
        search: searchText,
        filterQuery: "",
        enableFilter: false,
        sortOn: "",
        first: 8,
        after: "",
        pageType: "number",
      };
      fpi
        .executeGQL(SEARCH_PRODUCT, payload, { skipStoreUpdate: true })
        .then((res) => {
          setSearchData(res?.data?.products?.items);
          setTotalCount(res?.data?.products?.page?.item_total || 0);
        })
        .finally(() => {
          setShowSearchSuggestions(searchText?.length > 2);
        });
    }
    fpi
      .executeGQL(AUTOCOMPLETE, { query: searchText })
      .then((res) => {
        const { items } = res?.data?.searchProduct || {};
        const filteredCollections = items
          ?.filter((item) => item.type === "brand" || item.type === "category")
          ?.map((item) => ({
            ...item,
            action: item.action,
          }));
        setCollectionsData(filteredCollections || []);
      })
      .finally(() => {});
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
  const redirectToProduct = (link = "/") => {
    if (link) navigate(link);
    closeSearch();
    setSearchText("");
    if (inputRef?.current) inputRef.current.value = "";
  };

  const getProductSearchSuggestions = (results) => results?.slice(0, 4);
  const checkInput = () => {
    if (searchText) {
      return;
    }
    setIsSearchFocused(false);
  };

  const getDisplayData = (product) => {
    let displayName;

    if (screen === "mobile" && product.name.length > 40) {
      displayName = `${product.name.substring(0, 40)}...`;
    } else if (product.name.length > 95) {
      displayName = `${product.name.substring(0, 95)}...`;
    } else {
      displayName = product.name;
    }

    // Use displayName in your JSX
    return <div>{displayName}</div>;
  };

  const getImage = (product) => {
    if (Array.isArray(product?.media)) {
      return product.media?.find((item) => item.type === "image") || "";
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
                onChange={(e) => setEnterSearchData(e)}
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
              {/* eslint-disable jsx-a11y/label-has-associated-control */}
              <label
                htmlFor="searchInput"
                id="search-input-label"
                className={`${styles["search__input--label"]} b1 ${
                  styles.fontBody
                } ${isSearchFocused ? styles.active : ""}`}
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
                    {/* Collections Section */}
                    {Object.keys(groupedCollections).length > 0 && (
                      <div className={styles.collectionsSection}>
                        {Object.entries(groupedCollections).map(
                          ([type, items]) => (
                            <div key={type} className={styles.collectionGroup}>
                              <div
                                className={styles["search__suggestions--title"]}
                              >
                                {type}
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
                              const productUrl = `/product/${product.slug}`;
                              return (
                                <FDKLink
                                  key={index}
                                  action={product.action}
                                  onClick={() =>
                                    redirectToProduct(
                                      product.action?.path ||
                                        `/product/${product.slug}`
                                    )
                                  }
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
                  <div
                    className={`${styles["search__suggestions--item"]} ${styles.fontBody}`}
                  >
                    {t("resource.common.loading")}
                  </div>
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
