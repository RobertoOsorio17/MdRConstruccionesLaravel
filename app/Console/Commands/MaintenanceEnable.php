<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AdminSetting;
use App\Events\MaintenanceModeToggled;

/**
 * Enables maintenance mode from the CLI, supporting custom messaging, scheduling, and IP whitelisting.
 * Persists the chosen settings and dispatches the maintenance toggle event for downstream listeners.
 */
class MaintenanceEnable extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'maintenance:enable 
                            {--message= : Custom maintenance message}
                            {--ips= : Comma-separated list of allowed IPs}
                            {--start= : Scheduled start time (Y-m-d H:i:s)}
                            {--end= : Scheduled end time (Y-m-d H:i:s)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Enable maintenance mode with optional custom message and IP whitelist';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔧 Enabling maintenance mode...');

        // Set maintenance mode to true
        AdminSetting::setValueWithHistory(
            'maintenance_mode',
            true,
            'Enabled via artisan command'
        );

        // Set custom message if provided
        if ($message = $this->option('message')) {
            AdminSetting::setValueWithHistory(
                'maintenance_message',
                $message,
                'Set via artisan command'
            );
            $this->info("📝 Message: {$message}");
        }

        // Set allowed IPs if provided
        if ($ips = $this->option('ips')) {
            $ipArray = array_map('trim', explode(',', $ips));
            AdminSetting::setValueWithHistory(
                'maintenance_allowed_ips',
                $ipArray,
                'Set via artisan command'
            );
            $this->info("🌐 Allowed IPs: " . implode(', ', $ipArray));
        }

        // Set scheduled start time if provided
        if ($start = $this->option('start')) {
            AdminSetting::setValueWithHistory(
                'maintenance_start_at',
                $start,
                'Set via artisan command'
            );
            $this->info("⏰ Scheduled start: {$start}");
        }

        // Set scheduled end time if provided
        if ($end = $this->option('end')) {
            AdminSetting::setValueWithHistory(
                'maintenance_end_at',
                $end,
                'Set via artisan command'
            );
            $this->info("⏰ Scheduled end: {$end}");
        }

        // Fire event
        event(new MaintenanceModeToggled(
            enabled: true,
            message: $message ?? AdminSetting::getValue('maintenance_message'),
            user: null,
            startAt: $start,
            endAt: $end
        ));

        $this->newLine();
        $this->components->success('✅ Maintenance mode enabled successfully!');
        $this->newLine();
        
        $this->warn('⚠️  Your site is now in maintenance mode.');
        $this->info('💡 Admins and whitelisted IPs can still access the site.');
        $this->info('💡 To disable: php artisan maintenance:disable');

        return Command::SUCCESS;
    }
}
