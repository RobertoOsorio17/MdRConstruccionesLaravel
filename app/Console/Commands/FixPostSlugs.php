<?php

namespace App\Console\Commands;

use App\Models\Post;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

/**
 * Repairs missing or duplicate post slugs by regenerating unique values via Artisan.
 * Helpful when imported data or manual edits leave records without SEO-friendly identifiers.
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
     * ✅ FIX: Use chunking to avoid loading entire table into memory
     */
    public function handle()
    {
        $this->info('Checking and repairing post slugs...');

        // ✅ FIX: Count instead of loading all posts
        $postsWithoutSlugCount = Post::whereNull('slug')->orWhere('slug', '')->count();

        if ($postsWithoutSlugCount === 0) {
            $this->info('All posts already have valid slugs.');

            // ✅ FIX: Use chunk() to display posts without loading all at once
            $this->info('Displaying posts (chunked for memory efficiency)...');
            $displayData = [];

            Post::select(['id', 'title', 'slug'])
                ->orderBy('id')
                ->chunk(100, function ($posts) use (&$displayData) {
                    foreach ($posts as $post) {
                        $displayData[] = [$post->id, $post->title, $post->slug];
                    }
                });

            $this->table(['ID', 'Title', 'Slug'], $displayData);

            return 0;
        }

        $this->info("Found {$postsWithoutSlugCount} posts without a slug.");

        // ✅ FIX: Process posts in chunks to avoid memory issues
        $processedCount = 0;

        Post::whereNull('slug')
            ->orWhere('slug', '')
            ->chunk(50, function ($posts) use (&$processedCount) {
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
                    $processedCount++;
                }
            });

        $this->info("Slugs repaired successfully! Processed {$processedCount} posts.");

        // ✅ FIX: Use chunk() to display final results
        $this->info('Displaying updated posts (chunked for memory efficiency)...');
        $displayData = [];

        Post::select(['id', 'title', 'slug'])
            ->orderBy('id')
            ->chunk(100, function ($posts) use (&$displayData) {
                foreach ($posts as $post) {
                    $displayData[] = [$post->id, $post->title, $post->slug];
                }
            });

        $this->table(['ID', 'Title', 'Slug'], $displayData);

        return 0;
    }
}
