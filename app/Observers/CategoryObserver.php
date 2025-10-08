<?php

namespace App\Observers;

use App\Models\Category;
use App\Services\CacheService;

/**
 * Listens for category lifecycle events to keep cached data synchronized.
 * Invalidates relevant cache segments whenever categories are created, updated, or removed.
 */
class CategoryObserver
{
    protected $cacheService;

    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Handle the Category "created" event.
     */
    public function created(Category $category): void
    {
        $this->invalidateCache($category);
    }

    /**
     * Handle the Category "updated" event.
     */
    public function updated(Category $category): void
    {
        $this->invalidateCache($category);
    }

    /**
     * Handle the Category "deleted" event.
     */
    public function deleted(Category $category): void
    {
        $this->invalidateCache($category);
    }

    /**
     * Invalidate related caches
     */
    protected function invalidateCache(Category $category): void
    {
        // Invalidate specific category cache
        $this->cacheService->invalidateCategory($category->slug);
        
        // Invalidate dashboard stats
        $this->cacheService->invalidateDashboardStats();
    }
}

