<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\MLRecommendationService;
use App\Helpers\MLSettingsHelper;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
/**
 * Job GenerateBatchRecommendationsJob.
 */

class GenerateBatchRecommendationsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 2;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 300;

    
    
    
    
    /**

    
    
    
     * Handle __construct.

    
    
    
     *

    
    
    
     * @param protected array $userIds The userIds.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function __construct(
        protected array $userIds
    ) {}

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @param MLRecommendationService $recommendationService The recommendationService.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle(MLRecommendationService $recommendationService): void
    {
        $performanceConfig = MLSettingsHelper::getPerformanceConfig();
        $batchSize = $performanceConfig['batch_size'];
        
        $processed = 0;
        $failed = 0;

        foreach ($this->userIds as $userId) {
            try {
                // Generate recommendations for user
                $recommendations = $recommendationService->getRecommendations(
                    sessionId: null,
                    userId: $userId,
                    currentPostId: null,
                    limit: 10
                );

                // Cache recommendations
                $cacheKey = "batch_recommendations_{$userId}";
                Cache::put($cacheKey, $recommendations, now()->addHours(24));

                $processed++;

                // Respect batch size for rate limiting
                if ($processed % $batchSize === 0) {
                    sleep(1); // Small delay between batches
                }

            } catch (\Exception $e) {
                $failed++;
                Log::error('Failed to generate batch recommendations for user', [
                    'user_id' => $userId,
                    'error' => $e->getMessage()
                ]);
            }
        }

        Log::info('Batch recommendations generation completed', [
            'total_users' => count($this->userIds),
            'processed' => $processed,
            'failed' => $failed
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle failed.

    
    
    
     *

    
    
    
     * @param \Throwable $exception The exception.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function failed(\Throwable $exception): void
    {
        Log::error('Batch recommendations job failed permanently', [
            'error' => $exception->getMessage(),
            'user_count' => count($this->userIds)
        ]);
    }
}

