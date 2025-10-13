<?php

namespace App\Services;

use App\Models\MLInteractionLog;
use App\Models\MLUserProfile;
use App\Models\Post;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Service for evaluating ML recommendation system performance.
 * Calculates precision, recall, NDCG, and other quality metrics.
 */
class MLMetricsService
{
    /**
     * Calculate Precision@K for recommendations.
     * Measures what proportion of recommended items were relevant.
     */
    public function calculatePrecisionAtK(int $k = 10, int $days = 7): float
    {
        $recommendationClicks = MLInteractionLog::where('interaction_type', 'recommendation_click')
            ->where('created_at', '>=', now()->subDays($days))
            ->whereNotNull('recommendation_position')
            ->where('recommendation_position', '<=', $k)
            ->get();

        if ($recommendationClicks->isEmpty()) {
            return 0.0;
        }

        // Count how many recommendations led to positive engagement
        $relevantCount = $recommendationClicks->filter(function($log) {
            return $log->engagement_score > 0.5 || $log->completed_reading;
        })->count();

        return $relevantCount / $recommendationClicks->count();
    }

    /**
     * Calculate Recall@K for recommendations.
     * Measures what proportion of relevant items were recommended.
     */
    public function calculateRecallAtK(int $k = 10, int $days = 7): float
    {
        // Get all posts user engaged with
        $engagedPosts = MLInteractionLog::where('created_at', '>=', now()->subDays($days))
            ->where('engagement_score', '>', 0.5)
            ->distinct('post_id')
            ->count('post_id');

        if ($engagedPosts == 0) {
            return 0.0;
        }

        // Get how many of those were from recommendations
        $recommendedEngaged = MLInteractionLog::where('interaction_type', 'recommendation_click')
            ->where('created_at', '>=', now()->subDays($days))
            ->where('recommendation_position', '<=', $k)
            ->where('engagement_score', '>', 0.5)
            ->distinct('post_id')
            ->count('post_id');

        return $recommendedEngaged / $engagedPosts;
    }

    /**
     * Calculate F1 Score (harmonic mean of precision and recall).
     */
    public function calculateF1Score(int $k = 10, int $days = 7): float
    {
        $precision = $this->calculatePrecisionAtK($k, $days);
        $recall = $this->calculateRecallAtK($k, $days);

        if ($precision + $recall == 0) {
            return 0.0;
        }

        return 2 * ($precision * $recall) / ($precision + $recall);
    }

    /**
     * Calculate Normalized Discounted Cumulative Gain (NDCG@K).
     * Measures ranking quality of recommendations.
     */
    public function calculateNDCGAtK(int $k = 10, int $days = 7): float
    {
        $sessions = MLInteractionLog::where('interaction_type', 'recommendation_click')
            ->where('created_at', '>=', now()->subDays($days))
            ->whereNotNull('recommendation_position')
            ->where('recommendation_position', '<=', $k)
            ->select('session_id')
            ->distinct()
            ->pluck('session_id');

        if ($sessions->isEmpty()) {
            return 0.0;
        }

        $ndcgScores = [];

        foreach ($sessions as $sessionId) {
            $recommendations = MLInteractionLog::where('session_id', $sessionId)
                ->where('interaction_type', 'recommendation_click')
                ->where('recommendation_position', '<=', $k)
                ->orderBy('recommendation_position')
                ->get();

            if ($recommendations->isEmpty()) {
                continue;
            }

            // Calculate DCG
            $dcg = 0;
            foreach ($recommendations as $rec) {
                $relevance = $this->getRelevanceScore($rec);
                $position = $rec->recommendation_position;
                $dcg += $relevance / log($position + 1, 2);
            }

            // Calculate IDCG (ideal DCG)
            $relevanceScores = $recommendations->map(fn($rec) => $this->getRelevanceScore($rec))
                ->sortDesc()
                ->values();
            
            $idcg = 0;
            foreach ($relevanceScores as $position => $relevance) {
                $idcg += $relevance / log($position + 2, 2);
            }

            if ($idcg > 0) {
                $ndcgScores[] = $dcg / $idcg;
            }
        }

        return !empty($ndcgScores) ? array_sum($ndcgScores) / count($ndcgScores) : 0.0;
    }

    /**
     * Get relevance score for a recommendation interaction.
     */
    private function getRelevanceScore(MLInteractionLog $log): float
    {
        $score = 0;

        // Base score from engagement
        $score += $log->engagement_score ?? 0;

        // Bonus for completed reading
        if ($log->completed_reading) {
            $score += 1.0;
        }

        // Bonus for high scroll percentage
        if ($log->scroll_percentage > 80) {
            $score += 0.5;
        }

        // Bonus for time spent
        if ($log->time_spent_seconds > 120) {
            $score += 0.5;
        }

        return min($score, 5.0); // Cap at 5.0
    }

    /**
     * Calculate Click-Through Rate (CTR) for recommendations.
     */
    public function calculateCTR(int $days = 7): float
    {
        $totalRecommendations = MLInteractionLog::where('recommendation_source', '!=', null)
            ->where('created_at', '>=', now()->subDays($days))
            ->count();

        if ($totalRecommendations == 0) {
            return 0.0;
        }

        $clicks = MLInteractionLog::where('interaction_type', 'recommendation_click')
            ->where('created_at', '>=', now()->subDays($days))
            ->count();

        return $clicks / $totalRecommendations;
    }

