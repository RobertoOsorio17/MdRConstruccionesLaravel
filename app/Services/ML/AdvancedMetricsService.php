<?php

namespace App\Services\ML;

use App\Models\MLInteractionLog;
use App\Models\Post;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Advanced metrics service for ML recommendation evaluation.
 * Implements MAP, MRR, Novelty, Serendipity, and other sophisticated metrics.
 */
class AdvancedMetricsService
{
    /**
     * Calculate Mean Average Precision (MAP).
     * Measures ranking quality considering position.
     */
    public function calculateMAP(array $recommendations, array $relevant, int $k = 10): float
    {
        if (empty($relevant)) {
            return 0;
        }

        $precisions = [];
        $relevantCount = 0;

        foreach ($recommendations as $i => $recId) {
            if ($i >= $k) break;

            if (in_array($recId, $relevant)) {
                $relevantCount++;
                $precisions[] = $relevantCount / ($i + 1);
            }
        }

        return !empty($precisions) ? array_sum($precisions) / count($relevant) : 0;
    }

    /**
     * Calculate Mean Reciprocal Rank (MRR).
     * Measures position of first relevant item.
     */
    public function calculateMRR(array $recommendations, array $relevant): float
    {
        foreach ($recommendations as $i => $recId) {
            if (in_array($recId, $relevant)) {
                return 1 / ($i + 1);
            }
        }

        return 0;
    }

    /**
     * Calculate Normalized Discounted Cumulative Gain (NDCG).
     * Considers graded relevance and position.
     */
    public function calculateNDCG(array $recommendations, array $relevanceScores, int $k = 10): float
    {
        $dcg = $this->calculateDCG($recommendations, $relevanceScores, $k);
        $idcg = $this->calculateIDCG($relevanceScores, $k);

        return $idcg > 0 ? $dcg / $idcg : 0;
    }

    /**
     * Calculate Discounted Cumulative Gain (DCG).
     */
    private function calculateDCG(array $recommendations, array $relevanceScores, int $k): float
    {
        $dcg = 0;

        foreach ($recommendations as $i => $recId) {
            if ($i >= $k) break;

            $relevance = $relevanceScores[$recId] ?? 0;
            $discount = log($i + 2, 2); // log2(i + 2)
            $dcg += $relevance / $discount;
        }

        return $dcg;
    }

    /**
     * Calculate Ideal DCG (IDCG).
     */
    private function calculateIDCG(array $relevanceScores, int $k): float
    {
        // Sort relevance scores in descending order
        arsort($relevanceScores);
        $idealOrder = array_keys($relevanceScores);

        return $this->calculateDCG($idealOrder, $relevanceScores, $k);
    }

    /**
     * Calculate Hit Rate (Recall@K).
     * Percentage of users with at least one relevant item in top K.
     */
    public function calculateHitRate(array $userRecommendations, array $userRelevant, int $k = 10): float
    {
        $hits = 0;
        $totalUsers = count($userRecommendations);

        foreach ($userRecommendations as $userId => $recommendations) {
            $relevant = $userRelevant[$userId] ?? [];
            $topK = array_slice($recommendations, 0, $k);

            if (!empty(array_intersect($topK, $relevant))) {
                $hits++;
            }
        }

        return $totalUsers > 0 ? $hits / $totalUsers : 0;
    }

    /**
     * Calculate Coverage.
     * Percentage of items that appear in recommendations.
     */
    public function calculateCoverage(array $allRecommendations, int $totalItems): float
    {
        $recommendedItems = [];

        foreach ($allRecommendations as $recommendations) {
            foreach ($recommendations as $itemId) {
                $recommendedItems[$itemId] = true;
            }
        }

        return $totalItems > 0 ? count($recommendedItems) / $totalItems : 0;
    }

    /**
     * Calculate Diversity.
     * Average dissimilarity between recommended items.
     */
    public function calculateDiversity(array $recommendations, array $itemSimilarities): float
    {
        $n = count($recommendations);
        
        if ($n < 2) {
            return 0;
        }

        $totalDissimilarity = 0;
        $pairs = 0;

        for ($i = 0; $i < $n; $i++) {
            for ($j = $i + 1; $j < $n; $j++) {
                $itemA = $recommendations[$i];
                $itemB = $recommendations[$j];

                $similarity = $itemSimilarities[$itemA][$itemB] ?? 0;
                $dissimilarity = 1 - $similarity;

                $totalDissimilarity += $dissimilarity;
                $pairs++;
            }
        }

        return $pairs > 0 ? $totalDissimilarity / $pairs : 0;
    }

