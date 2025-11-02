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

    
    
    
     * @param Post $post The post.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function created(Post $post): void
    {
        // ✅ Dispatch event for ML cache invalidation
        event(new PostCreated($post));

        // Invalidate general caches
        $this->invalidateCache($post);
    }

    
    
    
    
    /**

    
    
    
     * Handle updated.

    
    
    
     *

    
    
    
     * @param Post $post The post.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function updated(Post $post): void
    {
        $this->invalidateCache($post);
    }

    
    
    
    
    /**

    
    
    
     * Handle deleted.

    
    
    
     *

    
    
    
     * @param Post $post The post.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function deleted(Post $post): void
    {
        $this->invalidateCache($post);
    }

    
    
    
    
    /**

    
    
    
     * Handle invalidate cache.

    
    
    
     *

    
    
    
     * @param Post $post The post.

    
    
    
     * @return void

    
    
    
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

