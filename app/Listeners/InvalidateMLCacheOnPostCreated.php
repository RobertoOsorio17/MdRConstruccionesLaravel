<?php

namespace App\Listeners;

use App\Events\PostCreated;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * ✅ FIXED: Invalidate ML recommendation caches when new content is created
 * Prevents serving stale recommendations to users
 */
class InvalidateMLCacheOnPostCreated
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(PostCreated $event): void
    {
        try {
            // ✅ Invalidate all ML recommendation caches
            // Pattern: ml_recommendations_*
            $cacheKeys = $this->getMLCacheKeys();

            foreach ($cacheKeys as $key) {
                Cache::forget($key);
            }

            // ✅ Also clear precomputed recommendations
            Cache::tags(['ml_recommendations'])->flush();

            Log::info('ML cache invalidated', [
                'post_id' => $event->post->id,
                'post_title' => $event->post->title,
                'keys_cleared' => count($cacheKeys)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to invalidate ML cache', [
                'post_id' => $event->post->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get all ML cache keys to invalidate
     */
    private function getMLCacheKeys(): array
    {
        // In production, you might want to use Redis SCAN command
        // For now, we'll use cache tags which is more efficient
        return [
            // Pattern: ml_recommendations_{userId}_{sessionId}_{currentPostId}_{limit}
            // Since we can't enumerate all possible keys, we'll rely on cache tags
        ];
    }
}
