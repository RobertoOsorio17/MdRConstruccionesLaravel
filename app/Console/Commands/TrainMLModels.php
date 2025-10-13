<?php

namespace App\Console\Commands;

use App\Services\ContentAnalysisServiceV2;
use App\Services\MLUserProfileService;
use Illuminate\Console\Command;

/**
 * Artisan command to train ML models and update user profiles.
 * Can be scheduled to run daily for continuous model improvement.
 */
class TrainMLModels extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ml:train 
                            {--posts : Only analyze posts}
                            {--profiles : Only update user profiles}
                            {--clear-cache : Clear ML caches after training}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Train ML models by analyzing posts and updating user profiles';

    private ContentAnalysisServiceV2 $contentAnalysis;
    private MLUserProfileService $profileService;

    /**
     * Create a new command instance.
     */
    public function __construct(
        ContentAnalysisServiceV2 $contentAnalysis,
        MLUserProfileService $profileService
    ) {
        parent::__construct();
        $this->contentAnalysis = $contentAnalysis;
        $this->profileService = $profileService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🤖 Starting ML model training...');
        $this->newLine();

        $postsOnly = $this->option('posts');
        $profilesOnly = $this->option('profiles');
        $clearCache = $this->option('clear-cache');

        $stats = [
            'posts_analyzed' => 0,
            'profiles_updated' => 0,
            'duration' => 0
        ];

        $startTime = microtime(true);

        try {
            // Analyze posts
            if (!$profilesOnly) {
                $this->info('📊 Analyzing posts and generating vectors...');
                $bar = $this->output->createProgressBar(100);
                $bar->start();

                $stats['posts_analyzed'] = $this->contentAnalysis->analyzeAllPosts();
                
                $bar->finish();
                $this->newLine();
                $this->info("✅ Analyzed {$stats['posts_analyzed']} posts");
                $this->newLine();
            }

            // Update user profiles
            if (!$postsOnly) {
                $this->info('👥 Updating user profiles...');
                $bar = $this->output->createProgressBar(100);
                $bar->start();

                $stats['profiles_updated'] = $this->profileService->updateAllProfiles();
                
                $bar->finish();
                $this->newLine();
                $this->info("✅ Updated {$stats['profiles_updated']} user profiles");
                $this->newLine();
            }

            // Clear caches if requested
            if ($clearCache) {
                $this->info('🗑️  Clearing ML caches...');
                $this->contentAnalysis->clearCaches();
                $this->info('✅ Caches cleared');
                $this->newLine();
            }

            $stats['duration'] = round(microtime(true) - $startTime, 2);

            $this->displaySummary($stats);

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Error during ML training: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return Command::FAILURE;
        }
    }

    /**
     * Display training summary.
     */
    private function displaySummary(array $stats): void
    {
        $this->newLine();
        $this->info('═══════════════════════════════════════');
        $this->info('           TRAINING SUMMARY            ');
        $this->info('═══════════════════════════════════════');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Posts Analyzed', $stats['posts_analyzed']],
                ['Profiles Updated', $stats['profiles_updated']],
                ['Duration', $stats['duration'] . ' seconds'],
                ['Completed At', now()->format('Y-m-d H:i:s')]
            ]
        );
        $this->info('═══════════════════════════════════════');
        $this->newLine();
        $this->info('✨ ML training completed successfully!');
    }
}

