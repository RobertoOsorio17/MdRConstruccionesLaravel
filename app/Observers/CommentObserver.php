<?php

namespace App\Observers;

use App\Models\Comment;
use App\Services\CacheService;

class CommentObserver
{
    protected $cacheService;

    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Handle the Comment "created" event.
     */
    public function created(Comment $comment): void
    {
        $this->invalidateCache($comment);
    }

    /**
     * Handle the Comment "updated" event.
     */
    public function updated(Comment $comment): void
    {
        $this->invalidateCache($comment);
    }

    /**
     * Handle the Comment "deleted" event.
     */
    public function deleted(Comment $comment): void
    {
        $this->invalidateCache($comment);
    }

    /**
     * Invalidate related caches
     */
    protected function invalidateCache(Comment $comment): void
    {
        // Invalidate dashboard stats
        $this->cacheService->invalidateDashboardStats();
        
        // Invalidate user stats if comment has an author
        if ($comment->user_id) {
            $this->cacheService->invalidateUserStats($comment->user_id);
        }
    }
}

