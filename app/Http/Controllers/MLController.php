<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\MLUserProfile;
use App\Models\MLInteractionLog;
use App\Services\ContentAnalysisService;
use App\Services\MLRecommendationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MLController extends Controller
{
    private ContentAnalysisService $contentAnalysis;
    private MLRecommendationService $mlRecommendation;

    public function __construct(
        ContentAnalysisService $contentAnalysis,
        MLRecommendationService $mlRecommendation
    ) {
        $this->contentAnalysis = $contentAnalysis;
        $this->mlRecommendation = $mlRecommendation;
    }

    /**
     * Retrieve ML recommendations for a user.
     */
    public function getRecommendations(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'session_id' => 'nullable|string',
                'current_post_id' => 'nullable|integer|exists:posts,id',
                'limit' => 'nullable|integer|min:1|max:20'
            ]);

            $sessionId = $validated['session_id'] ?? $request->session()->getId();
            $userId = Auth::id();
            $currentPostId = $validated['current_post_id'] ?? null;
            $limit = $validated['limit'] ?? 10;

            $recommendations = $this->mlRecommendation->getRecommendations(
                $sessionId,
                $userId,
                $currentPostId,
                $limit
            );

            return response()->json([
                'success' => true,
                'recommendations' => $this->formatRecommendations($recommendations),
                'metadata' => [
                    'algorithm_version' => '1.0',
                    'generated_at' => now()->toISOString(),
                    'user_type' => $userId ? 'authenticated' : 'guest',
                    'total_count' => count($recommendations)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error generating ML recommendations', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Recommendations could not be generated.',
                'recommendations' => []
            ], 500);
        }
    }

    /**
     * Register a user interaction for the ML system.
     */
    public function logInteraction(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'session_id' => 'nullable|string',
                'post_id' => 'required|integer|exists:posts,id',
                'interaction_type' => 'required|in:view,click,like,share,comment,bookmark,recommendation_click',
                'time_spent_seconds' => 'nullable|integer|min:0',
                'scroll_percentage' => 'nullable|numeric|min:0|max:100',
                'completed_reading' => 'nullable|boolean',
                'recommendation_source' => 'nullable|string',
                'recommendation_position' => 'nullable|integer|min:1',
                'metadata' => 'nullable|array'
            ]);

            $sessionId = $validated['session_id'] ?? $request->session()->getId();
            $userId = Auth::id();

            // Record the interaction entry.
            $interaction = MLInteractionLog::logInteraction([
                'session_id' => $sessionId,
                'user_id' => $userId,
                'post_id' => $validated['post_id'],
                'interaction_type' => $validated['interaction_type'],
                'time_spent_seconds' => $validated['time_spent_seconds'] ?? null,
                'scroll_percentage' => $validated['scroll_percentage'] ?? null,
                'completed_reading' => $validated['completed_reading'] ?? false,
                'recommendation_source' => $validated['recommendation_source'] ?? null,
                'recommendation_position' => $validated['recommendation_position'] ?? null,
                'interaction_metadata' => $validated['metadata'] ?? null,
            ]);

            // Update the user profile when required.
            $this->updateUserProfile($sessionId, $userId, $interaction);

            return response()->json([
                'success' => true,
                'message' => 'Interaction recorded successfully.',
                'interaction_id' => $interaction->id
            ]);

        } catch (\Exception $e) {
            Log::error('Error logging ML interaction', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'The interaction could not be recorded.'
            ], 500);
        }
    }

    /**
     * Retrieve ML insights for a user.
     */
    public function getUserInsights(Request $request): JsonResponse
    {
        try {
            $sessionId = $request->get('session_id', $request->session()->getId());
            $userId = Auth::id();

            $profile = MLUserProfile::findByIdentifier($sessionId, $userId);
            
            if (!$profile) {
                return response()->json([
                    'success' => true,
                    'insights' => [
                        'message' => 'Keep exploring to receive personalized recommendations.',
                        'reading_time' => 0,
                        'posts_read' => 0,
                        'top_categories' => [],
                        'reading_patterns' => []
                    ]
                ]);
            }

            $insights = [
                'reading_time' => round($profile->avg_reading_time / 60, 1), // in minutes
                'posts_read' => $profile->total_posts_read,
                'engagement_rate' => round($profile->engagement_rate * 100, 1),
                'top_categories' => $this->getTopCategories($profile),
                'reading_patterns' => $this->getReadingPatterns($profile),
                'user_cluster' => $profile->user_cluster,
                'cluster_description' => $this->getClusterDescription($profile->user_cluster),
                'recommendations_accuracy' => $this->getRecommendationAccuracy($sessionId, $userId)
            ];

            return response()->json([
                'success' => true,
                'insights' => $insights
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting user insights', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Unable to retrieve insights.'
            ], 500);
        }
    }

    /**
     * Trigger ML model training.
     */
    public function trainModels(Request $request): JsonResponse
    {
        try {
            // Allow only administrators (simplified - enforce role checks separately).
            $user = Auth::user();
            if (!$user || !$user->is_admin) {
                return response()->json([
                    'success' => false,
                    'error' => 'Unauthorized.'
                ], 403);
            }

            // Analyze all posts.
            $this->contentAnalysis->analyzeAllPosts();
            
            // Train user clustering (simplified).
            $this->trainUserClustering();
            
            return response()->json([
                'success' => true,
                'message' => 'Models trained successfully.',
                'trained_at' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            Log::error('Error training ML models', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error training models.'
            ], 500);
        }
    }

    /**
     * Retrieve ML system performance metrics.
     */
    public function getMetrics(Request $request): JsonResponse
    {
        try {
            $days = $request->get('days', 7);
            $from = now()->subDays($days);
            
            $metrics = [
                'content_based' => MLInteractionLog::getRecommendationMetrics('content_based', $from),
                'collaborative' => MLInteractionLog::getRecommendationMetrics('collaborative', $from),
                'personalized' => MLInteractionLog::getRecommendationMetrics('personalized', $from),
                'trending' => MLInteractionLog::getRecommendationMetrics('trending', $from),
                'overall' => $this->getOverallMetrics($from)
            ];

            return response()->json([
                'success' => true,
                'metrics' => $metrics,
                'period' => [
                    'from' => $from->toISOString(),
                    'to' => now()->toISOString(),
                    'days' => $days
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting ML metrics', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Unable to retrieve metrics.'
            ], 500);
        }
    }

    /**
     * Format recommendation payloads for the frontend.
     */
    private function formatRecommendations(array $recommendations): array
    {
        return array_map(function($rec) {
            return [
                'id' => $rec['post']->id,
                'title' => $rec['post']->title,
                'slug' => $rec['post']->slug,
                'excerpt' => $rec['post']->excerpt,
                'cover_image' => $rec['post']->cover_image,
                'published_at' => $rec['post']->published_at,
                'author' => [
                    'id' => $rec['post']->author->id ?? null,
                    'name' => $rec['post']->author->name ?? 'Anonymous',
                    'avatar' => $rec['post']->author->avatar ?? null,
                ],
                'categories' => $rec['post']->categories->map(fn($cat) => [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'color' => $cat->color
                ]),
                'tags' => $rec['post']->tags->take(5)->map(fn($tag) => [
                    'id' => $tag->id,
                    'name' => $tag->name
                ]),
                'stats' => [
                    'views_count' => $rec['post']->views_count ?? 0,
                    'likes_count' => $rec['post']->likes_count ?? 0,
                    'comments_count' => $rec['post']->comments_count ?? 0,
                ],
                'ml_data' => [
                    'score' => round($rec['combined_score'], 3),
                    'source' => $rec['source'],
                    'sources' => $rec['sources'] ?? [$rec['source']],
                    'reason' => $rec['reason'],
                    'confidence' => min($rec['combined_score'] * 100, 100)
                ]
            ];
        }, $recommendations);
    }

    /**
     * Update the user profile based on interactions.
     */
    private function updateUserProfile(string $sessionId, int $userId = null, MLInteractionLog $interaction): void
    {
        $profile = MLUserProfile::findByIdentifier($sessionId, $userId);
        
        if (!$profile) {
            $profile = MLUserProfile::create([
                'session_id' => $sessionId,
                'user_id' => $userId,
                'category_preferences' => [],
                'tag_interests' => [],
                'reading_patterns' => [],
                'content_type_preferences' => []
            ]);
        }

        // Update basic metrics.
        $profile->total_posts_read++;
        $profile->last_activity = now();
        
        if ($interaction->time_spent_seconds) {
            $currentAvg = $profile->avg_reading_time;
            $newAvg = (($currentAvg * ($profile->total_posts_read - 1)) + $interaction->time_spent_seconds) / $profile->total_posts_read;
            $profile->avg_reading_time = $newAvg;
        }

        if ($interaction->engagement_score) {
            $currentEngagement = $profile->engagement_rate;
            $newEngagement = (($currentEngagement * ($profile->total_posts_read - 1)) + $interaction->engagement_score) / $profile->total_posts_read;
            $profile->engagement_rate = $newEngagement;
        }

        // Update category preferences.
        $post = Post::with(['categories', 'tags'])->find($interaction->post_id);
        if ($post && $post->categories->isNotEmpty()) {
            $categoryWeights = [];
            foreach ($post->categories as $category) {
                $weight = $this->calculateInteractionWeight($interaction);
                $categoryWeights[$category->id] = $weight;
            }
            $profile->updateCategoryPreferences($categoryWeights);
        }

        // Update tag interests.
        if ($post && $post->tags->isNotEmpty()) {
            $tagWeights = [];
            foreach ($post->tags as $tag) {
                $weight = $this->calculateInteractionWeight($interaction);
                $tagWeights[$tag->id] = $weight;
            }
            $profile->updateTagInterests($tagWeights);
        }

        $profile->save();
    }

    /**
     * Calculate interaction weight to update preferences.
     */
    private function calculateInteractionWeight(MLInteractionLog $interaction): float
    {
        $weights = [
            'view' => 0.1,
            'click' => 0.2,
            'like' => 0.8,
            'share' => 0.9,
            'comment' => 1.0,
            'bookmark' => 0.9,
            'recommendation_click' => 0.3
        ];

        $baseWeight = $weights[$interaction->interaction_type] ?? 0.1;
        
        // Increase weight for time spent.
        if ($interaction->time_spent_seconds > 60) {
            $baseWeight *= 1.5;
        }
        
        // Increase weight for engagement score.
        if ($interaction->engagement_score > 0.7) {
            $baseWeight *= 1.3;
        }

        return min($baseWeight, 2.0);
    }

    /**
     * Retrieve the user top categories.
     */
    private function getTopCategories(MLUserProfile $profile): array
    {
        if (empty($profile->category_preferences)) {
            return [];
        }

        arsort($profile->category_preferences);
        $topCategories = array_slice($profile->category_preferences, 0, 5, true);
        
        $categories = \App\Models\Category::whereIn('id', array_keys($topCategories))->get();
        
        return $categories->map(function($category) use ($topCategories) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'preference_score' => round($topCategories[$category->id] * 100, 1)
            ];
        })->toArray();
    }

    /**
     * Retrieve reading patterns.
     */
    private function getReadingPatterns(MLUserProfile $profile): array
    {
        $patterns = $profile->reading_patterns ?? [];
        
        return [
            'preferred_time' => $patterns['preferred_time'] ?? 'Not defined',
            'avg_session_duration' => round(($patterns['avg_session_duration'] ?? 0) / 60, 1),
            'reading_frequency' => $patterns['reading_frequency'] ?? 'Not defined'
        ];
    }

    /**
     * Retrieve the user cluster description.
     */
    private function getClusterDescription(int $cluster = null): string
    {
        $descriptions = [
            0 => 'Casual reader - Explores various topics occasionally.',
            1 => 'Construction enthusiast - Interested in projects and techniques.',
            2 => 'Industry professional - Seeks specialized technical information.',
            3 => 'Active learner - Constantly seeks new information.',
            4 => 'Social reader - Enjoys interacting with and sharing content.'
        ];

        return $descriptions[$cluster] ?? 'Profile in progress.';
    }

    /**
     * Calculate recommendation accuracy.
     */
    private function getRecommendationAccuracy(string $sessionId, int $userId = null): float
    {
        $recommended = MLInteractionLog::where(function($query) use ($sessionId, $userId) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('session_id', $sessionId);
                }
            })
            ->whereNotNull('recommendation_source')
            ->where('created_at', '>', now()->subDays(30))
            ->count();

        $interacted = MLInteractionLog::where(function($query) use ($sessionId, $userId) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('session_id', $sessionId);
                }
            })
            ->whereNotNull('recommendation_source')
            ->whereIn('interaction_type', ['recommendation_click', 'like', 'bookmark', 'share'])
            ->where('created_at', '>', now()->subDays(30))
            ->count();

        return $recommended > 0 ? round(($interacted / $recommended) * 100, 1) : 0;
    }

    /**
     * Train user clustering (simplified).
     */
    private function trainUserClustering(): void
    {
        // Simplified K-means implementation.
        // In production use a more robust ML library.
        
        $profiles = MLUserProfile::whereNotNull('category_preferences')->get();
        
        if ($profiles->count() < 5) {
            return; // Additional data is required.
        }

        // Assign clusters based on dominant preferences.
        foreach ($profiles as $profile) {
            $cluster = $this->assignUserCluster($profile);
            $profile->update([
                'user_cluster' => $cluster,
                'cluster_confidence' => 0.8 // Simplificado
            ]);
        }
    }

    /**
     * Assign a user cluster based on preferences.
     */
    private function assignUserCluster(MLUserProfile $profile): int
    {
        $preferences = $profile->category_preferences ?? [];
        
        if (empty($preferences)) {
            return 0; // Cluster por defecto
        }

        // Simplified logic based on dominant categories.
        $maxPreference = max($preferences);
        $dominantCategory = array_search($maxPreference, $preferences);
        
        // Map categories to clusters (simplified).
        $categoryToCluster = [
            1 => 1, // General construction
            2 => 2, // Technical/professional
            3 => 3, // Design/innovation
            4 => 4, // Social/trends
        ];

        return $categoryToCluster[$dominantCategory] ?? 0;
    }

    /**
     * Retrieve overall system metrics.
     */
    private function getOverallMetrics(\DateTime $from): array
    {
        $totalInteractions = MLInteractionLog::where('created_at', '>=', $from)->count();
        $uniqueUsers = MLInteractionLog::where('created_at', '>=', $from)
            ->distinct(['user_id', 'session_id'])
            ->count();
        
        $avgEngagement = MLInteractionLog::where('created_at', '>=', $from)
            ->avg('engagement_score') ?? 0;

        return [
            'total_interactions' => $totalInteractions,
            'unique_users' => $uniqueUsers,
            'avg_engagement_score' => round($avgEngagement, 3),
            'active_profiles' => MLUserProfile::where('last_activity', '>=', $from)->count()
        ];
    }
}


