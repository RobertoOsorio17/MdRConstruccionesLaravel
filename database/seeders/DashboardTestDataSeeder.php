<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Category;
use App\Models\UserInteraction;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DashboardTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear categorías si no existen
        $categories = [
            ['name' => 'Reformas', 'slug' => 'reformas', 'description' => 'Todo sobre reformas del hogar'],
            ['name' => 'Construcción', 'slug' => 'construccion', 'description' => 'Consejos de construcción'],
            ['name' => 'Diseño', 'slug' => 'diseno', 'description' => 'Ideas de diseño y decoración'],
        ];

        foreach ($categories as $categoryData) {
            Category::firstOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );
        }

        // Crear usuario de prueba
        $testUser = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Usuario de Prueba',
                'password' => Hash::make('password'),
                'bio' => 'Soy un usuario de prueba interesado en construcción y reformas. Me gusta seguir las últimas tendencias en diseño.',
                'profession' => 'Arquitecto',
                'location' => 'Madrid, España',
                'website' => 'https://ejemplo.com',
                'phone' => '+34 123 456 789',
                'social_links' => [
                    'twitter' => 'https://twitter.com/usuario',
                    'linkedin' => 'https://linkedin.com/in/usuario'
                ],
                'profile_visibility' => true,
                'show_email' => false,
                'profile_updated_at' => now(),
            ]
        );

        // Crear otro usuario para ser autor
        $authorUser = User::firstOrCreate(
            ['email' => 'autor@example.com'],
            [
                'name' => 'María García',
                'password' => Hash::make('password'),
                'bio' => 'Experta en reformas y construcción con más de 10 años de experiencia.',
                'profession' => 'Jefa de Obras',
                'location' => 'Barcelona, España',
                'website' => 'https://mariagarcia.com',
                'profile_visibility' => true,
                'show_email' => true,
            ]
        );

        // Crear posts de ejemplo
        $postsData = [
            [
                'title' => 'Guía Completa para Reformar tu Cocina',
                'slug' => 'guia-completa-reformar-cocina',
                'excerpt' => 'Descubre todos los pasos necesarios para reformar tu cocina de manera eficiente y económica.',
                'content' => '<p>Reformar la cocina es una de las mejores inversiones que puedes hacer en tu hogar. En esta guía te explicamos paso a paso todo lo que necesitas saber.</p><p>Desde la planificación inicial hasta los acabados finales, cubrimos todos los aspectos importantes de una reforma de cocina exitosa.</p>',
                'cover_image' => 'https://via.placeholder.com/800x400/2563eb/ffffff?text=Cocina+Moderna',
                'published_at' => now()->subDays(5),
                'status' => 'published',
                'user_id' => $authorUser->id,
            ],
            [
                'title' => '10 Tendencias en Diseño de Interiores para 2024',
                'slug' => '10-tendencias-diseno-interiores-2024',
                'excerpt' => 'Las tendencias más actuales en diseño de interiores que marcarán el año 2024.',
                'content' => '<p>El mundo del diseño de interiores está en constante evolución. Este año 2024 trae consigo nuevas tendencias que combinan funcionalidad, sostenibilidad y belleza.</p><p>Desde colores tierra hasta materiales naturales, exploramos las 10 tendencias más importantes.</p>',
                'cover_image' => 'https://via.placeholder.com/800x400/16a34a/ffffff?text=Diseño+2024',
                'published_at' => now()->subDays(3),
                'status' => 'published',
                'user_id' => $authorUser->id,
            ],
            [
                'title' => 'Cómo Elegir los Mejores Materiales para tu Reforma',
                'slug' => 'como-elegir-mejores-materiales-reforma',
                'excerpt' => 'Consejos profesionales para seleccionar los materiales más adecuados según tu presupuesto y necesidades.',
                'content' => '<p>Elegir los materiales correctos es fundamental para el éxito de cualquier reforma. La calidad, durabilidad y estética deben ir de la mano con tu presupuesto.</p><p>En este artículo analizamos los diferentes tipos de materiales disponibles en el mercado.</p>',
                'cover_image' => 'https://via.placeholder.com/800x400/dc2626/ffffff?text=Materiales+Construcción',
                'published_at' => now()->subDays(1),
                'status' => 'published',
                'user_id' => $authorUser->id,
            ],
        ];

        $posts = [];
        foreach ($postsData as $postData) {
            $post = Post::firstOrCreate(
                ['slug' => $postData['slug']],
                $postData
            );
            $posts[] = $post;

            // Asignar categoría aleatoria
            $randomCategory = Category::inRandomOrder()->first();
            if ($randomCategory) {
                $post->categories()->sync([$randomCategory->id]);
            }
        }

        // Crear comentarios del usuario de prueba
        $commentsData = [
            [
                'content' => 'Excelente artículo! Me ha ayudado mucho a planificar mi reforma de cocina. Especialmente útiles los consejos sobre presupuesto.',
                'post_id' => $posts[0]->id,
            ],
            [
                'content' => 'Me encantan estas tendencias, especialmente la del uso de materiales naturales. ¿Tienes algún proveedor recomendado?',
                'post_id' => $posts[1]->id,
            ],
            [
                'content' => 'Muy interesante el punto sobre la relación calidad-precio. He tenido malas experiencias eligiendo materiales baratos.',
                'post_id' => $posts[2]->id,
            ],
            [
                'content' => 'Gracias por compartir tu experiencia. Como profesional del sector, confirmo que estos consejos son muy acertados.',
                'post_id' => $posts[0]->id,
            ],
            [
                'content' => 'Estoy pensando en hacer una reforma similar. ¿Podrías hacer un artículo sobre costes aproximados?',
                'post_id' => $posts[0]->id,
            ],
        ];

        foreach ($commentsData as $commentData) {
            Comment::create([
                'body' => $commentData['content'],
                'post_id' => $commentData['post_id'],
                'user_id' => $testUser->id,
                'status' => 'approved',
                'created_at' => now()->subDays(rand(1, 10))->subHours(rand(1, 23)),
            ]);
        }

        // Crear interacciones (posts guardados y likes)
        foreach ($posts as $post) {
            // Bookmark (guardar posts)
            UserInteraction::firstOrCreate([
                'user_id' => $testUser->id,
                'interactable_type' => Post::class,
                'interactable_id' => $post->id,
                'type' => UserInteraction::TYPE_BOOKMARK,
            ]);

            // Like en algunos posts
            if (rand(0, 1)) {
                UserInteraction::firstOrCreate([
                    'user_id' => $testUser->id,
                    'interactable_type' => Post::class,
                    'interactable_id' => $post->id,
                    'type' => UserInteraction::TYPE_LIKE,
                ]);
            }
        }

        // Crear relación de seguimiento
        $testUser->following()->attach($authorUser->id, [
            'followed_at' => now()->subDays(7),
            'created_at' => now()->subDays(7),
            'updated_at' => now()->subDays(7),
        ]);

        $this->command->info('✅ Datos de prueba para dashboard creados exitosamente:');
        $this->command->info("- Usuario de prueba: test@example.com (password: password)");
        $this->command->info("- Usuario autor: autor@example.com (password: password)");
        $this->command->info("- {$testUser->comments()->count()} comentarios");
        $this->command->info("- {$testUser->bookmarkedPosts()->count()} posts guardados");
        $this->command->info("- {$testUser->following()->count()} usuarios seguidos");
        $this->command->info("- {$testUser->followers()->count()} seguidores");
    }
}