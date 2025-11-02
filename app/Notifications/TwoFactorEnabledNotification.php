<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
/**
 * Class TwoFactorEnabledNotification.
 */

class TwoFactorEnabledNotification extends Notification implements ShouldQueue
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
            ->subject('Autenticación de Dos Factores Habilitada')
            ->greeting('¡Hola ' . $notifiable->name . '!')
            ->line('La autenticación de dos factores ha sido habilitada en tu cuenta.')
            ->line('Esto añade una capa adicional de seguridad a tu cuenta.')
            ->line('**Detalles del evento:**')
            ->line('• IP: ' . ($this->context['ip'] ?? request()->ip()))
            ->line('• Fecha: ' . now()->format('d/m/Y H:i:s'))
            ->line('Si no fuiste tú quien realizó este cambio, contacta inmediatamente con soporte.')
            ->action('Ver Configuración de Seguridad', route('profile.settings', ['tab' => 'security']))
            ->line('Gracias por mantener tu cuenta segura.');
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
            'type' => 'two_factor_enabled',
            'message' => 'La autenticación de dos factores ha sido habilitada en tu cuenta.',
            'ip' => $this->context['ip'] ?? request()->ip(),
            'timestamp' => now()->toISOString(),
        ];
    }
}

