<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Post;
use App\Models\Category;
use App\Models\User;
use App\Models\Comment;

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
        $this->info('🏗️  MDR Construcciones - Blog Status');
        $this->newLine();

        try {
            // Database connection info
            $connection = config('database.default');
            $this->info("📊 Database: " . ucfirst($connection));
            
            // Posts statistics
            $totalPosts = Post::count();
            $publishedPosts = Post::published()->count();
            $featuredPosts = Post::featured()->count();
            $draftPosts = Post::where('status', 'draft')->count();
            
            $this->info("📝 Posts Statistics:");
            $this->line("   Total Posts: {$totalPosts}");
            $this->line("   Published: {$publishedPosts}");
            $this->line("   Featured: {$featuredPosts}");
            $this->line("   Drafts: {$draftPosts}");
            
            // Categories
            $activeCategories = Category::active()->count();
            $totalCategories = Category::count();
            
            $this->info("🏷️  Categories:");
            $this->line("   Active: {$activeCategories}");
            $this->line("   Total: {$totalCategories}");
            
            // Users
            $totalUsers = User::count();
            $this->info("👥 Users: {$totalUsers}");
            
            // Comments (if exist)
            if (class_exists('App\Models\Comment')) {
                $totalComments = Comment::count();
                $approvedComments = Comment::where('status', 'approved')->count();
                $this->info("💬 Comments:");
                $this->line("   Total: {$totalComments}");
                $this->line("   Approved: {$approvedComments}");
            }
            
            $this->newLine();
            
            // Recent posts
            $recentPosts = Post::published()->latest()->take(3)->get(['title', 'status', 'published_at']);
            $this->info("📚 Recent Published Posts:");
            foreach ($recentPosts as $post) {
                $this->line("   • {$post->title}");
            }
            
            $this->newLine();
            $this->info("✅ Blog is operational!");
            $this->info("🌐 Visit: http://localhost:5175/blog");
            
        } catch (\Exception $e) {
            $this->error("❌ Error: " . $e->getMessage());
            return Command::FAILURE;
        }
        
        return Command::SUCCESS;
    }
}