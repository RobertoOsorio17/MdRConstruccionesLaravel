<?php

namespace App\Console\Commands;

use App\Services\CacheService;
use Illuminate\Console\Command;

class CacheWarmUp extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:warm-up 
                            {--force : Force cache refresh even if already cached}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Warm up application cache with frequently accessed data';

    /**
     * Execute the console command.
     */
    public function handle(CacheService $cacheService)
    {
        $this->info('🔥 Warming up application cache...');

        if ($this->option('force')) {
            $this->warn('⚠️  Force mode enabled - clearing existing cache first');
            $cacheService->invalidateAll();
        }

        $this->info('📊 Caching dashboard statistics...');
        $cacheService->getDashboardStats();

        $this->info('📝 Caching popular posts...');
        $cacheService->getPopularPosts(10);

        $this->info('🆕 Caching recent posts...');
        $cacheService->getRecentPosts(10);

        $this->info('⭐ Caching featured posts...');
        $cacheService->getFeaturedPosts(5);

        $this->info('📁 Caching active categories...');
        $cacheService->getActiveCategories();

        $this->newLine();
        $this->info('✅ Cache warm-up completed successfully!');
        
        // Display cache stats
        $stats = $cacheService->getCacheStats();
        $this->table(
            ['Setting', 'Value'],
            [
                ['Cache Driver', $stats['driver']],
                ['Cache Prefix', $stats['prefix'] ?? 'none'],
                ['Available Stores', implode(', ', $stats['stores'])],
            ]
        );

        return Command::SUCCESS;
    }
}

