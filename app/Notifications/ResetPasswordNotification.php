<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sends password reset instructions to users with a custom Blade template and signed token URL.
 * Mirrors Laravel's default notification while allowing application-specific branding.
 */
class ResetPasswordNotification extends Notification
{
    use Queueable;

    /**
     * The password reset token.
     */
    public string $token;

    /**
     * The callback that should get the user's email address.
     */
    public static $toEmailCallback;

    /**
     * Create a notification instance.
     */
    public function __construct(string $token)
    {
        $this->token = $token;
    }

    /**
     * Get the notification's channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Build the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        return (new MailMessage)
            ->subject('Recuperar ContraseÃƒÆ’Ã‚Â±a - MDR Construcciones')
            ->view('emails.reset-password', [
                'user' => $notifiable,
                'url' => $url,
                'token' => $this->token,
            ]);
    }

    /**
     * Set a callback that should get the user's email address.
     */
    public static function toEmailUsing(callable $callback): void
    {
        static::$toEmailCallback = $callback;
    }
}
