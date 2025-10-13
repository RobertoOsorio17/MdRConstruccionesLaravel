<?php

namespace App\Listeners;

use App\Events\SettingChanged;
use App\Models\AdminSettingHistory;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

/**
 * Log setting changes to the admin_setting_history table.
 * 
 * This listener creates a comprehensive audit trail of all configuration changes,
 * recording who changed what, when, and from where.
 */
class LogSettingChange implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     *
     * @param \App\Events\SettingChanged $event
     * @return void
     */
    public function handle(SettingChanged $event): void
    {
        try {
            // Create history record
            AdminSettingHistory::create([
                'setting_id' => $event->setting->id,
                'user_id' => $event->user?->id,
                'old_value' => $this->prepareValueForStorage($event->oldValue, $event->setting->type),
                'new_value' => $this->prepareValueForStorage($event->newValue, $event->setting->type),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'change_reason' => $event->reason,
            ]);

            // Also log to AdminAuditLog if it exists
            if (class_exists('App\Models\AdminAuditLog')) {
                \App\Models\AdminAuditLog::create([
                    'user_id' => $event->user?->id,
                    'action' => 'setting_changed',
                    'description' => $event->getDescription(),
                    'model_type' => 'AdminSetting',
                    'model_id' => $event->setting->id,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                    'metadata' => json_encode([
                        'setting_key' => $event->setting->key,
                        'old_value' => $event->oldValue,
                        'new_value' => $event->newValue,
                        'is_critical' => $event->isCritical(),
                    ]),
                ]);
            }

            // Log critical changes to Laravel log
            if ($event->isCritical()) {
                Log::warning('Critical setting changed', [
                    'setting' => $event->setting->key,
                    'old_value' => $event->oldValue,
                    'new_value' => $event->newValue,
                    'user' => $event->user?->name ?? 'System',
                    'ip' => request()->ip(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to log setting change', [
                'setting' => $event->setting->key,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Prepare value for storage in history table.
     *
     * @param mixed $value
     * @param string $type
     * @return string|null
     */
    private function prepareValueForStorage($value, string $type): ?string
    {
        if (is_null($value)) {
            return null;
        }

        if (in_array($type, ['json', 'array'])) {
            return json_encode($value);
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        return (string) $value;
    }
}

