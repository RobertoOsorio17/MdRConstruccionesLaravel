<?php

namespace App\Observers;

use App\Models\Post;
use App\Services\CacheService;

class PostObserver
{
    protected $cacheService;

    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Handle the Post "created" event.
     */
    public function created(Post $post): void
    {
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

