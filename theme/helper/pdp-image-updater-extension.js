/**
 * PDP Image Updater - Extension Event Listener
 *
 * Listens to extension events and updates product images on PDP page.
 * Updated images are prepended at index 0, with original images following.
 *
 * Event Specification:
 * - Event Name: "extension:updatePdpImages"
 */

import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useFPI } from "fdk-core/utils";
import { isRunningOnClient } from "./utils";

// ===== EVENT NAME =====
export const EXTENSION_EVENT = "extension:updatePdpImages";

// ===== STORE KEY PREFIX =====
const STORE_KEY_PREFIX = "pdpUpdatedImages_";

// ===== VALIDATION =====
/**
 * Validate and normalize images
 * Supports both legacy format ({ url, type, alt }) and new indexed format ({ url, index }).
 * @param {Array|Object|string} images - Images to validate
 * @returns {Array} Validated image array
 */
const validateImages = (images) => {
  if (!images) {
    throw new Error("Images are required in event payload");
  }

  const imagesArray = Array.isArray(images) ? images : [images];

  return imagesArray.map((img, arrayIndex) => {
    // Handle string URLs (legacy)
    if (typeof img === "string") {
      return {
        url: img,
        type: "image",
        alt: `Product Image ${arrayIndex + 1}`,
      };
    }

    // Validate object format
    if (typeof img !== "object" || !img || !img.url) {
      throw new Error(
        `Invalid image at index ${arrayIndex}: must have 'url' property`
      );
    }

    const normalized = {
      url: img.url,
      type: img.type || "image",
      alt: img.alt || `Product Image ${arrayIndex + 1}`,
    };

    // Preserve index if provided (new indexed format)
    if (img.index !== undefined && img.index !== null) {
      normalized.index = img.index;
    }

    return normalized;
  });
};

/**
 * Get product slug from URL or FPI store
 * @param {string} [productSlug] - Optional product slug
 * @param {Object} [fpi] - FPI instance
 * @returns {string|null} Product slug or null
 */
const getProductSlug = (productSlug = null, fpi = null) => {
  if (productSlug) {
    return productSlug;
  }

  if (!isRunningOnClient()) {
    return null;
  }

  // Try to get from URL
  const currentPath = window.location?.pathname || "";
  const pdpMatch = currentPath.match(/\/product\/([^/]+)/);
  if (pdpMatch) {
    return pdpMatch[1];
  }

  // Try to get from FPI store
  if (fpi?.store) {
    try {
      const state = fpi.store.getState();
      const { product_details: productDetails } = state?.PRODUCT || {};
      if (productDetails?.slug) {
        return productDetails.slug;
      }
    } catch (error) {
      // Silently handle errors
    }
  }

  return null;
};

/**
 * Get store key for product images
 * @param {string} productSlug - Product slug
 * @returns {string} Store key
 */
const getStoreKey = (productSlug) => `${STORE_KEY_PREFIX}${productSlug}`;

// ===== CUSTOM HOOK =====
/**
 * Hook to listen to extension events and update PDP images
 *
 * @param {string} [productSlug] - Current product slug (optional, auto-detected)
 * @returns {Object} Updated images and helper functions
 *
 * @example
 * const { updatedImages, hasUpdates } = usePdpImageUpdaterFromExtension(slug);
 */
