<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CreateAdminUvhSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear usuario administrador UVH
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@uvh.es'],
            [
                'name' => 'Administrador UVH',
                'password' => Hash::make('Nosequeponer123'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'bio' => 'Usuario administrador principal del sistema',
                'profession' => 'Administrador del Sistema',
                'profile_visibility' => true,
                'show_email' => false,
                'profile_updated_at' => now(),
            ]
        );

        if ($adminUser->wasRecentlyCreated) {
            echo "✅ Usuario administrador creado exitosamente:\n";
            echo "   Email: admin@uvh.es\n";
            echo "   Contraseña: Nosequeponer123\n";
            echo "   Rol: admin\n";
        } else {
            echo "ℹ️  El usuario admin@uvh.es ya existe.\n";
        }
    }
}