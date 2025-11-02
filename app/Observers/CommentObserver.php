<?php

namespace App\Observers;

use App\Models\Comment;
use App\Models\AdminAuditLog;
use App\Services\CacheService;
use Illuminate\Support\Facades\Log;

/**
 * Reacts to comment lifecycle events to refresh caches and emit administrative notifications.
 * Ensures dashboards and audit logs stay current whenever comments are created, updated, or removed.
 */
class CommentObserver
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

    
    
    
     * @param Comment $comment The comment.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function created(Comment $comment): void
    {
        $this->invalidateCache($comment);

        // Log new comment creation for admin notification
        try {
            Log::info('New comment created', [
                'comment_id' => $comment->id,
                'post_id' => $comment->post_id,
                'author' => $comment->user ? $comment->user->name : $comment->author_name,
                'status' => $comment->status,
            ]);

            // Create audit log if created by admin
            if (auth()->check() && auth()->user()->role === 'admin') {
                AdminAuditLog::logAction([
                    'action' => 'create',
                    'model_type' => Comment::class,
                    'model_id' => $comment->id,
                    'severity' => 'low',
                    'description' => 'Created new comment on post #' . $comment->post_id,
                ]);
            }

            // Create admin notification for new comment
            $post = $comment->post()->first();
            $postTitle = $post ? $post->title : 'Post #' . $comment->post_id;

            \App\Models\AdminNotification::createSystem([
                'type' => 'info',
                'title' => 'Nuevo Comentario',
                'message' => 'Nuevo comentario de ' . ($comment->user ? $comment->user->name : $comment->author_name) . ' en el post: ' . $postTitle,
                'data' => [
                    'comment_id' => $comment->id,
                    'post_id' => $comment->post_id,
                    'author' => $comment->user ? $comment->user->name : $comment->author_name,
                    'status' => $comment->status,
                ],
                'action_url' => route('admin.comments.index'),
                'action_text' => 'Ver Comentarios',
                'priority' => $comment->status === 'pending' ? 'high' : 'medium',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log comment creation', ['error' => $e->getMessage()]);
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle updated.

    
    
    
     *

    
    
    
     * @param Comment $comment The comment.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function updated(Comment $comment): void
    {
        $this->invalidateCache($comment);
    }

    
    
    
    
    /**

    
    
    
     * Handle deleted.

    
    
    
     *

    
    
    
     * @param Comment $comment The comment.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function deleted(Comment $comment): void
    {
        $this->invalidateCache($comment);
    }

    
    
    
    
    /**

    
    
    
     * Handle invalidate cache.

    
    
    
     *

    
    
    
     * @param Comment $comment The comment.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    protected function invalidateCache(Comment $comment): void
    {
        // Invalidate dashboard stats
        $this->cacheService->invalidateDashboardStats();
        
        // Invalidate user stats if comment has an author
        if ($comment->user_id) {
            $this->cacheService->invalidateUserStats($comment->user_id);
        }
    }
}

