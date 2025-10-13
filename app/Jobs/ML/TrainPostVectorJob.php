<?php

namespace App\Jobs\ML;

use App\Models\Post;
use App\Services\ContentAnalysisServiceV2;
use App\Exceptions\ML\MLTrainingException;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Job for training individual post vectors.
 * Processes posts in background for scalability.
 */
class TrainPostVectorJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;
    public int $backoff = 60;

    private int $postId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $postId)
    {
        $this->postId = $postId;
        $this->onQueue('ml-training');
    }

    /**
     * Execute the job.
     */
    public function handle(ContentAnalysisServiceV2 $contentAnalysis): void
    {
        try {
            $post = Post::find($this->postId);

            if (!$post) {
                Log::warning("Post not found for vector training", ['post_id' => $this->postId]);
                return;
            }

            Log::info("Training post vector", ['post_id' => $this->postId]);

            $contentAnalysis->analyzePost($post);

            Log::info("Post vector trained successfully", ['post_id' => $this->postId]);

        } catch (\Exception $e) {
            Log::error("Failed to train post vector", [
                'post_id' => $this->postId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Post vector training job failed permanently", [
            'post_id' => $this->postId,
            'error' => $exception->getMessage()
        ]);

        // Optionally notify administrators
        // Notification::route('mail', config('mail.admin'))->notify(new MLJobFailedNotification($exception));
    }

    /**
     * Get the tags that should be assigned to the job.
     */
    public function tags(): array
    {
        return ['ml-training', 'post-vector', "post:{$this->postId}"];
    }
}

