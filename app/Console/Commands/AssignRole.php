<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;

/**
 * Provides a maintenance Artisan command that assigns a given role to a user by email.
 * Helps administrators manage role memberships directly from the CLI while surfacing validation feedback.
 */
class AssignRole extends Command
{
    /**
     * The console command signature.
     *
     * @var string
     */
    protected $signature = 'debug:assign-role {email} {role}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign a role to a user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $roleName = $this->argument('role');

        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->error("User with email {$email} was not found.");
            return;
        }

        $role = Role::where('name', $roleName)->first();
        if (!$role) {
            $this->error("Role '{$roleName}' was not found.");
            $this->line('Available roles:');
            Role::all()->each(function ($role) {
                $this->line("- {$role->name} ({$role->display_name})");
            });
            return;
        }

        // Abort when the user already owns the role.
        if ($user->roles()->where('role_id', $role->id)->exists()) {
            $this->warn("The user already has the role '{$roleName}' assigned.");
            return;
        }

        // Attach the requested role to the user.
        $user->assignRole($role);

        $this->info("âœ“ Role '{$roleName}' successfully assigned to {$user->name} ({$user->email}).");

        // Display the consolidated permission set now available.
        $permissions = $user->roles()
            ->with('permissions')
            ->get()
            ->flatMap(function ($role) {
                return $role->permissions->pluck('name');
            })
            ->unique()
            ->values()
            ->toArray();

        $this->line("");
        $this->info('Permissions now available:');
        foreach ($permissions as $permission) {
            $this->line("- {$permission}");
        }
    }
}
