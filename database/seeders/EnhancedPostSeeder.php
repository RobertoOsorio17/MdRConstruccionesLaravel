<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Comment;
use App\Models\UserInteraction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class EnhancedPostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('es_ES');
        
        // Obtener usuarios, categorías y etiquetas existentes
        $users = User::all();
        $categories = Category::all();
        $tags = Tag::all();
        
        // Crear algunos usuarios adicionales si no existen suficientes
        if ($users->count() < 5) {
            for ($i = $users->count(); $i < 5; $i++) {
                User::create([
                    'name' => $faker->name,
                    'email' => $faker->unique()->safeEmail,
                    'password' => bcrypt('password123'),
                    'email_verified_at' => now(),
                    'bio' => $faker->paragraph(2),
                    'profession' => $faker->randomElement([
                        'Arquitecto', 'Ingeniero Civil', 'Project Manager', 
                        'Especialista en Sostenibilidad', 'Consultor BIM'
                    ]),
                    'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($faker->name) . '&size=200&background=2563eb&color=ffffff&bold=true'
                ]);
            }
            $users = User::all();
        }

        $posts = [
            [
                'title' => 'Construcción Sostenible: El Futuro de la Edificación',
                'content' => $this->generateRichContent([
                    'La construcción sostenible se ha convertido en una necesidad imperante en el siglo XXI.',
                    'Los nuevos materiales ecológicos están revolucionando la industria.',
                    'La eficiencia energética no es solo una tendencia, es una responsabilidad.',
                    'Certificaciones como BREEAM y LEED marcan el camino hacia la sostenibilidad.'
                ]),
                'cover_image' => 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=600&fit=crop',
                'featured' => true,
                'tags' => ['Construcción Sostenible', 'Eficiencia Energética', 'Materiales Ecológicos', 'Certificaciones']
            ],
            [
                'title' => 'Domótica: Transformando Hogares en Smart Homes',
                'content' => $this->generateRichContent([
                    'La domótica está revolucionando la forma en que interactuamos con nuestros hogares.',
                    'Sistemas inteligentes de climatización, iluminación y seguridad.',
                    'La integración de IoT en la construcción moderna.',
                    'Beneficios económicos y de comodidad de la automatización del hogar.'
                ]),
                'cover_image' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop',
                'featured' => true,
                'tags' => ['Domótica', 'Smart Homes', 'Automatización', 'IoT Construcción']
            ],
            [
                'title' => 'Arquitectura Moderna: Diseños que Inspiran',
                'content' => $this->generateRichContent([
                    'La arquitectura moderna combina funcionalidad con estética.',
                    'Líneas limpias, espacios abiertos y uso inteligente de la luz natural.',
                    'Materiales innovadores que definen el diseño contemporáneo.',
                    'Casos de estudio de proyectos arquitectónicos destacados.'
                ]),
                'cover_image' => 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&h=600&fit=crop',
                'featured' => false,
                'tags' => ['Arquitectura Moderna', 'Diseño Sostenible', 'Innovación']
            ],
            [
                'title' => 'BIM: Revolucionando la Gestión de Proyectos',
                'content' => $this->generateRichContent([
                    'Building Information Modeling está transformando la industria de la construcción.',
                    'Colaboración en tiempo real entre todos los stakeholders del proyecto.',
                    'Reducción de errores y optimización de recursos mediante BIM.',
                    'El futuro digital de la construcción ya está aquí.'
                ]),
                'cover_image' => 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=600&fit=crop',
                'featured' => true,
                'tags' => ['Tecnología BIM', 'Gestión de Proyectos', 'Innovación', 'Planificación']
            ],
            [
                'title' => 'Viviendas Unifamiliares: Diseño Personalizado',
                'content' => $this->generateRichContent([
                    'Cada familia tiene necesidades únicas que requieren soluciones personalizadas.',
                    'Factores clave en el diseño de viviendas unifamiliares modernas.',
                    'Integración de espacios interiores y exteriores.',
                    'Tendencias actuales en arquitectura residencial.'
                ]),
                'cover_image' => 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=600&fit=crop',
                'featured' => false,
                'tags' => ['Viviendas Unifamiliares', 'Diseño Sostenible', 'Arquitectura Moderna']
            ],
            [
                'title' => 'Rehabilitación de Edificios: Segunda Vida',
                'content' => $this->generateRichContent([
                    'La rehabilitación es clave para la sostenibilidad urbana.',
                    'Técnicas modernas para mejorar edificios existentes.',
                    'Eficiencia energética en proyectos de rehabilitación.',
                    'Casos de éxito en rehabilitación arquitectónica.'
                ]),
                'cover_image' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop',
                'featured' => false,
                'tags' => ['Rehabilitación', 'Eficiencia Energética', 'Renovación', 'Sostenibilidad']
            ],
            [
                'title' => 'Construcción Industrial: Espacios Funcionales',
                'content' => $this->generateRichContent([
                    'Los espacios industriales requieren soluciones específicas y funcionales.',
                    'Optimización de flujos de trabajo en el diseño industrial.',
                    'Materiales resistentes y durables para entornos exigentes.',
                    'Seguridad y normativas en construcción industrial.'
                ]),
                'cover_image' => 'https://images.unsplash.com/photo-1565008576726-6280b4062e46?w=1200&h=600&fit=crop',
                'featured' => false,
                'tags' => ['Construcción Industrial', 'Planificación', 'Normativas', 'Calidad']
            ],
            [
                'title' => 'Casas Pasivas: Máxima Eficiencia Energética',
                'content' => $this->generateRichContent([
                    'Las casas pasivas representan el estándar más alto en eficiencia energética.',
                    'Principios de diseño bioclimático y arquitectura pasiva.',
                    'Sistemas de ventilación y aislamiento de última generación.',
                    'Beneficios económicos y ambientales a largo plazo.'
                ]),
                'cover_image' => 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=600&fit=crop',
                'featured' => true,
                'tags' => ['Casas Pasivas', 'Eficiencia Energética', 'Construcción Sostenible', 'Diseño Sostenible']
            ]
        ];

        foreach ($posts as $index => $postData) {
            // Crear el post
            $post = Post::create([
                'user_id' => $users->random()->id,
                'title' => $postData['title'],
                'slug' => Str::slug($postData['title']),
                'excerpt' => $this->generateExcerpt($postData['content']),
                'content' => $postData['content'],
                'cover_image' => $postData['cover_image'],
                'status' => 'published',
                'featured' => $postData['featured'],
                'published_at' => now()->subDays(rand(1, 30)),
                'views_count' => rand(50, 500),
                'seo_title' => $postData['title'] . ' | MDR Construcciones',
                'seo_description' => $this->generateExcerpt($postData['content'], 150),
            ]);

            // Asignar categorías aleatorias
            $randomCategories = $categories->random(rand(1, 2));
            $post->categories()->attach($randomCategories->pluck('id'));

            // Asignar etiquetas específicas
            $postTags = collect($postData['tags'])->map(function ($tagName) use ($tags) {
                return $tags->where('name', $tagName)->first();
            })->filter();
            
            if ($postTags->count() > 0) {
                $post->tags()->attach($postTags->pluck('id'));
            }

            // Crear comentarios realistas
            $this->createCommentsForPost($post, $users, $faker);

            // Crear interacciones (likes y bookmarks)
            $this->createInteractionsForPost($post, $users);
        }
    }

    /**
     * Generar contenido rico en HTML
     */
    private function generateRichContent(array $keyPoints): string
    {
        $content = '<div class="post-content">';
        
        // Introducción
        $content .= '<p class="lead">En el panorama actual de la construcción, la innovación y la sostenibilidad son elementos clave que definen el éxito de cualquier proyecto.</p>';
        
        foreach ($keyPoints as $index => $point) {
            if ($index === 0) {
                $content .= '<h2>Introducción</h2>';
            } elseif ($index === 1) {
                $content .= '<h2>Desarrollo Principal</h2>';
            } elseif ($index === 2) {
                $content .= '<h3>Aspectos Técnicos</h3>';
            } elseif ($index === 3) {
                $content .= '<h3>Conclusiones</h3>';
            }
            
            $content .= '<p>' . $point . ' Este enfoque integral permite obtener resultados excepcionales que superan las expectativas de nuestros clientes.</p>';
            
            // Añadir lista ocasionalmente
            if ($index === 1) {
                $content .= '<ul>
                    <li>Análisis detallado de requisitos y necesidades específicas</li>
                    <li>Implementación de tecnologías de vanguardia</li>
                    <li>Supervisión continua y control de calidad</li>
                    <li>Entrega puntual y dentro del presupuesto establecido</li>
                </ul>';
            }
            
            // Añadir cita destacada
            if ($index === 2) {
                $content .= '<blockquote>"La excelencia en construcción no es un accidente, sino el resultado de una planificación meticulosa y una ejecución impecable."</blockquote>';
            }
        }
        
        $content .= '<h2>Conclusión</h2>';
        $content .= '<p>En MDR Construcciones, nos comprometemos a entregar proyectos que no solo cumplan con los más altos estándares de calidad, sino que también contribuyan positivamente al desarrollo sostenible de nuestras comunidades.</p>';
        $content .= '</div>';
        
        return $content;
    }

    /**
     * Generar excerpt del contenido
     */
    private function generateExcerpt(string $content, int $maxLength = 200): string
    {
        $plainText = strip_tags($content);
        return Str::limit($plainText, $maxLength);
    }

    /**
     * Crear comentarios para un post
     */
    private function createCommentsForPost(Post $post, $users, $faker): void
    {
        $commentCount = rand(2, 8);
        
        for ($i = 0; $i < $commentCount; $i++) {
            $user = $users->random();
            
            $comments = [
                'Excelente artículo, muy informativo y bien estructurado.',
                'Me parece muy interesante esta perspectiva sobre el tema.',
                'Gracias por compartir esta información tan valiosa.',
                '¿Podrían profundizar más en este aspecto específico?',
                'Muy útil para mi proyecto actual, gracias!',
                'Gran trabajo, esperamos más contenido como este.',
                'Información muy actualizada y relevante.',
                'Me gustaría saber más sobre la implementación práctica.',
            ];
            
            $comment = Comment::create([
                'post_id' => $post->id,
                'user_id' => $user->id,
                'body' => $faker->randomElement($comments),
                'status' => 'approved',
                'created_at' => $post->published_at->addHours(rand(1, 48)),
            ]);

            // Ocasionalmente crear respuestas
            if (rand(1, 3) === 1) {
                Comment::create([
                    'post_id' => $post->id,
                    'user_id' => $users->random()->id,
                    'parent_id' => $comment->id,
                    'body' => $faker->randomElement([
                        'Totalmente de acuerdo con tu comentario.',
                        'Muy buena observación, gracias por compartir.',
                        'Me parece una perspectiva muy interesante.',
                        'Gracias por la pregunta, intentaremos profundizar más.',
                    ]),
                    'status' => 'approved',
                    'created_at' => $comment->created_at->addHours(rand(1, 12)),
                ]);
            }
        }
    }

    /**
     * Crear interacciones para un post
     */
    private function createInteractionsForPost(Post $post, $users): void
    {
        // Crear likes
        $likeCount = rand(5, min(25, $users->count()));
        $likedUsers = $users->random($likeCount);
        
        foreach ($likedUsers as $user) {
            UserInteraction::create([
                'user_id' => $user->id,
                'interactable_type' => Post::class,
                'interactable_id' => $post->id,
                'type' => UserInteraction::TYPE_LIKE,
                'created_at' => $post->published_at->addHours(rand(1, 72)),
            ]);
        }

        // Crear bookmarks
        $bookmarkCount = rand(2, min(8, $users->count()));
        $bookmarkedUsers = $users->random($bookmarkCount);
        
        foreach ($bookmarkedUsers as $user) {
            // Evitar duplicados con likes
            if (!$likedUsers->contains($user)) {
                UserInteraction::create([
                    'user_id' => $user->id,
                    'interactable_type' => Post::class,
                    'interactable_id' => $post->id,
                    'type' => UserInteraction::TYPE_BOOKMARK,
                    'created_at' => $post->published_at->addHours(rand(1, 72)),
                ]);
            }
        }
    }
}