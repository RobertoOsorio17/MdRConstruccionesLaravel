<?php

namespace App\Jobs;

use App\Models\MLInteractionLog;
use App\Services\MLUserProfileService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
/**
 * Job UpdateMLUserProfileJob.
 */

class UpdateMLUserProfileJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 120;

    
    
    
    
    /**

    
    
    
     * Handle __construct.

    
    
    
     *

    
    
    
     * @param protected string $sessionId The sessionId.

    
    
    
     * @param protected ?int $userId The userId.

    
    
    
     * @param protected int $interactionId The interactionId.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function __construct(
        protected string $sessionId,
        protected ?int $userId,
        protected int $interactionId
    ) {}

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @param MLUserProfileService $userProfileService The userProfileService.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle(MLUserProfileService $userProfileService): void
    {
        try {
            $interaction = MLInteractionLog::find($this->interactionId);
            
            if (!$interaction) {
                Log::warning('Interaction not found for profile update', [
                    'interaction_id' => $this->interactionId
                ]);
                return;
            }

            $userProfileService->updateFromInteraction(
                $this->sessionId,
                $this->userId,
                $interaction
            );

            Log::info('ML user profile updated successfully', [
                'session_id' => $this->sessionId,
                'user_id' => $this->userId,
                'interaction_id' => $this->interactionId
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update ML user profile in job', [
                'error' => $e->getMessage(),
                'session_id' => $this->sessionId,
                'user_id' => $this->userId,
                'interaction_id' => $this->interactionId
            ]);

            throw $e; // Re-throw to trigger retry
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle failed.

    
    
    
     *

    
    
    
     * @param \Throwable $exception The exception.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function failed(\Throwable $exception): void
    {
        Log::error('ML user profile update job failed permanently', [
            'error' => $exception->getMessage(),
            'session_id' => $this->sessionId,
            'user_id' => $this->userId,
            'interaction_id' => $this->interactionId
        ]);
    }
}

