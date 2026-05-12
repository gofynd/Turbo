import { useEffect } from "react";
import { prefetchCache } from "../prefetch-cache";
import { COLLECTION_WITH_ITEMS } from "../../queries/collectionsQuery";

const usePrefetchCollectionOnHover = ({ fpi, globalConfig }) => {
  useEffect(() => {
    // Algolia uses a different REST data shape — GQL cache would corrupt it
    if (globalConfig?.algolia_enabled) return;
    if (typeof document === "undefined") return;

    const handleMouseOver = (e) => {
      const link = e.target.closest('a[href*="/collection/"]');
      if (!link) return;
      // Ignore external links — slug would belong to a foreign domain
      if (link.origin !== window.location.origin) return;

      const slug = link.pathname?.split("/collection/")[1]?.split("/")[0];
      if (!slug) return;

      // Prefetch always fetches unfiltered page 1, so any query string on the
      // link (page_no, sort_on, filter keys) would cause a cache hit that
      // renders the wrong products. Skip when there are any params.
      if (link.search) return;

      const CACHE_KEY = `collection-${slug}`;
      if (prefetchCache.has(CACHE_KEY)) return;   // already cached
      if (prefetchCache.hasPending(CACHE_KEY)) return; // request already in flight

      // Store the promise so the listing hook can await it on navigation
      const promise = fpi
        .executeGQL(COLLECTION_WITH_ITEMS, {
          slug,
          pageType: "number",
          first: 12,
        })
        .then((res) => {
          if (res?.errors || !res?.data) return;
          prefetchCache.set(CACHE_KEY, {
            collection: res.data.collection,
            collectionItems: res.data.collectionItems,
          });
        })
        .catch(() => {
          // Prefetch is best-effort — silently ignore failures
        })
        .finally(() => {
          prefetchCache.clearPending(CACHE_KEY);
        });

      prefetchCache.setPending(CACHE_KEY, promise);
    };

    document.addEventListener("mouseover", handleMouseOver);
    return () => document.removeEventListener("mouseover", handleMouseOver);
  }, [globalConfig?.algolia_enabled, fpi]);
};

export default usePrefetchCollectionOnHover;
