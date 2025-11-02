<?php

namespace App\Listeners;

use App\Events\CommentReported;
use App\Models\User;
use App\Models\AdminNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Listener that notifies moderators when a comment is reported.
 * 
 * This listener creates admin notifications for users with moderator
 * or admin roles when a new comment report is created.
 * 
 * Implements ShouldQueue to process notifications asynchronously.
 */
class NotifyModeratorsOfReport implements ShouldQueue
{
    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = 60;

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @param CommentReported $event The event.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle(CommentReported $event): void
    {
        $report = $event->report;
        
        // Load necessary relationships
        $report->load(['comment.post', 'user']);
        
        try {
            // Get all moderators and admins
            $moderators = User::role(['admin', 'moderator'])->get();
            
            if ($moderators->isEmpty()) {
                Log::warning('No moderators found to notify about comment report', [
                    'report_id' => $report->id,
                    'comment_id' => $report->comment_id
                ]);
                return;
            }
            
            // Determine notification priority based on report priority
            $notificationPriority = match($report->priority) {
                'high' => 'urgent',
                'medium' => 'high',
                'low' => 'medium',
                default => 'medium'
            };
            
            // Determine notification type based on category
            $notificationType = match($report->category) {
                'hate_speech', 'harassment' => 'error',
                'spam', 'inappropriate' => 'warning',
                default => 'info'
            };
            
            // Create notification title and message
            $categoryLabel = $this->getCategoryLabel($report->category);
            $reporterName = $report->user 
                ? $report->user->name 
                : 'Invitado (IP: ' . substr($report->ip_address, 0, -4) . 'xxx)';
            
            $title = "Nuevo reporte de comentario: {$categoryLabel}";
            $message = "{$reporterName} reportó un comentario en el post \"{$report->comment->post->title}\" por {$categoryLabel}.";
            
            // Add urgency message for high priority reports
            if ($report->priority === 'high') {
                $message .= " ⚠️ Este reporte requiere atención urgente.";
            }
            
            // Create notification for each moderator
            foreach ($moderators as $moderator) {
                AdminNotification::create([
                    'user_id' => $moderator->id,
                    'type' => $notificationType,
                    'title' => $title,
                    'message' => $message,
                    'data' => [
                        'report_id' => $report->id,
                        'comment_id' => $report->comment_id,
                        'post_id' => $report->comment->post_id,
                        'category' => $report->category,
                        'priority' => $report->priority,
                        'reporter_type' => $report->is_guest_report ? 'guest' : 'user',
                        'reporter_id' => $report->user_id
                    ],
                    'action_url' => route('admin.comment-reports.index', ['status' => 'pending']),
                    'action_text' => 'Ver Reportes',
                    'priority' => $notificationPriority,
                    'is_dismissible' => true,
                    'is_system' => false
                ]);
            }
            
            Log::info('Moderators notified of comment report', [
                'report_id' => $report->id,
                'comment_id' => $report->comment_id,
                'category' => $report->category,
                'priority' => $report->priority,
                'moderators_notified' => $moderators->count()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to notify moderators of comment report', [
                'report_id' => $report->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Re-throw to trigger retry
            throw $e;
        }
    }
    
    
    
    
    
    /**

    
    
    
     * Get category label.

    
    
    
     *

    
    
    
     * @param string $category The category.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    private function getCategoryLabel(string $category): string
    {
        return match($category) {
            'spam' => 'Spam',
            'harassment' => 'Acoso',
            'hate_speech' => 'Discurso de odio',
            'inappropriate' => 'Contenido inapropiado',
            'misinformation' => 'Desinformación',
            'off_topic' => 'Fuera de tema',
            'other' => 'Otro',
            default => 'Desconocido'
        };
    }
    
    
    
    
    
    /**

    
    
    
     * Handle failed.

    
    
    
     *

    
    
    
     * @param CommentReported $event The event.

    
    
    
     * @param \Throwable $exception The exception.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function failed(CommentReported $event, \Throwable $exception): void
    {
        Log::critical('Failed to notify moderators after all retries', [
            'report_id' => $event->report->id,
            'error' => $exception->getMessage()
        ]);
    }
}

