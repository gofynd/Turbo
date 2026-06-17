import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  isRunningOnClient,
  debounce,
  getProductImgAspectRatio,
} from "../../helper/utils";
import {
  useGlobalStore,
  useGlobalTranslation,
  useNavigate,
} from "fdk-core/utils";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";
import SearchIcon from "../../assets/images/single-row-search.svg";
import CloseIcon from "../../assets/images/close.svg";
import InputSearchIcon from "../../assets/images/search-black.svg";
import MicrophoneIcon from "../../assets/images/microphone.svg";
import styles from "./styles/search.less";
import { AUTOCOMPLETE } from "../../queries/headerQuery";
import OutsideClickHandler from "react-outside-click-handler";
import { FDKLink } from "fdk-core/components";
import SearchSuggestionsShimmer from "../shimmer/search-suggestions-shimmer";

const SEARCH_HISTORY_KEY = "theme-search-history";
const MAX_SEARCH_HISTORY_ITEMS = 5;
const EMPTY_SEARCH_RESULT = {
  products: [],
  totalCount: 0,
  collections: [],
  querySuggestions: [],
};

function Search({
  screen,
  globalConfig,
  fpi,
  customSearchClass = "",
  customSearchWrapperClass = "",
  showCloseButton = true,
  alwaysOnSearch = false,
  hideTriggerOnMobile = false,
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
  const [recentSearches, setRecentSearches] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const navigate = useNavigate();
  const { openHeaderSearch } = useGlobalStore(fpi?.getters?.CUSTOM_VALUE) || {};
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const isDoubleRowHeader = globalConfig?.header_layout === "double";
  const isAlgoliaEnabled = globalConfig?.algolia_enabled;
  const isSearchHistoryEnabled = globalConfig?.enable_search_history ?? false;

  const readRecentSearches = useCallback(() => {
    if (!isRunningOnClient()) return [];

    try {
      const storedHistory = window.localStorage.getItem(SEARCH_HISTORY_KEY);
      const parsedHistory = JSON.parse(storedHistory || "[]");
      return Array.isArray(parsedHistory)
        ? parsedHistory.filter(
            (item) => typeof item === "string" && item.trim()
          )
        : [];
    } catch (error) {
      return [];
    }
  }, []);

  const persistRecentSearches = useCallback(
    (history) => {
      if (!isRunningOnClient()) return;

      try {
        window.localStorage.setItem(
          SEARCH_HISTORY_KEY,
          JSON.stringify(history)
        );
      } catch (error) {
        // Search navigation should continue when browser storage is unavailable.
      }
      setRecentSearches(history);
    },
    [setRecentSearches]
  );

  const storeSearchHistory = useCallback(
    (value) => {
      if (!isSearchHistoryEnabled) return;

      const normalizedValue = value?.trim();
      if (!normalizedValue) return;

      const updatedHistory = [
        normalizedValue,
        ...readRecentSearches().filter(
          (item) => item.toLowerCase() !== normalizedValue.toLowerCase()
        ),
      ].slice(0, MAX_SEARCH_HISTORY_ITEMS);

      persistRecentSearches(updatedHistory);
    },
    [isSearchHistoryEnabled, persistRecentSearches, readRecentSearches]
  );

  const handleRecentSearchDelete = useCallback(
    (value) => {
      if (!isSearchHistoryEnabled) return;

      const updatedHistory = readRecentSearches().filter(
        (item) => item.toLowerCase() !== value?.toLowerCase()
      );
      persistRecentSearches(updatedHistory);
    },
    [isSearchHistoryEnabled, persistRecentSearches, readRecentSearches]
  );
  const isVoiceSearchEnabled = globalConfig?.enable_voice_search;

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

  useEffect(() => {
    if (!isSearchHistoryEnabled) {
      setRecentSearches([]);
      return;
    }

    setRecentSearches(readRecentSearches());
  }, [isSearchHistoryEnabled, readRecentSearches]);

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

  const openSearchFromExternal = () => {
    setShowSearch(true);
    // Focus is handled by the mobile nav tap handler via the temp input trick.
    // No focus() here — a delayed focus() would reopen the keyboard if the user
    // had already tapped elsewhere in the 300ms window.
    setTimeout(() => {
      if (isRunningOnClient() && inputRef.current) {
        const existingValue = inputRef.current?.value || searchText || "";
        const len = existingValue.length;
        inputRef.current?.setSelectionRange?.(len, len);
        if (existingValue.length > 2) getEnterSearchData(existingValue);
      }
    }, 300);
  };

  useEffect(() => {
    if (openHeaderSearch && fpi) {
      openSearchFromExternal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when openHeaderSearch is triggered
  }, [openHeaderSearch]);

  useEffect(() => {
    if (isRunningOnClient()) {
      const SR =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsVoiceSupported(!!SR);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
  };

  const preventButtonFocus = useCallback((event) => {
    event.preventDefault();
  }, []);

  const syncSearchInputValue = useCallback((value = "") => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
    setSearchText(value);
    setHasInputValue(value.length > 0);
  }, []);

  const applySearchPreviewData = useCallback(
    (value, data = EMPTY_SEARCH_RESULT, options = {}) => {
      const {
        products = [],
        totalCount: nextTotalCount = 0,
        collections = [],
        querySuggestions: nextQuerySuggestions = [],
      } = data;
      const { forceNoProductsFallback = false } = options;

      if (products.length > 0) {
        setSearchData(products);
        setTotalCount(nextTotalCount);
        setCollectionsData(collections);
        setQuerySuggestions(nextQuerySuggestions);
      } else {
        setSearchData([]);
        setTotalCount(0);
        setCollectionsData(forceNoProductsFallback ? [] : collections);
        setQuerySuggestions(forceNoProductsFallback ? [] : nextQuerySuggestions);
      }

      setShowSearchSuggestions(value?.length > 2);
    },
    []
  );

  const fetchSearchPreviewData = useCallback(
    (value) => {
      const normalizedValue = value?.trim();
      if (!normalizedValue) {
        return Promise.resolve(EMPTY_SEARCH_RESULT);
      }

      if (isAlgoliaEnabled) {
        const BASE_URL = `${window.location.origin}/ext/search/application/api/v1.0/products`;
        const url = new URL(BASE_URL);
        url.searchParams.append("page_size", "4");
        url.searchParams.append("q", normalizedValue);

        return fetch(url)
          .then((response) => response.json())
          .then((data) => {
            const productDataNormalization =
              data.items?.map((item) => ({
                ...item,
                media: item.medias,
              })) || [];

            return {
              ...EMPTY_SEARCH_RESULT,
              products: productDataNormalization,
              totalCount: data.page?.item_total || 0,
            };
          });
      }

      return fpi.executeGQL(AUTOCOMPLETE, { query: normalizedValue }).then(
        (res) => {
          const { items } = res?.data?.searchProduct || {};

          const products =
            items?.filter((item) => item.type === "product") || [];
          const collections =
            items?.filter(
              (item) =>
                item.type === "brand" ||
                item.type === "category" ||
                item.type === "collection"
            ) || [];

          return {
            ...EMPTY_SEARCH_RESULT,
            products: products.slice(0, 4),
            totalCount: products.length,
            collections: collections.map((item) => ({
              ...item,
              action: item.action,
            })),
          };
        }
      );
    },
    [fpi, isAlgoliaEnabled]
  );

  const getEnterSearchData = useCallback(
    (value, options = {}) => {
      const normalizedValue = value?.trim() || "";
      setShowSearchSuggestions(false);

      return fetchSearchPreviewData(normalizedValue)
        .then((data) => {
          applySearchPreviewData(normalizedValue, data, options);
          return data;
        })
        .catch((error) => {
          console.error("Search API error:", error);
          applySearchPreviewData(normalizedValue, EMPTY_SEARCH_RESULT, options);
          return EMPTY_SEARCH_RESULT;
        });
    },
    [applySearchPreviewData, fetchSearchPreviewData]
  );

  const runSearch = (value) => {
    const normalizedValue = value?.trim();
    if (!normalizedValue) return;

    storeSearchHistory(normalizedValue);
    redirectToProduct(`/products/?q=${normalizedValue}`);
  };

  const toggleVoiceSearch = () => {
    if (isListening) {
      stopVoiceSearch();
      return;
    }

    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    // On mobile, dismiss the on-screen keyboard for better UX during voice search.
    // Blur both the search input and any other focused element to ensure keyboard closes.
    if (isRunningOnClient()) {
      if (inputRef.current) {
        inputRef.current.blur();
      }
      if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
      }
    }

    const recognition = new SR();
    recognition.lang = document.documentElement.lang || "en";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results || [])
        .map((result) => result?.[0]?.transcript || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      const latestResult = event.results?.[event.results.length - 1];

      if (transcript) {
        syncSearchInputValue(transcript);
      }

      if (latestResult?.isFinal) {
        setIsListening(false);
        if (transcript) {
          getEnterSearchData(transcript, {
            forceNoProductsFallback: true,
          }).finally(() => runSearch(transcript));
        }
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setShowSearchSuggestions(false);
    setSearchData([]);
    setCollectionsData([]);
    setQuerySuggestions([]);
    setTotalCount(0);
    recognition.start();
    setIsListening(true);
  };

  const collapseSearch = () => {
    setShowSearch(false);
    // setIsSearchFocused(false);
    setShowSearchSuggestions(false);
    setSearchData([]);
    setCollectionsData([]);
    setQuerySuggestions([]);
    setTotalCount(0);
  };
  const clearAll = () => {
    setSearchText("");
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
    stopVoiceSearch();
    collapseSearch();
    clearAll();
    // clearAll() re-focuses the input (so the cursor stays put when the
    // user taps the in-overlay "Clear All" button). On close that focus is
    // unwanted: the input becomes invisible but still focused, and on
    // mobile any subsequent user gesture (e.g. tapping a page-level button
    // like "Shop Now") could then pop the keyboard. Blur it explicitly.
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleOutsideClick = () => {
    if (showSearch) {
      closeSearch();
    }
  };
  const groupedCollections = collectionsData.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const setEnterSearchData = useCallback(
    debounce((value) => {
      if (!showSearch) {
        setShowSearch(true);
      }
      setSearchText(value);
      getEnterSearchData(value);
    }, 400),
    []
  );

  const handleInputChange = (e) => {
    const { value } = e.target;
    // Immediately update hasInputValue for label animation (no delay)
    setSearchText(value);
    setHasInputValue(value.length > 0);
    // Call debounced search function
    setEnterSearchData(value);
  };
  const redirectToProduct = (link = "/", searchQuery = "") => {
    storeSearchHistory(searchQuery);
    if (link) navigate(link);
    // Blur the input on navigate so the on-screen keyboard closes on mobile.
    // Without this, the input is hidden by the closing overlay but still
    // focused, so iOS keeps the keyboard up after pressing Enter / tapping a
    // suggestion / "See all products".
    if (isRunningOnClient() && inputRef.current) {
      inputRef.current.blur();
    }
    // When alwaysOnSearch is enabled, clear all search data and hide suggestions
    // but keep the search input visible
    if (alwaysOnSearch) {
      setShowSearchSuggestions(false);
      setSearchData([]);
      setCollectionsData([]);
      setQuerySuggestions([]);
      setTotalCount(0);
      setSearchText("");
      setHasInputValue(false);
      // Clear input value safely
      if (isRunningOnClient() && inputRef.current) {
        inputRef.current.value = "";
      }
    } else {
      collapseSearch();
    }
  };

  const handleRecentSearchClick = (value) => {
    if (inputRef.current) {
      inputRef.current.value = value;
      inputRef.current.focus();
    }
    setSearchText(value);
    setHasInputValue(true);
    runSearch(value);
  };

  const getProductSearchSuggestions = (results) => results?.slice(0, 4);
  const currentInputValue = inputRef.current?.value || "";
  const shouldShowSearchHistory =
    showSearch &&
    isSearchHistoryEnabled &&
    !currentInputValue &&
    recentSearches.length > 0;
  const shouldShowSuggestions =
    shouldShowSearchHistory || searchText?.length > 2;
  const shouldShowSearchResults =
    !shouldShowSearchHistory && showSearchSuggestions;

  const checkInput = () => {
    // Check the actual input value, not the debounced searchText state
    if (inputRef.current?.value) {
      return;
    }
    // setIsSearchFocused(false);
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
        className={`${styles.searchIcon} ${hideTriggerOnMobile ? styles.hideTriggerOnMobile : ""}`.trim()}
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
          data-role="search-overlay"
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
                placeholder={t("resource.facets.search")}
                onChange={handleInputChange}
                onKeyUp={(e) =>
                  e.key === "Enter" &&
                  e.target?.value &&
                  runSearch(e.target?.value)
                }
                onFocus={() => setIsSearchFocused(true)}
                // onBlur={checkInput}
                aria-labelledby="search-input-label"
                aria-label="search-input-label"
              />
              {/* {!(hasInputValue || inputRef.current?.value) && (
                <InputSearchIcon
                  className={styles["search__input--search-icon"]}
                  onClick={() => getEnterSearchData(searchText)}
                />
              )} */}
              {isVoiceSearchEnabled && isVoiceSupported && (
                <button
                  type="button"
                  className={`${styles.voiceSearchBtn} ${isListening ? styles.voiceSearchBtnActive : ""}`.trim()}
                  aria-label={
                    isListening
                      ? t("resource.facets.stop_voice_search")
                      : t("resource.facets.start_voice_search")
                  }
                  title={
                    isListening
                      ? t("resource.facets.voice_search_listening")
                      : t("resource.facets.search_by_voice")
                  }
                  onPointerDown={preventButtonFocus}
                  onMouseDown={preventButtonFocus}
                  onClick={toggleVoiceSearch}
                >
                  <MicrophoneIcon className={styles.voiceSearchIcon} />
                </button>
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
              {/* <label
                htmlFor="searchInput"
                id="search-input-label"
                className={`${styles["search__input--label"]} b1 ${
                  styles.fontBody
                } ${isSearchFocused || hasInputValue ? styles.active : ""}`}
                style={{ display: !isDoubleRowHeader ? "block" : "none" }}
              >
                {t("resource.facets.search")}
              </label> */}
            </div>
            {showCloseButton && (
              <CloseIcon
                className={`${styles["search--closeIcon"]} ${styles.headerIcon}`}
                onClick={closeSearch}
              />
            )}
            <div
              className={styles.search__suggestions}
              style={{ display: shouldShowSuggestions ? "block" : "none" }}
            >
              <div className={styles["search__suggestions--products"]}>
                {/* eslint-disable-next-line no-nested-ternary */}
                {shouldShowSearchHistory ? (
                  <>
                    <div
                      className={`b1 ${styles["search__suggestions--title"]} fontBody`}
                    >
                      {t("resource.facets.recent_searches")}
                    </div>
                    <ul className={styles.searchHistoryList}>
                      {recentSearches.map((item, index) => (
                        <li
                          key={`${item}-${index}`}
                          className={styles.searchHistoryItem}
                        >
                          <button
                            type="button"
                            className={`${styles["search__suggestions--item"]} ${styles.searchHistoryButton}`}
                            onClick={() => handleRecentSearchClick(item)}
                          >
                            <InputSearchIcon
                              className={styles.searchHistoryIcon}
                            />
                            <span>{item}</span>
                          </button>
                          <button
                            type="button"
                            className={styles.searchHistoryDeleteButton}
                            aria-label={t(
                              "resource.facets.delete_search_history_item",
                              { item }
                            )}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRecentSearchDelete(item);
                            }}
                          >
                            <CloseIcon />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : shouldShowSearchResults ? (
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
                                  redirectToProduct(
                                    item.action?.path || "/",
                                    searchText
                                  )
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
                      <div
                        className={styles.collectionsSection}
                        data-search-section="collections"
                      >
                        {Object.entries(groupedCollections).map(
                          ([type, items]) => (
                            <div
                              key={type}
                              className={styles.collectionGroup}
                              data-search-collection-type={type}
                            >
                              <div
                                className={styles["search__suggestions--title"]}
                                data-search-collection-title={type}
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </div>
                              <ul data-search-collection-list={type}>
                                {items.map((item, index) => (
                                  <li
                                    key={index}
                                    className={
                                      styles["search__suggestions--item"]
                                    }
                                    data-search-collection-item={type}
                                    data-search-collection-item-index={index}
                                  >
                                    <FDKLink
                                      action={item.action}
                                      className={styles.linkButton}
                                      title={item.display}
                                      data-search-collection-link={type}
                                      onClick={() =>
                                        redirectToProduct(
                                          item.action?.path || "/",
                                          searchText
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
                                  onClick={() =>
                                    redirectToProduct(productUrl, searchText)
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
                          onClick={() => runSearch(searchText)}
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
