<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\AdminAuditLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * Process scheduled notifications that are due to be sent
 */
class ProcessScheduledNotifications implements ShouldQueue
{
    use Queueable;

    
    
    
    
    /**

    
    
    
     * Handle __construct.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function __construct()
    {
        //
    }

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle(): void
    {
        try {
            // Get all scheduled notifications that are due
            $dueNotifications = Notification::where('status', 'scheduled')
                ->where('scheduled_at', '<=', now())
                ->whereNotNull('sent_by')
                ->get();

            $processedCount = 0;
            $failedCount = 0;

            foreach ($dueNotifications as $notification) {
                try {
                    // Update status to sent
                    $notification->update([
                        'status' => 'sent',
                        'sent_at' => now(),
                    ]);

                    $processedCount++;

                    // Handle recurring notifications
                    if ($notification->is_recurring && $notification->recurrence_pattern) {
                        $this->scheduleNextOccurrence($notification);
                    }
                } catch (\Exception $e) {
                    $failedCount++;

                    // Mark as failed
                    $notification->update([
                        'status' => 'failed',
                        'failure_reason' => $e->getMessage(),
                    ]);

                    Log::error('Failed to process scheduled notification', [
                        'notification_id' => $notification->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // Log the processing
            if ($processedCount > 0 || $failedCount > 0) {
                Log::info('Processed scheduled notifications', [
                    'processed' => $processedCount,
                    'failed' => $failedCount,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to process scheduled notifications job', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle schedule next occurrence.

    
    
    
     *

    
    
    
     * @param Notification $notification The notification.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function scheduleNextOccurrence(Notification $notification): void
    {
        $nextDate = null;

        switch ($notification->recurrence_pattern) {
            case 'daily':
                $nextDate = Carbon::parse($notification->scheduled_at)->addDay();
                break;
            case 'weekly':
                $nextDate = Carbon::parse($notification->scheduled_at)->addWeek();
                break;
            case 'monthly':
                $nextDate = Carbon::parse($notification->scheduled_at)->addMonth();
                break;
        }

        if ($nextDate) {
            // Create a new scheduled notification for the next occurrence
            Notification::create([
                'user_id' => $notification->user_id,
                'sent_by' => $notification->sent_by,
                'type' => $notification->type,
                'title' => $notification->title,
                'priority' => $notification->priority,
                'data' => $notification->data,
                'action_url' => $notification->action_url,
                'action_text' => $notification->action_text,
                'scheduled_at' => $nextDate,
                'status' => 'scheduled',
                'is_recurring' => true,
                'recurrence_pattern' => $notification->recurrence_pattern,
                'next_occurrence' => $nextDate,
            ]);
        }
    }
}
