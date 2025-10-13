<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Category;
use App\Models\Tag;
use App\Models\UserInteraction;
use Illuminate\Support\Str;

class MLTrainingDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding ML training data...');

        // Get or create users
        $users = $this->createUsers();
        $this->command->info('✅ Created ' . count($users) . ' users');

        // Get categories and tags
        $categories = Category::all();
        $tags = Tag::all();

        if ($categories->isEmpty()) {
            $this->command->warn('⚠️  No categories found. Run CategorySeeder first.');
            return;
        }

        if ($tags->isEmpty()) {
            $this->command->warn('⚠️  No tags found. Run TagSeeder first.');
            return;
        }

        // Create posts
        $posts = $this->createPosts($users, $categories, $tags);
        $this->command->info('✅ Created ' . count($posts) . ' posts');

        // Create comments
        $comments = $this->createComments($users, $posts);
        $this->command->info('✅ Created ' . count($comments) . ' comments');

        // Create interactions
        $interactions = $this->createInteractions($users, $posts, $comments);
        $this->command->info('✅ Created ' . $interactions . ' interactions');

        $this->command->info('🎉 ML training data seeded successfully!');
    }

    private function createUsers(): array
    {
        $users = [];

        // Create test users if they don't exist
        $testUsers = [
            ['name' => 'María García', 'email' => 'maria@example.com', 'role' => 'user'],
            ['name' => 'Juan Pérez', 'email' => 'juan@example.com', 'role' => 'user'],
            ['name' => 'Ana Martínez', 'email' => 'ana@example.com', 'role' => 'user'],
            ['name' => 'Carlos López', 'email' => 'carlos@example.com', 'role' => 'user'],
            ['name' => 'Laura Sánchez', 'email' => 'laura@example.com', 'role' => 'user'],
        ];

        foreach ($testUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => bcrypt('password'),
                    'role' => $userData['role'],
                    'email_verified_at' => now(),
                ]
            );
            $users[] = $user;
        }

        return $users;
    }

    private function createPosts($users, $categories, $tags): array
    {
        $posts = [];

        $postData = [
            [
                'title' => 'Guía Completa para Reformar tu Cocina en 2025',
                'content' => $this->generateContent('cocina', 'reforma'),
                'excerpt' => 'Descubre todos los pasos necesarios para reformar tu cocina de manera eficiente y económica.',
                'categories' => ['cocinas'],
                'tags' => ['reformas', 'cocinas'],
            ],
            [
                'title' => 'Tendencias en Diseño de Baños Modernos',
                'content' => $this->generateContent('baño', 'diseño'),
                'excerpt' => 'Las últimas tendencias en diseño de baños que transformarán tu espacio.',
                'categories' => ['banos'],
                'tags' => ['diseño', 'baños'],
            ],
            [
                'title' => 'Cómo Elegir los Mejores Materiales para tu Reforma',
                'content' => $this->generateContent('materiales', 'construcción'),
                'excerpt' => 'Guía práctica para seleccionar los materiales más adecuados para tu proyecto de reforma.',
                'categories' => ['reformas-integrales'],
                'tags' => ['materiales', 'construcción'],
            ],
            [
                'title' => 'Reforma Integral: Planificación y Presupuesto',
                'content' => $this->generateContent('reforma', 'presupuesto'),
                'excerpt' => 'Todo lo que necesitas saber sobre planificación y presupuesto para una reforma integral.',
                'categories' => ['reformas-integrales'],
                'tags' => ['planificación', 'presupuesto'],
            ],
            [
                'title' => 'Iluminación LED: Ahorro y Eficiencia en tu Hogar',
                'content' => $this->generateContent('iluminación', 'eficiencia'),
                'excerpt' => 'Cómo la iluminación LED puede reducir tu consumo energético y mejorar tu hogar.',
                'categories' => ['reformas-integrales'],
                'tags' => ['iluminación', 'eficiencia'],
            ],
            [
                'title' => 'Reformas de Cocinas: Errores Comunes a Evitar',
                'content' => $this->generateContent('cocina', 'errores'),
                'excerpt' => 'Los errores más frecuentes en reformas de cocinas y cómo evitarlos.',
                'categories' => ['cocinas'],
                'tags' => ['cocinas', 'consejos'],
            ],
            [
                'title' => 'Baños Pequeños: Maximiza el Espacio',
                'content' => $this->generateContent('baño', 'espacio'),
                'excerpt' => 'Trucos y consejos para aprovechar al máximo los baños pequeños.',
                'categories' => ['banos'],
                'tags' => ['baños', 'diseño'],
            ],
            [
                'title' => 'Sostenibilidad en la Construcción: Materiales Ecológicos',
                'content' => $this->generateContent('sostenibilidad', 'ecología'),
                'excerpt' => 'Materiales ecológicos y sostenibles para tu próxima reforma.',
                'categories' => ['reformas-integrales'],
                'tags' => ['sostenibilidad', 'materiales'],
            ],
            [
                'title' => 'Reforma de Baño: Paso a Paso',
                'content' => $this->generateContent('baño', 'tutorial'),
                'excerpt' => 'Guía detallada paso a paso para reformar tu baño.',
                'categories' => ['banos'],
                'tags' => ['baños', 'tutorial'],
            ],
            [
                'title' => 'Cocinas Abiertas: Ventajas y Desventajas',
                'content' => $this->generateContent('cocina', 'diseño'),
                'excerpt' => 'Análisis completo de las cocinas abiertas: pros y contras.',
                'categories' => ['cocinas'],
                'tags' => ['cocinas', 'diseño'],
            ],
        ];

        foreach ($postData as $data) {
            $slug = Str::slug($data['title']);

            $post = Post::firstOrCreate(
                ['slug' => $slug],
                [
                    'user_id' => $users[array_rand($users)]->id,
                    'title' => $data['title'],
                    'excerpt' => $data['excerpt'],
                    'content' => $data['content'],
                    'cover_image' => 'https://via.placeholder.com/800x400/667eea/ffffff?text=' . urlencode(substr($data['title'], 0, 30)),
                    'status' => 'published',
                    'featured' => rand(0, 1) === 1,
                    'published_at' => now()->subDays(rand(1, 60)),
                    'views_count' => rand(50, 500),
                    'seo_title' => $data['title'] . ' | MDR Construcciones',
                    'seo_description' => $data['excerpt'],
                ]
            );

            // Attach categories (only if not already attached)
            $categoryIds = Category::whereIn('slug', $data['categories'])->pluck('id');
            $post->categories()->syncWithoutDetaching($categoryIds);

            // Attach tags (only if not already attached)
            $tagIds = Tag::whereIn('slug', $data['tags'])->pluck('id');
            $post->tags()->syncWithoutDetaching($tagIds);

            $posts[] = $post;
        }

        return $posts;
    }

    private function createComments($users, $posts): array
    {
        $comments = [];

        $commentTexts = [
            'Excelente artículo, muy útil la información.',
            'Gracias por compartir estos consejos, me han sido de gran ayuda.',
            '¿Podrías ampliar más sobre este tema?',
            'Muy interesante, estoy pensando en hacer una reforma similar.',
            'Me encanta el enfoque que le das al tema.',
            'Tengo una duda sobre los materiales que mencionas.',
            'Perfecto, justo lo que estaba buscando.',
            'Muy completo el artículo, felicidades.',
            '¿Cuánto tiempo aproximadamente tomaría este tipo de reforma?',
            'Excelentes recomendaciones, las pondré en práctica.',
        ];

        foreach ($posts as $post) {
            // Create 3-8 comments per post
            $numComments = rand(3, 8);

            for ($i = 0; $i < $numComments; $i++) {
                $comment = Comment::create([
                    'post_id' => $post->id,
                    'user_id' => $users[array_rand($users)]->id,
                    'body' => $commentTexts[array_rand($commentTexts)],
                    'status' => 'approved',
                    'created_at' => $post->published_at->addHours(rand(1, 72)),
                ]);

                $comments[] = $comment;

                // Some comments have replies
                if (rand(0, 2) === 0) {
                    Comment::create([
                        'post_id' => $post->id,
                        'parent_id' => $comment->id,
                        'user_id' => $users[array_rand($users)]->id,
                        'body' => 'Gracias por tu comentario. ' . $commentTexts[array_rand($commentTexts)],
                        'status' => 'approved',
                        'created_at' => $comment->created_at->addHours(rand(1, 24)),
                    ]);
                }
            }
        }

        return $comments;
    }

    private function createInteractions($users, $posts, $comments): int
    {
        $count = 0;

        // Create post interactions (views, likes)
        foreach ($posts as $post) {
            $numInteractions = rand(10, 30);
            $usedCombinations = [];

            for ($i = 0; $i < $numInteractions; $i++) {
                $userId = $users[array_rand($users)]->id;
                $type = rand(0, 3) === 0 ? UserInteraction::TYPE_LIKE : UserInteraction::TYPE_VIEW;

                // Create unique key to avoid duplicates
                $key = "{$userId}-{$post->id}-{$type}";

                // Skip if this combination already exists
                if (in_array($key, $usedCombinations)) {
                    continue;
                }

                $usedCombinations[] = $key;

                UserInteraction::firstOrCreate(
                    [
                        'user_id' => $userId,
                        'interactable_type' => Post::class,
                        'interactable_id' => $post->id,
                        'type' => $type,
                    ],
                    [
                        'created_at' => $post->published_at->addHours(rand(1, 100)),
                    ]
                );
                $count++;
            }
        }

        return $count;
    }

    private function generateContent($topic, $subtopic): string
    {
        return "<h2>Introducción a {$topic}</h2>
<p>En este artículo vamos a explorar todo lo relacionado con {$topic} y {$subtopic}. La información que compartimos está basada en años de experiencia en el sector de la construcción y reformas.</p>

<h3>¿Por qué es importante {$topic}?</h3>
<p>El {$topic} es un aspecto fundamental en cualquier proyecto de reforma. Muchos propietarios subestiman su importancia, pero la realidad es que una buena planificación en este aspecto puede marcar la diferencia entre un proyecto exitoso y uno problemático.</p>

<h3>Aspectos clave de {$subtopic}</h3>
<p>Cuando hablamos de {$subtopic}, debemos considerar varios factores importantes:</p>
<ul>
<li>Calidad de los materiales</li>
<li>Presupuesto disponible</li>
<li>Tiempo de ejecución</li>
<li>Normativas y regulaciones</li>
<li>Sostenibilidad y eficiencia energética</li>
</ul>

<h3>Consejos prácticos</h3>
<p>Basándonos en nuestra experiencia, estos son algunos consejos que te ayudarán en tu proyecto:</p>
<ol>
<li>Planifica con anticipación y establece un presupuesto realista</li>
<li>Consulta con profesionales antes de tomar decisiones importantes</li>
<li>No escatimes en materiales de calidad</li>
<li>Considera el impacto a largo plazo de tus decisiones</li>
<li>Mantén una comunicación fluida con tu equipo de trabajo</li>
</ol>

<h3>Conclusión</h3>
<p>El {$topic} y {$subtopic} son elementos cruciales en cualquier proyecto de reforma. Con la información y consejos adecuados, podrás tomar decisiones informadas que te ayudarán a lograr los resultados que deseas.</p>

<p>Si tienes alguna pregunta o necesitas asesoramiento personalizado, no dudes en contactarnos. Nuestro equipo de expertos está siempre dispuesto a ayudarte.</p>";
    }
}