    /**
     * Calculate Novelty.
     * Average unexpectedness of recommendations.
     */
    public function calculateNovelty(array $recommendations, array $itemPopularity): float
    {
        if (empty($recommendations)) {
            return 0;
        }

        $totalNovelty = 0;

        foreach ($recommendations as $itemId) {
            $popularity = $itemPopularity[$itemId] ?? 0;
            
            // Novelty = -log2(popularity)
            // More popular items have lower novelty
            if ($popularity > 0) {
                $totalNovelty += -log($popularity, 2);
            }
        }

        return $totalNovelty / count($recommendations);
    }

    /**
     * Calculate Serendipity.
     * Unexpected but relevant recommendations.
     */
    public function calculateSerendipity(
        array $recommendations,
        array $relevant,
        array $expected,
        int $k = 10
    ): float {
        $serendipitousCount = 0;

        foreach ($recommendations as $i => $recId) {
            if ($i >= $k) break;

            // Serendipitous if relevant but not expected
            if (in_array($recId, $relevant) && !in_array($recId, $expected)) {
                $serendipitousCount++;
            }
        }

        return $k > 0 ? $serendipitousCount / $k : 0;
    }

    /**
     * Calculate Personalization.
     * How different recommendations are across users.
     */
    public function calculatePersonalization(array $userRecommendations): float
    {
        $users = array_keys($userRecommendations);
        $n = count($users);

        if ($n < 2) {
            return 0;
        }

        $totalDissimilarity = 0;
        $pairs = 0;

        for ($i = 0; $i < $n; $i++) {
            for ($j = $i + 1; $j < $n; $j++) {
                $recsA = $userRecommendations[$users[$i]];
                $recsB = $userRecommendations[$users[$j]];

                $intersection = count(array_intersect($recsA, $recsB));
                $union = count(array_unique(array_merge($recsA, $recsB)));

                $jaccard = $union > 0 ? $intersection / $union : 0;
                $dissimilarity = 1 - $jaccard;

                $totalDissimilarity += $dissimilarity;
                $pairs++;
            }
        }

        return $pairs > 0 ? $totalDissimilarity / $pairs : 0;
    }

    /**
     * Calculate Click-Through Rate (CTR).
     */
    public function calculateCTR(int $clicks, int $impressions): float
    {
        return $impressions > 0 ? $clicks / $impressions : 0;
    }

    /**
     * Calculate Conversion Rate.
     */
    public function calculateConversionRate(int $conversions, int $clicks): float
    {
        return $clicks > 0 ? $conversions / $clicks : 0;
    }

    /**
     * Calculate Average Session Duration.
     */
    public function calculateAvgSessionDuration(string $sessionId = null): float
    {
        $query = MLInteractionLog::whereNotNull('time_spent_seconds');

        if ($sessionId) {
            $query->where('session_id', $sessionId);
        }

        return $query->avg('time_spent_seconds') ?? 0;
    }

    /**
     * Calculate Engagement Score.
     * Composite metric of various engagement signals.
     */
    public function calculateEngagementScore(array $metrics): float
    {
        $weights = [
            'time_spent' => 0.3,
            'scroll_percentage' => 0.2,
            'completed_reading' => 0.2,
            'interactions' => 0.3
        ];

        $score = 0;

        // Normalize time spent (0-600 seconds -> 0-1)
        $timeScore = min(($metrics['time_spent'] ?? 0) / 600, 1);
        $score += $timeScore * $weights['time_spent'];

        // Scroll percentage (already 0-100, normalize to 0-1)
        $scrollScore = ($metrics['scroll_percentage'] ?? 0) / 100;
        $score += $scrollScore * $weights['scroll_percentage'];

        // Completed reading (boolean -> 0 or 1)
        $completedScore = $metrics['completed_reading'] ? 1 : 0;
        $score += $completedScore * $weights['completed_reading'];

        // Interactions (likes, comments, shares, bookmarks)
        $interactionCount = ($metrics['likes'] ?? 0) + 
                           ($metrics['comments'] ?? 0) + 
                           ($metrics['shares'] ?? 0) + 
                           ($metrics['bookmarks'] ?? 0);
        $interactionScore = min($interactionCount / 4, 1);
        $score += $interactionScore * $weights['interactions'];

        return $score;
    }

