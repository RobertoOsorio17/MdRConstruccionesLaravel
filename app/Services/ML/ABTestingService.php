<?php

namespace App\Services\ML;

use App\Models\MLInteractionLog;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * A/B Testing service for ML recommendation algorithms.
 * Enables controlled experiments to compare algorithm performance.
 */
class ABTestingService
{
    private const CACHE_PREFIX = 'ab_test:';

    /**
     * Create a new A/B test.
     */
    public function createTest(array $config): array
    {
        $testId = uniqid('test_', true);

        $test = [
            'id' => $testId,
            'name' => $config['name'],
            'description' => $config['description'] ?? '',
            'variants' => $config['variants'], // ['control' => [...], 'variant_a' => [...]]
            'traffic_split' => $config['traffic_split'] ?? $this->equalSplit(count($config['variants'])),
            'start_date' => $config['start_date'] ?? now()->toIso8601String(),
            'end_date' => $config['end_date'] ?? now()->addDays(14)->toIso8601String(),
            'status' => 'active',
            'metrics' => $config['metrics'] ?? ['ctr', 'engagement', 'conversion'],
            'created_at' => now()->toIso8601String()
        ];

        // Store test configuration
        Cache::put(self::CACHE_PREFIX . $testId, $test, now()->addDays(30));

        // Initialize metrics storage
        foreach (array_keys($test['variants']) as $variantId) {
            $this->initializeVariantMetrics($testId, $variantId);
        }

        Log::info("A/B test created", ['test_id' => $testId, 'name' => $test['name']]);

        return $test;
    }

    /**
     * Assign user to a test variant.
     */
    public function assignVariant(string $testId, string $userId): string
    {
        // Check if user already assigned
        $assignmentKey = self::CACHE_PREFIX . "assignment:{$testId}:{$userId}";
        $existing = Cache::get($assignmentKey);

        if ($existing) {
            return $existing;
        }

        $test = $this->getTest($testId);

        if (!$test || $test['status'] !== 'active') {
            return 'control';
        }

        // Assign based on traffic split
        $variant = $this->selectVariant($test['traffic_split'], $userId);

        // Store assignment
        Cache::put($assignmentKey, $variant, now()->addDays(30));

        // Track assignment
        $this->trackAssignment($testId, $variant);

        return $variant;
    }

    /**
     * Track event for A/B test.
     */
    public function trackEvent(string $testId, string $userId, string $event, array $data = []): void
    {
        $variant = $this->getUserVariant($testId, $userId);

        if (!$variant) {
            return;
        }

        $metricsKey = self::CACHE_PREFIX . "metrics:{$testId}:{$variant}";
        $metrics = Cache::get($metricsKey, [
            'impressions' => 0,
            'clicks' => 0,
            'conversions' => 0,
            'engagement_sum' => 0,
            'engagement_count' => 0,
            'events' => []
        ]);

        // Update metrics based on event type
        switch ($event) {
            case 'impression':
                $metrics['impressions']++;
                break;
            case 'click':
                $metrics['clicks']++;
                break;
            case 'conversion':
                $metrics['conversions']++;
                break;
            case 'engagement':
                $metrics['engagement_sum'] += $data['score'] ?? 0;
                $metrics['engagement_count']++;
                break;
        }

        // Store event details
        $metrics['events'][] = [
            'event' => $event,
            'user_id' => $userId,
            'data' => $data,
            'timestamp' => now()->toIso8601String()
        ];

        // Keep only last 1000 events
        if (count($metrics['events']) > 1000) {
            $metrics['events'] = array_slice($metrics['events'], -1000);
        }

        Cache::put($metricsKey, $metrics, now()->addDays(30));
    }

