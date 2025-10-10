<?php

namespace App\Jobs\ML;

use App\Services\MLUserProfileService;
use App\Exceptions\ML\MLProfileUpdateException;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Job for updating user profiles.
 * Processes profile updates asynchronously.
 */
class UpdateUserProfileJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;
    public int $backoff = 30;

    private string $sessionId;
    private ?int $userId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $sessionId, ?int $userId = null)
    {
        $this->sessionId = $sessionId;
        $this->userId = $userId;
        $this->onQueue('ml-profiles');
    }

    /**
     * Execute the job.
     */
    public function handle(MLUserProfileService $profileService): void
    {
        try {
            Log::info("Updating user profile", [
                'session_id' => $this->sessionId,
                'user_id' => $this->userId
            ]);

            $profileService->updateUserProfile($this->sessionId, $this->userId);

            Log::info("User profile updated successfully", [
                'session_id' => $this->sessionId
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to update user profile", [
                'session_id' => $this->sessionId,
                'user_id' => $this->userId,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("User profile update job failed permanently", [
            'session_id' => $this->sessionId,
            'user_id' => $this->userId,
            'error' => $exception->getMessage()
        ]);
    }

    /**
     * Get the tags that should be assigned to the job.
     */
    public function tags(): array
    {
        return ['ml-profiles', "session:{$this->sessionId}"];
    }
}

