<?php

namespace App\Console\Commands;

use App\Models\Post;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

/**
 * Console command that regenerates missing or empty slugs for posts.
 */
class FixPostSlugs extends Command
{
    /**
     * The console command signature.
     *
     * @var string
     */
    protected $signature = 'blog:fix-slugs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix missing slugs for blog posts';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking and repairing post slugs...');
        
        $posts = Post::whereNull('slug')->orWhere('slug', '')->get();
        
        if ($posts->count() === 0) {
            $this->info('All posts already have valid slugs.');
            
            // Display the current post listing for verification.
            $allPosts = Post::all(['id', 'title', 'slug']);
            $this->table(['ID', 'Title', 'Slug'], $allPosts->map(function ($post) {
                return [$post->id, $post->title, $post->slug];
            }));
            
            return 0;
        }
        
        $this->info("Found {$posts->count()} posts without a slug.");
        
        foreach ($posts as $post) {
            $slug = Str::slug($post->title);
            
            // Ensure the slug is unique before applying it.
            $originalSlug = $slug;
            $counter = 1;
            while (Post::where('slug', $slug)->where('id', '!=', $post->id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            
            $post->update(['slug' => $slug]);
            $this->info("Post '{$post->title}' -> slug: '{$slug}'");
        }
        
        $this->info('Slugs repaired successfully!');
        
        // Display the complete post list with refreshed slugs.
        $allPosts = Post::all(['id', 'title', 'slug']);
        $this->table(['ID', 'Title', 'Slug'], $allPosts->map(function ($post) {
            return [$post->id, $post->title, $post->slug];
        }));
        
        return 0;
    }
}