    /**
     * Get test results.
     */
    public function getResults(string $testId): array
    {
        $test = $this->getTest($testId);

        if (!$test) {
            return [];
        }

        $results = [
            'test_id' => $testId,
            'name' => $test['name'],
            'status' => $test['status'],
            'duration_days' => now()->diffInDays($test['start_date']),
            'variants' => []
        ];

        foreach (array_keys($test['variants']) as $variantId) {
            $metrics = $this->getVariantMetrics($testId, $variantId);
            
            $results['variants'][$variantId] = [
                'config' => $test['variants'][$variantId],
                'metrics' => [
                    'impressions' => $metrics['impressions'],
                    'clicks' => $metrics['clicks'],
                    'conversions' => $metrics['conversions'],
                    'ctr' => $this->calculateCTR($metrics),
                    'conversion_rate' => $this->calculateConversionRate($metrics),
                    'avg_engagement' => $this->calculateAvgEngagement($metrics)
                ],
                'statistical_significance' => null
            ];
        }

        // Calculate statistical significance
        if (count($results['variants']) >= 2) {
            $results = $this->calculateStatisticalSignificance($results);
        }

        return $results;
    }

    /**
     * Calculate statistical significance using Chi-square test.
     */
    private function calculateStatisticalSignificance(array $results): array
    {
        $variants = array_keys($results['variants']);
        
        if (count($variants) < 2) {
            return $results;
        }

        $control = $variants[0];
        
        foreach (array_slice($variants, 1) as $variant) {
            $controlMetrics = $results['variants'][$control]['metrics'];
            $variantMetrics = $results['variants'][$variant]['metrics'];

            // Chi-square test for CTR
            $chiSquare = $this->chiSquareTest(
                $controlMetrics['clicks'],
                $controlMetrics['impressions'],
                $variantMetrics['clicks'],
                $variantMetrics['impressions']
            );

            $results['variants'][$variant]['statistical_significance'] = [
                'chi_square' => $chiSquare['statistic'],
                'p_value' => $chiSquare['p_value'],
                'is_significant' => $chiSquare['p_value'] < 0.05,
                'confidence_level' => (1 - $chiSquare['p_value']) * 100
            ];

            // Calculate lift
            $controlCTR = $controlMetrics['ctr'];
            $variantCTR = $variantMetrics['ctr'];
            
            if ($controlCTR > 0) {
                $lift = (($variantCTR - $controlCTR) / $controlCTR) * 100;
                $results['variants'][$variant]['lift'] = round($lift, 2);
            }
        }

        return $results;
    }

    /**
     * Perform Chi-square test.
     */
    private function chiSquareTest(int $c1, int $n1, int $c2, int $n2): array
    {
        // Observed values
        $o11 = $c1;           // Control clicks
        $o12 = $n1 - $c1;     // Control non-clicks
        $o21 = $c2;           // Variant clicks
        $o22 = $n2 - $c2;     // Variant non-clicks

        // Expected values
        $total = $n1 + $n2;
        $totalClicks = $c1 + $c2;
        $totalNonClicks = ($n1 - $c1) + ($n2 - $c2);

        $e11 = ($n1 * $totalClicks) / $total;
        $e12 = ($n1 * $totalNonClicks) / $total;
        $e21 = ($n2 * $totalClicks) / $total;
        $e22 = ($n2 * $totalNonClicks) / $total;

        // Chi-square statistic
        $chiSquare = 0;
        
        if ($e11 > 0) $chiSquare += pow($o11 - $e11, 2) / $e11;
        if ($e12 > 0) $chiSquare += pow($o12 - $e12, 2) / $e12;
        if ($e21 > 0) $chiSquare += pow($o21 - $e21, 2) / $e21;
        if ($e22 > 0) $chiSquare += pow($o22 - $e22, 2) / $e22;

        // Calculate p-value (simplified - for df=1)
        $pValue = $this->chiSquarePValue($chiSquare, 1);

        return [
            'statistic' => $chiSquare,
            'p_value' => $pValue,
            'degrees_of_freedom' => 1
        ];
    }

