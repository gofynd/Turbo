/**
 * True SWR (Stale-While-Revalidate) wrapper for fpi.executeGQL
 *
 * Features:
 * - Returns stale data immediately (non-blocking)
 * - Revalidates in background
 * - Deduplicates concurrent requests
 * - Notifies subscribers when data updates
 * - LRU eviction to prevent unbounded memory growth
 */

import { LRUCache } from "./lru-cache.js";

let cache = null; // Will be initialized with maxSize from config
let currentCacheMemoryBytes = 0; // Track total cache memory usage
const pendingRequests = new Map();
const subscribers = new Map(); // Key -> Set of callbacks

/**
 * Estimate size of data in bytes (rough approximation)
 */
function estimateDataSize(data) {
  try {
    // Try using Blob for accurate size
    if (typeof Blob !== "undefined") {
      return new Blob([JSON.stringify(data)]).size;
    }
    // Fallback: approximate string length (2 bytes per char for UTF-16)
    return JSON.stringify(data).length * 2;
  } catch (e) {
    // Fallback: approximate string length
    return JSON.stringify(data).length * 2;
  }
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Calculate total cache size
 */
function getTotalCacheSize() {
  if (!cache) return 0;

  let totalSize = 0;
  for (const [key, value] of cache.entries()) {
    // Size of key (string)
    totalSize += estimateDataSize(key);
    // Size of value (data + timestamp)
    totalSize += estimateDataSize(value.data || {});
    totalSize += 8; // timestamp (number) ~8 bytes
  }

  return totalSize;
}

/**
 * Calculate size of a cache entry (key + value)
 */
function getEntrySize(key, value) {
  const keySize = estimateDataSize(key);
  const dataSize = estimateDataSize(value.data || {});
  const timestampSize = 8; // timestamp (number) ~8 bytes
  return keySize + dataSize + timestampSize;
}

/**
 * Evict least recently used entries until memory limit is satisfied
 */
function evictUntilMemoryLimit(newEntrySize, maxMemoryBytes) {
  if (!cache || cache.size === 0) return;

  const pageName = getPageName();
  let evictedCount = 0;
  let freedMemory = 0;

  // Evict oldest entries (LRU) until we have enough space
  while (
    currentCacheMemoryBytes + newEntrySize > maxMemoryBytes &&
    cache.size > 0
  ) {
    const oldestKey = cache.getOldestKey();
    if (!oldestKey) break;

    // Use peek() to get value without marking as recently used
    const oldestValue = cache.peek(oldestKey);
    if (oldestValue) {
      const entrySize = getEntrySize(oldestKey, oldestValue);
      cache.delete(oldestKey);
      currentCacheMemoryBytes -= entrySize;
      freedMemory += entrySize;
      evictedCount++;
    } else {
      // Safety break if we can't get the value
      break;
    }
  }

  if (evictedCount > 0) {
    console.log(
      `🗑️ [${pageName}] Memory limit eviction: Removed ${evictedCount} entries (freed ${formatBytes(freedMemory)})`
    );
  }
}

/**
 * Safely print cache information using console.table with fallback
 */
function printCacheInfo(maxMemoryMB = DEFAULT_CONFIG.maxCacheMemoryMB) {
  if (!cache) {
    console.log("Cache not initialized yet");
    return;
  }

  const cacheEntries = [];
  let totalSize = 0;
  let index = 0;

  for (const [key, value] of cache.entries()) {
    const keySize = estimateDataSize(key);
    const dataSize = estimateDataSize(value.data || {});
    const entrySize = keySize + dataSize + 8; // +8 for timestamp
    totalSize += entrySize;

    cacheEntries.push({
      index: index++,
      key: key.substring(0, 50) + (key.length > 50 ? "..." : ""),
      size: formatBytes(entrySize),
      dataSize: formatBytes(dataSize),
      timestamp: new Date(value.timestamp).toLocaleTimeString(),
      age: Math.round((Date.now() - value.timestamp) / 1000) + "s",
      hasData: !!value.data,
    });
  }

  // Use console.table if available, otherwise use console.log
  if (typeof console.table === "function") {
    console.table(cacheEntries);
  } else {
    console.log("Cache Entries:", cacheEntries);
  }

  // Print summary
  const maxMemoryBytes = maxMemoryMB * 1024 * 1024;
  const memoryUtilization = (currentCacheMemoryBytes / maxMemoryBytes) * 100;

  console.log(`\n📊 Cache Summary:`);
  console.log(
    `   Entries: ${cache.size}/${cache.maxSize} (${((cache.size / cache.maxSize) * 100).toFixed(1)}%)`
  );
  console.log(`   Total Size: ${formatBytes(totalSize)}`);
  console.log(
    `   Average Entry Size: ${cache.size > 0 ? formatBytes(totalSize / cache.size) : "0 B"}`
  );
  console.log(
    `   Memory Usage: ${formatBytes(currentCacheMemoryBytes)}/${formatBytes(maxMemoryBytes)} (${memoryUtilization.toFixed(1)}%)`
  );
}

// Configuration
const DEFAULT_CONFIG = {
  staleTime: 0, // Data is always considered stale (revalidate every time)
  cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  dedupingInterval: 2000, // Dedupe identical requests within 2 seconds
  maxCacheSize: 100, // Maximum number of cache entries (LRU eviction)
  maxCacheMemoryMB: 5, // Maximum cache memory in MB (default: 5 MB)
};

function getCacheKey(query, variables) {
  return JSON.stringify({ query, variables });
}

/**
 * Get current page name for logging (similar to getPageUrl pattern)
 */
function getPageName() {
  try {
    // Check if we're on client side
    if (typeof window === "undefined" || !window.location) {
      return "unknown";
    }

    const pathname = window.location.pathname;
    if (!pathname) return "unknown";
    return pathname;
  } catch (error) {
    return "unknown";
  }
}

/**
 * Subscribe to cache updates for a specific key
 * Returns unsubscribe function
 */
export function subscribeToCacheKey(cacheKey, callback) {
  if (!subscribers.has(cacheKey)) {
    subscribers.set(cacheKey, new Set());
  }
  subscribers.get(cacheKey).add(callback);

  return () => {
    subscribers.get(cacheKey)?.delete(callback);
  };
}

/**
 * Notify all subscribers of a cache update
 */
function notifySubscribers(cacheKey, data) {
  const callbacks = subscribers.get(cacheKey);
  if (callbacks) {
    callbacks.forEach((callback) => callback(data));
  }
}

/**
 * Wrap fpi.executeGQL with SWR-like behavior
 */
export function wrapFpiWithSWR(fpi, config = {}) {
  const options = { ...DEFAULT_CONFIG, ...config };

  // Initialize LRU cache with maxSize from config (only once)
  if (!cache) {
    cache = new LRUCache(options.maxCacheSize);
    currentCacheMemoryBytes = 0; // Reset memory tracking
    const maxMemoryMB =
      options.maxCacheMemoryMB || DEFAULT_CONFIG.maxCacheMemoryMB;
    console.log(
      `📦 LRU Cache initialized with maxSize=${options.maxCacheSize} entries, maxMemory=${maxMemoryMB}MB`
    );
  } else if (cache.maxSize !== options.maxCacheSize) {
    // If maxSize changed, resize cache (evict oldest if needed)
    const oldSize = cache.size;
    cache.maxSize = options.maxCacheSize;
    // If new maxSize is smaller, evict oldest entries
    while (cache.size > options.maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    if (oldSize !== cache.size) {
      console.log(
        `📦 LRU Cache resized: maxSize=${options.maxCacheSize}, entries=${oldSize}→${cache.size}`
      );
    } else {
      console.log(
        `📦 LRU Cache maxSize updated: ${options.maxCacheSize} (current entries: ${cache.size})`
      );
    }
  }

  const originalExecuteGQL = fpi.executeGQL.bind(fpi);

  fpi.executeGQL = async (query, variables = {}, executeOptions = {}) => {
    const cacheKey = getCacheKey(query, variables);
    const now = Date.now();
    const cached = cache.get(cacheKey); // LRU get() marks as recently used
    const pageName = getPageName();

    // Background revalidation function
    const revalidate = async () => {
      // Dedupe: If request is already pending, reuse it
      if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey);
      }

      const requestPromise = originalExecuteGQL(
        query,
        variables,
        executeOptions
      )
        .then((result) => {
          if (!result?.errors?.length) {
            const cacheEntry = {
              data: result,
              timestamp: Date.now(),
            };

            // Calculate entry size
            const entrySize = getEntrySize(cacheKey, cacheEntry);
            const maxMemoryBytes =
              (options.maxCacheMemoryMB || DEFAULT_CONFIG.maxCacheMemoryMB) *
              1024 *
              1024;

            // Check if entry already exists (update vs new) - use peek() to avoid marking as recently used
            const existingEntry = cache.peek(cacheKey);
            let existingEntrySize = 0;
            if (existingEntry) {
              existingEntrySize = getEntrySize(cacheKey, existingEntry);
            }

            // Evict entries if needed to make room (before adding new entry)
            const memoryAfterUpdate =
              currentCacheMemoryBytes - existingEntrySize + entrySize;
            if (memoryAfterUpdate > maxMemoryBytes) {
              // Need to evict entries to make room for the new/updated entry
              evictUntilMemoryLimit(
                entrySize,
                maxMemoryBytes - existingEntrySize
              );
            }

            // Update memory tracking before setting cache
            currentCacheMemoryBytes =
              currentCacheMemoryBytes - existingEntrySize + entrySize;

            // LRU set() will evict oldest entry if at maxSize (entry count limit)
            const cacheSizeBefore = cache.size;
            const oldestKeyBeforeSet =
              cacheSizeBefore === options.maxCacheSize
                ? cache.getOldestKey()
                : null;
            const oldestValueBeforeSet = oldestKeyBeforeSet
              ? cache.peek(oldestKeyBeforeSet)
              : null;
            const oldestEntrySizeBeforeSet = oldestValueBeforeSet
              ? getEntrySize(oldestKeyBeforeSet, oldestValueBeforeSet)
              : 0;

            cache.set(cacheKey, cacheEntry);

            // Handle LRU eviction (entry count limit) - update memory tracking
            if (
              cacheSizeBefore === options.maxCacheSize &&
              cache.size === options.maxCacheSize &&
              oldestKeyBeforeSet &&
              oldestKeyBeforeSet !== cacheKey
            ) {
              // An entry was evicted by LRU cache (entry count limit)
              currentCacheMemoryBytes -= oldestEntrySizeBeforeSet;
              const pageName = getPageName();
              console.log(
                `🗑️ [${pageName}] LRU eviction: Cache at max entries (${options.maxCacheSize}), oldest entry evicted (freed ${formatBytes(oldestEntrySizeBeforeSet)})`
              );
            }

            // Log memory usage if high
            const memoryUsagePercent =
              (currentCacheMemoryBytes / maxMemoryBytes) * 100;
            if (memoryUsagePercent > 90) {
              const pageName = getPageName();
              console.log(
                `⚠️ [${pageName}] Cache memory usage: ${memoryUsagePercent.toFixed(1)}% (${formatBytes(currentCacheMemoryBytes)}/${formatBytes(maxMemoryBytes)})`
              );
            }

            // Notify React components of the update
            notifySubscribers(cacheKey, result);
          }
          pendingRequests.delete(cacheKey);
          return result;
        })
        .catch((error) => {
          pendingRequests.delete(cacheKey);
          throw error;
        });

      pendingRequests.set(cacheKey, requestPromise);
      return requestPromise;
    };

    // STALE-WHILE-REVALIDATE LOGIC:

    // 1. If we have cached data
    if (cached) {
      const isStale = now - cached.timestamp > options.staleTime;
      const isExpired = now - cached.timestamp > options.cacheTime;

      if (isExpired) {
        // Cache expired - must wait for fresh data
        console.log(
          `⏳ [${pageName}] Cache expired, fetching fresh:`,
          cacheKey.substring(0, 50)
        );
        return revalidate();
      }

      if (isStale) {
        // STALE-WHILE-REVALIDATE: Return cached data, revalidate in background
        console.log(
          `🔄 [${pageName}] SWR: Returning stale, revalidating in background:`,
          cacheKey.substring(0, 50)
        );
        revalidate(); // Fire and forget - don't await!
        return cached.data;
      }

      // Fresh data - return immediately
      console.log(
        `✅ [${pageName}] Cache hit (fresh):`,
        cacheKey.substring(0, 50)
      );
      return cached.data;
    }

    // 2. No cached data - fetch and wait
    console.log(
      `🆕 [${pageName}] No cache, fetching:`,
      cacheKey.substring(0, 50)
    );
    return revalidate();
  };

  // Add helper methods to fpi
  fpi.clearCache = () => {
    const pageName = getPageName();
    if (cache) {
      cache.clear();
    }
    currentCacheMemoryBytes = 0; // Reset memory tracking
    pendingRequests.clear();
    console.log(`🗑️ [${pageName}] Cache cleared`);
  };

  fpi.invalidate = (query, variables) => {
    const cacheKey = getCacheKey(query, variables);
    const pageName = getPageName();
    if (cache) {
      const existingEntry = cache.get(cacheKey);
      if (existingEntry) {
        const entrySize = getEntrySize(cacheKey, existingEntry);
        currentCacheMemoryBytes -= entrySize;
      }
      cache.delete(cacheKey);
    }
    console.log(
      `❌ [${pageName}] Cache invalidated:`,
      cacheKey.substring(0, 50)
    );
  };

  fpi.getCacheKey = getCacheKey;

  // Add cache stats method for debugging
  fpi.getCacheStats = () => {
    if (!cache) {
      const maxMemoryMB =
        options.maxCacheMemoryMB || DEFAULT_CONFIG.maxCacheMemoryMB;
      return {
        size: 0,
        maxSize: options.maxCacheSize,
        utilization: "0.0%",
        totalSizeBytes: 0,
        totalSize: "0 B",
        averageEntrySize: "0 B",
        memoryUsageBytes: 0,
        memoryUsage: "0 B",
        memoryLimitMB: maxMemoryMB,
        memoryLimitBytes: maxMemoryMB * 1024 * 1024,
        memoryUtilization: "0.0%",
        initialized: false,
      };
    }

    const totalSizeBytes = getTotalCacheSize();
    const averageSizeBytes = cache.size > 0 ? totalSizeBytes / cache.size : 0;
    const maxMemoryMB =
      options.maxCacheMemoryMB || DEFAULT_CONFIG.maxCacheMemoryMB;
    const maxMemoryBytes = maxMemoryMB * 1024 * 1024;
    const memoryUtilization = (currentCacheMemoryBytes / maxMemoryBytes) * 100;

    return {
      size: cache.size,
      maxSize: cache.maxSize,
      utilization: `${((cache.size / cache.maxSize) * 100).toFixed(1)}%`,
      totalSizeBytes: totalSizeBytes,
      totalSize: formatBytes(totalSizeBytes),
      averageEntrySize: formatBytes(averageSizeBytes),
      memoryUsageBytes: currentCacheMemoryBytes,
      memoryUsage: formatBytes(currentCacheMemoryBytes),
      memoryLimitMB: maxMemoryMB,
      memoryLimitBytes: maxMemoryBytes,
      memoryUtilization: `${memoryUtilization.toFixed(1)}%`,
      initialized: true,
    };
  };

  // Print cache information in table format
  fpi.printCache = () => {
    const maxMemoryMB =
      options.maxCacheMemoryMB || DEFAULT_CONFIG.maxCacheMemoryMB;
    printCacheInfo(maxMemoryMB);
  };

  return fpi;
}

