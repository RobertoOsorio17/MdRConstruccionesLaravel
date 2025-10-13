<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast when maintenance mode flips state so listeners can notify stakeholders or clear caches.
 * Carries contextual data about scheduling, messaging, and the actor responsible for the change.
 */
class MaintenanceModeToggled
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Whether maintenance mode is now enabled.
     *
     * @var bool
     */
    public bool $enabled;

    /**
     * The maintenance message (if enabled).
     *
     * @var string|null
     */
    public ?string $message;

    /**
     * The user who toggled maintenance mode.
     *
     * @var \App\Models\User|null
     */
    public ?User $user;

    /**
     * Scheduled start time (if programmed).
     *
     * @var \Carbon\Carbon|null
     */
    public $startAt;

    /**
     * Scheduled end time (if programmed).
     *
     * @var \Carbon\Carbon|null
     */
    public $endAt;

    /**
     * Create a new event instance.
     *
     * @param bool $enabled
     * @param string|null $message
     * @param \App\Models\User|null $user
     * @param mixed $startAt
     * @param mixed $endAt
     */
    public function __construct(
        bool $enabled,
        ?string $message = null,
        ?User $user = null,
        $startAt = null,
        $endAt = null
    ) {
        $this->enabled = $enabled;
        $this->message = $message;
        $this->user = $user ?? auth()->user();
        $this->startAt = $startAt;
        $this->endAt = $endAt;
    }

    /**
     * Check if this is a scheduled maintenance.
     *
     * @return bool
     */
    public function isScheduled(): bool
    {
        return $this->startAt !== null || $this->endAt !== null;
    }

    /**
     * Get a human-readable description of the action.
     *
     * @return string
     */
    public function getDescription(): string
    {
        $userName = $this->user ? $this->user->name : 'System';
        $action = $this->enabled ? 'enabled' : 'disabled';
        
        if ($this->isScheduled()) {
            return "{$userName} {$action} maintenance mode (scheduled)";
        }

        return "{$userName} {$action} maintenance mode";
    }
}
