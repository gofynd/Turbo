/**
 * LRU Cache implementation
 * Maintains insertion order and evicts least recently used items when maxSize is exceeded
 */
export class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map(); // Map maintains insertion order in modern JS
  }

  /**
   * Get value from cache and mark as recently used
   */
  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // Move to end (most recently used) by deleting and re-adding
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  /**
   * Set value in cache, evicting oldest if needed
   */
  set(key, value) {
    // If key exists, update it and move to end
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else {
      // If adding new key and at max size, evict oldest (first entry)
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
    }

    // Add/update at end (most recently used)
    this.cache.set(key, value);
  }

  /**
   * Delete key from cache
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Clear all entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get current size
   */
  get size() {
    return this.cache.size;
  }

  /**
   * Get all keys (for debugging)
   */
  keys() {
    return this.cache.keys();
  }

  /**
   * Get all entries (for iteration)
   */
  entries() {
    return this.cache.entries();
  }

  /**
   * Peek at a value without marking it as recently used
   */
  peek(key) {
    return this.cache.get(key);
  }

  /**
   * Get the oldest key without removing it
   */
  getOldestKey() {
    return this.cache.keys().next().value;
  }
}

