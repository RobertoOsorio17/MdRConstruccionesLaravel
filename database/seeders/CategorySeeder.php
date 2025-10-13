<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Consejos y Guías',
                'slug' => 'consejos-y-guias',
                'description' => 'Artículos con consejos prácticos y guías para reformas y construcciones.',
                'color' => '#0B6BCB',
                'sort_order' => 1,
            ],
            [
                'name' => 'Tendencias',
                'slug' => 'tendencias',
                'description' => 'Las últimas tendencias en diseño, materiales y técnicas de construcción.',
                'color' => '#F5A524',
                'sort_order' => 2,
            ],
            [
                'name' => 'Casos de Éxito',
                'slug' => 'casos-de-exito',
                'description' => 'Historias reales de nuestros proyectos y la satisfacción de nuestros clientes.',
                'color' => '#0A4A75',
                'sort_order' => 3,
            ],
            [
                'name' => 'Mantenimiento',
                'slug' => 'mantenimiento',
                'description' => 'Tips y consejos para el mantenimiento de tu hogar.',
                'color' => '#4CAF50',
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->insert(array_merge($category, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
