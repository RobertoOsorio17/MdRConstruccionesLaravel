<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tag;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiar tablas
        Category::truncate();
        Tag::truncate();
        Post::truncate();
        
        // Crear categorías
        $categories = [
            [
                'name' => 'Reformas',
                'slug' => 'reformas',
                'description' => 'Todo sobre reformas integrales, cocinas, baños y espacios',
                'color' => '#f59e0b',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Consejos',
                'slug' => 'consejos',
                'description' => 'Tips y consejos para el hogar y la construcción',
                'color' => '#10b981',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Tendencias',
                'slug' => 'tendencias',
                'description' => 'Últimas tendencias en decoración y diseño',
                'color' => '#8b5cf6',
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];
        
        foreach ($categories as $categoryData) {
            Category::create($categoryData);
        }
        
        // Crear etiquetas
        $tags = [
            ['name' => 'Cocinas', 'slug' => 'cocinas', 'color' => '#f59e0b'],
            ['name' => 'Baños', 'slug' => 'banos', 'color' => '#06b6d4'],
            ['name' => 'Diseño Interior', 'slug' => 'diseno-interior', 'color' => '#8b5cf6'],
            ['name' => 'Sostenibilidad', 'slug' => 'sostenibilidad', 'color' => '#10b981'],
            ['name' => 'Materiales', 'slug' => 'materiales', 'color' => '#6b7280'],
        ];
        
        foreach ($tags as $tagData) {
            Tag::create($tagData);
        }
        
        // Obtener usuario para asignar como autor
        $author = User::first();
        
        // Crear posts del blog
        $posts = [
            [
                'title' => '10 Tendencias en Reformas de Cocinas para 2024',
                'slug' => '10-tendencias-reformas-cocinas-2024',
                'excerpt' => 'Descubre las últimas tendencias en diseño de cocinas que estarán marcando el 2024.',
                'content' => '<h2>Las Cocinas del Futuro</h2><p>El diseño de cocinas evoluciona constantemente...</p>',
                'cover_image' => 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
                'status' => 'published',
                'published_at' => now()->subDays(5),
                'featured' => true,
                'categories' => ['reformas', 'tendencias'],
                'tags' => ['cocinas', 'diseno-interior']
            ],
            [
                'title' => 'Cómo Maximizar el Espacio en Baños Pequeños',
                'slug' => 'maximizar-espacio-banos-pequenos',
                'excerpt' => 'Consejos prácticos para aprovechar cada centímetro de tu baño pequeño.',
                'content' => '<h2>Optimiza tu Baño Pequeño</h2><p>Un baño pequeño no tiene por qué ser limitante...</p>',
                'cover_image' => 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
                'status' => 'published',
                'published_at' => now()->subDays(10),
                'featured' => false,
                'categories' => ['consejos'],
                'tags' => ['banos']
            ],
        ];
        
        foreach ($posts as $postData) {
            $post = Post::create([
                'user_id' => $author->id,
                'title' => $postData['title'],
                'slug' => $postData['slug'],
                'excerpt' => $postData['excerpt'],
                'content' => $postData['content'],
                'cover_image' => $postData['cover_image'],
                'status' => $postData['status'],
                'published_at' => $postData['published_at'],
                'featured' => $postData['featured'],
            ]);
            
            // Asignar categorías
            $categoryIds = Category::whereIn('slug', $postData['categories'])->pluck('id');
            $post->categories()->attach($categoryIds);
            
            // Asignar tags
            $tagIds = Tag::whereIn('slug', $postData['tags'])->pluck('id');
            $post->tags()->attach($tagIds);
        }
    }
}