    /**
     * Calculate Retention Rate.
     * Percentage of users who return after first visit.
     */
    public function calculateRetentionRate(int $days = 7): float
    {
        $firstVisits = MLInteractionLog::select('session_id')
            ->where('created_at', '>=', now()->subDays($days * 2))
            ->where('created_at', '<', now()->subDays($days))
            ->distinct()
            ->count();

        $returnVisits = MLInteractionLog::select('session_id')
            ->where('created_at', '>=', now()->subDays($days))
            ->whereIn('session_id', function($query) use ($days) {
                $query->select('session_id')
                    ->from('ml_interaction_logs')
                    ->where('created_at', '>=', now()->subDays($days * 2))
                    ->where('created_at', '<', now()->subDays($days));
            })
            ->distinct()
            ->count();

        return $firstVisits > 0 ? $returnVisits / $firstVisits : 0;
    }

    /**
     * Calculate Churn Rate.
     */
    public function calculateChurnRate(int $days = 30): float
    {
        $activeUsers = MLInteractionLog::select('session_id')
            ->where('created_at', '>=', now()->subDays($days * 2))
            ->where('created_at', '<', now()->subDays($days))
            ->distinct()
            ->count();

        $churnedUsers = $activeUsers - MLInteractionLog::select('session_id')
            ->where('created_at', '>=', now()->subDays($days))
            ->whereIn('session_id', function($query) use ($days) {
                $query->select('session_id')
                    ->from('ml_interaction_logs')
                    ->where('created_at', '>=', now()->subDays($days * 2))
                    ->where('created_at', '<', now()->subDays($days));
            })
            ->distinct()
            ->count();

        return $activeUsers > 0 ? $churnedUsers / $activeUsers : 0;
    }

    /**
     * Calculate Time to First Interaction.
     * Average time from page load to first meaningful interaction.
     */
    public function calculateTimeToFirstInteraction(): float
    {
        return MLInteractionLog::whereNotNull('interaction_metadata->time_to_first_interaction')
            ->avg(DB::raw("CAST(interaction_metadata->>'$.time_to_first_interaction' AS DECIMAL(10,2))")) ?? 0;
    }

    /**
     * Calculate Bounce Rate.
     * Percentage of single-page sessions.
     */
    public function calculateBounceRate(): float
    {
        $totalSessions = MLInteractionLog::select('session_id')
            ->distinct()
            ->count();

        $bouncedSessions = MLInteractionLog::select('session_id')
            ->groupBy('session_id')
            ->havingRaw('COUNT(DISTINCT post_id) = 1')
            ->havingRaw('MAX(time_spent_seconds) < 30')
            ->get()
            ->count();

        return $totalSessions > 0 ? $bouncedSessions / $totalSessions : 0;
    }

    /**
     * Calculate Average Pages Per Session.
     */
    public function calculateAvgPagesPerSession(): float
    {
        $result = MLInteractionLog::select('session_id')
            ->selectRaw('COUNT(DISTINCT post_id) as page_count')
            ->groupBy('session_id')
            ->get();

        return $result->isNotEmpty() ? $result->avg('page_count') : 0;
    }

    /**
     * Calculate Recommendation Acceptance Rate.
     * Percentage of recommended items that were clicked.
     */
    public function calculateRecommendationAcceptanceRate(): float
    {
        $totalRecommendations = MLInteractionLog::whereNotNull('recommendation_source')
            ->count();

        $acceptedRecommendations = MLInteractionLog::whereNotNull('recommendation_source')
            ->where('interaction_type', 'recommendation_click')
            ->count();

        return $totalRecommendations > 0 ? $acceptedRecommendations / $totalRecommendations : 0;
    }

    /**
     * Calculate Category Distribution Entropy.
     * Measures diversity of content consumption.
     */
    public function calculateCategoryEntropy(string $sessionId = null): float
    {
        $query = MLInteractionLog::join('posts', 'ml_interaction_logs.post_id', '=', 'posts.id')
            ->select('posts.category_id', DB::raw('COUNT(*) as count'));

        if ($sessionId) {
            $query->where('ml_interaction_logs.session_id', $sessionId);
        }

        $distribution = $query->groupBy('posts.category_id')
            ->pluck('count', 'category_id')
            ->toArray();

        if (empty($distribution)) {
            return 0;
        }

        $total = array_sum($distribution);
        $entropy = 0;

        foreach ($distribution as $count) {
            $p = $count / $total;
            if ($p > 0) {
                $entropy -= $p * log($p, 2);
            }
        }

        return $entropy;
    }

