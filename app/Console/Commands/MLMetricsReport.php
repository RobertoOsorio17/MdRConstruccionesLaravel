<?php

namespace App\Console\Commands;

use App\Services\MLMetricsService;
use Illuminate\Console\Command;

/**
 * Artisan command to generate ML recommendation system metrics report.
 */
class MLMetricsReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ml:metrics 
                            {--k=10 : Number of recommendations to evaluate}
                            {--days=7 : Number of days to analyze}
                            {--export : Export report to file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate ML recommendation system performance metrics report';

    private MLMetricsService $metricsService;

    /**
     * Create a new command instance.
     */
    public function __construct(MLMetricsService $metricsService)
    {
        parent::__construct();
        $this->metricsService = $metricsService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $k = (int) $this->option('k');
        $days = (int) $this->option('days');
        $export = $this->option('export');

        $this->info("📊 Generating ML Metrics Report (K={$k}, Days={$days})...");
        $this->newLine();

        try {
            // Get comprehensive metrics
            $report = $this->metricsService->getMetricsReport($k, $days);
            $performanceBySource = $this->metricsService->getPerformanceBySource($days);

            // Display main metrics
            $this->displayMainMetrics($report);
            $this->newLine();

            // Display performance by source
            $this->displayPerformanceBySource($performanceBySource);
            $this->newLine();

            // Export if requested
            if ($export) {
                $this->exportReport($report, $performanceBySource);
            }

            $this->info('✨ Metrics report generated successfully!');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Error generating metrics: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Display main metrics table.
     */
    private function displayMainMetrics(array $report): void
    {
        $this->info('═══════════════════════════════════════');
        $this->info('        RECOMMENDATION METRICS         ');
        $this->info('═══════════════════════════════════════');
        
        $this->table(
            ['Metric', 'Value', 'Interpretation'],
            [
                [
                    'Precision@' . $report['k'],
                    $this->formatPercentage($report['precision_at_k']),
                    $this->interpretPrecision($report['precision_at_k'])
                ],
                [
                    'Recall@' . $report['k'],
                    $this->formatPercentage($report['recall_at_k']),
                    $this->interpretRecall($report['recall_at_k'])
                ],
                [
                    'F1 Score',
                    $this->formatPercentage($report['f1_score']),
                    $this->interpretF1($report['f1_score'])
                ],
                [
                    'NDCG@' . $report['k'],
                    $this->formatPercentage($report['ndcg_at_k']),
                    $this->interpretNDCG($report['ndcg_at_k'])
                ],
                [
                    'Click-Through Rate',
                    $this->formatPercentage($report['ctr']),
                    $this->interpretCTR($report['ctr'])
                ],
                [
                    'Avg Engagement',
                    round($report['avg_engagement'], 3),
                    $this->interpretEngagement($report['avg_engagement'])
                ],
                [
                    'Diversity',
                    $this->formatPercentage($report['diversity']),
                    $this->interpretDiversity($report['diversity'])
                ],
                [
                    'Coverage',
                    $this->formatPercentage($report['coverage']),
                    $this->interpretCoverage($report['coverage'])
                ]
            ]
        );
    }

    /**
     * Display performance by source table.
     */
    private function displayPerformanceBySource(array $performance): void
    {
        if (empty($performance)) {
            $this->warn('No performance data by source available.');
            return;
        }

        $this->info('═══════════════════════════════════════');
        $this->info('      PERFORMANCE BY SOURCE            ');
        $this->info('═══════════════════════════════════════');

        $rows = [];
        foreach ($performance as $source => $metrics) {
            $rows[] = [
                $source,
                $metrics['total_recommendations'],
                round($metrics['avg_engagement'], 3),
                $this->formatPercentage($metrics['completion_rate']),
                round($metrics['avg_time_spent'], 1) . 's'
            ];
        }

        $this->table(
            ['Source', 'Total Recs', 'Avg Engagement', 'Completion Rate', 'Avg Time'],
            $rows
        );
    }

    /**
     * Export report to JSON file.
     */
    private function exportReport(array $report, array $performanceBySource): void
    {
        $filename = storage_path('logs/ml_metrics_' . now()->format('Y-m-d_His') . '.json');
        
        $data = [
            'report' => $report,
            'performance_by_source' => $performanceBySource,
            'generated_at' => now()->toISOString()
        ];

        file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));
        
        $this->info("📄 Report exported to: {$filename}");
    }

    /**
     * Format value as percentage.
     */
    private function formatPercentage(float $value): string
    {
        return round($value * 100, 2) . '%';
    }

    /**
     * Interpret precision score.
     */
    private function interpretPrecision(float $value): string
    {
        if ($value >= 0.7) return '🟢 Excellent';
        if ($value >= 0.5) return '🟡 Good';
        if ($value >= 0.3) return '🟠 Fair';
        return '🔴 Needs Improvement';
    }

    /**
     * Interpret recall score.
     */
    private function interpretRecall(float $value): string
    {
        if ($value >= 0.6) return '🟢 Excellent';
        if ($value >= 0.4) return '🟡 Good';
        if ($value >= 0.2) return '🟠 Fair';
        return '🔴 Needs Improvement';
    }

    /**
     * Interpret F1 score.
     */
    private function interpretF1(float $value): string
    {
        if ($value >= 0.6) return '🟢 Excellent';
        if ($value >= 0.4) return '🟡 Good';
        if ($value >= 0.2) return '🟠 Fair';
        return '🔴 Needs Improvement';
    }

    /**
     * Interpret NDCG score.
     */
    private function interpretNDCG(float $value): string
    {
        if ($value >= 0.8) return '🟢 Excellent';
        if ($value >= 0.6) return '🟡 Good';
        if ($value >= 0.4) return '🟠 Fair';
        return '🔴 Needs Improvement';
    }

    /**
     * Interpret CTR.
     */
    private function interpretCTR(float $value): string
    {
        if ($value >= 0.1) return '🟢 Excellent';
        if ($value >= 0.05) return '🟡 Good';
        if ($value >= 0.02) return '🟠 Fair';
        return '🔴 Needs Improvement';
    }

    /**
     * Interpret engagement score.
     */
    private function interpretEngagement(float $value): string
    {
        if ($value >= 0.7) return '🟢 High';
        if ($value >= 0.4) return '🟡 Medium';
        if ($value >= 0.2) return '🟠 Low';
        return '🔴 Very Low';
    }

    /**
     * Interpret diversity score.
     */
    private function interpretDiversity(float $value): string
    {
        if ($value >= 0.7) return '🟢 High Diversity';
        if ($value >= 0.5) return '🟡 Good Diversity';
        if ($value >= 0.3) return '🟠 Low Diversity';
        return '🔴 Very Low Diversity';
    }

    /**
     * Interpret coverage score.
     */
    private function interpretCoverage(float $value): string
    {
        if ($value >= 0.5) return '🟢 Excellent Coverage';
        if ($value >= 0.3) return '🟡 Good Coverage';
        if ($value >= 0.1) return '🟠 Fair Coverage';
        return '🔴 Poor Coverage';
    }
}

