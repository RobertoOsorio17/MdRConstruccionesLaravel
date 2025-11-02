<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
/**
 * Class UnblockMLUser.
 */

class UnblockMLUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ml:unblock-user {email : The email of the user to unblock}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Unblock a user that was blocked by the ML system';

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle()
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email '{$email}' not found.");
            return 1;
        }

        if (!$user->isMLBlocked()) {
            $this->info("User '{$email}' is not blocked by ML system.");
            return 0;
        }

        $blockInfo = $user->getMLBlockInfo();
        
        $this->info("User Block Information:");
        $this->table(
            ['Field', 'Value'],
            [
                ['Blocked At', $blockInfo['blocked_at']],
                ['Reason', $blockInfo['reason']],
                ['Anomaly Score', $blockInfo['anomaly_score']],
            ]
        );

        if (!$this->confirm('Do you want to unblock this user?', true)) {
            $this->info('Operation cancelled.');
            return 0;
        }

        $user->unblockByML();

        $this->info("User '{$email}' has been successfully unblocked.");
        return 0;
    }
}

