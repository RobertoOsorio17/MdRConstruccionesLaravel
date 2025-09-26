<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;

class DiagnoseUser extends Command
{
    protected $signature = 'debug:user {email}';
    protected $description = 'Diagnose user permissions and roles';

    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("Usuario con email {$email} no encontrado");
            return;
        }

        $this->info("=== DIAGNÓSTICO DEL USUARIO ===");
        $this->line("ID: {$user->id}");
        $this->line("Nombre: {$user->name}");
        $this->line("Email: {$user->email}");
        $this->line("Rol simple: {$user->role}");
        $this->line("");

        // Verificar roles del sistema de roles avanzado
        $this->info("=== ROLES AVANZADOS ===");
        $roles = $user->roles;
        if ($roles->count() > 0) {
            foreach ($roles as $role) {
                $this->line("- {$role->name} ({$role->display_name})");
            }
        } else {
            $this->warn("No tiene roles asignados en el sistema avanzado");
        }
        $this->line("");

        // Verificar permisos
        $this->info("=== PERMISOS ===");
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
                $this->warn("No tiene permisos asignados");
            }
        } else {
            $this->warn("No puede verificar permisos - el usuario no tiene roles");
        }
        $this->line("");

        // Verificar permisos específicos importantes
        $this->info("=== VERIFICACIÓN DE PERMISOS ESPECÍFICOS ===");
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
            $status = $hasPermission ? "✓" : "✗";
            $this->line("{$status} {$permission}");
        }
        $this->line("");

        // Sugerir soluciones
        if ($roles->count() == 0) {
            $this->info("=== SOLUCIÓN SUGERIDA ===");
            $this->warn("El usuario no tiene roles asignados. Para solucionarlo:");
            $this->line("1. Asignar rol de administrador:");
            $this->line("   php artisan debug:assign-role {$email} admin");
            $this->line("");
            $this->line("2. O ejecutar el seeder completo:");
            $this->line("   php artisan db:seed");
        }
    }
}