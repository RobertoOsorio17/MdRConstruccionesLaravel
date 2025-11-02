<?php

namespace App\Notifications;

use App\Models\BanAppeal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * BanAppealReviewed Notification
 *
 * Sent to the user when their ban appeal has been reviewed by an administrator.
 * Includes the decision (approved/rejected/more info requested) and admin response.
 */
class BanAppealReviewed extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The reviewed ban appeal.
     *
     * @var BanAppeal
     */
    protected $appeal;

    /**
     * Create a new notification instance.
     *
     * @param BanAppeal $appeal The reviewed appeal.
     */
    public function __construct(BanAppeal $appeal)
    {
        $this->appeal = $appeal;
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
        $mail = (new MailMessage)
            ->greeting('Hola ' . $notifiable->name . ',');

        switch ($this->appeal->status) {
            case 'approved':
                $mail->subject('Tu Apelación ha sido Aprobada')
                    ->line('¡Buenas noticias! Tu apelación de baneo ha sido **aprobada**.')
                    ->line('Tu cuenta ha sido desbaneada y ahora puedes acceder normalmente a la plataforma.')
                    ->line('**Detalles de la revisión:**')
                    ->line('- **Revisado por:** ' . ($this->appeal->reviewedBy->name ?? 'Administrador'))
                    ->line('- **Fecha de revisión:** ' . $this->appeal->reviewed_at->format('d/m/Y H:i'));

                if ($this->appeal->admin_response) {
                    $mail->line('**Mensaje del administrador:**')
                        ->line('"' . $this->appeal->admin_response . '"');
                }

                $mail->action('Acceder a tu Cuenta', url('/'))
                    ->line('Te recordamos seguir las reglas de la comunidad para evitar futuros baneos.')
                    ->line('¡Bienvenido de vuelta!');
                break;

            case 'rejected':
                $mail->subject('Tu Apelación ha sido Rechazada')
                    ->line('Lamentamos informarte que tu apelación de baneo ha sido **rechazada**.')
                    ->line('Después de revisar tu caso, hemos decidido mantener el baneo activo.')
                    ->line('**Detalles de la revisión:**')
                    ->line('- **Revisado por:** ' . ($this->appeal->reviewedBy->name ?? 'Administrador'))
                    ->line('- **Fecha de revisión:** ' . $this->appeal->reviewed_at->format('d/m/Y H:i'));

                if ($this->appeal->admin_response) {
                    $mail->line('**Razón del rechazo:**')
                        ->line('"' . $this->appeal->admin_response . '"');
                }

                $mail->line('Si tienes preguntas adicionales, puedes contactar con el equipo de soporte.')
                    ->line('Gracias por tu comprensión.');
                break;

            case 'more_info_requested':
                $mail->subject('Se Requiere Más Información sobre tu Apelación')
                    ->line('Hemos revisado tu apelación de baneo y necesitamos **más información** antes de tomar una decisión.')
                    ->line('**Detalles de la revisión:**')
                    ->line('- **Revisado por:** ' . ($this->appeal->reviewedBy->name ?? 'Administrador'))
                    ->line('- **Fecha de revisión:** ' . $this->appeal->reviewed_at->format('d/m/Y H:i'));

                if ($this->appeal->admin_response) {
                    $mail->line('**Información solicitada:**')
                        ->line('"' . $this->appeal->admin_response . '"');
                }

                $mail->line('Por favor, responde a este email con la información solicitada lo antes posible.')
                    ->line('Gracias por tu cooperación.');
                break;
        }

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $statusMessages = [
            'approved' => 'Tu apelación ha sido aprobada. Tu cuenta ha sido desbaneada.',
            'rejected' => 'Tu apelación ha sido rechazada. El baneo se mantiene activo.',
            'more_info_requested' => 'Se requiere más información sobre tu apelación.',
        ];

        return [
            'type' => 'ban_appeal_reviewed',
            'title' => 'Apelación Revisada',
            'message' => $statusMessages[$this->appeal->status] ?? 'Tu apelación ha sido revisada.',
            'appeal_id' => $this->appeal->id,
            'status' => $this->appeal->status,
            'admin_response' => $this->appeal->admin_response,
        ];
    }
}
