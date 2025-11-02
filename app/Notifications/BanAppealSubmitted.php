<?php

namespace App\Notifications;

use App\Models\BanAppeal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * BanAppealSubmitted Notification
 *
 * Sent when a user submits a ban appeal.
 * - To User: Confirmation that appeal was received
 * - To Admins: Alert about new appeal to review
 */
class BanAppealSubmitted extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The ban appeal instance.
     *
     * @var BanAppeal
     */
    protected $appeal;

    /**
     * Create a new notification instance.
     *
     * @param BanAppeal $appeal The submitted appeal.
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
        // Check if notifiable is the user who submitted the appeal
        $isAppealUser = $notifiable->id === $this->appeal->user_id;

        if ($isAppealUser) {
            return $this->toUserMail($notifiable);
        }

        return $this->toAdminMail($notifiable);
    }

    /**
     * Get the mail message for the user who submitted the appeal.
     */
    protected function toUserMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Apelación de Baneo Recibida')
            ->greeting('Hola ' . $notifiable->name . ',')
            ->line('Hemos recibido tu apelación de baneo.')
            ->line('**Detalles de tu apelación:**')
            ->line('- **Fecha de envío:** ' . $this->appeal->created_at->format('d/m/Y H:i'))
            ->line('- **Estado:** Pendiente de revisión')
            ->line('Nuestro equipo de administración revisará tu apelación lo antes posible. Te notificaremos por email cuando haya una decisión.')
            ->line('**Importante:** Solo puedes enviar una apelación por baneo. Por favor, espera nuestra respuesta.')
            ->line('Gracias por tu paciencia.');
    }

    /**
     * Get the mail message for administrators.
     */
    protected function toAdminMail(object $notifiable): MailMessage
    {
        $user = $this->appeal->user;
        $ban = $this->appeal->userBan;

        return (new MailMessage)
            ->subject('Nueva Apelación de Baneo - ' . $user->name)
            ->greeting('Hola ' . $notifiable->name . ',')
            ->line('Se ha recibido una nueva apelación de baneo que requiere tu revisión.')
            ->line('**Detalles del usuario:**')
            ->line('- **Usuario:** ' . $user->name . ' (' . $user->email . ')')
            ->line('- **Baneado el:** ' . $ban->banned_at->format('d/m/Y H:i'))
            ->line('- **Razón del baneo:** ' . $ban->reason)
            ->line('- **Tipo:** ' . ($ban->isPermanent() ? 'Permanente' : 'Temporal'))
            ->line('**Razón de la apelación:**')
            ->line('"' . substr($this->appeal->reason, 0, 200) . (strlen($this->appeal->reason) > 200 ? '...' : '') . '"')
            ->action('Revisar Apelación', route('admin.ban-appeals.show', $this->appeal->id))
            ->line('Por favor, revisa esta apelación lo antes posible.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $isAppealUser = $notifiable->id === $this->appeal->user_id;

        if ($isAppealUser) {
            return [
                'type' => 'ban_appeal_submitted',
                'title' => 'Apelación Recibida',
                'message' => 'Tu apelación de baneo ha sido recibida y está pendiente de revisión.',
                'appeal_id' => $this->appeal->id,
                'status' => $this->appeal->status,
            ];
        }

        return [
            'type' => 'new_ban_appeal',
            'title' => 'Nueva Apelación de Baneo',
            'message' => $this->appeal->user->name . ' ha enviado una apelación de baneo.',
            'appeal_id' => $this->appeal->id,
            'user_id' => $this->appeal->user_id,
            'user_name' => $this->appeal->user->name,
        ];
    }
}
