<?php

namespace App\Observers;

use App\Models\Tag;
use App\Services\CacheService;

/**
 * Observes Tag model events to invalidate dashboard cache.
 * OPTIMIZED: Ensures dashboard stats are refreshed when tags are created/updated/deleted.
 */
class TagObserver
{
    protected $cacheService;

    /**

     * Handle __construct.

     *

     * @param CacheService $cacheService The cacheService.

     * @return void

     */

    

    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Handle created.
     *
     * @param Tag $tag The tag.
     * @return void
     */
    
    public function created(Tag $tag): void
    {
        $this->invalidateCache($tag);
    }

    /**
     * Handle updated.
     *
     * @param Tag $tag The tag.
     * @return void
     */
    
    public function updated(Tag $tag): void
    {
        $this->invalidateCache($tag);
    }

    /**
     * Handle deleted.
     *
     * @param Tag $tag The tag.
     * @return void
     */
    
    public function deleted(Tag $tag): void
    {
        $this->invalidateCache($tag);
    }

    /**
     * Handle invalidate cache.
     *
     * @param Tag $tag The tag.
     * @return void
     */
    
    protected function invalidateCache(Tag $tag): void
    {
        // Invalidate dashboard stats
        $this->cacheService->invalidateDashboardStats();
    }
}