    /**
     * Calculate average engagement score for recommendations.
     */
    public function calculateAverageEngagement(int $days = 7): float
    {
        return MLInteractionLog::where('interaction_type', 'recommendation_click')
            ->where('created_at', '>=', now()->subDays($days))
            ->avg('engagement_score') ?? 0.0;
    }

    /**
     * Calculate diversity of recommendations (how many unique posts recommended).
     */
    public function calculateDiversity(int $days = 7): float
    {
        $totalRecommendations = MLInteractionLog::where('interaction_type', 'recommendation_click')
            ->where('created_at', '>=', now()->subDays($days))
            ->count();

        if ($totalRecommendations == 0) {
            return 0.0;
        }

        $uniquePosts = MLInteractionLog::where('interaction_type', 'recommendation_click')
            ->where('created_at', '>=', now()->subDays($days))
            ->distinct('post_id')
            ->count('post_id');

        return $uniquePosts / $totalRecommendations;
    }

    /**
     * Calculate coverage (what % of catalog is being recommended).
     */
    public function calculateCoverage(int $days = 7): float
    {
        $totalPosts = Post::published()->count();

        if ($totalPosts == 0) {
            return 0.0;
        }

        $recommendedPosts = MLInteractionLog::where('interaction_type', 'recommendation_click')
            ->where('created_at', '>=', now()->subDays($days))
            ->distinct('post_id')
            ->count('post_id');

        return $recommendedPosts / $totalPosts;
    }

    /**
     * Get comprehensive metrics report.
     */
    public function getMetricsReport(int $k = 10, int $days = 7): array
    {
        return Cache::remember("ml_metrics_report_{$k}_{$days}", 300, function() use ($k, $days) {
            return [
                'precision_at_k' => round($this->calculatePrecisionAtK($k, $days), 4),
                'recall_at_k' => round($this->calculateRecallAtK($k, $days), 4),
                'f1_score' => round($this->calculateF1Score($k, $days), 4),
                'ndcg_at_k' => round($this->calculateNDCGAtK($k, $days), 4),
                'ctr' => round($this->calculateCTR($days), 4),
                'avg_engagement' => round($this->calculateAverageEngagement($days), 4),
                'diversity' => round($this->calculateDiversity($days), 4),
                'coverage' => round($this->calculateCoverage($days), 4),
                'k' => $k,
                'days' => $days,
                'generated_at' => now()->toISOString()
            ];
        });
    }

    /**
     * Get performance by recommendation source.
     */
    public function getPerformanceBySource(int $days = 7): array
    {
        $sources = MLInteractionLog::where('interaction_type', 'recommendation_click')
            ->where('created_at', '>=', now()->subDays($days))
            ->whereNotNull('recommendation_source')
            ->select('recommendation_source')
            ->distinct()
            ->pluck('recommendation_source');

        $performance = [];

        foreach ($sources as $source) {
            $logs = MLInteractionLog::where('recommendation_source', $source)
                ->where('created_at', '>=', now()->subDays($days))
                ->get();

            $performance[$source] = [
                'total_recommendations' => $logs->count(),
                'avg_engagement' => round($logs->avg('engagement_score') ?? 0, 4),
                'completion_rate' => round($logs->where('completed_reading', true)->count() / max($logs->count(), 1), 4),
                'avg_time_spent' => round($logs->avg('time_spent_seconds') ?? 0, 2)
            ];
        }

        return $performance;
    }

    /**
     * Get A/B test results comparing different algorithm versions.
     */
    public function getABTestResults(string $variantA, string $variantB, int $days = 7): array
    {
        $resultsA = MLInteractionLog::where('recommendation_source', $variantA)
            ->where('created_at', '>=', now()->subDays($days))
            ->get();

        $resultsB = MLInteractionLog::where('recommendation_source', $variantB)
            ->where('created_at', '>=', now()->subDays($days))
            ->get();

        return [
            'variant_a' => [
                'name' => $variantA,
                'sample_size' => $resultsA->count(),
                'avg_engagement' => round($resultsA->avg('engagement_score') ?? 0, 4),
                'completion_rate' => round($resultsA->where('completed_reading', true)->count() / max($resultsA->count(), 1), 4)
            ],
            'variant_b' => [
                'name' => $variantB,
                'sample_size' => $resultsB->count(),
                'avg_engagement' => round($resultsB->avg('engagement_score') ?? 0, 4),
                'completion_rate' => round($resultsB->where('completed_reading', true)->count() / max($resultsB->count(), 1), 4)
            ],
            'winner' => $this->determineWinner($resultsA, $resultsB)
        ];
    }

    /**
     * Determine winner in A/B test.
     */
    private function determineWinner($resultsA, $resultsB): string
    {
        $scoreA = ($resultsA->avg('engagement_score') ?? 0) * 0.7 + 
                  ($resultsA->where('completed_reading', true)->count() / max($resultsA->count(), 1)) * 0.3;
        
        $scoreB = ($resultsB->avg('engagement_score') ?? 0) * 0.7 + 
                  ($resultsB->where('completed_reading', true)->count() / max($resultsB->count(), 1)) * 0.3;

        if (abs($scoreA - $scoreB) < 0.05) {
            return 'tie';
        }

        return $scoreA > $scoreB ? 'variant_a' : 'variant_b';
    }
}

