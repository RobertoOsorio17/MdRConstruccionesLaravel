<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AdminSetting;
use App\Events\MaintenanceModeToggled;

/**
 * Disables maintenance mode from the CLI and clears any scheduled downtime metadata.
 * Emits the corresponding domain event so listeners can react when the site returns to normal operation.
 */
class MaintenanceDisable extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'maintenance:disable';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Disable maintenance mode and restore normal operation';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔓 Disabling maintenance mode...');

        // Check if maintenance mode is currently enabled
        $isEnabled = AdminSetting::getValue('maintenance_mode', false);

        if (!$isEnabled) {
            $this->components->warn('⚠️  Maintenance mode is already disabled.');
            return Command::SUCCESS;
        }

        // Set maintenance mode to false
        AdminSetting::setValueWithHistory(
            'maintenance_mode',
            false,
            'Disabled via artisan command'
        );

        // Clear scheduled times
        AdminSetting::setValueWithHistory(
            'maintenance_start_at',
            null,
            'Cleared via artisan command'
        );

        AdminSetting::setValueWithHistory(
            'maintenance_end_at',
            null,
            'Cleared via artisan command'
        );

        // Fire event
        event(new MaintenanceModeToggled(
            enabled: false,
            message: null,
            user: null
        ));

        $this->newLine();
        $this->components->success('✅ Maintenance mode disabled successfully!');
        $this->newLine();
        
        $this->info('🎉 Your site is now accessible to all users.');

        return Command::SUCCESS;
    }
}
