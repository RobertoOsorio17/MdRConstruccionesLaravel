<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Welcomes newly registered users with an onboarding email and dashboard prompt.
 * Also stores a database notification so the greeting appears in-app.
 */
class WelcomeNotification extends Notification implements ShouldQueue
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

    
    
    
     * Handle via.

    
    
    
     *

    
    
    
     * @param object $notifiable The notifiable.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    
    
    
    
    /**

    
    
    
     * Handle to mail.

    
    
    
     *

    
    
    
     * @param object $notifiable The notifiable.

    
    
    
     * @return MailMessage

    
    
    
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

    
    
    
     * Handle to array.

    
    
    
     *

    
    
    
     * @param object $notifiable The notifiable.

    
    
    
     * @return array

    
    
    
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

