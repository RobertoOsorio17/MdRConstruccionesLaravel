<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiar tablas
        Role::truncate();
        Permission::truncate();
        
        // Crear permisos por módulo
        $permissions = [
            // Módulo Servicios
            ['name' => 'services.view', 'display_name' => 'Ver Servicios', 'module' => 'services', 'action' => 'view'],
            ['name' => 'services.create', 'display_name' => 'Crear Servicios', 'module' => 'services', 'action' => 'create'],
            ['name' => 'services.edit', 'display_name' => 'Editar Servicios', 'module' => 'services', 'action' => 'edit'],
            ['name' => 'services.delete', 'display_name' => 'Eliminar Servicios', 'module' => 'services', 'action' => 'delete'],
            
            // Módulo Proyectos
            ['name' => 'projects.view', 'display_name' => 'Ver Proyectos', 'module' => 'projects', 'action' => 'view'],
            ['name' => 'projects.create', 'display_name' => 'Crear Proyectos', 'module' => 'projects', 'action' => 'create'],
            ['name' => 'projects.edit', 'display_name' => 'Editar Proyectos', 'module' => 'projects', 'action' => 'edit'],
            ['name' => 'projects.delete', 'display_name' => 'Eliminar Proyectos', 'module' => 'projects', 'action' => 'delete'],
            
            // Módulo Blog
            ['name' => 'posts.view', 'display_name' => 'Ver Posts', 'module' => 'posts', 'action' => 'view'],
            ['name' => 'posts.create', 'display_name' => 'Crear Posts', 'module' => 'posts', 'action' => 'create'],
            ['name' => 'posts.edit', 'display_name' => 'Editar Posts', 'module' => 'posts', 'action' => 'edit'],
            ['name' => 'posts.delete', 'display_name' => 'Eliminar Posts', 'module' => 'posts', 'action' => 'delete'],
            ['name' => 'posts.publish', 'display_name' => 'Publicar Posts', 'module' => 'posts', 'action' => 'publish'],
            
            // Módulo Usuarios
            ['name' => 'users.view', 'display_name' => 'Ver Usuarios', 'module' => 'users', 'action' => 'view'],
            ['name' => 'users.create', 'display_name' => 'Crear Usuarios', 'module' => 'users', 'action' => 'create'],
            ['name' => 'users.edit', 'display_name' => 'Editar Usuarios', 'module' => 'users', 'action' => 'edit'],
            ['name' => 'users.delete', 'display_name' => 'Eliminar Usuarios', 'module' => 'users', 'action' => 'delete'],
            
            // Módulo Configuraciones
            ['name' => 'settings.view', 'display_name' => 'Ver Configuraciones', 'module' => 'settings', 'action' => 'view'],
            ['name' => 'settings.edit', 'display_name' => 'Editar Configuraciones', 'module' => 'settings', 'action' => 'edit'],
            
            // Dashboard
            ['name' => 'dashboard.access', 'display_name' => 'Acceso al Dashboard', 'module' => 'dashboard', 'action' => 'access'],
        ];
        
        foreach ($permissions as $permission) {
            Permission::create($permission);
        }
        
        // Crear roles
        $superAdminRole = Role::create([
            'name' => 'super_admin',
            'display_name' => 'Super Administrador',
            'description' => 'Acceso completo a todas las funcionalidades del sistema',
            'color' => '#dc2626',
            'level' => 100,
            'is_active' => true,
        ]);
        
        $adminRole = Role::create([
            'name' => 'admin',
            'display_name' => 'Administrador',
            'description' => 'Acceso completo a la gestión de contenidos',
            'color' => '#ea580c',
            'level' => 80,
            'is_active' => true,
        ]);
        
        $editorRole = Role::create([
            'name' => 'editor',
            'display_name' => 'Editor',
            'description' => 'Puede crear y editar contenidos',
            'color' => '#0ea5e9',
            'level' => 60,
            'is_active' => true,
        ]);
        
        $userRole = Role::create([
            'name' => 'user',
            'display_name' => 'Usuario',
            'description' => 'Usuario registrado sin permisos especiales',
            'color' => '#10b981',
            'level' => 20,
            'is_active' => true,
        ]);
        
        $guestRole = Role::create([
            'name' => 'guest',
            'display_name' => 'Invitado',
            'description' => 'Usuario no registrado',
            'color' => '#6b7280',
            'level' => 0,
            'is_active' => true,
        ]);
        
        // Asignar permisos a roles
        
        // Super Admin: todos los permisos
        $superAdminRole->permissions()->attach(Permission::all());
        
        // Admin: todos excepto usuarios
        $adminPermissions = Permission::whereNotIn('module', ['users'])->get();
        $adminRole->permissions()->attach($adminPermissions);
        
        // Editor: solo contenidos
        $editorPermissions = Permission::whereIn('module', ['services', 'projects', 'posts', 'dashboard'])
            ->whereNotIn('action', ['delete'])->get();
        $editorRole->permissions()->attach($editorPermissions);
        
        // Usuario: solo dashboard
        $userPermissions = Permission::where('module', 'dashboard')->get();
        $userRole->permissions()->attach($userPermissions);
        
        // Crear usuario Super Admin por defecto
        $superAdminUser = User::firstOrCreate(
            ['email' => 'admin@mdrconstrucciones.com'],
            [
                'name' => 'Super Administrador',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        
        $superAdminUser->assignRole($superAdminRole);
    }
}
