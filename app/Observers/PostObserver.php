<?php

namespace App\Observers;

use App\Models\Post;
use App\Events\PostCreated;
use App\Services\CacheService;

/**
 * Synchronizes caches when posts change, ensuring dashboards and detail pages stay accurate.
 * Responds to create, update, and delete events to refresh related metrics.
 */
class PostObserver
{
    protected $cacheService;

    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Handle the Post "created" event.
     * ✅ FIXED: Dispatch PostCreated event for ML cache invalidation
     */
    public function created(Post $post): void
    {
        // ✅ Dispatch event for ML cache invalidation
        event(new PostCreated($post));

        // Invalidate general caches
        $this->invalidateCache($post);
    }

    /**
     * Handle the Post "updated" event.
     */
    public function updated(Post $post): void
    {
        $this->invalidateCache($post);
    }

    /**
     * Handle the Post "deleted" event.
     */
    public function deleted(Post $post): void
    {
        $this->invalidateCache($post);
    }

    /**
     * Invalidate related caches
     */
    protected function invalidateCache(Post $post): void
    {
        // Invalidate specific post cache (using post ID, not slug)
        $this->cacheService->invalidatePost((int) $post->id);

        // Invalidate dashboard stats
        $this->cacheService->invalidateDashboardStats();

        // Invalidate user stats if post has an author
        if ($post->user_id) {
            $this->cacheService->invalidateUserStats((int) $post->user_id);
        }
    }
}

