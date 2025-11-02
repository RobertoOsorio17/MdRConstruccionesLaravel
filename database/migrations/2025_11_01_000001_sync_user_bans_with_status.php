<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration synchronizes the user_bans table with the users.status field.
     * It ensures data consistency between the two ban systems.
     */
    public function up(): void
    {
        Log::info('Starting user ban synchronization migration');

        // 1. Find all users with active bans in user_bans table
        $activeBans = DB::table('user_bans')
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->get();

        $syncedCount = 0;
        $alreadySyncedCount = 0;

        foreach ($activeBans as $ban) {
            $user = DB::table('users')->where('id', $ban->user_id)->first();
            
            if (!$user) {
                Log::warning('User not found for ban', ['ban_id' => $ban->id, 'user_id' => $ban->user_id]);
                continue;
            }

            // Update status to 'banned' if not already
            if ($user->status !== 'banned') {
                DB::table('users')
                    ->where('id', $ban->user_id)
                    ->update(['status' => 'banned']);
                
                $syncedCount++;
                Log::info('Synced user status to banned', [
                    'user_id' => $ban->user_id,
                    'old_status' => $user->status,
                    'ban_id' => $ban->id
                ]);
            } else {
                $alreadySyncedCount++;
            }
        }

        // 2. Find users with status='banned' but no active ban in user_bans
        $bannedUsers = DB::table('users')
            ->where('status', 'banned')
            ->get();

        $fixedCount = 0;

        foreach ($bannedUsers as $user) {
            $hasActiveBan = DB::table('user_bans')
                ->where('user_id', $user->id)
                ->where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })
                ->exists();

            // If user has status='banned' but no active ban, set status to 'active'
            if (!$hasActiveBan) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['status' => 'active']);
                
                $fixedCount++;
                Log::info('Fixed user status (no active ban found)', [
                    'user_id' => $user->id,
                    'old_status' => 'banned',
                    'new_status' => 'active'
                ]);
            }
        }

        Log::info('User ban synchronization completed', [
            'users_synced_to_banned' => $syncedCount,
            'users_already_synced' => $alreadySyncedCount,
            'users_fixed_to_active' => $fixedCount,
            'total_active_bans' => $activeBans->count(),
        ]);

        // Output summary to console
        echo "\n";
        echo "✅ User Ban Synchronization Complete\n";
        echo "=====================================\n";
        echo "Users synced to 'banned': {$syncedCount}\n";
        echo "Users already synced: {$alreadySyncedCount}\n";
        echo "Users fixed to 'active': {$fixedCount}\n";
        echo "Total active bans: {$activeBans->count()}\n";
        echo "\n";
    }

    /**
     * Reverse the migrations.
     * 
     * This migration is data-only and doesn't modify schema,
     * so rollback is not applicable.
     */
    public function down(): void
    {
        Log::info('Rollback not applicable for user ban synchronization migration');
        echo "⚠️  This migration is data-only. Rollback not applicable.\n";
    }
};

