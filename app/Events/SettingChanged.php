<?php

namespace App\Events;

use App\Models\AdminSetting;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Signals that an administrative setting has been modified so downstream listeners can react.
 * Exposes the old and new values, actor, and optional reason to power auditing or cache invalidation.
 */
class SettingChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The setting that was changed.
     *
     * @var \App\Models\AdminSetting
     */
    public AdminSetting $setting;

    /**
     * The old value before the change.
     *
     * @var mixed
     */
    public mixed $oldValue;

    /**
     * The new value after the change.
     *
     * @var mixed
     */
    public mixed $newValue;

    /**
     * The user who made the change.
     *
     * @var \App\Models\User|null
     */
    public ?User $user;

    /**
     * Optional reason for the change.
     *
     * @var string|null
     */
    public ?string $reason;

    /**
     * Create a new event instance.
     *
     * @param \App\Models\AdminSetting $setting
     * @param mixed $oldValue
     * @param mixed $newValue
     * @param \App\Models\User|null $user
     * @param string|null $reason
     */
    public function __construct(
        AdminSetting $setting,
        mixed $oldValue,
        mixed $newValue,
        ?User $user = null,
        ?string $reason = null
    ) {
        $this->setting = $setting;
        $this->oldValue = $oldValue;
        $this->newValue = $newValue;
        $this->user = $user ?? auth()->user();
        $this->reason = $reason;
    }

    /**
     * Check if this is a critical setting change.
     *
     * @return bool
     */
    public function isCritical(): bool
    {
        $criticalSettings = [
            'maintenance_mode',
            'enable_2fa',
            'session_timeout',
            'max_login_attempts',
            'enable_audit_log',
        ];

        return in_array($this->setting->key, $criticalSettings);
    }

    /**
     * Get a human-readable description of the change.
     *
     * @return string
     */
    public function getDescription(): string
    {
        $userName = $this->user ? $this->user->name : 'System';
        $settingLabel = $this->setting->label;

        return "{$userName} changed {$settingLabel} from '{$this->oldValue}' to '{$this->newValue}'";
    }
}
