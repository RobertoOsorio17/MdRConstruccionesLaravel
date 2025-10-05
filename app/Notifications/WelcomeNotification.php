<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
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
            ->subject('¡Bienvenido a MDR Construcciones!')
            ->greeting('¡Hola ' . $notifiable->name . '!')
            ->line('Gracias por registrarte en MDR Construcciones.')
            ->line('Estamos emocionados de tenerte con nosotros.')
            ->action('Explorar Dashboard', url('/dashboard'))
            ->line('Si tienes alguna pregunta, no dudes en contactarnos.')
            ->salutation('Saludos, El equipo de MDR Construcciones');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => '¡Bienvenido!',
            'message' => 'Gracias por registrarte en MDR Construcciones.',
            'action_url' => url('/dashboard'),
            'action_text' => 'Explorar Dashboard',
        ];
    }
}

