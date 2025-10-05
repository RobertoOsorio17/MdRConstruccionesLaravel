<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionsAndRolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Permissions
        $permissions = [
            // Posts
            ['name' => 'posts.view', 'display_name' => 'Ver Posts', 'description' => 'Ver posts publicados', 'group' => 'posts'],
            ['name' => 'posts.create', 'display_name' => 'Crear Posts', 'description' => 'Crear nuevos posts', 'group' => 'posts'],
            ['name' => 'posts.edit', 'display_name' => 'Editar Posts', 'description' => 'Editar posts existentes', 'group' => 'posts'],
            ['name' => 'posts.delete', 'display_name' => 'Eliminar Posts', 'description' => 'Eliminar posts', 'group' => 'posts'],
            ['name' => 'posts.publish', 'display_name' => 'Publicar Posts', 'description' => 'Publicar/despublicar posts', 'group' => 'posts'],
            ['name' => 'posts.feature', 'display_name' => 'Destacar Posts', 'description' => 'Marcar posts como destacados', 'group' => 'posts'],

            // Comments
            ['name' => 'comments.view', 'display_name' => 'Ver Comentarios', 'description' => 'Ver comentarios', 'group' => 'comments'],
            ['name' => 'comments.create', 'display_name' => 'Crear Comentarios', 'description' => 'Crear comentarios', 'group' => 'comments'],
            ['name' => 'comments.edit', 'display_name' => 'Editar Comentarios', 'description' => 'Editar comentarios', 'group' => 'comments'],
            ['name' => 'comments.delete', 'display_name' => 'Eliminar Comentarios', 'description' => 'Eliminar comentarios', 'group' => 'comments'],
            ['name' => 'comments.moderate', 'display_name' => 'Moderar Comentarios', 'description' => 'Aprobar/rechazar comentarios', 'group' => 'comments'],

            // Users
            ['name' => 'users.view', 'display_name' => 'Ver Usuarios', 'description' => 'Ver lista de usuarios', 'group' => 'users'],
            ['name' => 'users.create', 'display_name' => 'Crear Usuarios', 'description' => 'Crear nuevos usuarios', 'group' => 'users'],
            ['name' => 'users.edit', 'display_name' => 'Editar Usuarios', 'description' => 'Editar usuarios existentes', 'group' => 'users'],
            ['name' => 'users.delete', 'display_name' => 'Eliminar Usuarios', 'description' => 'Eliminar usuarios', 'group' => 'users'],
            ['name' => 'users.ban', 'display_name' => 'Banear Usuarios', 'description' => 'Banear/desbanear usuarios', 'group' => 'users'],

            // Services
            ['name' => 'services.view', 'display_name' => 'Ver Servicios', 'description' => 'Ver servicios', 'group' => 'services'],
            ['name' => 'services.create', 'display_name' => 'Crear Servicios', 'description' => 'Crear nuevos servicios', 'group' => 'services'],
            ['name' => 'services.edit', 'display_name' => 'Editar Servicios', 'description' => 'Editar servicios', 'group' => 'services'],
            ['name' => 'services.delete', 'display_name' => 'Eliminar Servicios', 'description' => 'Eliminar servicios', 'group' => 'services'],

            // Projects
            ['name' => 'projects.view', 'display_name' => 'Ver Proyectos', 'description' => 'Ver proyectos', 'group' => 'projects'],
            ['name' => 'projects.create', 'display_name' => 'Crear Proyectos', 'description' => 'Crear nuevos proyectos', 'group' => 'projects'],
            ['name' => 'projects.edit', 'display_name' => 'Editar Proyectos', 'description' => 'Editar proyectos', 'group' => 'projects'],
            ['name' => 'projects.delete', 'display_name' => 'Eliminar Proyectos', 'description' => 'Eliminar proyectos', 'group' => 'projects'],

            // Categories
            ['name' => 'categories.view', 'display_name' => 'Ver Categorías', 'description' => 'Ver categorías', 'group' => 'categories'],
            ['name' => 'categories.create', 'display_name' => 'Crear Categorías', 'description' => 'Crear categorías', 'group' => 'categories'],
            ['name' => 'categories.edit', 'display_name' => 'Editar Categorías', 'description' => 'Editar categorías', 'group' => 'categories'],
            ['name' => 'categories.delete', 'display_name' => 'Eliminar Categorías', 'description' => 'Eliminar categorías', 'group' => 'categories'],

            // Reviews
            ['name' => 'reviews.view', 'display_name' => 'Ver Reseñas', 'description' => 'Ver reseñas', 'group' => 'reviews'],
            ['name' => 'reviews.create', 'display_name' => 'Crear Reseñas', 'description' => 'Crear reseñas', 'group' => 'reviews'],
            ['name' => 'reviews.edit', 'display_name' => 'Editar Reseñas', 'description' => 'Editar reseñas', 'group' => 'reviews'],
            ['name' => 'reviews.delete', 'display_name' => 'Eliminar Reseñas', 'description' => 'Eliminar reseñas', 'group' => 'reviews'],
            ['name' => 'reviews.moderate', 'display_name' => 'Moderar Reseñas', 'description' => 'Aprobar/rechazar reseñas', 'group' => 'reviews'],

            // Settings
            ['name' => 'settings.view', 'display_name' => 'Ver Configuración', 'description' => 'Ver configuración del sistema', 'group' => 'settings'],
            ['name' => 'settings.edit', 'display_name' => 'Editar Configuración', 'description' => 'Modificar configuración', 'group' => 'settings'],

            // Analytics
            ['name' => 'analytics.view', 'display_name' => 'Ver Analytics', 'description' => 'Ver estadísticas y analytics', 'group' => 'analytics'],

            // Export
            ['name' => 'export.data', 'display_name' => 'Exportar Datos', 'description' => 'Exportar datos del sistema', 'group' => 'export'],

            // Audit
            ['name' => 'audit.view', 'display_name' => 'Ver Auditoría', 'description' => 'Ver logs de auditoría', 'group' => 'audit'],

            // Newsletter
            ['name' => 'newsletter.view', 'display_name' => 'Ver Newsletter', 'description' => 'Ver suscriptores de newsletter', 'group' => 'newsletter'],
            ['name' => 'newsletter.send', 'display_name' => 'Enviar Newsletter', 'description' => 'Enviar campañas de newsletter', 'group' => 'newsletter'],
            ['name' => 'newsletter.export', 'display_name' => 'Exportar Newsletter', 'description' => 'Exportar suscriptores', 'group' => 'newsletter'],
            ['name' => 'newsletter.delete', 'display_name' => 'Eliminar Suscriptores', 'description' => 'Eliminar suscriptores', 'group' => 'newsletter'],
            ['name' => 'newsletter.manage', 'display_name' => 'Gestionar Newsletter', 'description' => 'Gestión completa de newsletter', 'group' => 'newsletter'],

            // System
            ['name' => 'system.backup', 'display_name' => 'Gestionar Backups', 'description' => 'Crear y gestionar backups del sistema', 'group' => 'system'],

            // Contact Requests
            ['name' => 'contact.view', 'display_name' => 'Ver Solicitudes', 'description' => 'Ver solicitudes de contacto', 'group' => 'contact'],
            ['name' => 'contact.manage', 'display_name' => 'Gestionar Solicitudes', 'description' => 'Gestionar solicitudes de contacto', 'group' => 'contact'],
            ['name' => 'contact.delete', 'display_name' => 'Eliminar Solicitudes', 'description' => 'Eliminar solicitudes de contacto', 'group' => 'contact'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }

        // Create Roles
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            [
                'display_name' => 'Administrador',
                'description' => 'Acceso completo al sistema',
                'level' => 100,
            ]
        );

        $editorRole = Role::firstOrCreate(
            ['name' => 'editor'],
            [
                'display_name' => 'Editor',
                'description' => 'Puede gestionar contenido',
                'level' => 50,
            ]
        );

        $moderatorRole = Role::firstOrCreate(
            ['name' => 'moderator'],
            [
                'display_name' => 'Moderador',
                'description' => 'Puede moderar comentarios y reseñas',
                'level' => 30,
            ]
        );

        $userRole = Role::firstOrCreate(
            ['name' => 'user'],
            [
                'display_name' => 'Usuario',
                'description' => 'Usuario estándar',
                'level' => 10,
            ]
        );

        // Assign all permissions to admin
        $adminRole->syncPermissions(Permission::all()->pluck('name')->toArray());

        // Assign permissions to editor
        $editorPermissions = [
            'posts.view', 'posts.create', 'posts.edit', 'posts.delete', 'posts.publish',
            'comments.view', 'comments.edit', 'comments.delete', 'comments.moderate',
            'services.view', 'services.create', 'services.edit',
            'projects.view', 'projects.create', 'projects.edit',
            'categories.view', 'categories.create', 'categories.edit',
            'reviews.view', 'reviews.moderate',
            'analytics.view',
        ];
        $editorRole->syncPermissions($editorPermissions);

        // Assign permissions to moderator
        $moderatorPermissions = [
            'posts.view',
            'comments.view', 'comments.moderate',
            'reviews.view', 'reviews.moderate',
        ];
        $moderatorRole->syncPermissions($moderatorPermissions);

        // Assign permissions to user
        $userPermissions = [
            'posts.view',
            'comments.view', 'comments.create',
            'services.view',
            'projects.view',
            'reviews.view', 'reviews.create',
        ];
        $userRole->syncPermissions($userPermissions);

        $this->command->info('✅ Permissions and Roles seeded successfully!');
    }
}

