<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncUserRoles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'roles:sync {--dry-run : Show what would be done without making changes}';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Synchronize user roles between the role field and role_user table for consistency';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('🔍 DRY RUN MODE - No changes will be made');
            $this->newLine();
        }

        $this->info('🔄 Starting role synchronization...');
        $this->newLine();

        // Get all users
        $users = User::all();
        $totalUsers = $users->count();
        $syncedUsers = 0;
        $skippedUsers = 0;
        $errorUsers = 0;

        $this->withProgressBar($users, function ($user) use (&$syncedUsers, &$skippedUsers, &$errorUsers, $dryRun) {
            try {
                $roleFromField = $user->role;
                $rolesFromTable = $user->roles()->pluck('name')->toArray();

                // Check if synchronization is needed
                if (empty($roleFromField) && empty($rolesFromTable)) {
                    // No role in either place - skip
                    $skippedUsers++;
                    return;
                }

                // If role field is set but not in role_user table, add it
                if ($roleFromField && !in_array($roleFromField, $rolesFromTable)) {
                    $role = Role::where('name', $roleFromField)->first();

                    if ($role) {
                        if (!$dryRun) {
                            // Check if already attached
                            if (!$user->roles()->where('role_id', $role->id)->exists()) {
                                $user->roles()->attach($role->id, [
                                    'assigned_at' => now(),
                                    'assigned_by' => null,
                                ]);
                            }
                        }
                        $syncedUsers++;
                    } else {
                        $this->warn("\n⚠️  Role '{$roleFromField}' not found in roles table for user {$user->email}");
                        $errorUsers++;
                    }
                }

                // If role_user table has roles but field is not set, update the field
                if (!$roleFromField && !empty($rolesFromTable)) {
                    // Get the primary role (highest level)
                    $primaryRole = $user->getPrimaryRole();

                    if ($primaryRole) {
                        if (!$dryRun) {
                            $user->update(['role' => $primaryRole->name]);
                        }
                        $syncedUsers++;
                    }
                }

                // If both are set but different, prioritize role_user table
                if ($roleFromField && !empty($rolesFromTable) && !in_array($roleFromField, $rolesFromTable)) {
                    $primaryRole = $user->getPrimaryRole();

                    if ($primaryRole && $primaryRole->name !== $roleFromField) {
                        if (!$dryRun) {
                            $user->update(['role' => $primaryRole->name]);
                        }
                        $syncedUsers++;
                    }
                }
            } catch (\Exception $e) {
                $this->error("\n❌ Error syncing user {$user->email}: {$e->getMessage()}");
                $errorUsers++;
            }
        });

        $this->newLine(2);

        // Summary
        $this->info('📊 Synchronization Summary:');
        $this->line("   Total users: {$totalUsers}");
        $this->line("   Synced: {$syncedUsers}");
        $this->line("   Skipped: {$skippedUsers}");
        $this->line("   Errors: {$errorUsers}");

        if ($dryRun) {
            $this->info("\n✅ Dry run completed. Run without --dry-run to apply changes.");
        } else {
            $this->info("\n✅ Role synchronization completed successfully!");
        }

        return Command::SUCCESS;
    }
}

