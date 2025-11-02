<?php

namespace App\Listeners;

use App\Http\Controllers\NotificationController;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

/**
 * Handle comment like notification listener events.
 */
class SendCommentLikeNotification implements ShouldQueue
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
        $user = $event->user;

        // Don't notify if liking own comment
        if ($comment->user_id && $comment->user_id !== $user->id) {
            NotificationController::create(
                $comment->user_id,
                'comment_like',
                $comment,
                [
                    'title' => 'Le gustó tu comentario',
                    'message' => substr($comment->body, 0, 100),
                    'liker' => $user->name,
                    'url' => route('blog.show', $comment->post->slug) . '#comment-' . $comment->id,
                    'post_title' => $comment->post->title,
                ]
            );
        }
    }
}

