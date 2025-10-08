<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AdminSetting;
use Carbon\Carbon;

/**
 * Summarizes maintenance-mode configuration from the CLI, including schedule, messaging, and access controls.
 * Designed to give operators a quick snapshot before toggling or adjusting downtime.
 */
class MaintenanceStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'maintenance:status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Show current maintenance mode status and configuration';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔍 Maintenance Mode Status');
        $this->newLine();

        // Get all maintenance settings
        $enabled = AdminSetting::getValue('maintenance_mode', false);
        $message = AdminSetting::getValue('maintenance_message', '');
        $allowedIps = AdminSetting::getValue('maintenance_allowed_ips', []);
        $startAt = AdminSetting::getValue('maintenance_start_at');
        $endAt = AdminSetting::getValue('maintenance_end_at');
        $showCountdown = AdminSetting::getValue('maintenance_show_countdown', true);
        $allowAdmin = AdminSetting::getValue('maintenance_allow_admin', true);
        $retryAfter = AdminSetting::getValue('maintenance_retry_after', 3600);

        // Display status
        if ($enabled) {
            $this->components->error('🔴 Status: ENABLED');
        } else {
            $this->components->success('🟢 Status: DISABLED');
        }

        $this->newLine();

        // Display configuration
        $this->table(
            ['Setting', 'Value'],
            [
                ['Message', $this->truncate($message, 50)],
                ['Show Countdown', $showCountdown ? 'Yes' : 'No'],
                ['Allow Admin Access', $allowAdmin ? 'Yes' : 'No'],
                ['Retry-After (seconds)', $retryAfter],
            ]
        );

        // Display allowed IPs
        if (!empty($allowedIps)) {
            $this->info('🌐 Allowed IPs:');
            foreach ($allowedIps as $ip) {
                $this->line("   • {$ip}");
            }
        } else {
            $this->warn('⚠️  No IPs whitelisted');
        }

        $this->newLine();

        // Display schedule
        if ($startAt || $endAt) {
            $this->info('⏰ Schedule:');
            
            if ($startAt) {
                $start = Carbon::parse($startAt);
                $startStatus = $start->isPast() ? '(started)' : '(pending)';
                $this->line("   Start: {$start->format('Y-m-d H:i:s')} {$startStatus}");
            }
            
            if ($endAt) {
                $end = Carbon::parse($endAt);
                $endStatus = $end->isPast() ? '(ended)' : '(pending)';
                $this->line("   End:   {$end->format('Y-m-d H:i:s')} {$endStatus}");
                
                if ($end->isFuture()) {
                    $remaining = $end->diffForHumans(null, true);
                    $this->info("   ⏳ Time remaining: {$remaining}");
                }
            }
        } else {
            $this->info('⏰ Schedule: Not scheduled');
        }

        $this->newLine();

        // Display helpful commands
        if ($enabled) {
            $this->info('💡 To disable: php artisan maintenance:disable');
        } else {
            $this->info('💡 To enable: php artisan maintenance:enable');
            $this->info('💡 With options: php artisan maintenance:enable --message="Custom message" --ips="127.0.0.1,192.168.1.1"');
        }

        return Command::SUCCESS;
    }

    /**
     * Truncate a string to a maximum length.
     *
     * @param string $text
     * @param int $length
     * @return string
     */
    private function truncate(string $text, int $length): string
    {
        if (strlen($text) <= $length) {
            return $text;
        }

        return substr($text, 0, $length) . '...';
    }
}
