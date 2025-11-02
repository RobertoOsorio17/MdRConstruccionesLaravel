<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
/**
 * Class NewDeviceLoginNotification.
 */

class NewDeviceLoginNotification extends Notification // implements ShouldQueue // ⚠️ TEMPORARILY DISABLED FOR DEBUGGING
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
            ->subject('🔔 Nuevo Inicio de Sesión Detectado')
            ->greeting('¡Hola ' . $notifiable->name . '!')
            ->line('Se ha detectado un inicio de sesión desde un nuevo dispositivo o ubicación.')
            ->line('**Detalles del inicio de sesión:**')
            ->line('• IP: ' . ($this->context['ip'] ?? 'Desconocida'))
            ->line('• Dispositivo: ' . ($this->context['device'] ?? 'Desconocido'))
            ->line('• Ubicación: ' . ($this->context['location'] ?? 'Desconocida'))
            ->line('• Fecha: ' . now()->format('d/m/Y H:i:s'))
            ->line('Si fuiste tú, puedes ignorar este mensaje.')
            ->line('Si no reconoces esta actividad, tu cuenta puede estar comprometida.')
            ->action('Revisar Actividad de la Cuenta', route('profile.settings', ['tab' => 'security']))
            ->line('Te recomendamos cambiar tu contraseña inmediatamente si no reconoces este inicio de sesión.');
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
            'type' => 'new_device_login',
            'message' => 'Nuevo inicio de sesión detectado desde un dispositivo desconocido.',
            'ip' => $this->context['ip'] ?? 'Desconocida',
            'device' => $this->context['device'] ?? 'Desconocido',
            'location' => $this->context['location'] ?? 'Desconocida',
            'timestamp' => now()->toISOString(),
            'severity' => 'info',
        ];
    }
}

