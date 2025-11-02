<?php

namespace App\Observers;

use App\Models\User;
use App\Services\CacheService;

/**
 * Observes User model events to invalidate dashboard cache.
 * OPTIMIZED: Ensures dashboard stats are refreshed when users are created/deleted.
 */
class UserObserver
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
     * @param User $user The user.
     * @return void
     */
    
    public function created(User $user): void
    {
        // Invalidate dashboard stats when new user is created
        $this->cacheService->invalidateDashboardStats();
    }

    /**
     * Handle deleted.
     *
     * @param User $user The user.
     * @return void
     */
    
    public function deleted(User $user): void
    {
        // Invalidate dashboard stats when user is deleted
        $this->cacheService->invalidateDashboardStats();
    }
}

