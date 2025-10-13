<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DefaultRolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default roles if they don't exist
        $roles = [
            [
                'name' => 'user',
                'display_name' => 'Usuario',
                'description' => 'Usuario regular del sistema',
                'color' => '#6b7280',
                'level' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'editor',
                'display_name' => 'Editor',
                'description' => 'Editor de contenido',
                'color' => '#059669',
                'level' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'admin',
                'display_name' => 'Administrador',
                'description' => 'Administrador del sistema',
                'color' => '#dc2626',
                'level' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($roles as $roleData) {
            Role::firstOrCreate(
                ['name' => $roleData['name']],
                $roleData
            );
        }

        // Create default permissions if they don't exist
        $permissions = [
            // Dashboard permissions
            [
                'name' => 'dashboard.access',
                'display_name' => 'Acceso al Dashboard',
                'description' => 'Permite acceder al panel de administración',
                'module' => 'dashboard',
                'action' => 'access',
            ],
            
            // User permissions
            [
                'name' => 'users.view',
                'display_name' => 'Ver Usuarios',
                'description' => 'Permite ver la lista de usuarios',
                'module' => 'users',
                'action' => 'view',
            ],
            [
                'name' => 'users.create',
                'display_name' => 'Crear Usuarios',
                'description' => 'Permite crear nuevos usuarios',
                'module' => 'users',
                'action' => 'create',
            ],
            [
                'name' => 'users.edit',
                'display_name' => 'Editar Usuarios',
                'description' => 'Permite editar usuarios existentes',
                'module' => 'users',
                'action' => 'edit',
            ],
            [
                'name' => 'users.delete',
                'display_name' => 'Eliminar Usuarios',
                'description' => 'Permite eliminar usuarios',
                'module' => 'users',
                'action' => 'delete',
            ],
            
            // Posts permissions
            [
                'name' => 'posts.view',
                'display_name' => 'Ver Posts',
                'description' => 'Permite ver la lista de posts',
                'module' => 'posts',
                'action' => 'view',
            ],
            [
                'name' => 'posts.create',
                'display_name' => 'Crear Posts',
                'description' => 'Permite crear nuevos posts',
                'module' => 'posts',
                'action' => 'create',
            ],
            [
                'name' => 'posts.edit',
                'display_name' => 'Editar Posts',
                'description' => 'Permite editar posts existentes',
                'module' => 'posts',
                'action' => 'edit',
            ],
            [
                'name' => 'posts.delete',
                'display_name' => 'Eliminar Posts',
                'description' => 'Permite eliminar posts',
                'module' => 'posts',
                'action' => 'delete',
            ],
            [
                'name' => 'posts.publish',
                'display_name' => 'Publicar Posts',
                'description' => 'Permite publicar y despublicar posts',
                'module' => 'posts',
                'action' => 'publish',
            ],
            
            // Comments permissions
            [
                'name' => 'comments.moderate',
                'display_name' => 'Moderar Comentarios',
                'description' => 'Permite moderar comentarios',
                'module' => 'comments',
                'action' => 'moderate',
            ],
        ];

        foreach ($permissions as $permissionData) {
            Permission::firstOrCreate(
                ['name' => $permissionData['name']],
                $permissionData
            );
        }

        // Assign permissions to roles
        $userRole = Role::where('name', 'user')->first();
        $editorRole = Role::where('name', 'editor')->first();
        $adminRole = Role::where('name', 'admin')->first();

        // Admin gets all permissions
        if ($adminRole) {
            $allPermissions = Permission::all();
            $adminRole->permissions()->sync($allPermissions->pluck('id'));
        }

        // Editor gets content management permissions
        if ($editorRole) {
            $editorPermissions = Permission::whereIn('name', [
                'dashboard.access',
                'posts.view',
                'posts.create',
                'posts.edit',
                'posts.publish',
                'comments.moderate',
            ])->get();
            $editorRole->permissions()->sync($editorPermissions->pluck('id'));
        }

        // User role gets no special permissions (just basic user access)
        // Users can access their own dashboard via user.dashboard route

        // Assign default role to existing users without roles
        $usersWithoutRoles = User::whereDoesntHave('roles')->get();
        
        foreach ($usersWithoutRoles as $user) {
            // Check if user should be admin (you can customize this logic)
            if (in_array($user->email, ['admin@mdrconstrucciones.com', 'info@mdrconstrucciones.com'])) {
                $user->assignRole('admin');
            } else {
                $user->assignRole('user');
            }
        }

        $this->command->info('Default roles and permissions created successfully!');
        $this->command->info('Users without roles have been assigned the "user" role.');
        $this->command->info('Admin emails (admin@mdrconstrucciones.com, info@mdrconstrucciones.com) have been assigned "admin" role.');
    }
}
