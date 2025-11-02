<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;

/**
 * Outputs a comprehensive CLI diagnostic for a user, including roles, permissions, and remediation tips.
 * Provides security teams with a quick way to audit RBAC assignments during support incidents.
 */
class DiagnoseUser extends Command
{
    /**
     * The console command signature.
     *
     * @var string
     */
    protected $signature = 'debug:user {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Diagnose user permissions and roles';

    
    
    
    
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
            $this->error("User with email {$email} was not found.");
            return;
        }

        $this->info('=== USER DIAGNOSTIC ===');
        $this->line("ID: {$user->id}");
        $this->line("Name: {$user->name}");
        $this->line("Email: {$user->email}");
        $this->line("Primary role field: {$user->role}");
        $this->line("");

        // Evaluate roles assigned through the advanced RBAC system.
        $this->info('=== ADVANCED ROLES ===');
        $roles = $user->roles;
        if ($roles->count() > 0) {
            foreach ($roles as $role) {
                $this->line("- {$role->name} ({$role->display_name})");
            }
        } else {
            $this->warn('No roles are assigned through the advanced RBAC system.');
        }
        $this->line("");

        // Enumerate the permissions inherited from currently assigned roles.
        $this->info('=== PERMISSIONS ===');
        if (method_exists($user, 'roles') && $user->roles()->exists()) {
            $permissions = $user->roles()
                ->with('permissions')
                ->get()
                ->flatMap(function ($role) {
                    return $role->permissions->pluck('name');
                })
                ->unique()
                ->values()
                ->toArray();

            if (!empty($permissions)) {
                foreach ($permissions as $permission) {
                    $this->line("- {$permission}");
                }
            } else {
                $this->warn('No permissions are currently assigned.');
            }
        } else {
            $this->warn('Permissions cannot be resolved because the user has no roles.');
        }
        $this->line("");

        // Perform quick checks for critical permissions.
        $this->info('=== CRITICAL PERMISSION CHECK ===');
        $importantPermissions = [
            'dashboard.access',
            'posts.view',
            'posts.create',
            'posts.edit',
            'categories.view',
            'services.view'
        ];

        foreach ($importantPermissions as $permission) {
            $hasPermission = method_exists($user, 'hasPermission') ? $user->hasPermission($permission) : false;
            $status = $hasPermission ? "âœ“" : "âœ—";
            $this->line("{$status} {$permission}");
        }
        $this->line("");

        // Provide remediation guidance when no roles are attached.
        if ($roles->count() == 0) {
            $this->info('=== SUGGESTED REMEDIATION ===');
            $this->warn('The user has no roles assigned. Consider:');
            $this->line('1. Assigning the administrator role:');
            $this->line("   php artisan debug:assign-role {$email} admin");
            $this->line("");
            $this->line('2. Or running the full seeder:');
            $this->line('   php artisan db:seed');
        }
    }
}
