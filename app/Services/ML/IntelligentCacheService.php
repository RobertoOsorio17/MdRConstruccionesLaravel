<?php

namespace App\Services\ML;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

/**
 * Intelligent caching service for ML recommendations.
 * Implements multi-level caching with automatic invalidation.
 */
class IntelligentCacheService
{
    private const CACHE_PREFIX = 'ml_cache:';
    private const DEFAULT_TTL = 3600; // 1 hour
    
    private array $cacheLevels = [
        'hot' => 300,      // 5 minutes - frequently accessed
        'warm' => 1800,    // 30 minutes - moderately accessed
        'cold' => 7200     // 2 hours - rarely accessed
    ];

    /**
     * Get cached recommendations with intelligent TTL.
     */
    public function getRecommendations(string $key, callable $callback, array $options = []): mixed
    {
        $fullKey = $this->buildKey('recommendations', $key);
        $level = $this->determineCacheLevel($fullKey);
        $ttl = $options['ttl'] ?? $this->cacheLevels[$level];

        return Cache::tags(['ml_recommendations'])->remember($fullKey, $ttl, function() use ($callback, $fullKey, $level) {
            $result = $callback();
            
            // Track cache usage
            $this->trackCacheAccess($fullKey, $level);
            
            return $result;
        });
    }

    /**
     * Get cached user profile.
     */
    public function getUserProfile(string $identifier, callable $callback): mixed
    {
        $key = $this->buildKey('profile', $identifier);
        
        return Cache::tags(['ml_profiles'])->remember($key, 3600, function() use ($callback, $key) {
            $result = $callback();
            $this->trackCacheAccess($key, 'warm');
            return $result;
        });
    }

    /**
     * Get cached post vector.
     */
    public function getPostVector(int $postId, callable $callback): mixed
    {
        $key = $this->buildKey('vector', $postId);
        
        return Cache::tags(['ml_vectors'])->remember($key, 86400, function() use ($callback, $key) {
            $result = $callback();
            $this->trackCacheAccess($key, 'cold');
            return $result;
        });
    }

    /**
     * Get cached similarity scores.
     */
    public function getSimilarityScores(int $postId, callable $callback): mixed
    {
        $key = $this->buildKey('similarity', $postId);
        
        return Cache::tags(['ml_similarities'])->remember($key, 7200, function() use ($callback, $key) {
            $result = $callback();
            $this->trackCacheAccess($key, 'warm');
            return $result;
        });
    }

    /**
     * Cache with automatic invalidation on related updates.
     */
    public function cacheWithDependencies(
        string $key,
        callable $callback,
        array $dependencies = [],
        int $ttl = null
    ): mixed {
        $fullKey = $this->buildKey('dependent', $key);
        $ttl = $ttl ?? self::DEFAULT_TTL;

        // Store dependencies
        $this->storeDependencies($fullKey, $dependencies);

        return Cache::remember($fullKey, $ttl, $callback);
    }

    /**
     * Invalidate cache by key pattern.
     */
    public function invalidatePattern(string $pattern): int
    {
        $count = 0;
        
        if (config('cache.default') === 'redis') {
            $keys = Redis::keys(self::CACHE_PREFIX . $pattern);
            
            foreach ($keys as $key) {
                Redis::del($key);
                $count++;
            }
        } else {
            // Fallback for non-Redis cache drivers
            Cache::tags(['ml_recommendations', 'ml_profiles', 'ml_vectors'])->flush();
            $count = 1;
        }

        Log::info("Cache invalidated", ['pattern' => $pattern, 'count' => $count]);

        return $count;
    }

    /**
     * Invalidate cache by tags.
     */
    public function invalidateTags(array $tags): void
    {
        Cache::tags($tags)->flush();
        
        Log::info("Cache tags invalidated", ['tags' => $tags]);
    }

    /**
     * Invalidate user-specific caches.
     */
    public function invalidateUser(string $identifier): void
    {
        $patterns = [
            "recommendations:*:{$identifier}",
            "profile:{$identifier}",
            "insights:{$identifier}"
        ];

        foreach ($patterns as $pattern) {
            $this->invalidatePattern($pattern);
        }
    }

    /**
     * Invalidate post-specific caches.
     */
    public function invalidatePost(int $postId): void
    {
        $patterns = [
            "vector:{$postId}",
            "similarity:{$postId}",
            "recommendations:*:{$postId}"
        ];

        foreach ($patterns as $pattern) {
            $this->invalidatePattern($pattern);
        }

        // Also invalidate related recommendations
        $this->invalidateTags(['ml_recommendations']);
    }

    /**
     * Warm up cache with popular items.
     */
    public function warmUpCache(array $popularItems, callable $generator): int
    {
        $warmed = 0;

        foreach ($popularItems as $item) {
            try {
                $key = $this->buildKey('warmup', $item['id']);
                $data = $generator($item);
                
                Cache::tags(['ml_recommendations'])->put($key, $data, $this->cacheLevels['hot']);
                $warmed++;
            } catch (\Exception $e) {
                Log::warning("Failed to warm cache for item", [
                    'item' => $item,
                    'error' => $e->getMessage()
                ]);
            }
        }

        Log::info("Cache warmed up", ['items' => $warmed]);

        return $warmed;
    }

