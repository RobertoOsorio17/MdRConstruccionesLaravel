<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ListMLBlockedUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ml:list-blocked';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all users blocked by the ML system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $blockedUsers = User::where('ml_blocked', true)
            ->orderBy('ml_blocked_at', 'desc')
            ->get();

        if ($blockedUsers->isEmpty()) {
            $this->info('No users are currently blocked by the ML system.');
            return 0;
        }

        $this->info("Found {$blockedUsers->count()} blocked user(s):");
        
        $this->table(
            ['ID', 'Name', 'Email', 'Blocked At', 'Anomaly Score', 'Reason'],
            $blockedUsers->map(function ($user) {
                return [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->ml_blocked_at?->format('Y-m-d H:i:s'),
                    $user->ml_anomaly_score,
                    substr($user->ml_blocked_reason, 0, 50) . (strlen($user->ml_blocked_reason) > 50 ? '...' : ''),
                ];
            })->toArray()
        );

        return 0;
    }
}