    /**
     * Calculate p-value for chi-square distribution (simplified).
     */
    private function chiSquarePValue(float $chiSquare, int $df): float
    {
        // Simplified p-value calculation for df=1
        // For production, use a proper statistical library
        
        if ($chiSquare < 0.004) return 0.95;
        if ($chiSquare < 0.02) return 0.90;
        if ($chiSquare < 0.06) return 0.80;
        if ($chiSquare < 0.15) return 0.70;
        if ($chiSquare < 0.46) return 0.50;
        if ($chiSquare < 1.07) return 0.30;
        if ($chiSquare < 1.64) return 0.20;
        if ($chiSquare < 2.71) return 0.10;
        if ($chiSquare < 3.84) return 0.05;
        if ($chiSquare < 5.02) return 0.025;
        if ($chiSquare < 6.63) return 0.01;
        if ($chiSquare < 10.83) return 0.001;
        
        return 0.0001;
    }

    /**
     * Stop a test.
     */
    public function stopTest(string $testId): bool
    {
        $test = $this->getTest($testId);

        if (!$test) {
            return false;
        }

        $test['status'] = 'stopped';
        $test['stopped_at'] = now()->toIso8601String();

        Cache::put(self::CACHE_PREFIX . $testId, $test, now()->addDays(90));

        Log::info("A/B test stopped", ['test_id' => $testId]);

        return true;
    }

    /**
     * Get active tests.
     */
    public function getActiveTests(): array
    {
        // In production, store test IDs in a separate index
        // For now, return empty array
        return [];
    }

    /**
     * Helper methods
     */

    private function getTest(string $testId): ?array
    {
        return Cache::get(self::CACHE_PREFIX . $testId);
    }

    private function getUserVariant(string $testId, string $userId): ?string
    {
        $assignmentKey = self::CACHE_PREFIX . "assignment:{$testId}:{$userId}";
        return Cache::get($assignmentKey);
    }

    private function equalSplit(int $numVariants): array
    {
        $split = [];
        $percentage = 100 / $numVariants;
        
        for ($i = 0; $i < $numVariants; $i++) {
            $split[] = $percentage;
        }

        return $split;
    }

    private function selectVariant(array $trafficSplit, string $userId): string
    {
        $hash = crc32($userId);
        $percentage = ($hash % 100) + 1;

        $cumulative = 0;
        $variantKeys = array_keys($trafficSplit);

        foreach ($trafficSplit as $i => $split) {
            $cumulative += $split;
            if ($percentage <= $cumulative) {
                return $variantKeys[$i];
            }
        }

        return $variantKeys[0];
    }

    private function initializeVariantMetrics(string $testId, string $variantId): void
    {
        $metricsKey = self::CACHE_PREFIX . "metrics:{$testId}:{$variantId}";
        
        Cache::put($metricsKey, [
            'impressions' => 0,
            'clicks' => 0,
            'conversions' => 0,
            'engagement_sum' => 0,
            'engagement_count' => 0,
            'events' => []
        ], now()->addDays(30));
    }

    private function trackAssignment(string $testId, string $variant): void
    {
        $assignmentKey = self::CACHE_PREFIX . "assignments:{$testId}:{$variant}";
        Cache::increment($assignmentKey, 1);
        Cache::put($assignmentKey, Cache::get($assignmentKey, 0), now()->addDays(30));
    }

    private function getVariantMetrics(string $testId, string $variantId): array
    {
        $metricsKey = self::CACHE_PREFIX . "metrics:{$testId}:{$variantId}";
        return Cache::get($metricsKey, [
            'impressions' => 0,
            'clicks' => 0,
            'conversions' => 0,
            'engagement_sum' => 0,
            'engagement_count' => 0
        ]);
    }

    private function calculateCTR(array $metrics): float
    {
        return $metrics['impressions'] > 0 
            ? $metrics['clicks'] / $metrics['impressions'] 
            : 0;
    }

    private function calculateConversionRate(array $metrics): float
    {
        return $metrics['clicks'] > 0 
            ? $metrics['conversions'] / $metrics['clicks'] 
            : 0;
    }

    private function calculateAvgEngagement(array $metrics): float
    {
        return $metrics['engagement_count'] > 0 
            ? $metrics['engagement_sum'] / $metrics['engagement_count'] 
            : 0;
    }
}

