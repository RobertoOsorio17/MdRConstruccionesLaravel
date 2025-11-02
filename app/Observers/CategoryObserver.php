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

    
    
    
     * @param Category $category The category.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function created(Category $category): void
    {
        $this->invalidateCache($category);
    }

    
    
    
    
    /**

    
    
    
     * Handle updated.

    
    
    
     *

    
    
    
     * @param Category $category The category.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function updated(Category $category): void
    {
        $this->invalidateCache($category);
    }

    
    
    
    
    /**

    
    
    
     * Handle deleted.

    
    
    
     *

    
    
    
     * @param Category $category The category.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function deleted(Category $category): void
    {
        $this->invalidateCache($category);
    }

    
    
    
    
    /**

    
    
    
     * Handle invalidate cache.

    
    
    
     *

    
    
    
     * @param Category $category The category.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    protected function invalidateCache(Category $category): void
    {
        // Invalidate specific category cache
        $this->cacheService->invalidateCategory($category->slug);
        
        // Invalidate dashboard stats
        $this->cacheService->invalidateDashboardStats();
    }
}

