<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Jobs\GenerateBatchRecommendationsJob;
use App\Helpers\MLSettingsHelper;
use Illuminate\Console\Command;

class GenerateBatchRecommendations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ml:generate-batch-recommendations 
                            {--users= : Comma-separated list of user IDs}
                            {--all : Generate for all active users}
                            {--limit=100 : Maximum number of users to process}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate recommendations in batch for multiple users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $performanceConfig = MLSettingsHelper::getPerformanceConfig();
        $batchSize = $performanceConfig['batch_size'];

        if ($this->option('users')) {
            // Process specific users
            $userIds = array_map('intval', explode(',', $this->option('users')));
            $this->info("Processing " . count($userIds) . " specific users...");
        } elseif ($this->option('all')) {
            // Process all active users
            $limit = (int) $this->option('limit');
            $userIds = User::where('status', 'active')
                ->limit($limit)
                ->pluck('id')
                ->toArray();
            $this->info("Processing {$limit} active users...");
        } else {
            $this->error('Please specify --users or --all option.');
            return 1;
        }

        if (empty($userIds)) {
            $this->warn('No users to process.');
            return 0;
        }

        // Split into batches
        $batches = array_chunk($userIds, $batchSize);
        
        $this->info("Splitting into " . count($batches) . " batches of {$batchSize} users each...");

        $bar = $this->output->createProgressBar(count($batches));
        $bar->start();

        foreach ($batches as $batch) {
            if ($performanceConfig['enable_queue_jobs']) {
                // Dispatch to queue
                GenerateBatchRecommendationsJob::dispatch($batch);
            } else {
                // Process synchronously
                $this->warn('Queue jobs are disabled. This may take a while...');
                GenerateBatchRecommendationsJob::dispatchSync($batch);
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        if ($performanceConfig['enable_queue_jobs']) {
            $this->info('Batch jobs dispatched to queue successfully!');
        } else {
            $this->info('Batch processing completed!');
        }

        return 0;
    }
}

