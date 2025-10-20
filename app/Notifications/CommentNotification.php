<?php

namespace App\Notifications;

use App\Models\Comment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notifies post authors when a new comment is published, delivering both email and database payloads.
 * Queued to avoid blocking user interactions while providing localized messaging.
 */
class CommentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Comment $comment;

    /**
     * Create a new notification instance.
     */
    public function __construct(Comment $comment)
    {
        $this->comment = $comment;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $post = $this->comment->post;
        $commenterName = $this->comment->user?->name ?? $this->comment->author_name ?? 'Un usuario';

        return (new MailMessage)
            ->subject('Nuevo comentario en tu post')
            ->greeting('¡Hola ' . $notifiable->name . '!')
            ->line($commenterName . ' ha comentado en tu post "' . $post->title . '"')
            ->line('Comentario: ' . \Illuminate\Support\Str::limit($this->comment->body, 100))
            ->action('Ver Comentario', url('/posts/' . $post->slug . '#comment-' . $this->comment->id))
            ->line('Gracias por usar nuestra plataforma.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $commenterName = $this->comment->user?->name ?? $this->comment->author_name ?? 'Un usuario';

        return [
            'title' => 'Nuevo comentario',
            'message' => $commenterName . ' comentó en tu post',
            'comment_id' => $this->comment->id,
            'post_id' => $this->comment->post_id,
            'action_url' => url('/posts/' . $this->comment->post->slug . '#comment-' . $this->comment->id),
        ];
    }
}

