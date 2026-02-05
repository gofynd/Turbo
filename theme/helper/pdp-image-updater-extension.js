/**
 * PDP Image Updater - Extension Event Listener
 *
 * Listens to extension events and updates product images on PDP page.
 * Updated images are prepended at index 0, with original images following.
 *
 * Event Specification:
 * - Event Name: "extension:updatePdpImages"
 */

import { useState, useEffect } from "react";
import { useFPI } from "fdk-core/utils";
import { isRunningOnClient } from "./utils";

// ===== EVENT NAME =====
export const EXTENSION_EVENT = "extension:updatePdpImages";

// ===== STORE KEY PREFIX =====
const STORE_KEY_PREFIX = "pdpUpdatedImages_";

// ===== VALIDATION =====
/**
 * Validate and normalize images
 * @param {Array|Object|string} images - Images to validate
 * @returns {Array} Validated image array
 */
const validateImages = (images) => {
  if (!images) {
    throw new Error("Images are required in event payload");
  }

  const imagesArray = Array.isArray(images) ? images : [images];

  return imagesArray.map((img, index) => {
    // Handle string URLs
    if (typeof img === "string") {
      return {
        url: img,
        type: "image",
        alt: `Product Image ${index + 1}`,
      };
    }

    // Validate object format
    if (typeof img !== "object" || !img || !img.url) {
      throw new Error(
        `Invalid image at index ${index}: must have 'url' property`
      );
    }

    return {
      url: img.url,
      type: img.type || "image",
      alt: img.alt || `Product Image ${index + 1}`,
    };
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
  const [updatedImages, setUpdatedImages] = useState(null);

  // Get current product slug
  const currentSlug = productSlug || getProductSlug(null, fpi);

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

        // Validate required fields
        if (!eventSlug) {
          return;
        }

        if (!images) {
          return;
        }

        // Only process if for current product
        if (eventSlug !== currentSlug) {
          return;
        }

        // Validate and normalize images
        const validImages = validateImages(images);

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
        // Silently handle errors in production
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
