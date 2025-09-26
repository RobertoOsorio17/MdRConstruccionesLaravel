<?php

namespace App\Console\Commands;

use App\Models\Post;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class FixPostSlugs extends Command
{
    protected $signature = 'blog:fix-slugs';
    protected $description = 'Fix missing slugs for blog posts';

    public function handle()
    {
        $this->info('Verificando y corrigiendo slugs de posts...');
        
        $posts = Post::whereNull('slug')->orWhere('slug', '')->get();
        
        if ($posts->count() === 0) {
            $this->info('Todos los posts ya tienen slugs válidos.');
            
            // Mostrar posts existentes
            $allPosts = Post::all(['id', 'title', 'slug']);
            $this->table(['ID', 'Título', 'Slug'], $allPosts->map(function ($post) {
                return [$post->id, $post->title, $post->slug];
            }));
            
            return 0;
        }
        
        $this->info("Encontrados {$posts->count()} posts sin slug.");
        
        foreach ($posts as $post) {
            $slug = Str::slug($post->title);
            
            // Asegurar unicidad
            $originalSlug = $slug;
            $counter = 1;
            while (Post::where('slug', $slug)->where('id', '!=', $post->id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            
            $post->update(['slug' => $slug]);
            $this->info("Post '{$post->title}' -> slug: '{$slug}'");
        }
        
        $this->success('Slugs corregidos exitosamente!');
        
        // Mostrar todos los posts
        $allPosts = Post::all(['id', 'title', 'slug']);
        $this->table(['ID', 'Título', 'Slug'], $allPosts->map(function ($post) {
            return [$post->id, $post->title, $post->slug];
        }));
        
        return 0;
    }
}