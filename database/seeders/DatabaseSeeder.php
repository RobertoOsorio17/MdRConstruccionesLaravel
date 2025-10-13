<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear usuario administrador
        User::factory()->create([
            'name' => 'Admin MDR',
            'email' => 'admin@mdrconstrucciones.com',
            'role' => 'admin',
        ]);

        // Crear usuario editor
        User::factory()->create([
            'name' => 'Editor MDR',
            'email' => 'editor@mdrconstrucciones.com',
            'role' => 'editor',
        ]);

        // Ejecutar seeders
        $this->call([
            SettingsSeeder::class,
            CategorySeeder::class,
            ServiceSeeder::class,
            TagSeeder::class,
            EnhancedPostSeeder::class,
            CommentInteractionSeeder::class,
            // ProjectSeeder::class,
        ]);
    }
}
