<?php

namespace App\Services;

use App\Models\Post;
use App\Models\MLPostVector;
use App\Models\MLUserProfile;
use App\Models\MLInteractionLog;
use App\Services\ML\MatrixFactorizationService;
use App\Services\ML\ExplainableAIService;
use App\Helpers\MLSettingsHelper;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Orchestrates the hybrid recommendation engine combining content-based, collaborative, and trending signals.
 * Generates personalized suggestions, caches results, and logs interactions for continuous model improvement.
 *
 * V2.0: Integrated with MatrixFactorizationService and ExplainableAIService
 */
class MLRecommendationService
{
    private ContentAnalysisService $contentAnalysis;
    private MatrixFactorizationService $matrixFactorization;
    private ExplainableAIService $explainableAI;

    public function __construct(
        ContentAnalysisService $contentAnalysis,
        MatrixFactorizationService $matrixFactorization,
        ExplainableAIService $explainableAI
    ) {
        $this->contentAnalysis = $contentAnalysis;
        $this->matrixFactorization = $matrixFactorization;
        $this->explainableAI = $explainableAI;
    }

    /**
     * Retrieve recommendations for a user or anonymous session.
     */
    public function getRecommendations(
        string $sessionId = null,
        int $userId = null,
        int $currentPostId = null,
        int $limit = null
    ): array {
        // Get settings
        $params = MLSettingsHelper::getRecommendationParams();
        $performanceConfig = MLSettingsHelper::getPerformanceConfig();

        // Use settings for limit and cache timeout
        $limit = $limit ?? $params['default_limit'];
        $cacheTimeout = $params['cache_timeout'];
        $cachingEnabled = $performanceConfig['enable_caching'];

        // ✅ FIXED: Improve cache key to include algorithm context
        $algorithmWeights = MLSettingsHelper::getAlgorithmWeights();
        $algorithmHash = md5(json_encode($algorithmWeights));
        $cacheKey = "ml_recommendations_{$userId}_{$sessionId}_{$currentPostId}_{$limit}_{$algorithmHash}";

        // Use cache only if enabled in settings
        if (!$cachingEnabled) {
            return $this->generateRecommendations($sessionId, $userId, $currentPostId, $limit);
        }

        // ✅ FIXED: Check if cache driver supports tagging before using tags
        try {
            // Try to use tags if supported (Redis, Memcached)
            return Cache::tags(['ml_recommendations'])->remember($cacheKey, $cacheTimeout, function() use ($sessionId, $userId, $currentPostId, $limit) {
                return $this->generateRecommendations($sessionId, $userId, $currentPostId, $limit);
            });
        } catch (\BadMethodCallException $e) {
            // Fallback to regular cache for drivers that don't support tags (file, database)
            return Cache::remember($cacheKey, $cacheTimeout, function() use ($sessionId, $userId, $currentPostId, $limit) {
                return $this->generateRecommendations($sessionId, $userId, $currentPostId, $limit);
            });
        }
    }

    /**
     * Generate recommendations (extracted for cache control)
     */
    private function generateRecommendations(
        string $sessionId = null,
        int $userId = null,
        int $currentPostId = null,
        int $limit = 10
    ): array {
        // Retrieve the user profile if it exists.
        $userProfile = MLUserProfile::findByIdentifier($sessionId, $userId);

        // Retrieve candidate posts.
        $candidatePosts = $this->getCandidatePosts($currentPostId);

        if ($candidatePosts->isEmpty()) {
            return [];
        }

        // Apply multiple recommendation strategies based on settings.
        $recommendations = [];

        // 1. Content-based filtering (if enabled).
        if (MLSettingsHelper::isAlgorithmEnabled('content_based')) {
            $contentBasedRecs = $this->getContentBasedRecommendations($currentPostId, $candidatePosts, $limit);
            $recommendations = array_merge($recommendations, $contentBasedRecs);
        }

        // 2. Collaborative filtering (when a user profile is present and enabled).
        if ($userProfile && MLSettingsHelper::isAlgorithmEnabled('collaborative')) {
            $collaborativeRecs = $this->getCollaborativeRecommendations($userProfile, $candidatePosts, $limit);
            $recommendations = array_merge($recommendations, $collaborativeRecs);
        }

        // 3. Personalized/Hybrid recommendations (if enabled).
        if ($userProfile && MLSettingsHelper::isAlgorithmEnabled('hybrid')) {
            $personalizedRecs = $this->getPersonalizedRecommendations($userProfile, $candidatePosts, $limit);
            $recommendations = array_merge($recommendations, $personalizedRecs);
        }

        // 4. Trending/popular posts (if enabled).
        if (MLSettingsHelper::isAlgorithmEnabled('trending')) {
            $trendingRecs = $this->getTrendingRecommendations($candidatePosts, $limit);
            $recommendations = array_merge($recommendations, $trendingRecs);
        }

        // Combine and rank the recommendation sets.
        $finalRecs = $this->combineAndRankRecommendations($recommendations, $userProfile, $limit);

        // Log the recommendations for later analysis.
        $this->logRecommendations($sessionId, $userId, $finalRecs);

        return $finalRecs;
    }

