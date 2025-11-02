<?php

namespace App\Console\Commands;

use App\Models\ImpersonationSession;
use Carbon\Carbon;
use Illuminate\Console\Command;
/**
 * Class CleanupExpiredImpersonationSessions.
 */

class CleanupExpiredImpersonationSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'impersonation:cleanup
                            {--days=90 : Number of days after which to delete old sessions}
                            {--force : Force cleanup without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old impersonation session records from the database';

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle()
    {
        $days = (int) $this->option('days');
        $force = $this->option('force');

        $cutoffDate = Carbon::now()->subDays($days);

        // Count sessions to be deleted
        $count = ImpersonationSession::where('started_at', '<', $cutoffDate)->count();

        if ($count === 0) {
            $this->info('No old impersonation sessions found to clean up.');
            return Command::SUCCESS;
        }

        $this->info("Found {$count} impersonation session(s) older than {$days} days.");

        // Ask for confirmation unless --force is used
        if (!$force && !$this->confirm('Do you want to delete these sessions?')) {
            $this->info('Cleanup cancelled.');
            return Command::SUCCESS;
        }

        // Delete old sessions
        $deleted = ImpersonationSession::where('started_at', '<', $cutoffDate)->delete();

        $this->info("Successfully deleted {$deleted} old impersonation session(s).");

        return Command::SUCCESS;
    }
}