    /**
     * Get cache statistics.
     */
    public function getStatistics(): array
    {
        $stats = [
            'total_keys' => 0,
            'by_level' => [
                'hot' => 0,
                'warm' => 0,
                'cold' => 0
            ],
            'by_type' => [
                'recommendations' => 0,
                'profiles' => 0,
                'vectors' => 0,
                'similarities' => 0
            ],
            'hit_rate' => 0,
            'memory_usage' => 0
        ];

        if (config('cache.default') === 'redis') {
            $keys = Redis::keys(self::CACHE_PREFIX . '*');
            $stats['total_keys'] = count($keys);

            foreach ($keys as $key) {
                // Categorize by type
                if (str_contains($key, 'recommendations')) {
                    $stats['by_type']['recommendations']++;
                } elseif (str_contains($key, 'profile')) {
                    $stats['by_type']['profiles']++;
                } elseif (str_contains($key, 'vector')) {
                    $stats['by_type']['vectors']++;
                } elseif (str_contains($key, 'similarity')) {
                    $stats['by_type']['similarities']++;
                }

                // Get TTL to determine level
                $ttl = Redis::ttl($key);
                if ($ttl > 0 && $ttl <= 300) {
                    $stats['by_level']['hot']++;
                } elseif ($ttl > 300 && $ttl <= 1800) {
                    $stats['by_level']['warm']++;
                } else {
                    $stats['by_level']['cold']++;
                }
            }

            // Get hit rate from Redis info
            $info = Redis::info('stats');
            if (isset($info['keyspace_hits']) && isset($info['keyspace_misses'])) {
                $hits = $info['keyspace_hits'];
                $misses = $info['keyspace_misses'];
                $total = $hits + $misses;
                $stats['hit_rate'] = $total > 0 ? $hits / $total : 0;
            }

            // Get memory usage
            $memInfo = Redis::info('memory');
            $stats['memory_usage'] = $memInfo['used_memory_human'] ?? 'N/A';
        }

        return $stats;
    }

    /**
     * Determine cache level based on access patterns.
     */
    private function determineCacheLevel(string $key): string
    {
        $accessCount = $this->getAccessCount($key);

        if ($accessCount > 100) {
            return 'hot';
        } elseif ($accessCount > 10) {
            return 'warm';
        } else {
            return 'cold';
        }
    }

    /**
     * Track cache access for adaptive TTL.
     */
    private function trackCacheAccess(string $key, string $level): void
    {
        $statsKey = self::CACHE_PREFIX . 'stats:' . $key;
        
        if (config('cache.default') === 'redis') {
            Redis::incr($statsKey);
            Redis::expire($statsKey, 86400); // Keep stats for 24 hours
        }
    }

    /**
     * Get access count for a cache key.
     */
    private function getAccessCount(string $key): int
    {
        $statsKey = self::CACHE_PREFIX . 'stats:' . $key;
        
        if (config('cache.default') === 'redis') {
            return (int)Redis::get($statsKey) ?? 0;
        }

        return 0;
    }

    /**
     * Store cache dependencies.
     */
    private function storeDependencies(string $key, array $dependencies): void
    {
        $depsKey = self::CACHE_PREFIX . 'deps:' . $key;
        
        Cache::put($depsKey, $dependencies, 86400);
    }

    /**
     * Get cache dependencies.
     */
    private function getDependencies(string $key): array
    {
        $depsKey = self::CACHE_PREFIX . 'deps:' . $key;
        
        return Cache::get($depsKey, []);
    }

    /**
     * Build cache key.
     */
    private function buildKey(string $type, mixed $identifier): string
    {
        return self::CACHE_PREFIX . $type . ':' . $identifier;
    }

    /**
     * Preload frequently accessed data.
     */
    public function preloadFrequentData(): int
    {
        $preloaded = 0;

        // Preload popular posts
        $popularPosts = \App\Models\Post::published()
            ->orderBy('view_count', 'desc')
            ->limit(50)
            ->get();

        foreach ($popularPosts as $post) {
            try {
                $this->getPostVector($post->id, function() use ($post) {
                    return $post->mlVector;
                });
                $preloaded++;
            } catch (\Exception $e) {
                Log::warning("Failed to preload post vector", [
                    'post_id' => $post->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $preloaded;
    }

    /**
     * Clear expired cache entries.
     */
    public function clearExpired(): int
    {
        $cleared = 0;

        if (config('cache.default') === 'redis') {
            // Redis automatically handles expiration
            // Just log the action
            Log::info("Redis handles automatic expiration");
        } else {
            // For other drivers, manually clear old entries
            Cache::tags(['ml_recommendations', 'ml_profiles'])->flush();
            $cleared = 1;
        }

        return $cleared;
    }
}

