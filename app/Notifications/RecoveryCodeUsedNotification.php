<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
/**
 * Class RecoveryCodeUsedNotification.
 */

class RecoveryCodeUsedNotification extends Notification implements ShouldQueue
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
        $remainingCodes = $this->context['remaining_codes'] ?? 0;
        
        $message = (new MailMessage)
            ->subject('⚠️ Código de Recuperación Utilizado')
            ->greeting('¡Hola ' . $notifiable->name . '!')
            ->line('Se ha utilizado un código de recuperación para acceder a tu cuenta.')
            ->line('**Detalles del evento:**')
            ->line('• IP: ' . ($this->context['ip'] ?? request()->ip()))
            ->line('• Fecha: ' . now()->format('d/m/Y H:i:s'))
            ->line('• Códigos restantes: ' . $remainingCodes);
        
        if ($remainingCodes <= 2) {
            $message->line('⚠️ **ADVERTENCIA:** Te quedan pocos códigos de recuperación.')
                ->line('Te recomendamos regenerar tus códigos de recuperación pronto.');
        }
        
        $message->line('Si no fuiste tú quien utilizó este código, tu cuenta puede estar comprometida.')
            ->action('Revisar Seguridad de la Cuenta', route('profile.settings', ['tab' => 'security']))
            ->line('Si no reconoces esta actividad, deshabilita y vuelve a habilitar 2FA inmediatamente.');
        
        return $message;
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
            'type' => 'recovery_code_used',
            'message' => 'Se ha utilizado un código de recuperación para acceder a tu cuenta.',
            'ip' => $this->context['ip'] ?? request()->ip(),
            'remaining_codes' => $this->context['remaining_codes'] ?? 0,
            'timestamp' => now()->toISOString(),
            'severity' => 'warning',
        ];
    }
}