    /**
     * Retrieve candidate posts for recommendation.
     *
     * ✅ FIXED: Make candidate limit configurable
     */
    private function getCandidatePosts(int $currentPostId = null): Collection
    {
        // ✅ Get limit from config instead of hardcoding
        $candidateLimit = config('ml.candidate_posts_limit', 100);

        $query = Post::with(['categories', 'tags', 'author', 'mlVector'])
            ->withCount(['likes', 'comments'])
            ->where('status', 'published')
            ->where('published_at', '<=', now());

        if ($currentPostId) {
            $query->where('id', '!=', $currentPostId);
        }

        return $query->orderBy('published_at', 'desc')
            ->limit($candidateLimit)
            ->get();
    }

    /**
     * Generate content-based recommendations.
     */
    private function getContentBasedRecommendations(int $currentPostId = null, Collection $candidates, int $limit): array
    {
        if (!$currentPostId) {
            return [];
        }

        $currentVector = MLPostVector::where('post_id', $currentPostId)->first();
        if (!$currentVector) {
            return [];
        }

        // ✅ FIXED: Eager load all vectors at once to prevent N+1 queries
        $candidateIds = $candidates->pluck('id')->toArray();
        $vectors = MLPostVector::whereIn('post_id', $candidateIds)
            ->get()
            ->keyBy('post_id');

        $recommendations = [];

        foreach ($candidates as $candidate) {
            // ✅ Use pre-loaded vector from collection
            $candidateVector = $vectors->get($candidate->id);

            if (!$candidateVector) {
                // Analyze the post if it lacks a vector.
                $candidateVector = $this->contentAnalysis->analyzePost($candidate);
            }

            // Calculate similarity scores.
            $contentSimilarity = MLPostVector::cosineSimilarity(
                $currentVector->content_vector ?? [],
                $candidateVector->content_vector ?? []
            );

            $categorySimilarity = MLPostVector::cosineSimilarity(
                $currentVector->category_vector ?? [],
                $candidateVector->category_vector ?? []
            );

            $tagSimilarity = MLPostVector::cosineSimilarity(
                $currentVector->tag_vector ?? [],
                $candidateVector->tag_vector ?? []
            );

            // Combined score.
            $score = ($contentSimilarity * 0.5) + ($categorySimilarity * 0.3) + ($tagSimilarity * 0.2);

            if ($score > 0.1) { // Minimum threshold.
                $recommendations[] = [
                    'post' => $candidate,
                    'score' => $score,
                    'source' => 'content_based',
                    'reason' => $this->generateContentBasedReason($contentSimilarity, $categorySimilarity, $tagSimilarity),
                    'metadata' => [
                        'content_similarity' => $contentSimilarity,
                        'category_similarity' => $categorySimilarity,
                        'tag_similarity' => $tagSimilarity
                    ]
                ];
            }
        }

        // Sort by score and return the top N.
        usort($recommendations, fn($a, $b) => $b['score'] <=> $a['score']);
        return array_slice($recommendations, 0, $limit);
    }

