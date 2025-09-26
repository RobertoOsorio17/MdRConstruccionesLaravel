<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Post;
use Carbon\Carbon;

class BlogTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear usuario admin si no existe
        $admin = User::firstOrCreate(
            ['email' => 'admin@mdrconstrucciones.com'],
            [
                'name' => 'Admin MDR',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Crear categorías
        $categories = [
            [
                'name' => 'Reformas Integrales',
                'slug' => 'reformas-integrales',
                'description' => 'Todo sobre reformas completas de viviendas',
                'color' => '#1976d2',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Cocinas',
                'slug' => 'cocinas',
                'description' => 'Diseño y reforma de cocinas',
                'color' => '#f57c00',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Baños',
                'slug' => 'banos',
                'description' => 'Reformas de baños modernos',
                'color' => '#388e3c',
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($categories as $categoryData) {
            Category::firstOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );
        }

        // Crear posts de ejemplo
        $posts = [
            [
                'title' => '5 Tendencias en Reformas Integrales para 2024',
                'slug' => '5-tendencias-reformas-integrales-2024',
                'excerpt' => 'Descubre las últimas tendencias en reformas integrales que marcarán el año 2024. Desde sostenibilidad hasta tecnología.',
                'content' => '<h2>Introducción</h2><p>Las reformas integrales están evolucionando constantemente. En 2024, vemos cinco tendencias principales que están definiendo el sector.</p><h3>1. Sostenibilidad</h3><p>Los materiales eco-friendly son cada vez más populares...</p><h3>2. Tecnología Smart Home</h3><p>La domótica se integra de forma natural en las reformas...</p><h3>3. Espacios Multifuncionales</h3><p>Los espacios que se adaptan a diferentes usos ganan protagonismo...</p><h3>4. Colores Naturales</h3><p>Los tonos tierra y naturales dominan las paletas de color...</p><h3>5. Iluminación LED</h3><p>La eficiencia energética a través de la iluminación LED...</p>',
                'cover_image' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(1),
                'featured' => true,
                'views_count' => 245,
                'user_id' => $admin->id,
            ],
            [
                'title' => 'Cómo Elegir los Mejores Materiales para tu Cocina',
                'slug' => 'como-elegir-mejores-materiales-cocina',
                'excerpt' => 'Guía completa para seleccionar los materiales perfectos para tu cocina: durabilidad, estética y presupuesto.',
                'content' => '<h2>La Importancia de los Materiales</h2><p>Elegir los materiales correctos para tu cocina es una decisión crucial que afectará tanto la funcionalidad como la estética de tu espacio.</p><h3>Encimeras</h3><p>Las opciones van desde granito hasta cuarzo, cada una con sus ventajas...</p><h3>Armarios</h3><p>La elección de la madera y el acabado determinará la durabilidad...</p><h3>Electrodomésticos</h3><p>La calidad de los electrodomésticos es fundamental...</p>',
                'cover_image' => 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(3),
                'featured' => true,
                'views_count' => 189,
                'user_id' => $admin->id,
            ],
            [
                'title' => 'Reforma de Baño: Errores Comunes que Debes Evitar',
                'slug' => 'reforma-bano-errores-comunes-evitar',
                'excerpt' => 'Los errores más frecuentes en reformas de baño y cómo evitarlos para conseguir el resultado perfecto.',
                'content' => '<h2>Planificación es Clave</h2><p>Una reforma de baño requiere una planificación meticulosa. Estos son los errores más comunes que vemos.</p><h3>1. No considerar la ventilación</h3><p>La humedad puede causar problemas graves...</p><h3>2. Subestimar el presupuesto</h3><p>Las reformas de baño suelen costar más de lo previsto...</p><h3>3. Ignorar la fontanería existente</h3><p>Cambiar la ubicación de las tuberías puede ser costoso...</p>',
                'cover_image' => 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(5),
                'featured' => false,
                'views_count' => 156,
                'user_id' => $admin->id,
            ],
            [
                'title' => 'Presupuesto para Reforma Integral: Guía Completa',
                'slug' => 'presupuesto-reforma-integral-guia-completa',
                'excerpt' => 'Todo lo que necesitas saber para calcular el presupuesto de tu reforma integral y evitar sorpresas.',
                'content' => '<h2>¿Cuánto cuesta una reforma integral?</h2><p>El coste de una reforma integral depende de múltiples factores que analizamos en detalle.</p><h3>Factores que influyen en el precio</h3><p>Desde el tamaño de la vivienda hasta la calidad de los materiales...</p><h3>Desglose de costes típicos</h3><p>Te mostramos un desglose detallado por partidas...</p>',
                'cover_image' => 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
                'status' => 'published',
                'published_at' => Carbon::now()->subWeek(),
                'featured' => false,
                'views_count' => 98,
                'user_id' => $admin->id,
            ],
        ];

        foreach ($posts as $postData) {
            $post = Post::firstOrCreate(
                ['slug' => $postData['slug']],
                $postData
            );

            // Asignar categorías relacionadas
            if ($post->wasRecentlyCreated) {
                if (str_contains($post->title, 'Cocina') || str_contains($post->title, 'cocina')) {
                    $category = Category::where('slug', 'cocinas')->first();
                    if ($category) {
                        $post->categories()->attach($category->id);
                    }
                } elseif (str_contains($post->title, 'Baño') || str_contains($post->title, 'baño')) {
                    $category = Category::where('slug', 'banos')->first();
                    if ($category) {
                        $post->categories()->attach($category->id);
                    }
                } else {
                    $category = Category::where('slug', 'reformas-integrales')->first();
                    if ($category) {
                        $post->categories()->attach($category->id);
                    }
                }
            }
        }

        $this->command->info('Blog test data created successfully!');
    }
}