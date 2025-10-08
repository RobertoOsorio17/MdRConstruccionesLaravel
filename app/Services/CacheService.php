<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

/**
 * Centralizes cache operations, namespacing, and invalidation logic across the application.
 * Offers convenience methods for common cache patterns and targeted purge routines.
 */
class CacheService
{
    /**
     * Cache TTL constants (in seconds).
     */
    const TTL_SHORT = 300;      // 5 minutes
    const TTL_MEDIUM = 1800;    // 30 minutes
    const TTL_LONG = 3600;      // 1 hour
    const TTL_DAY = 86400;      // 24 hours
    const TTL_WEEK = 604800;    // 7 days

    /**
     * Cache key prefixes.
     */
    const PREFIX_USER = 'user:';
    const PREFIX_POST = 'post:';
    const PREFIX_SERVICE = 'service:';
    const PREFIX_PROJECT = 'project:';
    const PREFIX_ANALYTICS = 'analytics:';
    const PREFIX_SETTINGS = 'settings:';

    /**
     * Remember a value in cache with automatic key generation.
     *
     * @param string $key
     * @param int $ttl
     * @param callable $callback
     * @return mixed
     */
    public function remember(string $key, int $ttl, callable $callback): mixed
    {
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Remember a value forever (until manually cleared).
     *
     * @param string $key
     * @param callable $callback
     * @return mixed
     */
    public function rememberForever(string $key, callable $callback): mixed
    {
        return Cache::rememberForever($key, $callback);
    }

    /**
     * Get a value from cache.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function get(string $key, mixed $default = null): mixed
    {
        return Cache::get($key, $default);
    }

    /**
     * Put a value in cache.
     *
     * @param string $key
     * @param mixed $value
     * @param int $ttl
     * @return bool
     */
    public function put(string $key, mixed $value, int $ttl = self::TTL_MEDIUM): bool
    {
        return Cache::put($key, $value, $ttl);
    }

    /**
     * Put a value in cache forever.
     *
     * @param string $key
     * @param mixed $value
     * @return bool
     */
    public function forever(string $key, mixed $value): bool
    {
        return Cache::forever($key, $value);
    }

    /**
     * Forget a value from cache.
     *
     * @param string $key
     * @return bool
     */
    public function forget(string $key): bool
    {
        return Cache::forget($key);
    }

    /**
     * Flush all cache.
     *
     * @return bool
     */
    public function flush(): bool
    {
        return Cache::flush();
    }

    /**
     * Flush cache by prefix/tag.
     *
     * @param string $prefix
     * @return void
     */
    public function flushByPrefix(string $prefix): void
    {
        $keys = $this->getKeysByPrefix($prefix);
        
        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Get all keys matching a prefix.
     *
     * @param string $prefix
     * @return array
     */
    protected function getKeysByPrefix(string $prefix): array
    {
        try {
            // Try Redis first
            if (config('cache.default') === 'redis') {
                return Redis::keys($prefix . '*');
            }
        } catch (\Exception $e) {
            \Log::warning('Redis not available, falling back to file cache');
        }

        // Fallback for file cache (limited functionality)
        return [];
    }

    /**
     * Cache user data.
     *
     * @param int $userId
     * @param callable $callback
     * @return mixed
     */
    public function cacheUser(int $userId, callable $callback): mixed
    {
        return $this->remember(
            self::PREFIX_USER . $userId,
            self::TTL_MEDIUM,
            $callback
        );
    }

    /**
     * Cache post data.
     *
     * @param int $postId
     * @param callable $callback
     * @return mixed
     */
    public function cachePost(int $postId, callable $callback): mixed
    {
        return $this->remember(
            self::PREFIX_POST . $postId,
            self::TTL_LONG,
            $callback
        );
    }

    /**
     * Cache analytics data.
     *
     * @param string $key
     * @param callable $callback
     * @return mixed
     */
    public function cacheAnalytics(string $key, callable $callback): mixed
    {
        return $this->remember(
            self::PREFIX_ANALYTICS . $key,
            self::TTL_SHORT,
            $callback
        );
    }

    /**
     * Cache settings.
     *
     * @param string $key
     * @param callable $callback
     * @return mixed
     */
    public function cacheSettings(string $key, callable $callback): mixed
    {
        return $this->remember(
            self::PREFIX_SETTINGS . $key,
            self::TTL_DAY,
            $callback
        );
    }

    /**
     * Invalidate user cache.
     *
     * @param int $userId
     * @return bool
     */
    public function invalidateUser(int $userId): bool
    {
        return $this->forget(self::PREFIX_USER . $userId);
    }

    /**
     * Invalidate post cache.
     *
     * @param int $postId
     * @return bool
     */
    public function invalidatePost(int $postId): bool
    {
        return $this->forget(self::PREFIX_POST . $postId);
    }

    /**
     * Invalidate all analytics cache.
     *
     * @return void
     */
    public function invalidateAnalytics(): void
    {
        $this->flushByPrefix(self::PREFIX_ANALYTICS);
    }

    /**
     * Invalidate all settings cache.
     *
     * @return void
     */
    public function invalidateSettings(): void
    {
        $this->flushByPrefix(self::PREFIX_SETTINGS);
    }

    /**
     * Invalidate dashboard statistics cache.
     *
     * @return void
     */
    public function invalidateDashboardStats(): void
    {
        $keys = [
            'dashboard:stats',
            'dashboard:recent_posts',
            'dashboard:recent_comments',
            'dashboard:analytics',
            'admin:dashboard:stats',
        ];

        foreach ($keys as $key) {
            $this->forget($key);
        }
    }

    /**
     * Invalidate user statistics cache.
     *
     * @param int $userId
     * @return void
     */
    public function invalidateUserStats(int $userId): void
    {
        $keys = [
            "user:{$userId}:stats",
            "user:{$userId}:posts",
            "user:{$userId}:comments",
            "user:{$userId}:followers",
            "user:{$userId}:following",
        ];

        foreach ($keys as $key) {
            $this->forget($key);
        }
    }

    /**
     * Get cache statistics.
     *
     * @return array
     */
    public function getStats(): array
    {
        try {
            if (config('cache.default') === 'redis') {
                $info = Redis::info();
                
                return [
                    'driver' => 'redis',
                    'used_memory' => $info['used_memory_human'] ?? 'N/A',
                    'connected_clients' => $info['connected_clients'] ?? 0,
                    'total_keys' => Redis::dbSize(),
                    'hits' => $info['keyspace_hits'] ?? 0,
                    'misses' => $info['keyspace_misses'] ?? 0,
                ];
            }
        } catch (\Exception $e) {
            \Log::error('Failed to get cache stats', ['error' => $e->getMessage()]);
        }

        return [
            'driver' => config('cache.default'),
            'status' => 'available',
        ];
    }

    /**
     * Increment a counter in cache.
     *
     * @param string $key
     * @param int $value
     * @return int
     */
    public function increment(string $key, int $value = 1): int
    {
        return Cache::increment($key, $value);
    }

    /**
     * Decrement a counter in cache.
     *
     * @param string $key
     * @param int $value
     * @return int
     */
    public function decrement(string $key, int $value = 1): int
    {
        return Cache::decrement($key, $value);
    }
}

