<?php

namespace App\Notifications;

use App\Models\Post;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Alerts subscribers when a new blog post goes live, sending both email and database notifications.
 * Provides teaser content and a direct call-to-action back to the published article.
 */
class PostPublishedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Post $post;

    /**
     * Create a new notification instance.
     */
    public function __construct(Post $post)
    {
        $this->post = $post;
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
        return (new MailMessage)
            ->subject('Nuevo post publicado: ' . $this->post->title)
            ->greeting('¡Hola ' . $notifiable->name . '!')
            ->line('Se ha publicado un nuevo post que podría interesarte.')
            ->line('Título: ' . $this->post->title)
            ->line('Resumen: ' . \Illuminate\Support\Str::limit($this->post->summary, 150))
            ->action('Leer Post', url('/posts/' . $this->post->slug))
            ->line('¡Gracias por seguirnos!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Nuevo post publicado',
            'message' => $this->post->title,
            'post_id' => $this->post->id,
            'action_url' => url('/posts/' . $this->post->slug),
        ];
    }
}

