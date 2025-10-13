<?php

namespace App\Notifications;

use App\Models\ContactRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Confirmation notification sent to users when they submit a contact request
 */
class ContactRequestConfirmation extends Notification implements ShouldQueue
{
    use Queueable;

    protected ContactRequest $contactRequest;

    /**
     * Create a new notification instance.
     */
    public function __construct(ContactRequest $contactRequest)
    {
        $this->contactRequest = $contactRequest;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Confirmación de Solicitud de Contacto - ' . config('app.name'))
            ->greeting('¡Hola ' . $this->contactRequest->name . '!')
            ->line('Hemos recibido tu solicitud de contacto.')
            ->line('**Asunto:** ' . $this->contactRequest->subject)
            ->line('Nuestro equipo revisará tu mensaje y te responderá en las próximas 24 horas.')
            ->when($this->contactRequest->preferred_contact, function ($mail) {
                return $mail->line('Te contactaremos preferentemente por: ' . $this->contactRequest->preferred_contact);
            })
            ->line('Si tienes alguna pregunta urgente, no dudes en llamarnos.')
            ->line('Gracias por contactarnos.')
            ->salutation('Saludos cordiales, ' . config('app.name'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'contact_request_id' => $this->contactRequest->id,
            'subject' => $this->contactRequest->subject,
        ];
    }
}

