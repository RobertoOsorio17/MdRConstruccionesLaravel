<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\UserBan;
use App\Models\IpBan;
/**
 * Class CleanupExpiredBans.
 */

class CleanupExpiredBans extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bans:cleanup {--force : Skip confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark expired user and IP bans as inactive to keep records tidy';

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle()
    {
        if (!$this->option('force') && !$this->confirm('This will mark all expired bans as inactive. Continue?')) {
            $this->info('Operation cancelled.');
            return 0;
        }

        $this->info('Cleaning up expired bans...');

        // Mark expired user bans as inactive
        $expiredUserBans = UserBan::expired()->count();
        if ($expiredUserBans > 0) {
            UserBan::expired()->update(['is_active' => false]);
            $this->info("✓ Marked {$expiredUserBans} expired user ban(s) as inactive.");
        } else {
            $this->info('✓ No expired user bans found.');
        }

        // Mark expired IP bans as inactive
        $expiredIpBans = IpBan::where('is_active', true)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->count();

        if ($expiredIpBans > 0) {
            IpBan::where('is_active', true)
                ->whereNotNull('expires_at')
                ->where('expires_at', '<=', now())
                ->update(['is_active' => false]);
            $this->info("✓ Marked {$expiredIpBans} expired IP ban(s) as inactive.");
        } else {
            $this->info('✓ No expired IP bans found.');
        }

        $this->info('Cleanup completed successfully!');
        return 0;
    }
}