export function usePdpImageUpdaterFromExtension(productSlug = null) {
  const fpi = useFPI();
  const location = useLocation();
  const [updatedImages, setUpdatedImages] = useState(null);
  const prevSlugRef = useRef(null);
  const prevPathnameRef = useRef(null);

  // Get current product slug
  const currentSlug = productSlug || getProductSlug(null, fpi);

  // Clear images when navigating away from product page or when slug/pathname changes
  useEffect(() => {
    if (!isRunningOnClient() || !fpi?.store) {
      return;
    }

    const currentPathname = location?.pathname || "";
    const isOnProductPage = currentPathname.match(/\/product\/([^/]+)/);
    const pathnameChanged =
      prevPathnameRef.current !== null &&
      prevPathnameRef.current !== currentPathname;

    // Derive previous product slug from pathname so we clear even when currentSlug is stale
    const prevPathMatch = prevPathnameRef.current?.match(/\/product\/([^/]+)/);
    const prevSlugFromPath = prevPathMatch ? prevPathMatch[1] : null;
    const slugChanged =
      prevSlugRef.current !== null && prevSlugRef.current !== currentSlug;
    const navigatedAway =
      prevPathnameRef.current !== null &&
      prevPathnameRef.current.match(/\/product\/([^/]+)/) &&
      !isOnProductPage;

    // Clear images if:
    // 1. Pathname changed (always clear previous product's store so we don't rely on currentSlug timing)
    // 2. Slug changed (different product)
    // 3. Navigated away from product page
    const shouldClear =
      (pathnameChanged && prevSlugFromPath) ||
      slugChanged ||
      navigatedAway ||
      (pathnameChanged && !isOnProductPage);

    if (shouldClear) {
      const slugToClear = prevSlugFromPath || prevSlugRef.current;
      if (slugToClear) {
        const prevStoreKey = getStoreKey(slugToClear);
        try {
          fpi.custom.setValue(prevStoreKey, null);
        } catch (error) {
          // Silently handle errors
        }
      }
      setUpdatedImages(null);
    }

    // Update refs
    prevSlugRef.current = currentSlug;
    prevPathnameRef.current = currentPathname;
  }, [currentSlug, location?.pathname, fpi]);

  // On unmount only: clear store for the product we were showing (PDP section unmounts on route change)
  useEffect(() => {
    return () => {
      if (!isRunningOnClient() || !fpi?.store) return;
      const slugToClear = prevSlugRef.current;
      if (slugToClear && typeof slugToClear === "string") {
        try {
          fpi.custom.setValue(getStoreKey(slugToClear), null);
        } catch (error) {
          // Silently handle errors
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- clear store only on unmount; fpi ref is stable

  // Load existing images from store on mount and slug change
  useEffect(() => {
    if (!currentSlug || !fpi?.store) {
      setUpdatedImages(null);
      return;
    }

    const storeKey = getStoreKey(currentSlug);
    try {
      const state = fpi.store.getState();
      const stored = state?.custom?.[storeKey];
      if (stored?.images) {
        setUpdatedImages(stored.images);
      } else {
        setUpdatedImages(null);
      }
    } catch (error) {
      setUpdatedImages(null);
    }
  }, [currentSlug, fpi]);

  // Listen to extension events
  useEffect(() => {
    if (!isRunningOnClient() || !currentSlug) {
      return;
    }

    const storeKey = getStoreKey(currentSlug);

    // Handle image update event
    const handleExtensionUpdate = (event) => {
      try {
        const {
          productSlug: eventSlug,
          images,
          source,
          metadata,
        } = event.detail || {};

        console.log("[PDP Image Updater] Raw event received:", {
          eventName: EXTENSION_EVENT,
          detail: event.detail,
          currentSlug,
        });

        // Validate required fields
        if (!eventSlug) {
          console.warn("[PDP Image Updater] Ignored: missing productSlug in event detail");
          return;
        }

        if (!images) {
          console.warn("[PDP Image Updater] Ignored: missing images in event detail");
          return;
        }

        // Only process if for current product
        if (eventSlug !== currentSlug) {
          console.log(`[PDP Image Updater] Ignored: event slug "${eventSlug}" does not match current slug "${currentSlug}"`);
          return;
        }

        // Validate and normalize images
        const validImages = validateImages(images);

        console.log("[PDP Image Updater] Validated images to apply:", validImages);

        // Store in FPI custom store
        fpi.custom.setValue(storeKey, {
          images: validImages,
          updatedAt: new Date().toISOString(),
          productSlug: currentSlug,
          source: source || "extension",
          metadata: metadata || {},
        });

        // Update component state
        setUpdatedImages(validImages);
      } catch (error) {
        console.error("[PDP Image Updater] Error handling event:", error);
      }
    };

    // Register event listener
    window.addEventListener(EXTENSION_EVENT, handleExtensionUpdate);

    // Cleanup
    return () => {
      window.removeEventListener(EXTENSION_EVENT, handleExtensionUpdate);
    };
  }, [currentSlug, fpi]);

  return {
    updatedImages,
    hasUpdates: updatedImages !== null,
    productSlug: currentSlug,
  };
}

// ===== EXPORT FOR TESTING =====
export { validateImages, getProductSlug, getStoreKey };