// Optional: Add focus/reconnect revalidation (browser only)
export function setupAutoRevalidation(fpi) {
  if (typeof window === "undefined") return;

  let revalidationTimeout = null;
  const recentQueries = new Map(); // Track recent queries for revalidation

  // Store queries that should be revalidated
  const originalExecuteGQL = fpi.executeGQL;
  if (originalExecuteGQL) {
    const queryTracker = new Proxy(originalExecuteGQL, {
      apply(target, thisArg, argumentsList) {
        const [query, variables] = argumentsList;
        const cacheKey = fpi.getCacheKey(query, variables);
        recentQueries.set(cacheKey, { query, variables });

        // Keep only last 20 queries
        if (recentQueries.size > 20) {
          const firstKey = recentQueries.keys().next().value;
          recentQueries.delete(firstKey);
        }

        return target.apply(thisArg, argumentsList);
      },
    });
  }

  const revalidateAll = () => {
    // Debounce revalidation to avoid too many requests
    if (revalidationTimeout) clearTimeout(revalidationTimeout);

    revalidationTimeout = setTimeout(() => {
      const pageName = getPageName();
      console.log(`🔄 [${pageName}] Revalidating all cached queries...`);
      recentQueries.forEach(({ query, variables }) => {
        fpi.executeGQL(query, variables).catch((err) => {
          console.error(`[${pageName}] Revalidation failed:`, err);
        });
      });
    }, 500);
  };

  window.addEventListener("focus", revalidateAll);
  window.addEventListener("online", revalidateAll);

  console.log("✅ Auto-revalidation enabled (focus, reconnect)");
}
