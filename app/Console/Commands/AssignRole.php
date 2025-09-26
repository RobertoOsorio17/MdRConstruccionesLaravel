<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;

class AssignRole extends Command
{
    protected $signature = 'debug:assign-role {email} {role}';
    protected $description = 'Assign a role to a user';

    public function handle()
    {
        $email = $this->argument('email');
        $roleName = $this->argument('role');

        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->error("Usuario con email {$email} no encontrado");
            return;
        }

        $role = Role::where('name', $roleName)->first();
        if (!$role) {
            $this->error("Rol '{$roleName}' no encontrado");
            $this->line("Roles disponibles:");
            Role::all()->each(function ($role) {
                $this->line("- {$role->name} ({$role->display_name})");
            });
            return;
        }

        // Verificar si ya tiene el rol
        if ($user->roles()->where('role_id', $role->id)->exists()) {
            $this->warn("El usuario ya tiene el rol '{$roleName}' asignado");
            return;
        }

        // Asignar el rol
        $user->assignRole($role);

        $this->info("✓ Rol '{$roleName}' asignado exitosamente a {$user->name} ({$user->email})");
        
        // Verificar permisos
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
        $this->info("Permisos ahora disponibles:");
        foreach ($permissions as $permission) {
            $this->line("- {$permission}");
        }
    }
}