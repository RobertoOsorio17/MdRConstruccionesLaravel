/**
 * Advanced Cache Manager for Admin Panel
 * Provides memory and localStorage caching with TTL support
 */
class CacheManager {
    constructor() {
        this.memoryCache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes
        this.maxMemorySize = 100; // Maximum items in memory cache
        this.storagePrefix = 'admin_cache_';
    }

    /**
     * Generate cache key
     */
    generateKey(key, params = {}) {
        const paramString = Object.keys(params)
            .sort()
            .map(k => `${k}:${JSON.stringify(params[k])}`)
            .join('|');
        return paramString ? `${key}:${paramString}` : key;
    }

    /**
     * Check if cache entry is expired
     */
    isExpired(entry) {
        return Date.now() > entry.expiry;
    }

    /**
     * Set item in memory cache
     */
    setMemory(key, data, ttl = this.defaultTTL) {
        // Remove oldest entries if cache is full
        if (this.memoryCache.size >= this.maxMemorySize) {
            const firstKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(firstKey);
        }

        this.memoryCache.set(key, {
            data,
            expiry: Date.now() + ttl,
            timestamp: Date.now()
        });
    }

    /**
     * Get item from memory cache
     */
    getMemory(key) {
        const entry = this.memoryCache.get(key);
        if (!entry) return null;

        if (this.isExpired(entry)) {
            this.memoryCache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set item in localStorage
     */
    setStorage(key, data, ttl = this.defaultTTL) {
        try {
            const entry = {
                data,
                expiry: Date.now() + ttl,
                timestamp: Date.now()
            };
            localStorage.setItem(this.storagePrefix + key, JSON.stringify(entry));
        } catch (error) {
            console.warn('Failed to set localStorage cache:', error);
        }
    }

    /**
     * Get item from localStorage
     */
    getStorage(key) {
        try {
            const item = localStorage.getItem(this.storagePrefix + key);
            if (!item) return null;

            const entry = JSON.parse(item);
            if (this.isExpired(entry)) {
                localStorage.removeItem(this.storagePrefix + key);
                return null;
            }

            return entry.data;
        } catch (error) {
            console.warn('Failed to get localStorage cache:', error);
            return null;
        }
    }

    /**
     * Set cache item (memory first, then storage)
     */
    set(key, data, options = {}) {
        const { ttl = this.defaultTTL, useStorage = true, params = {} } = options;
        const cacheKey = this.generateKey(key, params);

        // Always set in memory for fast access
        this.setMemory(cacheKey, data, ttl);

        // Optionally set in localStorage for persistence
        if (useStorage) {
            this.setStorage(cacheKey, data, ttl);
        }
    }

    /**
     * Get cache item (memory first, then storage)
     */
    get(key, params = {}) {
        const cacheKey = this.generateKey(key, params);

        // Try memory cache first
        let data = this.getMemory(cacheKey);
        if (data !== null) {
            return data;
        }

        // Try localStorage
        data = this.getStorage(cacheKey);
        if (data !== null) {
            // Restore to memory cache
            this.setMemory(cacheKey, data);
            return data;
        }

        return null;
    }

    /**
     * Remove cache item
     */
    remove(key, params = {}) {
        const cacheKey = this.generateKey(key, params);
        this.memoryCache.delete(cacheKey);
        localStorage.removeItem(this.storagePrefix + cacheKey);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.memoryCache.clear();
        
        // Clear localStorage items with our prefix
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.storagePrefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * Clear expired items
     */
    clearExpired() {
        // Clear expired memory cache
        for (const [key, entry] of this.memoryCache.entries()) {
            if (this.isExpired(entry)) {
                this.memoryCache.delete(key);
            }
        }

        // Clear expired localStorage items
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.storagePrefix)) {
                try {
                    const item = localStorage.getItem(key);
                    const entry = JSON.parse(item);
                    if (this.isExpired(entry)) {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    // Remove invalid entries
                    localStorage.removeItem(key);
                }
            }
        });
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const memorySize = this.memoryCache.size;
        const storageKeys = Object.keys(localStorage).filter(key => 
            key.startsWith(this.storagePrefix)
        );

        return {
            memorySize,
            storageSize: storageKeys.length,
            maxMemorySize: this.maxMemorySize,
            memoryUsage: (memorySize / this.maxMemorySize) * 100
        };
    }

    /**
     * Cached fetch wrapper
     */
    async cachedFetch(url, options = {}) {
        const {
            cacheKey = url,
            ttl = this.defaultTTL,
            useStorage = true,
            params = {},
            forceRefresh = false,
            ...fetchOptions
        } = options;

        // Check cache first (unless force refresh)
        if (!forceRefresh) {
            const cached = this.get(cacheKey, params);
            if (cached !== null) {
                return cached;
            }
        }

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...fetchOptions.headers
                },
                ...fetchOptions
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the result
            this.set(cacheKey, data, { ttl, useStorage, params });
            
            return data;
        } catch (error) {
            console.error('Cached fetch error:', error);
            throw error;
        }
    }

    /**
     * Invalidate cache by pattern
     */
    invalidatePattern(pattern) {
        // Invalidate memory cache
        for (const key of this.memoryCache.keys()) {
            if (key.includes(pattern)) {
                this.memoryCache.delete(key);
            }
        }

        // Invalidate localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.storagePrefix) && key.includes(pattern)) {
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * Preload data into cache
     */
    async preload(requests) {
        const promises = requests.map(async ({ url, cacheKey, ttl, params }) => {
            try {
                await this.cachedFetch(url, { cacheKey, ttl, params });
            } catch (error) {
                console.warn(`Failed to preload ${cacheKey}:`, error);
            }
        });

        await Promise.allSettled(promises);
    }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Auto-cleanup expired items every 5 minutes
setInterval(() => {
    cacheManager.clearExpired();
}, 5 * 60 * 1000);

export default cacheManager;

/**
 * React hook for cached data fetching
 */
export const useCachedData = (key, fetcher, options = {}) => {
    const [data, setData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const {
        ttl = 5 * 60 * 1000,
        params = {},
        dependencies = [],
        enabled = true
    } = options;

    React.useEffect(() => {
        if (!enabled) return;

        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Check cache first
                const cached = cacheManager.get(key, params);
                if (cached !== null) {
                    setData(cached);
                    setIsLoading(false);
                    return;
                }

                // Fetch new data
                const result = await fetcher();
                cacheManager.set(key, result, { ttl, params });
                setData(result);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [key, enabled, ...dependencies]);

    const refetch = React.useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await fetcher();
            cacheManager.set(key, result, { ttl, params });
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [key, fetcher, ttl, params]);

    const invalidate = React.useCallback(() => {
        cacheManager.remove(key, params);
    }, [key, params]);

    return { data, isLoading, error, refetch, invalidate };
};
