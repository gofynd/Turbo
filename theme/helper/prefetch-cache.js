// Module-level singleton — survives across React renders within the same SPA session.
// Keys: "collection-{slug}"
// Values: { data: { collection, collectionItems }, expiry: timestamp }

const cache = new Map();
const pendingPromises = new Map();
const DEFAULT_TTL_MS = 60_000; // 60 seconds

function sweep() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now > entry.expiry) cache.delete(key);
  }
}

export const prefetchCache = {
  get(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      cache.delete(key);
      return null;
    }
    return entry.data;
  },

  set(key, data, ttl = DEFAULT_TTL_MS) {
    if (!key || typeof window === "undefined") return; // No-op on server — prevents cross-request leakage
    cache.set(key, { data, expiry: Date.now() + ttl });
    sweep();
  },

  has(key) {
    const entry = cache.get(key);
    return !!entry && Date.now() <= entry.expiry;
  },

  delete(key) {
    cache.delete(key);
  },

  hasPending(key) {
    return pendingPromises.has(key);
  },

  getPending(key) {
    return pendingPromises.get(key) ?? null;
  },

  setPending(key, promise) {
    if (typeof window === "undefined") return; // No-op on server
    pendingPromises.set(key, promise);
  },

  clearPending(key) {
    pendingPromises.delete(key);
  },
};
