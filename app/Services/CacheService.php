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

    
    
    
     * Handle remember.

    
    
    
     *

    
    
    
     * @param string $key The key.

    
    
    
     * @param int $ttl The ttl.

    
    
    
     * @param callable $callback The callback.

    
    
    
     * @return mixed

    
    
    
     */
    
    
    
    
    
    
    
    public function remember(string $key, int $ttl, callable $callback): mixed
    {
        return Cache::remember($key, $ttl, $callback);
    }

    
    
    
    
    /**

    
    
    
     * Handle remember forever.

    
    
    
     *

    
    
    
     * @param string $key The key.

    
    
    
     * @param callable $callback The callback.

    
    
    
     * @return mixed

    
    
    
     */
    
    
    
    
    
    
    
    public function rememberForever(string $key, callable $callback): mixed
    {
        return Cache::rememberForever($key, $callback);
    }

    
    
    
    
    /**

    
    
    
     * Handle get.

    
    
    
     *

    
    
    
     * @param string $key The key.

    
    
    
     * @param mixed $default The default.

    
    
    
     * @return mixed

    
    
    
     */
    
    
    
    
    
    
    
    public function get(string $key, mixed $default = null): mixed
    {
        return Cache::get($key, $default);
    }

    
    
    
    
    /**

    
    
    
     * Handle put.

    
    
    
     *

    
    
    
     * @param string $key The key.

    
    
    
     * @param mixed $value The value.

    
    
    
     * @param int $ttl The ttl.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function put(string $key, mixed $value, int $ttl = self::TTL_MEDIUM): bool
    {
        return Cache::put($key, $value, $ttl);
    }

    
    
    
    
    /**

    
    
    
     * Handle forever.

    
    
    
     *

    
    
    
     * @param string $key The key.

    
    
    
     * @param mixed $value The value.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function forever(string $key, mixed $value): bool
    {
        return Cache::forever($key, $value);
    }

    
    
    
    
    /**

    
    
    
     * Handle forget.

    
    
    
     *

    
    
    
     * @param string $key The key.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function forget(string $key): bool
    {
        return Cache::forget($key);
    }

    
    
    
    
    /**

    
    
    
     * Handle flush.

    
    
    
     *

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function flush(): bool
    {
        return Cache::flush();
    }

    
    
    
    
    /**

    
    
    
     * Handle flush by prefix.

    
    
    
     *

    
    
    
     * @param string $prefix The prefix.

    
    
    
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

    
    
    
     * Get keys by prefix.

    
    
    
     *

    
    
    
     * @param string $prefix The prefix.

    
    
    
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

    
    
    
     * Handle cache user.

    
    
    
     *

    
    
    
     * @param int $userId The userId.

    
    
    
     * @param callable $callback The callback.

    
    
    
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

    
    
    
     * Handle cache post.

    
    
    
     *

    
    
    
     * @param int $postId The postId.

    
    
    
     * @param callable $callback The callback.

    
    
    
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

    
    
    
     * Handle cache analytics.

    
    
    
     *

    
    
    
     * @param string $key The key.

    
    
    
     * @param callable $callback The callback.

    
    
    
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

    
    
    
     * Handle cache settings.

    
    
    
     *

    
    
    
     * @param string $key The key.

    
    
    
     * @param callable $callback The callback.

    
    
    
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

    
    
    
     * Handle invalidate user.

    
    
    
     *

    
    
    
     * @param int $userId The userId.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function invalidateUser(int $userId): bool
    {
        return $this->forget(self::PREFIX_USER . $userId);
    }

    
    
    
    
    /**

    
    
    
     * Handle invalidate post.

    
    
    
     *

    
    
    
     * @param int $postId The postId.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function invalidatePost(int $postId): bool
    {
        return $this->forget(self::PREFIX_POST . $postId);
    }

    
    
    
    
    /**

    
    
    
     * Handle invalidate analytics.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function invalidateAnalytics(): void
    {
        $this->flushByPrefix(self::PREFIX_ANALYTICS);
    }

    
    
    
    
    /**

    
    
    
     * Handle invalidate settings.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function invalidateSettings(): void
    {
        $this->flushByPrefix(self::PREFIX_SETTINGS);
    }

    
    
    
    
    /**

    
    
    
     * Handle invalidate dashboard stats.

    
    
    
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
            'admin_dashboard_stats', // OPTIMIZED: Added for DashboardController cache
            'editor_dashboard_stats', // OPTIMIZED: Added for DashboardController cache
        ];

        foreach ($keys as $key) {
            $this->forget($key);
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle invalidate user stats.

    
    
    
     *

    
    
    
     * @param int $userId The userId.

    
    
    
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

    
    
    
     * Get stats.

    
    
    
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

    
    
    
     * Handle increment.

    
    
    
     *

    
    
    
     * @param string $key The key.

    
    
    
     * @param int $value The value.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    public function increment(string $key, int $value = 1): int
    {
        return Cache::increment($key, $value);
    }

    
    
    
    
    /**

    
    
    
     * Handle decrement.

    
    
    
     *

    
    
    
     * @param string $key The key.

    
    
    
     * @param int $value The value.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    public function decrement(string $key, int $value = 1): int
    {
        return Cache::decrement($key, $value);
    }
}