    /**
     * Generate comprehensive metrics report.
     */
    public function generateMetricsReport(array $options = []): array
    {
        $days = $options['days'] ?? 30;
        $k = $options['k'] ?? 10;

        return [
            'period' => [
                'days' => $days,
                'start_date' => now()->subDays($days)->toDateString(),
                'end_date' => now()->toDateString()
            ],
            'engagement' => [
                'avg_session_duration' => round($this->calculateAvgSessionDuration(), 2),
                'avg_pages_per_session' => round($this->calculateAvgPagesPerSession(), 2),
                'bounce_rate' => round($this->calculateBounceRate(), 4),
                'category_entropy' => round($this->calculateCategoryEntropy(), 4)
            ],
            'retention' => [
                'retention_rate_7d' => round($this->calculateRetentionRate(7), 4),
                'retention_rate_30d' => round($this->calculateRetentionRate(30), 4),
                'churn_rate' => round($this->calculateChurnRate($days), 4)
            ],
            'recommendations' => [
                'acceptance_rate' => round($this->calculateRecommendationAcceptanceRate(), 4),
                'avg_position_clicked' => $this->calculateAvgRecommendationPosition()
            ],
            'generated_at' => now()->toIso8601String()
        ];
    }

    /**
     * Calculate average position of clicked recommendations.
     */
    private function calculateAvgRecommendationPosition(): float
    {
        return MLInteractionLog::whereNotNull('recommendation_position')
            ->where('interaction_type', 'recommendation_click')
            ->avg('recommendation_position') ?? 0;
    }

    /**
     * Calculate F1 Score.
     */
    public function calculateF1Score(float $precision, float $recall): float
    {
        if ($precision + $recall == 0) {
            return 0;
        }

        return 2 * ($precision * $recall) / ($precision + $recall);
    }

    /**
     * Calculate AUC-ROC (Area Under ROC Curve).
     * Simplified implementation for binary classification.
     */
    public function calculateAUC(array $predictions, array $labels): float
    {
        // Sort by prediction score descending
        $combined = [];
        foreach ($predictions as $i => $score) {
            $combined[] = ['score' => $score, 'label' => $labels[$i]];
        }

        usort($combined, fn($a, $b) => $b['score'] <=> $a['score']);

        $positives = array_sum($labels);
        $negatives = count($labels) - $positives;

        if ($positives == 0 || $negatives == 0) {
            return 0;
        }

        $auc = 0;
        $posCount = 0;

        foreach ($combined as $item) {
            if ($item['label'] == 1) {
                $posCount++;
            } else {
                $auc += $posCount;
            }
        }

        return $auc / ($positives * $negatives);
    }

    /**
     * Calculate Gini coefficient for recommendation fairness.
     */
    public function calculateGiniCoefficient(array $itemCounts): float
    {
        if (empty($itemCounts)) {
            return 0;
        }

        sort($itemCounts);
        $n = count($itemCounts);
        $sum = array_sum($itemCounts);

        if ($sum == 0) {
            return 0;
        }

        $gini = 0;
        for ($i = 0; $i < $n; $i++) {
            $gini += ($i + 1) * $itemCounts[$i];
        }

        $gini = (2 * $gini) / ($n * $sum) - ($n + 1) / $n;

        return $gini;
    }

    /**
     * Calculate Catalog Coverage Over Time.
     */
    public function calculateCatalogCoverageOverTime(int $days = 30): array
    {
        $coverage = [];

        for ($d = $days; $d >= 0; $d--) {
            $date = now()->subDays($d)->toDateString();

            $recommendedItems = MLInteractionLog::whereDate('created_at', $date)
                ->whereNotNull('recommendation_source')
                ->distinct('post_id')
                ->count();

            $totalItems = Post::published()
                ->whereDate('published_at', '<=', $date)
                ->count();

            $coverage[$date] = $totalItems > 0 ? $recommendedItems / $totalItems : 0;
        }

        return $coverage;
    }

    /**
     * Calculate User Satisfaction Score.
     * Based on multiple engagement signals.
     */
    public function calculateUserSatisfaction(string $sessionId): float
    {
        $interactions = MLInteractionLog::where('session_id', $sessionId)->get();

        if ($interactions->isEmpty()) {
            return 0;
        }

        $signals = [
            'avg_time_spent' => $interactions->avg('time_spent_seconds') / 600, // Normalize to 10 min
            'avg_scroll' => $interactions->avg('scroll_percentage') / 100,
            'completion_rate' => $interactions->where('completed_reading', true)->count() / $interactions->count(),
            'return_visits' => min($interactions->unique('created_at')->count() / 10, 1),
            'positive_interactions' => $interactions->whereIn('interaction_type', ['like', 'share', 'bookmark'])->count() / max($interactions->count(), 1)
        ];

        return array_sum($signals) / count($signals);
    }
}


