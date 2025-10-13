<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            // Tecnología y Construcción
            ['name' => 'Construcción Sostenible', 'color' => '#4CAF50'],
            ['name' => 'Materiales Ecológicos', 'color' => '#8BC34A'],
            ['name' => 'Eficiencia Energética', 'color' => '#FFC107'],
            ['name' => 'Arquitectura Moderna', 'color' => '#2196F3'],
            ['name' => 'Domótica', 'color' => '#9C27B0'],
            ['name' => 'Tecnología BIM', 'color' => '#FF5722'],
            
            // Tipos de proyectos  
            ['name' => 'Viviendas Unifamiliares', 'color' => '#795548'],
            ['name' => 'Edificios Residenciales', 'color' => '#607D8B'],
            ['name' => 'Construcción Industrial', 'color' => '#FF9800'],
            ['name' => 'Oficinas', 'color' => '#3F51B5'],
            ['name' => 'Locales Comerciales', 'color' => '#E91E63'],
            ['name' => 'Rehabilitación', 'color' => '#009688'],
            
            // Procesos y métodos
            ['name' => 'Planificación', 'color' => '#673AB7'],
            ['name' => 'Presupuestos', 'color' => '#CDDC39'],
            ['name' => 'Gestión de Proyectos', 'color' => '#F44336'],
            ['name' => 'Certificaciones', 'color' => '#00BCD4'],
            ['name' => 'Normativas', 'color' => '#FF6F00'],
            ['name' => 'Calidad', 'color' => '#4CAF50'],
            
            // Tendencias
            ['name' => 'Innovación', 'color' => '#E91E63'],
            ['name' => 'Diseño Sostenible', 'color' => '#4CAF50'],
            ['name' => 'Casas Pasivas', 'color' => '#00E676'],
            ['name' => 'Smart Homes', 'color' => '#536DFE'],
            ['name' => 'Automatización', 'color' => '#7C4DFF'],
            ['name' => 'IoT Construcción', 'color' => '#18FFFF'],
            
            // Servicios específicos
            ['name' => 'Consultoría', 'color' => '#FFC107'],
            ['name' => 'Asesoramiento', 'color' => '#FF9800'],
            ['name' => 'Mantenimiento', 'color' => '#795548'],
            ['name' => 'Reformas', 'color' => '#607D8B'],
            ['name' => 'Ampliaciones', 'color' => '#9C27B0'],
            ['name' => 'Decoración', 'color' => '#E91E63'],
        ];

        foreach ($tags as $tagData) {
            Tag::create([
                'name' => $tagData['name'],
                'slug' => Str::slug($tagData['name']),
                'color' => $tagData['color'],
            ]);
        }
    }
}