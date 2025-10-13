<?php

namespace App\Listeners;

use App\Events\SettingChanged;
use App\Events\MaintenanceModeToggled;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

/**
 * Notify administrators of critical setting changes.
 * 
 * This listener sends notifications to administrators when critical
 * configuration changes occur, ensuring they are aware of important
 * system modifications.
 */
class NotifyAdminsOfChange implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     *
     * @param \App\Events\SettingChanged|\App\Events\MaintenanceModeToggled $event
     * @return void
     */
    public function handle(SettingChanged|MaintenanceModeToggled $event): void
    {
        try {
            if ($event instanceof SettingChanged) {
                $this->handleSettingChanged($event);
            } elseif ($event instanceof MaintenanceModeToggled) {
                $this->handleMaintenanceModeToggled($event);
            }
        } catch (\Exception $e) {
            Log::error('Failed to notify admins of setting change', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle setting changed event.
     *
     * @param \App\Events\SettingChanged $event
     * @return void
     */
    private function handleSettingChanged(SettingChanged $event): void
    {
        // Only notify for critical settings
        if (!$event->isCritical()) {
            return;
        }

        $this->createAdminNotification(
            'Critical Setting Changed',
            $event->getDescription(),
            'warning',
            [
                'setting_key' => $event->setting->key,
                'setting_label' => $event->setting->label,
                'old_value' => $event->oldValue,
                'new_value' => $event->newValue,
                'changed_by' => $event->user?->name ?? 'System',
            ]
        );
    }

    /**
     * Handle maintenance mode toggled event.
     *
     * @param \App\Events\MaintenanceModeToggled $event
     * @return void
     */
    private function handleMaintenanceModeToggled(MaintenanceModeToggled $event): void
    {
        $type = $event->enabled ? 'error' : 'success';
        $title = $event->enabled ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled';

        $this->createAdminNotification(
            $title,
            $event->getDescription(),
            $type,
            [
                'enabled' => $event->enabled,
                'message' => $event->message,
                'scheduled' => $event->isScheduled(),
                'start_at' => $event->startAt,
                'end_at' => $event->endAt,
                'toggled_by' => $event->user?->name ?? 'System',
            ]
        );
    }

    /**
     * Create an admin notification.
     *
     * @param string $title
     * @param string $message
     * @param string $type
     * @param array $data
     * @return void
     */
    private function createAdminNotification(string $title, string $message, string $type, array $data): void
    {
        // Check if AdminNotification model exists
        if (!class_exists('App\Models\AdminNotification')) {
            Log::info('AdminNotification model not found, skipping notification');
            return;
        }

        // Get all admin users
        $adminUsers = \App\Models\User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->get();

        // Create notification for each admin
        foreach ($adminUsers as $admin) {
            \App\Models\AdminNotification::create([
                'user_id' => $admin->id,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'data' => json_encode($data),
                'is_read' => false,
            ]);
        }

        Log::info('Admin notifications created', [
            'title' => $title,
            'recipients' => $adminUsers->count(),
        ]);
    }
}

