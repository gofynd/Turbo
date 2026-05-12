import { useEffect } from "react";
import { prefetchCache } from "../prefetch-cache";
import { PLP_PRODUCTS } from "../../queries/plpQuery";

const usePrefetchProductsOnHover = ({ fpi, globalConfig }) => {
  useEffect(() => {
    // Algolia uses a different REST data shape — GQL cache would corrupt it
    if (globalConfig?.algolia_enabled) return;
    if (typeof document === "undefined") return;

    const handleMouseOver = (e) => {
      const link = e.target.closest('a[href*="/products"]');
      if (!link) return;
      // Ignore external links
      if (link.origin !== window.location.origin) return;

      // Only prefetch /products links (with or without query params)
      const { pathname } = link;
      if (pathname !== "/products" && pathname !== "/products/") return;

      // Parse query params from the link
      const params = new URLSearchParams(link.search);

      // Skip prefetching for pagination links - the prefetch always fetches page 1,
      // so caching it under a page_no=X key would serve wrong data
      if (params.has("page_no")) return;

      // Build cache key from the full URL (path + query) to differentiate
      // /products?brand=nike from /products?category=shoes
      const cacheKey = `plp-${link.search || ""}`;
      if (prefetchCache.has(cacheKey)) return;
      if (prefetchCache.hasPending(cacheKey)) return;

      // Build the GQL payload using the already parsed params
      let filterQuery = "";
      const filterParts = [];
      const skipKeys = new Set(["sort_on", "page_no", "q"]);

      params.forEach((value, key) => {
        if (!skipKeys.has(key)) {
          filterParts.push(`${key}:${value}`);
        }
      });
      filterQuery = filterParts.join(":::");

      const payload = {
        filterQuery: filterQuery || undefined,
        sortOn: params.get("sort_on") || undefined,
        search: params.get("q") || undefined,
        enableFilter: true,
        first: 12,
        pageType: "number",
        pageNo: 1,
      };

      const promise = fpi
        .executeGQL(PLP_PRODUCTS, payload)
        .then((res) => {
          if (res?.errors || !res?.data) return;
          prefetchCache.set(cacheKey, {
            products: res.data.products,
          });
        })
        .catch(() => {
          // Prefetch is best-effort — silently ignore failures
        })
        .finally(() => {
          prefetchCache.clearPending(cacheKey);
        });

      prefetchCache.setPending(cacheKey, promise);
    };

    document.addEventListener("mouseover", handleMouseOver);
    return () => document.removeEventListener("mouseover", handleMouseOver);
  }, [globalConfig?.algolia_enabled, fpi]);
};

export default usePrefetchProductsOnHover;
