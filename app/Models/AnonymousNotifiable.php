<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;

/**
 * Anonymous notifiable for sending notifications to non-authenticated users
 * Used for contact form confirmations, etc.
 */
class AnonymousNotifiable
{
    use Notifiable;

    protected string $email;
    protected string $name;

    /**
     * Create a new anonymous notifiable instance.
     */
    public function __construct(string $email, string $name = '')
    {
        $this->email = $email;
        $this->name = $name;
    }

    /**
     * Route notifications for the mail channel.
     */
    public function routeNotificationForMail(): string
    {
        return $this->email;
    }

    /**
     * Get the name for the notifiable.
     */
    public function getName(): string
    {
        return $this->name;
    }
}

