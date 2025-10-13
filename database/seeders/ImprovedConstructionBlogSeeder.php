<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ImprovedConstructionBlogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear categorías especializadas en construcción
        $categories = $this->createCategories();
        
        // Crear tags especializados
        $tags = $this->createTags();
        
        // Crear posts especializados
        $this->createPosts($categories, $tags);
    }

    /**
     * Crear categorías especializadas en construcción
     */
    private function createCategories(): array
    {
        $categoryData = [
            [
                'name' => 'Construcción Sostenible',
                'description' => 'Técnicas y materiales ecológicos para construcción responsable',
                'color' => '#4CAF50'
            ],
            [
                'name' => 'Reformas Integrales',
                'description' => 'Proyectos de renovación y mejora de edificaciones',
                'color' => '#FF9800'
            ],
            [
                'name' => 'Tecnología BIM',
                'description' => 'Building Information Modeling y herramientas digitales',
                'color' => '#2196F3'
            ],
            [
                'name' => 'Eficiencia Energética',
                'description' => 'Soluciones para optimizar el consumo energético',
                'color' => '#9C27B0'
            ],
            [
                'name' => 'Materiales Innovadores',
                'description' => 'Nuevos materiales y tecnologías constructivas',
                'color' => '#E91E63'
            ],
            [
                'name' => 'Diseño de Interiores',
                'description' => 'Tendencias y soluciones en interiorismo',
                'color' => '#FFC107'
            ],
            [
                'name' => 'Gestión de Proyectos',
                'description' => 'Metodologías y herramientas para gestión constructiva',
                'color' => '#607D8B'
            ],
            [
                'name' => 'Smart Homes',
                'description' => 'Domótica y automatización residencial',
                'color' => '#795548'
            ]
        ];

        $createdCategories = [];
        foreach ($categoryData as $data) {
            $category = Category::firstOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'color' => $data['color'],
                    'sort_order' => count($createdCategories) + 1,
                    'is_active' => true
                ]
            );
            $createdCategories[] = $category;
        }

        return $createdCategories;
    }

    /**
     * Crear tags especializados en construcción
     */
    private function createTags(): array
    {
        $tagNames = [
            // Materiales
            'Hormigón', 'Acero', 'Madera', 'Ladrillo', 'Vidrio', 'Aluminio', 'Materiales Reciclados',
            // Técnicas
            'Prefabricación', 'Construcción Modular', 'Impresión 3D', 'Técnicas Tradicionales',
            // Espacios
            'Cocinas', 'Baños', 'Salones', 'Dormitorios', 'Oficinas', 'Espacios Exteriores',
            // Tecnología
            'IoT', 'Sensores', 'Automatización', 'Iluminación LED', 'Climatización',
            // Sostenibilidad
            'Energía Solar', 'Aislamiento Térmico', 'Reciclaje', 'Agua de Lluvia', 'Jardines Verticales'
        ];

        $createdTags = [];
        foreach ($tagNames as $name) {
            $tag = Tag::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
            $createdTags[] = $tag;
        }

        return $createdTags;
    }

    /**
     * Crear posts especializados en construcción
     */
    private function createPosts(array $categories, array $tags): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            // Crear usuario por defecto si no existe
            $user = User::create([
                'name' => 'MDR Admin',
                'email' => 'admin@mdrconstrucciones.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now()
            ]);
            $users = collect([$user]);
        }

        $posts = [
            [
                'title' => 'Casas Pasivas: Revolucionando la Eficiencia Energética',
                'excerpt' => 'Descubre cómo las casas pasivas están transformando el sector de la construcción con su enfoque innovador hacia la eficiencia energética.',
                'category_ids' => [0, 3], // Construcción Sostenible, Eficiencia Energética
                'tag_names' => ['Aislamiento Térmico', 'Energía Solar', 'Ventilación'],
                'cover_image' => 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=600&fit=crop'
            ],
            [
                'title' => 'BIM en Reformas: Optimizando Proyectos de Renovación',
                'excerpt' => 'Aprende cómo la tecnología BIM está revolucionando los proyectos de reforma, mejorando la precisión y reduciendo costos.',
                'category_ids' => [1, 2], // Reformas Integrales, Tecnología BIM
                'tag_names' => ['Prefabricación', 'Planificación', 'Gestión'],
                'cover_image' => 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=600&fit=crop'
            ],
            [
                'title' => 'Materiales Reciclados: Construcción Responsable',
                'excerpt' => 'Explora las opciones de materiales reciclados que están definiendo el futuro de la construcción sostenible.',
                'category_ids' => [0, 4], // Construcción Sostenible, Materiales Innovadores
                'tag_names' => ['Materiales Reciclados', 'Reciclaje', 'Sostenibilidad'],
                'cover_image' => 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=600&fit=crop'
            ],
            [
                'title' => 'Smart Kitchen: Cocinas Inteligentes del Futuro',
                'excerpt' => 'Descubre las últimas tendencias en domótica aplicada a cocinas, creando espacios más funcionales e inteligentes.',
                'category_ids' => [5, 7], // Diseño de Interiores, Smart Homes
                'tag_names' => ['Cocinas', 'IoT', 'Automatización', 'Iluminación LED'],
                'cover_image' => 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=600&fit=crop'
            ],
            [
                'title' => 'Construcción Modular: Velocidad y Calidad',
                'excerpt' => 'La construcción modular está redefiniendo los tiempos de entrega sin comprometer la calidad en proyectos residenciales.',
                'category_ids' => [4, 6], // Materiales Innovadores, Gestión de Proyectos
                'tag_names' => ['Construcción Modular', 'Prefabricación', 'Planificación'],
                'cover_image' => 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&h=600&fit=crop'
            ],
            [
                'title' => 'Jardines Verticales: Naturalizando Espacios Urbanos',
                'excerpt' => 'Los jardines verticales no solo embellecen, sino que mejoran la calidad del aire y la eficiencia energética.',
                'category_ids' => [0, 5], // Construcción Sostenible, Diseño de Interiores
                'tag_names' => ['Jardines Verticales', 'Espacios Exteriores', 'Sostenibilidad'],
                'cover_image' => 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop'
            ],
            [
                'title' => 'Iluminación LED Inteligente en Reformas',
                'excerpt' => 'Cómo integrar sistemas de iluminación LED inteligente en proyectos de reforma para maximizar confort y eficiencia.',
                'category_ids' => [1, 7], // Reformas Integrales, Smart Homes
                'tag_names' => ['Iluminación LED', 'Automatización', 'Reformas'],
                'cover_image' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop'
            ],
            [
                'title' => 'Gestión de Residuos en Construcción Sostenible',
                'excerpt' => 'Estrategias efectivas para minimizar residuos y maximizar el reciclaje en proyectos de construcción moderna.',
                'category_ids' => [0, 6], // Construcción Sostenible, Gestión de Proyectos
                'tag_names' => ['Reciclaje', 'Gestión', 'Sostenibilidad'],
                'cover_image' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop'
            ],
            [
                'title' => 'Sistemas de Climatización Eficientes',
                'excerpt' => 'Nuevas tecnologías en climatización que reducen el consumo energético hasta un 50% respecto a sistemas tradicionales.',
                'category_ids' => [3, 4], // Eficiencia Energética, Materiales Innovadores
                'tag_names' => ['Climatización', 'Eficiencia Energética', 'Sensores'],
                'cover_image' => 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=600&fit=crop'
            ],
            [
                'title' => 'Impresión 3D en Construcción: Casos Reales',
                'excerpt' => 'Análisis de proyectos reales donde la impresión 3D ha revolucionado los procesos constructivos tradicionales.',
                'category_ids' => [4, 2], // Materiales Innovadores, Tecnología BIM
                'tag_names' => ['Impresión 3D', 'Innovación', 'Tecnología'],
                'cover_image' => 'https://images.unsplash.com/photo-1565008576726-6280b4062e46?w=1200&h=600&fit=crop'
            ]
        ];

        foreach ($posts as $index => $postData) {
            $content = $this->generateContent($postData['title'], $postData['excerpt']);
            
            $post = Post::create([
                'user_id' => $users->random()->id,
                'title' => $postData['title'],
                'slug' => Str::slug($postData['title']),
                'excerpt' => $postData['excerpt'],
                'content' => $content,
                'cover_image' => $postData['cover_image'],
                'status' => 'published',
                'featured' => $index < 3, // Primeros 3 como destacados
                'published_at' => now()->subDays(rand(1, 60)),
                'views_count' => rand(100, 800),
                'seo_title' => $postData['title'] . ' | MDR Construcciones',
                'seo_description' => $postData['excerpt']
            ]);

            // Asignar categorías
            $postCategories = collect($postData['category_ids'])->map(fn($idx) => $categories[$idx]->id);
            $post->categories()->attach($postCategories);

            // Asignar tags
            $postTags = collect($postData['tag_names'])->map(function($tagName) use ($tags) {
                return collect($tags)->firstWhere('name', $tagName)?->id;
            })->filter();
            
            if ($postTags->isNotEmpty()) {
                $post->tags()->attach($postTags);
            }
        }
    }

    /**
     * Generar contenido HTML para el post
     */
    private function generateContent(string $title, string $excerpt): string
    {
        return <<<HTML
<div class="post-content">
    <p class="lead">{$excerpt}</p>
    
    <h2>Introducción</h2>
    <p>En el sector de la construcción actual, la innovación y la sostenibilidad van de la mano para crear soluciones que no solo satisfacen las necesidades inmediatas, sino que también consideran el impacto a largo plazo en el medio ambiente y la sociedad.</p>
    
    <h2>Desarrollo Principal</h2>
    <p>Los avances tecnológicos han permitido desarrollar nuevas metodologías y materiales que optimizan tanto los procesos constructivos como los resultados finales. Esto incluye desde la fase de diseño hasta la ejecución y mantenimiento de las obras.</p>
    
    <blockquote>
        <p>"La construcción del futuro no se trata solo de edificar, sino de crear espacios que mejoren la calidad de vida de las personas mientras respetan nuestro planeta."</p>
    </blockquote>
    
    <h3>Beneficios Clave</h3>
    <ul>
        <li><strong>Eficiencia:</strong> Optimización de recursos y tiempos de ejecución</li>
        <li><strong>Sostenibilidad:</strong> Reducción del impacto ambiental</li>
        <li><strong>Calidad:</strong> Mejores acabados y durabilidad</li>
        <li><strong>Innovación:</strong> Integración de nuevas tecnologías</li>
    </ul>
    
    <h2>Aplicaciones Prácticas</h2>
    <p>La implementación de estas soluciones requiere un enfoque integral que considere tanto los aspectos técnicos como los económicos y ambientales del proyecto.</p>
    
    <h2>Conclusión</h2>
    <p>El futuro de la construcción está en la adopción de prácticas y tecnologías que permitan crear edificaciones más eficientes, sostenibles y adaptadas a las necesidades cambiantes de la sociedad moderna.</p>
</div>
HTML;
    }
}