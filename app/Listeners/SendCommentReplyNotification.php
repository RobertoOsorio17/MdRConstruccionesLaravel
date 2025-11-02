<?php

namespace App\Listeners;

use App\Models\Comment;
use App\Http\Controllers\NotificationController;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

/**
 * Handle comment reply notification listener events.
 */
class SendCommentReplyNotification implements ShouldQueue
{
    use InteractsWithQueue;

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @param mixed $event The event.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle($event): void
    {
        $comment = $event->comment;

        // If this is a reply to another comment
        if ($comment->parent_id) {
            $parentComment = Comment::find($comment->parent_id);
            
            // Don't notify if replying to own comment
            if ($parentComment && $parentComment->user_id && $parentComment->user_id !== $comment->user_id) {
                NotificationController::create(
                    $parentComment->user_id,
                    'comment_reply',
                    $comment,
                    [
                        'title' => 'Nueva respuesta a tu comentario',
                        'message' => substr($comment->body, 0, 100),
                        'author' => $comment->user ? $comment->user->name : $comment->author_name,
                        'url' => route('blog.show', $comment->post->slug) . '#comment-' . $comment->id,
                        'post_title' => $comment->post->title,
                    ]
                );
            }
        }
    }
}

