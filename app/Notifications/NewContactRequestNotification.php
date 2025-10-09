<?php

namespace App\Notifications;

use App\Models\ContactRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification sent to administrators when a new contact request is received
 */
class NewContactRequestNotification extends Notification implements ShouldQueue
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
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $attachmentCount = $this->contactRequest->attachments()->count();
        
        return (new MailMessage)
            ->subject('Nueva Solicitud de Contacto - ' . $this->contactRequest->subject)
            ->greeting('¡Nueva Solicitud de Contacto!')
            ->line('Se ha recibido una nueva solicitud de contacto.')
            ->line('**De:** ' . $this->contactRequest->name)
            ->line('**Email:** ' . $this->contactRequest->email)
            ->line('**Teléfono:** ' . ($this->contactRequest->phone ?? 'No proporcionado'))
            ->line('**Asunto:** ' . $this->contactRequest->subject)
            ->line('**Mensaje:**')
            ->line($this->contactRequest->message)
            ->when($this->contactRequest->service, function ($mail) {
                return $mail->line('**Servicio de interés:** ' . $this->contactRequest->service);
            })
            ->when($attachmentCount > 0, function ($mail) use ($attachmentCount) {
                return $mail->line('**Archivos adjuntos:** ' . $attachmentCount);
            })
            ->action('Ver Solicitud', route('admin.contact-requests.show', $this->contactRequest->id))
            ->line('Por favor, responde a esta solicitud lo antes posible.');
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
            'name' => $this->contactRequest->name,
            'email' => $this->contactRequest->email,
            'subject' => $this->contactRequest->subject,
            'message' => \Illuminate\Support\Str::limit($this->contactRequest->message, 100),
        ];
    }
}

