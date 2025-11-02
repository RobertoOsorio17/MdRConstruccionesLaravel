<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
/**
 * Class PasswordChangedNotification.
 */

class PasswordChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected array $context;

    
    
    
    
    /**

    
    
    
     * Handle __construct.

    
    
    
     *

    
    
    
     * @param array $context The context.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function __construct(array $context = [])
    {
        $this->context = $context;
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
            ->subject('Contraseña Cambiada Exitosamente')
            ->greeting('¡Hola ' . $notifiable->name . '!')
            ->line('Tu contraseña ha sido cambiada exitosamente.')
            ->line('**Detalles del evento:**')
            ->line('• IP: ' . ($this->context['ip'] ?? request()->ip()))
            ->line('• Fecha: ' . now()->format('d/m/Y H:i:s'))
            ->line('• Método: ' . ($this->context['method'] ?? 'manual'))
            ->line('Si no fuiste tú quien realizó este cambio, tu cuenta puede estar comprometida.')
            ->action('Revisar Actividad de la Cuenta', route('profile.settings', ['tab' => 'security']))
            ->line('Si no reconoces esta actividad, cambia tu contraseña inmediatamente y contacta con soporte.');
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
            'type' => 'password_changed',
            'message' => 'Tu contraseña ha sido cambiada.',
            'ip' => $this->context['ip'] ?? request()->ip(),
            'method' => $this->context['method'] ?? 'manual',
            'timestamp' => now()->toISOString(),
        ];
    }
}

