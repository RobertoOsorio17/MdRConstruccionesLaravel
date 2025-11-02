<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
/**
 * Class TwoFactorDisabledNotification.
 */

class TwoFactorDisabledNotification extends Notification implements ShouldQueue
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
            ->subject('⚠️ Autenticación de Dos Factores Deshabilitada')
            ->greeting('¡Hola ' . $notifiable->name . '!')
            ->line('La autenticación de dos factores ha sido **deshabilitada** en tu cuenta.')
            ->line('Tu cuenta ahora tiene menos protección contra accesos no autorizados.')
            ->line('**Detalles del evento:**')
            ->line('• IP: ' . ($this->context['ip'] ?? request()->ip()))
            ->line('• Fecha: ' . now()->format('d/m/Y H:i:s'))
            ->line('⚠️ **Si no fuiste tú quien realizó este cambio, tu cuenta puede estar comprometida.**')
            ->action('Revisar Seguridad de la Cuenta', route('profile.settings', ['tab' => 'security']))
            ->line('Te recomendamos volver a habilitar la autenticación de dos factores.');
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
            'type' => 'two_factor_disabled',
            'message' => 'La autenticación de dos factores ha sido deshabilitada en tu cuenta.',
            'ip' => $this->context['ip'] ?? request()->ip(),
            'timestamp' => now()->toISOString(),
            'severity' => 'warning',
        ];
    }
}