    /**
     * Collaborative filtering recommendations using Matrix Factorization.
     *
     * V2.0: Now uses MatrixFactorizationService with ALS algorithm
     */
    private function getCollaborativeRecommendations(MLUserProfile $userProfile, Collection $candidates, int $limit): array
    {
        try {
            // Use Matrix Factorization for collaborative filtering
            $userId = $userProfile->user_id;

            // Skip Matrix Factorization for guest users (no user_id)
            if (!$userId) {
                return $this->getBasicCollaborativeRecommendations($userProfile, $candidates, $limit);
            }

            // Get predictions from Matrix Factorization for each candidate
            $recommendations = [];
            foreach ($candidates as $post) {
                try {
                    $predictedRating = $this->matrixFactorization->predict($userId, $post->id);

                    if ($predictedRating > 3.0) {
                        $recommendations[] = [
                            'post' => $post,
                            'score' => $predictedRating / 5.0, // Normalize to 0-1
                            'source' => 'collaborative',
                            'reason' => 'Recommended based on users with similar preferences',
                            'metadata' => [
                                'predicted_rating' => $predictedRating,
                                'algorithm' => 'Matrix Factorization (ALS)',
                                'latent_factors' => 50
                            ]
                        ];
                    }
                } catch (\Exception $e) {
                    // Skip this post if prediction fails
                    Log::debug('Failed to predict rating for post', [
                        'post_id' => $post->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            usort($recommendations, fn($a, $b) => $b['score'] <=> $a['score']);
            return array_slice($recommendations, 0, $limit);

        } catch (\Exception $e) {
            Log::warning('Matrix Factorization failed, falling back to basic collaborative filtering', [
                'user_id' => $userProfile->user_id,
                'error' => $e->getMessage()
            ]);

            // Fallback to basic collaborative filtering
            return $this->getBasicCollaborativeRecommendations($userProfile, $candidates, $limit);
        }
    }

    /**
     * Fallback basic collaborative filtering
     */
    private function getBasicCollaborativeRecommendations(MLUserProfile $userProfile, Collection $candidates, int $limit): array
    {
        // Find similar user profiles.
        $similarUsers = $this->findSimilarUsers($userProfile, 10);

        if (empty($similarUsers)) {
            return [];
        }

        $recommendations = [];
        $candidateIds = $candidates->pluck('id')->toArray();

        // Aggregate posts liked by similar users.
        $popularAmongSimilar = MLInteractionLog::whereIn('user_id', array_keys($similarUsers))
            ->whereIn('post_id', $candidateIds)
            ->whereIn('interaction_type', ['like', 'bookmark', 'share'])
            ->where('implicit_rating', '>', 3.0)
            ->groupBy('post_id')
            ->selectRaw('post_id, COUNT(*) as interaction_count, AVG(implicit_rating) as avg_rating')
            ->orderBy('interaction_count', 'desc')
            ->limit($limit * 2)
            ->get();

        foreach ($popularAmongSimilar as $popular) {
            $post = $candidates->firstWhere('id', $popular->post_id);
            if ($post) {
                $score = ($popular->interaction_count / count($similarUsers)) * ($popular->avg_rating / 5.0);

                $recommendations[] = [
                    'post' => $post,
                    'score' => $score,
                    'source' => 'collaborative',
                    'reason' => 'Users with similar tastes enjoyed this content.',
                    'metadata' => [
                        'similar_users_liked' => $popular->interaction_count,
                        'avg_rating' => $popular->avg_rating
                    ]
                ];
            }
        }

        usort($recommendations, fn($a, $b) => $b['score'] <=> $a['score']);
        return array_slice($recommendations, 0, $limit);
    }

    /**
     * Personalized recommendations tailored to a user profile.
     */
    private function getPersonalizedRecommendations(MLUserProfile $userProfile, Collection $candidates, int $limit): array
    {
        $recommendations = [];
        
        foreach ($candidates as $candidate) {
            $score = 0;
            $reasons = [];

            // Score based on category preferences.
            if (!empty($userProfile->category_preferences)) {
                $categoryScore = $this->calculateCategoryScore($candidate, $userProfile->category_preferences);
                $score += $categoryScore * 0.4;
                if ($categoryScore > 0.3) {
                    $reasons[] = 'Matches your favorite categories';
                }
            }

            // Score based on tag interests.
            if (!empty($userProfile->tag_interests)) {
                $tagScore = $this->calculateTagScore($candidate, $userProfile->tag_interests);
                $score += $tagScore * 0.3;
                if ($tagScore > 0.3) {
                    $reasons[] = 'Includes topics you follow';
                }
            }

            // Score based on reading patterns.
            if (!empty($userProfile->reading_patterns)) {
                $patternScore = $this->calculatePatternScore($candidate, $userProfile->reading_patterns);
                $score += $patternScore * 0.2;
            }

            // Score based on preferred content length.
            $lengthScore = $this->calculateLengthScore($candidate, $userProfile);
            $score += $lengthScore * 0.1;

            if ($score > 0.2) { // Personalization threshold.
                $recommendations[] = [
                    'post' => $candidate,
                    'score' => $score,
                    'source' => 'personalized',
                    'reason' => implode(', ', $reasons) ?: 'Based on your reading profile',
                    'metadata' => [
                        'user_cluster' => $userProfile->user_cluster,
                        'profile_match' => $score
                    ]
                ];
            }
        }

        usort($recommendations, fn($a, $b) => $b['score'] <=> $a['score']);
        return array_slice($recommendations, 0, $limit);
    }

    /**
     * Trending/popular recommendations.
     */
    private function getTrendingRecommendations(Collection $candidates, int $limit): array
    {
        $recommendations = [];

        // ✅ FIXED: Batch query for engagement scores instead of individual queries
        $candidateIds = $candidates->pluck('id')->toArray();

        $engagementScores = MLInteractionLog::whereIn('post_id', $candidateIds)
            ->where('created_at', '>', now()->subDays(7))
            ->groupBy('post_id')
            ->selectRaw('post_id, AVG(engagement_score) as avg_engagement')
            ->pluck('avg_engagement', 'post_id');

        foreach ($candidates as $candidate) {
            // Calculate a trending score based on recent engagement.
            $recentEngagement = $engagementScores->get($candidate->id, 0);

            $viewsScore = min(($candidate->views_count ?? 0) / 1000, 1.0);
            $likesScore = min(($candidate->likes_count ?? 0) / 100, 1.0);
            $commentsScore = min(($candidate->comments_count ?? 0) / 50, 1.0);

            $score = ($recentEngagement * 0.4) + ($viewsScore * 0.3) + ($likesScore * 0.2) + ($commentsScore * 0.1);

            if ($score > 0.1) {
                $recommendations[] = [
                    'post' => $candidate,
                    'score' => $score,
                    'source' => 'trending',
                    'reason' => 'Popular and trending content.',
                    'metadata' => [
                        'recent_engagement' => $recentEngagement,
                        'total_views' => $candidate->views_count
                    ]
                ];
            }
        }

        usort($recommendations, fn($a, $b) => $b['score'] <=> $a['score']);
        return array_slice($recommendations, 0, $limit);
    }

    /**
     * Combine and rank the aggregated recommendations.
     * V2.0: Now includes ExplainableAI explanations
     */
    private function combineAndRankRecommendations(array $allRecommendations, MLUserProfile $userProfile = null, int $limit = 10): array
    {
        // ✅ FIX: Cache algorithm weights outside loop to avoid repeated config pulls
        $algorithmWeights = MLSettingsHelper::getAlgorithmWeights();
        $sourceWeights = [
            'content_based' => $algorithmWeights['content'],
            'collaborative' => $algorithmWeights['collaborative'],
            'personalized' => $algorithmWeights['hybrid'],
            'trending' => $algorithmWeights['trending']
        ];

        // Group by post ID to avoid duplicates.
        $grouped = [];

        foreach ($allRecommendations as $rec) {
            $postId = $rec['post']->id;

            if (!isset($grouped[$postId])) {
                $grouped[$postId] = $rec;
                $grouped[$postId]['combined_score'] = 0;
                $grouped[$postId]['sources'] = [];
                $grouped[$postId]['algorithm_weights'] = [];
            }

            // ✅ FIX: Use pre-loaded weights instead of pulling config in loop
            $weight = $sourceWeights[$rec['source']] ?? 0.1;
            $grouped[$postId]['combined_score'] += $rec['score'] * $weight;
            $grouped[$postId]['sources'][] = $rec['source'];
            $grouped[$postId]['algorithm_weights'][$rec['source']] = $weight;
        }

        // Apply a diversity boost.
        $final = array_values($grouped);
        $final = $this->applyDiversityBoost($final);

        // Sort by the final combined score.
        usort($final, fn($a, $b) => $b['combined_score'] <=> $a['combined_score']);

        // Filter by minimum confidence (if configured and we have enough recommendations)
        $params = MLSettingsHelper::getRecommendationParams();
        $minConfidence = $params['min_confidence'];
        if ($minConfidence > 0 && count($final) > $limit) {
            $filtered = array_filter($final, function($rec) use ($minConfidence) {
                return ($rec['combined_score'] ?? 0) >= $minConfidence;
            });

            // Only apply filter if we still have enough recommendations
            if (count($filtered) >= $limit) {
                $final = array_values($filtered);
            }
        }

        // Add explanations using ExplainableAI (if enabled in settings)
        $explainableConfig = MLSettingsHelper::getExplainableAIConfig();
        $final = array_slice($final, 0, $limit);

        if ($explainableConfig['include_explanations']) {
            foreach ($final as &$rec) {
                try {
                    $explanation = $this->explainableAI->explainRecommendation(
                        $rec['post'],
                        $userProfile,
                        [
                            'source' => $rec['source'] ?? 'hybrid',
                            'score' => $rec['combined_score'],
                            'algorithm_weights' => $rec['algorithm_weights'] ?? [],
                            'metadata' => $rec['metadata'] ?? [],
                            'detail_level' => $explainableConfig['detail_level']
                        ]
                    );
                    $rec['explanation'] = $explanation;
                } catch (\Exception $e) {
                    Log::warning('Failed to generate explanation', [
                        'post_id' => $rec['post']->id,
                        'error' => $e->getMessage()
                    ]);
                    $rec['explanation'] = null;
                }
            }
        } else {
            // Set null explanations if disabled
            foreach ($final as &$rec) {
                $rec['explanation'] = null;
            }
        }

        return $final;
    }

    /**
     * Apply diversity boost to avoid overly similar recommendations.
     */
    private function applyDiversityBoost(array $recommendations): array
    {
        // Get diversity boost from settings
        $params = MLSettingsHelper::getRecommendationParams();
        $diversityBoost = $params['diversity_boost'];

        // Calculate penalty based on diversity boost (higher boost = higher penalty for duplicates)
        $categoryPenalty = 1.0 - $diversityBoost; // 0.3 boost = 0.7 penalty

        $seenCategories = [];

        foreach ($recommendations as &$rec) {
            $categories = $rec['post']->categories->pluck('id')->toArray();

            foreach ($categories as $categoryId) {
                if (isset($seenCategories[$categoryId])) {
                    $rec['combined_score'] *= $categoryPenalty;
                }
                $seenCategories[$categoryId] = true;
            }
        }

        return $recommendations;
    }

    /**
     * Find users similar to the current profile.
     */
    private function findSimilarUsers(MLUserProfile $userProfile, int $limit): array
    {
        $similarUsers = [];
        
        $otherProfiles = MLUserProfile::where('id', '!=', $userProfile->id)
            ->whereNotNull('category_preferences')
            ->limit(50) // Limit for performance.
            ->get();

        foreach ($otherProfiles as $otherProfile) {
            $similarity = $userProfile->calculateSimilarity($otherProfile);
            
            if ($similarity > 0.3) { // Similarity threshold.
                $similarUsers[$otherProfile->user_id ?: $otherProfile->session_id] = $similarity;
            }
        }

        // Sort by similarity and return the top N.
        arsort($similarUsers);
        return array_slice($similarUsers, 0, $limit, true);
    }

    /**
     * Calculate a score based on preferred categories.
     */
    private function calculateCategoryScore(Post $post, array $categoryPreferences): float
    {
        $score = 0;
        $categories = $post->categories;

        if ($categories->isEmpty()) {
            return 0;
        }

        foreach ($categories as $category) {
            $preference = $categoryPreferences[$category->id] ?? 0;
            $score += $preference;
        }

        // ✅ FIXED: Prevent division by zero
        $count = $categories->count();
        return $count > 0 ? min($score / $count, 1.0) : 0;
    }

    /**
     * Calculate a score based on interesting tags.
     */
    private function calculateTagScore(Post $post, array $tagInterests): float
    {
        $score = 0;
        $tags = $post->tags;

        if ($tags->isEmpty()) {
            return 0;
        }

        foreach ($tags as $tag) {
            $interest = $tagInterests[$tag->id] ?? 0;
            $score += $interest;
        }

        // ✅ FIXED: Prevent division by zero
        $count = $tags->count();
        return $count > 0 ? min($score / $count, 1.0) : 0;
    }

    /**
     * Calculate a score based on reading patterns.
     */
    private function calculatePatternScore(Post $post, array $readingPatterns): float
    {
        $score = 0.5; // Neutral base score.
        $currentHour = now()->hour;
        $currentDayOfWeek = now()->dayOfWeek;
        
        // Hourly patterns (boosted weight).
        if (isset($readingPatterns['preferred_hours'][$currentHour])) {
            $hourPreference = $readingPatterns['preferred_hours'][$currentHour];
            $score += $hourPreference * 0.3;
        }
        
        // Day-of-week patterns.
        if (isset($readingPatterns['preferred_days'][$currentDayOfWeek])) {
            $dayPreference = $readingPatterns['preferred_days'][$currentDayOfWeek];
            $score += $dayPreference * 0.2;
        }
        
        // Enhanced: engagement patterns by content length.
        if (isset($readingPatterns['engagement_by_length'])) {
            $contentLength = strlen(strip_tags($post->content ?? ''));
            $lengthCategory = $this->categorizeContentLength($contentLength);
            
            if (isset($readingPatterns['engagement_by_length'][$lengthCategory])) {
                $lengthEngagement = $readingPatterns['engagement_by_length'][$lengthCategory];
                $score += $lengthEngagement * 0.25;
            }
        }
        
        // Enhanced: scroll depth patterns.
        if (isset($readingPatterns['avg_scroll_depth']) && $readingPatterns['avg_scroll_depth'] > 0.4) {
            // If the user typically scrolls deeply, prefer longer content.
            $contentLength = strlen(strip_tags($post->content ?? ''));
            if ($contentLength > 2000) {
                $score += 0.15;
            }
        }
        
        // Enhanced: reading velocity and depth.
        if (isset($readingPatterns['reading_velocity']) && $readingPatterns['reading_velocity'] > 0) {
            $optimalVelocity = 0.1; // Ideal scrolls per second.
            $velocityDiff = abs($readingPatterns['reading_velocity'] - $optimalVelocity);
            $velocityScore = max(0, 1 - ($velocityDiff * 2));
            $score += $velocityScore * 0.1;
        }

        return min($score, 1.0);
    }
    
    /**
     * Categorize content by approximate length.
     */
    private function categorizeContentLength(int $length): string
    {
        if ($length < 1000) return 'short';
        if ($length < 3000) return 'medium';
        if ($length < 6000) return 'long';
        return 'very_long';
    }

    /**
     * Calculate a score based on preferred length.
     */
    private function calculateLengthScore(Post $post, MLUserProfile $userProfile): float
    {
        $contentLength = strlen(strip_tags($post->content ?? ''));
        $preferredLength = (int) ($userProfile->content_type_preferences['preferred_length'] ?? 2000);

        $lengthDiff = abs($contentLength - $preferredLength);
        $maxDiff = 5000; // Maximum tolerated difference.

        return max(0, 1 - ($lengthDiff / $maxDiff));
    }

    /**
     * Generate a reason for a content-based recommendation
     */
    private function generateContentBasedReason(float $contentSim, float $categorySim, float $tagSim): string
    {
        $reasons = [];
        
        if ($contentSim > 0.5) $reasons[] = 'similar content';
        if ($categorySim > 0.7) $reasons[] = 'same category';
        if ($tagSim > 0.6) $reasons[] = 'related tags';
        
        return "Recommended because: " . (implode(', ', $reasons) ?: "content similarity");
    }

    /**
     * Enhanced: intelligent precomputation of recommendations
     */
    public function precomputeRecommendations(
        int $userId = null,
        string $sessionId = null,
        int $limit = 20
    ): array {
        $cacheKey = "precomputed_recs_{$userId}_{$sessionId}";
        
        // Check if precomputed recommendations remain valid.
        $cached = Cache::get($cacheKey);
        if ($cached && isset($cached['computed_at']) && 
            (time() - $cached['computed_at']) < 1800) { // 30 minutos de validez
            return $cached['recommendations'];
        }
        
        // Precomputar con algoritmos optimizados
        $userProfile = MLUserProfile::findByIdentifier($sessionId, $userId);
        $candidatePosts = $this->getCandidatePosts();
        
        if ($candidatePosts->isEmpty()) {
            return [];
        }
        
        $recommendations = [];
        
        // Use more efficient algorithms for precomputation.
        if ($userProfile) {
            // Optimized hybrid algorithm.
            $personalizedRecs = $this->getEnhancedPersonalizedRecommendations(
                $userProfile, 
                $candidatePosts, 
                $limit
            );
            $recommendations = array_merge($recommendations, $personalizedRecs);
        }
        
        // Trending con boost temporal
        $trendingRecs = $this->getTemporalTrendingRecommendations($candidatePosts, $limit);
        $recommendations = array_merge($recommendations, $trendingRecs);
        
        // Combinar y rankear
        $finalRecs = $this->combineAndRankRecommendations($recommendations, $userProfile, $limit);
        
        // Cachear resultados
        Cache::put($cacheKey, [
            'recommendations' => $finalRecs,
            'computed_at' => time()
        ], 1800); // 30 minutos
        
        return $finalRecs;
    }
    
    /**
     * Enhanced: personalized recommendations with engagement insights
     */
    private function getEnhancedPersonalizedRecommendations(
        MLUserProfile $userProfile, 
        Collection $candidates, 
        int $limit
    ): array {
        $recommendations = [];
        
        foreach ($candidates as $candidate) {
            $score = 0;
            $reasons = [];
            
            // Score based on category preferences. (mejorado)
            if (!empty($userProfile->category_preferences)) {
                $categoryScore = $this->calculateEnhancedCategoryScore(
                    $candidate, 
                    $userProfile->category_preferences
                );
                $score += $categoryScore * 0.35; // Peso aumentado
                if ($categoryScore > 0.3) {
                    $reasons[] = 'Matches your favorite categories';
                }
            }
            
            // Score based on temporal engagement patterns.
            if (!empty($userProfile->reading_patterns)) {
                $patternScore = $this->calculateEnhancedPatternScore(
                    $candidate, 
                    $userProfile->reading_patterns
                );
                $score += $patternScore * 0.3; // Nuevo peso para patrones
                if ($patternScore > 0.4) {
                    $reasons[] = 'Aligns with your reading patterns';
                }
            }
            
            // Score based on historical engagement.
            if (isset($userProfile->engagement_history)) {
                $engagementScore = $this->calculateEngagementCompatibility(
                    $candidate,
                    $userProfile->engagement_history
                );
                $score += $engagementScore * 0.25;
                if ($engagementScore > 0.5) {
                    $reasons[] = 'Content with strong prior engagement';
                }
            }
            
            // Score basado en longitud preferida (mejorado)
            $lengthScore = $this->calculateEnhancedLengthScore($candidate, $userProfile);
            $score += $lengthScore * 0.1;
            
            if ($score > 0.25) { // more selective threshold
                $recommendations[] = [
                    'post' => $candidate,
                    'score' => $score,
                    'source' => 'enhanced_personalized',
                    'reason' => implode(', ', $reasons) ?: 'Based on your optimized profile',
                    'metadata' => [
                        'user_cluster' => $userProfile->user_cluster,
                        'profile_match' => $score,
                        'engagement_optimized' => true
                    ]
                ];
            }
        }
        
        usort($recommendations, fn($a, $b) => $b['score'] <=> $a['score']);
        return array_slice($recommendations, 0, $limit);
    }
    
    /**
     * NUEVA MEJORA: Trending con boost temporal
     */
    private function getTemporalTrendingRecommendations(Collection $candidates, int $limit): array
    {
        $recommendations = [];
        $now = now();
        
        foreach ($candidates as $candidate) {
            // Calcular trending score con factor temporal
            $hoursSincePublished = $now->diffInHours($candidate->published_at);
            $daysSincePublished = $now->diffInDays($candidate->published_at);
            
            // Boost para contenido reciente (primeras 24 horas)
            $recencyBoost = $hoursSincePublished <= 24 ? (24 - $hoursSincePublished) / 24 : 0;
            
            // Decaimiento temporal (contenido muy antiguo pierde relevancia)
            $temporalDecay = $daysSincePublished > 30 ? max(0.1, 1 - (($daysSincePublished - 30) / 365)) : 1;
            
            // Recent engagement metrics.
            $recentViews = $this->getRecentViews($candidate->id, 7); // last 7 days
            $recentLikes = $this->getRecentLikes($candidate->id, 7);
            $recentShares = $this->getRecentShares($candidate->id, 7);
            
            // Score trending mejorado
            $trendingScore = (
                ($recentViews * 0.001) +
                ($recentLikes * 0.1) +
                ($recentShares * 0.5) +
                ($candidate->views_count * 0.0005)
            ) * $temporalDecay * (1 + $recencyBoost);
            
            if ($trendingScore > 0.1) {
                $recommendations[] = [
                    'post' => $candidate,
                    'score' => $trendingScore,
                    'source' => 'temporal_trending',
                    'reason' => 'Trending with strong recent engagement.',
                    'metadata' => [
                        'recent_engagement' => $trendingScore,
                        'recency_boost' => $recencyBoost,
                        'temporal_decay' => $temporalDecay,
                        'days_since_published' => $daysSincePublished
                    ]
                ];
            }
        }
        
        usort($recommendations, fn($a, $b) => $b['score'] <=> $a['score']);
        return array_slice($recommendations, 0, $limit);
    }
    
    /**
     * ML improvements: helper methods for new capabilities
     */
    private function getRecentViews(int $postId, int $days): int
    {
        // ✅ Use static cache to prevent repeated queries for same post
        static $cache = [];
        $key = "{$postId}_{$days}_views";

        if (!isset($cache[$key])) {
            $cache[$key] = MLInteractionLog::where('post_id', $postId)
                ->where('interaction_type', 'view')
                ->where('created_at', '>', now()->subDays($days))
                ->count();
        }

        return $cache[$key];
    }

    private function getRecentLikes(int $postId, int $days): int
    {
        // ✅ Use static cache to prevent repeated queries for same post
        static $cache = [];
        $key = "{$postId}_{$days}_likes";

        if (!isset($cache[$key])) {
            $cache[$key] = MLInteractionLog::where('post_id', $postId)
                ->where('interaction_type', 'like')
                ->where('created_at', '>', now()->subDays($days))
                ->count();
        }

        return $cache[$key];
    }

    private function getRecentShares(int $postId, int $days): int
    {
        // ✅ Use static cache to prevent repeated queries for same post
        static $cache = [];
        $key = "{$postId}_{$days}_shares";

        if (!isset($cache[$key])) {
            $cache[$key] = MLInteractionLog::where('post_id', $postId)
                ->where('interaction_type', 'share')
                ->where('created_at', '>', now()->subDays($days))
                ->count();
        }

        return $cache[$key];
    }
    
    /**
     * Log recommendations for later analysis
     */
    private function logRecommendations(string $sessionId = null, int $userId = null, array $recommendations): void
    {
        // ✅ FIXED: Batch insert to prevent N queries
        $records = [];

        foreach ($recommendations as $index => $rec) {
            $records[] = [
                'session_id' => $sessionId,
                'user_id' => $userId,
                'post_id' => $rec['post']->id,
                'interaction_type' => 'view',
                'recommendation_source' => $rec['source'],
                'recommendation_context' => json_encode([
                    'algorithm' => $rec['source'],
                    'reason' => $rec['reason'],
                    'metadata' => $rec['metadata'] ?? []
                ]),
                'recommendation_score' => $rec['combined_score'] ?? $rec['score'],
                'recommendation_position' => $index + 1,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($records)) {
            MLInteractionLog::insert($records);
        }
    }

    /**
     * Obtiene recomendaciones basadas en contenido mejoradas
     */
    private function getEnhancedContentBasedRecommendations(int $currentPostId, Collection $candidates, int $limit): array
    {
        $currentPost = Post::find($currentPostId);
        if (!$currentPost) {
            return [];
        }

        $currentVector = MLPostVector::where('post_id', $currentPostId)->first();
        if (!$currentVector) {
            $currentVector = $this->contentAnalysis->analyzePost($currentPost);
        }

        $recommendations = [];

        foreach ($candidates as $candidate) {
            $candidateVector = MLPostVector::where('post_id', $candidate->id)->first();

            if (!$candidateVector) {
                $candidateVector = $this->contentAnalysis->analyzePost($candidate);
            }

            // Enhanced content similarity across multiple factors
            $contentSimilarity = MLPostVector::cosineSimilarity(
                $currentVector->content_vector ?? [],
                $candidateVector->content_vector ?? []
            );

            $categorySimilarity = MLPostVector::cosineSimilarity(
                $currentVector->category_vector ?? [],
                $candidateVector->category_vector ?? []
            );

            $tagSimilarity = MLPostVector::cosineSimilarity(
                $currentVector->tag_vector ?? [],
                $candidateVector->tag_vector ?? []
            );

            // Similitud de autor (si es el mismo autor, boost)
            $authorBoost = $currentPost->author_id === $candidate->author_id ? 0.2 : 0;

            // Temporal similarity (recent posts receive a slight boost)
            $daysDiff = $currentPost->published_at->diffInDays($candidate->published_at);
            $temporalBoost = max(0, (30 - $daysDiff) / 30) * 0.1;

            // Score combinado mejorado
            $score = ($contentSimilarity * 0.4) +
                    ($categorySimilarity * 0.25) +
                    ($tagSimilarity * 0.2) +
                    $authorBoost +
                    $temporalBoost;

            if ($score > 0.15) { // more selective threshold
                $recommendations[] = [
                    'post' => $candidate,
                    'score' => $score,
                    'source' => 'enhanced_content_based',
                    'reason' => $this->generateEnhancedContentReason($contentSimilarity, $categorySimilarity, $tagSimilarity, $authorBoost),
                    'metadata' => [
                        'content_similarity' => $contentSimilarity,
                        'category_similarity' => $categorySimilarity,
                        'tag_similarity' => $tagSimilarity,
                        'author_boost' => $authorBoost,
                        'temporal_boost' => $temporalBoost
                    ]
                ];
            }
        }

        usort($recommendations, fn($a, $b) => $b['score'] <=> $a['score']);
        return array_slice($recommendations, 0, $limit);
    }

    /**
     * Obtiene recomendaciones trending en tiempo real
     */
    private function getRealTimeTrendingRecommendations(Collection $candidates, int $limit): array
    {
        $recommendations = [];

        foreach ($candidates as $candidate) {
            // Recent engagement (last 24 hours)
            $recentEngagement = MLInteractionLog::where('post_id', $candidate->id)
                ->where('created_at', '>', now()->subDay())
                ->whereIn('interaction_type', ['like', 'share', 'comment', 'bookmark'])
                ->count();

            // Engagement por hora para detectar tendencias
            $hourlyEngagement = MLInteractionLog::where('post_id', $candidate->id)
                ->where('created_at', '>', now()->subHour())
                ->count();

            // Score basado en velocidad de engagement
            $engagementVelocity = $hourlyEngagement > 0 ? ($recentEngagement / 24) * $hourlyEngagement : 0;

            // General metrics with temporal weighting
            $ageInDays = $candidate->published_at->diffInDays(now());
            $agePenalty = $ageInDays > 7 ? 0.5 : 1.0; // Penalizar posts muy antiguos

            $viewsScore = min(($candidate->views_count ?? 0) / 1000, 1.0) * $agePenalty;
            $likesScore = min(($candidate->likes_count ?? 0) / 100, 1.0) * $agePenalty;
            $commentsScore = min(($candidate->comments_count ?? 0) / 50, 1.0) * $agePenalty;

            $score = ($engagementVelocity * 0.5) + ($viewsScore * 0.2) + ($likesScore * 0.2) + ($commentsScore * 0.1);

            if ($score > 0.1) {
                $recommendations[] = [
                    'post' => $candidate,
                    'score' => $score,
                    'source' => 'realtime_trending',
                    'reason' => "Trending ahora - Alto engagement reciente",
                    'metadata' => [
                        'recent_engagement' => $recentEngagement,
                        'hourly_engagement' => $hourlyEngagement,
                        'engagement_velocity' => $engagementVelocity,
                        'age_penalty' => $agePenalty
                    ]
                ];
            }
        }

        usort($recommendations, fn($a, $b) => $b['score'] <=> $a['score']);
        return array_slice($recommendations, 0, $limit);
    }

    /**
     * Generate an enhanced reason for content recommendations
     */
    private function generateEnhancedContentReason(float $content, float $category, float $tag, float $author): string
    {
        $reasons = [];

        if ($content > 0.7) $reasons[] = "Highly similar content";
        elseif ($content > 0.4) $reasons[] = "Related content";

        if ($category > 0.8) $reasons[] = "Same category";
        elseif ($category > 0.5) $reasons[] = "Related category";

        if ($tag > 0.6) $reasons[] = "Tags similares";

        if ($author > 0) $reasons[] = "Mismo autor";

        return implode(', ', $reasons) ?: "Contenido relacionado";
    }
}
