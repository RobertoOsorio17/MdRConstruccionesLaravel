<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Post;
use App\Models\Category;
use App\Models\User;
use App\Models\Comment;

/**
 * Aggregates key metrics about the blog and outputs them in a friendly status report via Artisan.
 * Useful for quick health checks during deployments or maintenance windows.
 */
class BlogStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'blog:status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Show current blog status and statistics';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('ðŸ—ï¸  MDR Construcciones - Blog Status');
        $this->newLine();

        try {
            // Database connection info
            $connection = config('database.default');
            $this->info("ðŸ“Š Database: " . ucfirst($connection));
            
            // Posts statistics
            $totalPosts = Post::count();
            $publishedPosts = Post::published()->count();
            $featuredPosts = Post::featured()->count();
            $draftPosts = Post::where('status', 'draft')->count();
            
            $this->info("ðŸ“ Posts Statistics:");
            $this->line("   Total Posts: {$totalPosts}");
            $this->line("   Published: {$publishedPosts}");
            $this->line("   Featured: {$featuredPosts}");
            $this->line("   Drafts: {$draftPosts}");
            
            // Categories
            $activeCategories = Category::active()->count();
            $totalCategories = Category::count();
            
            $this->info("ðŸ·ï¸  Categories:");
            $this->line("   Active: {$activeCategories}");
            $this->line("   Total: {$totalCategories}");
            
            // Users
            $totalUsers = User::count();
            $this->info("ðŸ‘¥ Users: {$totalUsers}");
            
            // Comments (if exist)
            if (class_exists('App\Models\Comment')) {
                $totalComments = Comment::count();
                $approvedComments = Comment::where('status', 'approved')->count();
                $this->info("ðŸ’¬ Comments:");
                $this->line("   Total: {$totalComments}");
                $this->line("   Approved: {$approvedComments}");
            }
            
            $this->newLine();
            
            // Recent posts
            $recentPosts = Post::published()->latest()->take(3)->get(['title', 'status', 'published_at']);
            $this->info("ðŸ“š Recent Published Posts:");
            foreach ($recentPosts as $post) {
                $this->line("   â€¢ {$post->title}");
            }
            
            $this->newLine();
            $this->info("âœ… Blog is operational!");
            $this->info("ðŸŒ Visit: http://localhost:5175/blog");
            
        } catch (\Exception $e) {
            $this->error("âŒ Error: " . $e->getMessage());
            return Command::FAILURE;
        }
        
        return Command::SUCCESS;
    }
}
