<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\AdminAuditLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
/**
 * Job SendBulkUserNotifications.
 */

class SendBulkUserNotifications implements ShouldQueue
{
    use Queueable;

    /**
     * The notification data.
     *
     * @var array
     */
    protected $notificationData;

    /**
     * The user IDs to send notifications to.
     *
     * @var array
     */
    protected $userIds;

    /**
     * The admin ID who is sending the notifications.
     *
     * @var int
     */
    protected $sentBy;

    
    
    
    
    /**

    
    
    
     * Handle __construct.

    
    
    
     *

    
    
    
     * @param array $notificationData The notificationData.

    
    
    
     * @param array $userIds The userIds.

    
    
    
     * @param int $sentBy The sentBy.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function __construct(array $notificationData, array $userIds, int $sentBy)
    {
        $this->notificationData = $notificationData;
        $this->userIds = $userIds;
        $this->sentBy = $sentBy;
    }

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle(): void
    {
        try {
            $notifications = [];
            $now = now();

            // Prepare bulk insert data
            foreach ($this->userIds as $userId) {
                $notifications[] = [
                    'user_id' => $userId,
                    'sent_by' => $this->sentBy,
                    'type' => $this->notificationData['type'],
                    'title' => $this->notificationData['title'],
                    'priority' => $this->notificationData['priority'],
                    'data' => json_encode([
                        'message' => $this->notificationData['message'],
                    ]),
                    'action_url' => $this->notificationData['action_url'] ?? null,
                    'action_text' => $this->notificationData['action_text'] ?? null,
                    'notifiable_type' => null,
                    'notifiable_id' => null,
                    'read_at' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Bulk insert notifications
            DB::transaction(function () use ($notifications) {
                // Insert in chunks to avoid memory issues
                $chunks = array_chunk($notifications, 500);
                foreach ($chunks as $chunk) {
                    Notification::insert($chunk);
                }
            });

            // Log the bulk send in audit log
            AdminAuditLog::create([
                'user_id' => $this->sentBy,
                'action' => 'bulk_notification_sent',
                'description' => sprintf(
                    'Sent bulk notification "%s" to %d users',
                    $this->notificationData['title'],
                    count($this->userIds)
                ),
                'severity' => 'low',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Queue Worker',
                'session_id' => 'queue',
                'route_name' => 'queue.job',
                'url' => config('app.url'),
                'metadata' => [
                    'notification_type' => $this->notificationData['type'],
                    'priority' => $this->notificationData['priority'],
                    'recipient_count' => count($this->userIds),
                ],
            ]);

            Log::info('Bulk notifications sent successfully', [
                'sent_by' => $this->sentBy,
                'recipient_count' => count($this->userIds),
                'title' => $this->notificationData['title'],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send bulk notifications', [
                'sent_by' => $this->sentBy,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Re-throw to mark job as failed
            throw $e;
        }
    }
}
