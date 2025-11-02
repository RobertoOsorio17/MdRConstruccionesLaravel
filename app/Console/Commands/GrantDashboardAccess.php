<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Permission;
use Illuminate\Console\Command;
/**
 * Class GrantDashboardAccess.
 */

class GrantDashboardAccess extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:grant-dashboard {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Grant dashboard access permission to a user';

    
    
    
    
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
            $this->error("❌ Usuario no encontrado: {$email}");
            return 1;
        }

        $this->info("Usuario encontrado:");
        $this->table(
            ['Campo', 'Valor'],
            [
                ['ID', $user->id],
                ['Nombre', $user->name],
                ['Email', $user->email],
                ['Rol', $user->role ?? 'N/A'],
            ]
        );

        // Check if permission exists
        $permission = Permission::where('name', 'dashboard.access')->first();

        if (!$permission) {
            $this->warn("⚠️  Permiso 'dashboard.access' no existe. Creándolo...");
            
            $permission = Permission::create([
                'name' => 'dashboard.access',
                'display_name' => 'Acceso al Dashboard',
                'description' => 'Permite acceder al panel de control principal',
                'module' => 'dashboard',
            ]);

            $this->info("✅ Permiso creado");
        }

        // Check if user already has the permission
        if ($user->hasPermission('dashboard.access')) {
            $this->warn("⚠️  El usuario ya tiene acceso al dashboard");
            return 0;
        }

        // Grant permission
        $user->givePermissionTo($permission);

        $this->info('');
        $this->info('✅ Permiso de dashboard otorgado exitosamente');
        $this->info('');
        $this->info("El usuario {$email} ahora puede acceder al dashboard");
        
        // Log the action
        \Log::info('Dashboard access granted via CLI', [
            'user_id' => $user->id,
            'email' => $user->email,
            'granted_by' => 'CLI command',
            'timestamp' => now()->toISOString()
        ]);

        return 0;
    }
}

