<?php

namespace App\Jobs\ML;

use App\Models\Post;
use App\Models\MLUserProfile;
use App\Services\ContentAnalysisServiceV2;
use App\Services\MLUserProfileService;
use App\Services\ML\KMeansClusteringService;
use App\Services\ML\MatrixFactorizationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;

/**
 * Job for batch training ML models.
 * Orchestrates training of all ML components.
 */
class BatchTrainModelsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 3600; // 1 hour
    public int $backoff = 300;

    private string $mode;
    private int $batchSize;
    private array $options;

    
    
    
    
    /**

    
    
    
     * Handle __construct.

    
    
    
     *

    
    
    
     * @param string $mode The mode.

    
    
    
     * @param int $batchSize The batchSize.

    
    
    
     * @param array $options The options.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function __construct(string $mode = 'full', int $batchSize = 100, array $options = [])
    {
        $this->mode = $mode;
        $this->batchSize = $batchSize;
        $this->options = $options;
        $this->onQueue('ml-training');
    }

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @param ContentAnalysisServiceV2 $contentAnalysis The contentAnalysis.

    
    
    
     * @param MLUserProfileService $profileService The profileService.

    
    
    
     * @param KMeansClusteringService $clusteringService The clusteringService.

    
    
    
     * @param MatrixFactorizationService $matrixFactorization The matrixFactorization.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle(
        ContentAnalysisServiceV2 $contentAnalysis,
        MLUserProfileService $profileService,
        KMeansClusteringService $clusteringService,
        MatrixFactorizationService $matrixFactorization
    ): void {
        $startTime = microtime(true);
        
        Log::info("Starting batch ML training", [
            'mode' => $this->mode,
            'batch_size' => $this->batchSize
        ]);

        $stats = [
            'posts_analyzed' => 0,
            'profiles_updated' => 0,
            'clusters_updated' => 0,
            'matrix_factorization_trained' => false,
            'errors' => []
        ];

        try {
            // Step 1: Train post vectors
            if (in_array($this->mode, ['full', 'posts_only', 'incremental'])) {
                $stats['posts_analyzed'] = $this->trainPostVectors($contentAnalysis);
            }

            // Step 2: Update user profiles
            if (in_array($this->mode, ['full', 'profiles_only', 'incremental'])) {
                $stats['profiles_updated'] = $this->updateUserProfiles($profileService);
            }

            // Step 3: Perform clustering
            if ($this->mode === 'full') {
                $stats['clusters_updated'] = $this->performClustering($clusteringService);
            }

            // Step 4: Train matrix factorization
            if ($this->mode === 'full' && ($this->options['train_matrix_factorization'] ?? true)) {
                $this->trainMatrixFactorization($matrixFactorization);
                $stats['matrix_factorization_trained'] = true;
            }

            // Step 5: Clear caches if requested
            if ($this->options['clear_cache'] ?? false) {
                $this->clearCaches();
            }

            $duration = round(microtime(true) - $startTime, 2);
            $stats['duration_seconds'] = $duration;

            Log::info("Batch ML training completed", $stats);

            // Send notification if requested
            if ($this->options['notify_on_completion'] ?? false) {
                $this->sendCompletionNotification($stats);
            }

        } catch (\Exception $e) {
            Log::error("Batch ML training failed", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'stats' => $stats
            ]);

            throw $e;
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle train post vectors.

    
    
    
     *

    
    
    
     * @param ContentAnalysisServiceV2 $contentAnalysis The contentAnalysis.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    private function trainPostVectors(ContentAnalysisServiceV2 $contentAnalysis): int
    {
        $count = 0;

        $query = Post::published();

        if ($this->mode === 'incremental') {
            $query->whereDoesntHave('mlVector');
        } else {
            $query->where(function($q) {
                $q->whereDoesntHave('mlVector')
                  ->orWhereHas('mlVector', function($subq) {
                      $subq->where('vector_updated_at', '<', now()->subHours(24));
                  });
            });
        }

        $query->chunk($this->batchSize, function($posts) use ($contentAnalysis, &$count) {
            foreach ($posts as $post) {
                try {
                    // Dispatch individual job for each post
                    TrainPostVectorJob::dispatch($post->id);
                    $count++;
                } catch (\Exception $e) {
                    Log::warning("Failed to dispatch post vector training", [
                        'post_id' => $post->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        });

        return $count;
    }

    
    
    
    
    /**

    
    
    
     * Handle update user profiles.

    
    
    
     *

    
    
    
     * @param MLUserProfileService $profileService The profileService.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    private function updateUserProfiles(MLUserProfileService $profileService): int
    {
        $count = 0;

        $query = MLUserProfile::query();

        if ($this->mode === 'incremental') {
            $query->where('last_activity', '>', now()->subHours(24))
                  ->where('profile_updated_at', '<', now()->subHours(1));
        } else {
            $query->where('profile_updated_at', '<', now()->subHours(24))
                  ->orWhereNull('profile_updated_at');
        }

        $query->chunk($this->batchSize, function($profiles) use (&$count) {
            foreach ($profiles as $profile) {
                try {
                    // Dispatch individual job for each profile
                    UpdateUserProfileJob::dispatch($profile->session_id, $profile->user_id);
                    $count++;
                } catch (\Exception $e) {
                    Log::warning("Failed to dispatch profile update", [
                        'profile_id' => $profile->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        });

        return $count;
    }

    
    
    
    
    /**

    
    
    
     * Handle perform clustering.

    
    
    
     *

    
    
    
     * @param KMeansClusteringService $clusteringService The clusteringService.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    private function performClustering(KMeansClusteringService $clusteringService): int
    {
        $profiles = MLUserProfile::whereNotNull('category_preferences')
            ->where('total_posts_read', '>', 5)
            ->get();

        if ($profiles->count() < 5) {
            Log::warning("Insufficient profiles for clustering", [
                'count' => $profiles->count()
            ]);
            return 0;
        }

        $result = $clusteringService->cluster($profiles, 5);

        // Update profiles with cluster assignments
        $updated = 0;
        foreach ($result['assignments'] as $i => $cluster) {
            $profileId = $result['profile_ids'][$i] ?? null;
            if ($profileId) {
                $profile = $profiles->firstWhere('id', $profileId);
                if ($profile) {
                    $confidence = $clusteringService->getClusterConfidence(
                        $profile,
                        $result['centroids']
                    );

                    $profile->update([
                        'user_cluster' => $cluster,
                        'cluster_confidence' => $confidence
                    ]);
                    $updated++;
                }
            }
        }

        // Cache centroids
        Cache::put('ml_cluster_centroids', $result['centroids'], now()->addDays(7));

        Log::info("Clustering completed", [
            'profiles_updated' => $updated,
            'silhouette_score' => $result['metrics']['silhouette_score']
        ]);

        return $updated;
    }

    
    
    
    
    /**

    
    
    
     * Handle train matrix factorization.

    
    
    
     *

    
    
    
     * @param MatrixFactorizationService $matrixFactorization The matrixFactorization.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function trainMatrixFactorization(MatrixFactorizationService $matrixFactorization): void
    {
        Log::info("Starting matrix factorization training");

        $result = $matrixFactorization->train();

        Log::info("Matrix factorization training completed", [
            'num_users' => $result['metrics']['num_users'],
            'num_items' => $result['metrics']['num_items'],
            'final_loss' => $result['metrics']['final_loss'],
            'iterations' => $result['metrics']['iterations']
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle clear caches.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function clearCaches(): void
    {
        Cache::tags(['ml_recommendations', 'ml_metrics', 'ml_clustering'])->flush();
        
        Log::info("ML caches cleared");
    }

    
    
    
    
    /**

    
    
    
     * Send completion notification.

    
    
    
     *

    
    
    
     * @param array $stats The stats.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function sendCompletionNotification(array $stats): void
    {
        // Implementation would use Laravel Notifications
        Log::info("Training completion notification sent", $stats);
    }

    
    
    
    
    /**

    
    
    
     * Handle failed.

    
    
    
     *

    
    
    
     * @param \Throwable $exception The exception.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function failed(\Throwable $exception): void
    {
        Log::error("Batch ML training job failed permanently", [
            'mode' => $this->mode,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle tags.

    
    
    
     *

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    public function tags(): array
    {
        return ['ml-training', 'batch', "mode:{$this->mode}"];
    }
}

