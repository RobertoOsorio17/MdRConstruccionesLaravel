<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
/**
 * Class RecoveryCodesRegeneratedNotification.
 */

class RecoveryCodesRegeneratedNotification extends Notification implements ShouldQueue
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
            ->subject('Códigos de Recuperación Regenerados')
            ->greeting('¡Hola ' . $notifiable->name . '!')
            ->line('Tus códigos de recuperación de autenticación de dos factores han sido regenerados.')
            ->line('Los códigos anteriores ya no son válidos.')
            ->line('**Detalles del evento:**')
            ->line('• IP: ' . ($this->context['ip'] ?? request()->ip()))
            ->line('• Fecha: ' . now()->format('d/m/Y H:i:s'))
            ->line('Asegúrate de guardar los nuevos códigos en un lugar seguro.')
            ->line('Si no fuiste tú quien regeneró estos códigos, contacta inmediatamente con soporte.')
            ->action('Ver Códigos de Recuperación', route('profile.settings', ['tab' => 'security']))
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
            'type' => 'recovery_codes_regenerated',
            'message' => 'Tus códigos de recuperación han sido regenerados.',
            'ip' => $this->context['ip'] ?? request()->ip(),
            'timestamp' => now()->toISOString(),
        ];
    }
}

