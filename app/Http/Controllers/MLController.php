<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\MLUserProfile;
use App\Models\MLInteractionLog;
use App\Services\ContentAnalysisService;
use App\Services\ContentAnalysisServiceV2;
use App\Services\MLRecommendationService;
use App\Services\MLUserProfileService;
use App\Services\MLMetricsService;
use App\Services\ML\KMeansClusteringService;
use App\Services\ML\AnomalyDetectionService;
use App\Services\ML\MLHealthMonitorService;
use App\Http\Requests\ML\GetRecommendationsRequest;
use App\Http\Requests\ML\LogInteractionRequest;
use App\Http\Requests\ML\TrainModelsRequest;
use App\Exceptions\ML\MLRecommendationException;
use App\Exceptions\ML\MLTrainingException;
use App\Exceptions\ML\MLProfileUpdateException;
use App\Helpers\MLSettingsHelper;
use App\Jobs\UpdateMLUserProfileJob;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Exposes machine learning powered personalization endpoints that drive recommendations and insight logging.
 * Connects content analysis services with user sessions to deliver contextual suggestions and telemetry.
 *
 * V2.0: Integrated with AnomalyDetectionService and MLHealthMonitorService
 */
class MLController extends Controller
{
    private ContentAnalysisService $contentAnalysis;
    private ContentAnalysisServiceV2 $contentAnalysisV2;
    private MLRecommendationService $mlRecommendation;
    private MLUserProfileService $userProfileService;
    private MLMetricsService $metricsService;
    private KMeansClusteringService $clusteringService;
    private AnomalyDetectionService $anomalyDetection;
    private MLHealthMonitorService $healthMonitor;

    public function __construct(
        ContentAnalysisService $contentAnalysis,
        ContentAnalysisServiceV2 $contentAnalysisV2,
        MLRecommendationService $mlRecommendation,
        MLUserProfileService $userProfileService,
        MLMetricsService $metricsService,
        KMeansClusteringService $clusteringService,
        AnomalyDetectionService $anomalyDetection,
        MLHealthMonitorService $healthMonitor
    ) {
        $this->contentAnalysis = $contentAnalysis;
        $this->contentAnalysisV2 = $contentAnalysisV2;
        $this->mlRecommendation = $mlRecommendation;
        $this->userProfileService = $userProfileService;
        $this->metricsService = $metricsService;
        $this->clusteringService = $clusteringService;
        $this->anomalyDetection = $anomalyDetection;
        $this->healthMonitor = $healthMonitor;
    }

    /**
     * Retrieve ML recommendations for a user.
     */
    public function getRecommendations(GetRecommendationsRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $sessionId = $validated['session_id'] ?? $request->session()->getId();
            $userId = Auth::id();
            $currentPostId = $validated['current_post_id'] ?? null;
            $limit = $validated['limit'];

            $recommendations = $this->mlRecommendation->getRecommendations(
                $sessionId,
                $userId,
                $currentPostId,
                $limit
            );

            if (empty($recommendations)) {
                throw MLRecommendationException::noCandidatesAvailable();
            }

            $response = [
                'success' => true,
                'recommendations' => $this->formatRecommendations($recommendations),
                'metadata' => [
                    'algorithm_version' => '2.0',
                    'generated_at' => now()->toISOString(),
                    'user_type' => $userId ? 'authenticated' : 'guest',
                    'total_count' => count($recommendations),
                    'session_id' => $sessionId,
                    'diversity_boost' => $validated['diversity_boost'],
                    'algorithm' => $validated['algorithm'] ?? 'hybrid'
                ]
            ];

            // Include explanations if requested
            if ($validated['include_explanation'] && !empty($recommendations)) {
                $response['explanations'] = $this->generateExplanations($recommendations);
            }

            return response()->json($response);

        } catch (MLRecommendationException $e) {
            return response()->json($e->toResponse(), $e->getHttpStatusCode());
        } catch (\Exception $e) {
            Log::error('Error generating ML recommendations', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->validated()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Recommendations could not be generated.',
                'error_code' => 'RECOMMENDATION_ERROR',
                'recommendations' => []
            ], 500);
        }
    }

    /**
     * Register a user interaction for the ML system.
     * V2.0: Now includes anomaly detection
     */
    public function logInteraction(LogInteractionRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $sessionId = $validated['session_id'] ?? $request->session()->getId();
            $userId = Auth::id();

            // Prepare interaction data with advanced metrics
            $interactionData = [
                'session_id' => $sessionId,
                'user_id' => $userId,
                'post_id' => $validated['post_id'],
                'interaction_type' => $validated['interaction_type'],
                'time_spent_seconds' => $validated['time_spent_seconds'] ?? null,
                'scroll_percentage' => $validated['scroll_percentage'] ?? null,
                'completed_reading' => $validated['completed_reading'],
                'recommendation_source' => $validated['recommendation_source'] ?? null,
                'recommendation_position' => $validated['recommendation_position'] ?? null,
                'recommendation_score' => $validated['recommendation_score'] ?? null,
                'interaction_metadata' => array_merge(
                    $validated['metadata'] ?? [],
                    [
                        'viewport' => [
                            'width' => $validated['viewport_width'] ?? null,
                            'height' => $validated['viewport_height'] ?? null
                        ],
                        'device_type' => $validated['device_type'] ?? 'unknown',
                        'referrer' => $validated['referrer'] ?? null,
                        'user_agent' => $validated['user_agent'] ?? null,
                        'engagement_metrics' => [
                            'clicks_count' => $validated['clicks_count'] ?? 0,
                            'copy_events' => $validated['copy_events'] ?? 0,
                            'highlight_events' => $validated['highlight_events'] ?? 0,
                            'scroll_depth_max' => $validated['scroll_depth_max'] ?? null,
                            'scroll_velocity' => $validated['scroll_velocity'] ?? null,
                            'reading_velocity' => $validated['reading_velocity'] ?? null,
                            'pause_count' => $validated['pause_count'] ?? 0,
                            'avg_pause_duration' => $validated['avg_pause_duration'] ?? null
                        ]
                    ]
                )
            ];

            // ✅ FIXED: Calculate engagement score before anomaly detection
            $engagementScore = $this->calculateEngagementScore($interactionData);
            // Clamp score between 0-100 to prevent invalid values
            $interactionData['engagement_score'] = max(0, min(100, $engagementScore));

            // Detect anomalies (if enabled in settings)
            $anomalyConfig = MLSettingsHelper::getAnomalyDetectionConfig();
            if ($anomalyConfig['enabled']) {
                $anomalyResult = $this->anomalyDetection->detectAnomalies($interactionData, $sessionId);

                // Add anomaly detection results to metadata
                $interactionData['interaction_metadata']['anomaly_detection'] = $anomalyResult;
                $interactionData['interaction_metadata']['is_anomalous'] = $anomalyResult['has_anomalies'];

                // Auto-block if enabled and anomaly detected
                if ($anomalyConfig['auto_block'] && $anomalyResult['has_anomalies'] && $anomalyResult['anomaly_score'] >= $anomalyConfig['threshold']) {
                    // Block user if authenticated
                    if ($userId) {
                        $user = Auth::user();
                        if ($user && !$user->isMLBlocked()) {
                            $user->blockByML(
                                $anomalyResult['anomaly_score'],
                                'Auto-blocked due to suspicious activity: ' . implode(', ', $anomalyResult['anomalies'] ?? [])
                            );

                            Log::warning('User auto-blocked by ML system', [
                                'user_id' => $userId,
                                'session_id' => $sessionId,
                                'anomaly_score' => $anomalyResult['anomaly_score'],
                                'anomalies' => $anomalyResult['anomalies'] ?? [],
                            ]);

                            // Don't logout immediately - let frontend handle it gracefully
                            // This prevents data loss and provides better UX
                            return response()->json([
                                'success' => false,
                                'error' => 'Your account has been temporarily blocked due to suspicious activity. Please contact support.',
                                'error_code' => 'ML_AUTO_BLOCKED',
                                'should_logout' => true,  // Frontend will handle logout
                                'block_info' => [
                                    'reason' => 'Suspicious activity detected',
                                    'anomaly_score' => $anomalyResult['anomaly_score'],
                                    'support_email' => config('mail.from.address')
                                ]
                            ], 403);
                        }
                    } else {
                        // For guest users, just log the anomaly
                        Log::warning('Suspicious guest activity detected', [
                            'session_id' => $sessionId,
                            'anomaly_score' => $anomalyResult['anomaly_score'],
                            'anomalies' => $anomalyResult['anomalies'] ?? [],
                        ]);
                    }
                }
            } else {
                $interactionData['interaction_metadata']['anomaly_detection'] = null;
                $interactionData['interaction_metadata']['is_anomalous'] = false;
            }

            // Record the interaction with retry logic
            $interaction = DB::transaction(function () use ($interactionData) {
                return MLInteractionLog::logInteraction($interactionData);
            });

            // Update user profile (queue or sync based on settings)
            $performanceConfig = MLSettingsHelper::getPerformanceConfig();

            if ($performanceConfig['enable_queue_jobs']) {
                // Dispatch to queue for async processing
                UpdateMLUserProfileJob::dispatch($sessionId, $userId, $interaction->id);
            } else {
                // Process synchronously
                dispatch(function () use ($sessionId, $userId, $interaction) {
                    try {
                        $this->updateUserProfile($sessionId, $userId, $interaction);
                    } catch (\Exception $e) {
                        Log::warning('Failed to update user profile after interaction', [
                            'error' => $e->getMessage(),
                            'interaction_id' => $interaction->id
                        ]);
                    }
                })->afterResponse();
            }

            return response()->json([
                'success' => true,
                'message' => 'Interaction recorded successfully.',
                'data' => [
                    'interaction_id' => $interaction->id,
                    'implicit_rating' => round($interaction->implicit_rating, 2),
                    'engagement_score' => round($interaction->engagement_score, 2)
                ]
            ]);

        } catch (MLProfileUpdateException $e) {
            return response()->json($e->toResponse(), $e->getHttpStatusCode());
        } catch (\Exception $e) {
            Log::error('Error logging ML interaction', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->validated()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'The interaction could not be recorded.',
                'error_code' => 'INTERACTION_LOG_ERROR'
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
     * Trigger ML model training with advanced options.
     */
    public function trainModels(TrainModelsRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $startTime = microtime(true);

            $stats = [
                'posts_analyzed' => 0,
                'profiles_updated' => 0,
                'clusters_updated' => 0,
                'cache_cleared' => false,
                'mode' => $validated['mode']
            ];

            // Execute training based on mode
            switch ($validated['mode']) {
                case 'posts_only':
                    $stats['posts_analyzed'] = $this->trainPostVectors($validated['batch_size']);
                    break;

                case 'profiles_only':
                    $stats['profiles_updated'] = $this->trainUserProfiles($validated['batch_size']);
                    break;

                case 'incremental':
                    $stats = $this->performIncrementalTraining($validated['batch_size']);
                    break;

                case 'full':
                default:
                    $stats['posts_analyzed'] = $this->trainPostVectors($validated['batch_size']);
                    $stats['profiles_updated'] = $this->trainUserProfiles($validated['batch_size']);
                    $stats['clusters_updated'] = $this->retrainClustering();
                    break;
            }

            // Clear caches if requested
            if ($validated['clear_cache']) {
                $this->contentAnalysisV2->clearCaches();

                // Clear ML caches (check if driver supports tags)
                try {
                    if (method_exists(Cache::getStore(), 'tags')) {
                        Cache::tags(['ml_recommendations', 'ml_metrics'])->flush();
                    } else {
                        // Fallback: clear specific keys
                        Cache::forget('ml_user_factors');
                        Cache::forget('ml_item_factors');
                        Cache::forget('ml_cluster_centroids');
                    }
                } catch (\BadMethodCallException $e) {
                    // Driver doesn't support tags, use fallback
                    Cache::forget('ml_user_factors');
                    Cache::forget('ml_item_factors');
                    Cache::forget('ml_cluster_centroids');
                }

                $stats['cache_cleared'] = true;
            }

            $stats['duration_seconds'] = round(microtime(true) - $startTime, 2);
            $stats['trained_at'] = now()->toISOString();

            // Send notification if requested
            if ($validated['notify_on_completion'] && $validated['notification_email']) {
                $this->sendTrainingNotification($validated['notification_email'], $stats);
            }

            Log::info('ML models trained successfully', $stats);

            return response()->json([
                'success' => true,
                'message' => 'Models trained successfully.',
                'stats' => $stats
            ]);

        } catch (MLTrainingException $e) {
            return response()->json($e->toResponse(), $e->getHttpStatusCode());
        } catch (\Exception $e) {
            Log::error('Error training ML models', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error training models.',
                'error_code' => 'TRAINING_ERROR'
            ], 500);
        }
    }

    /**
     * Train post vectors in batches.
     */
    private function trainPostVectors(int $batchSize): int
    {
        $count = 0;

        Post::published()
            ->whereDoesntHave('mlVector')
            ->orWhereHas('mlVector', function($query) {
                $query->where('vector_updated_at', '<', now()->subHours(24));
            })
            ->chunk($batchSize, function($posts) use (&$count) {
                foreach ($posts as $post) {
                    try {
                        $this->contentAnalysisV2->analyzePost($post);
                        $count++;
                    } catch (\Exception $e) {
                        Log::warning('Failed to analyze post', [
                            'post_id' => $post->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            });

        return $count;
    }

    /**
     * Train user profiles in batches.
     */
    private function trainUserProfiles(int $batchSize): int
    {
        $count = 0;

        MLUserProfile::where('profile_updated_at', '<', now()->subHours(24))
            ->orWhereNull('profile_updated_at')
            ->chunk($batchSize, function($profiles) use (&$count) {
                foreach ($profiles as $profile) {
                    try {
                        $this->userProfileService->updateUserProfile(
                            $profile->session_id,
                            $profile->user_id
                        );
                        $count++;
                    } catch (\Exception $e) {
                        Log::warning('Failed to update profile', [
                            'profile_id' => $profile->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            });

        return $count;
    }

    /**
     * Perform incremental training (only new/updated data).
     */
    private function performIncrementalTraining(int $batchSize): array
    {
        $stats = [
            'posts_analyzed' => 0,
            'profiles_updated' => 0,
            'clusters_updated' => 0
        ];

        // Only train posts without vectors
        $stats['posts_analyzed'] = Post::published()
            ->whereDoesntHave('mlVector')
            ->chunk($batchSize, function($posts) {
                foreach ($posts as $post) {
                    $this->contentAnalysisV2->analyzePost($post);
                }
            });

        // Only update profiles with recent activity
        $stats['profiles_updated'] = MLUserProfile::where('last_activity', '>', now()->subHours(24))
            ->where('profile_updated_at', '<', now()->subHours(1))
            ->chunk($batchSize, function($profiles) {
                foreach ($profiles as $profile) {
                    $this->userProfileService->updateUserProfile(
                        $profile->session_id,
                        $profile->user_id
                    );
                }
            });

        return $stats;
    }

    /**
     * Send training completion notification.
     */
    private function sendTrainingNotification(string $email, array $stats): void
    {
        // Implementation would use Laravel Mail
        // For now, just log
        Log::info('Training notification sent', [
            'email' => $email,
            'stats' => $stats
        ]);
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

    /**
     * Get comprehensive ML metrics report.
     */
    public function getMetricsReport(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'k' => 'nullable|integer|min:1|max:50',
                'days' => 'nullable|integer|min:1|max:90'
            ]);

            $k = $validated['k'] ?? 10;
            $days = $validated['days'] ?? 7;

            $report = $this->metricsService->getMetricsReport($k, $days);
            $performanceBySource = $this->metricsService->getPerformanceBySource($days);

            return response()->json([
                'success' => true,
                'report' => $report,
                'performance_by_source' => $performanceBySource
            ]);

        } catch (\Exception $e) {
            Log::error('Error generating metrics report', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Could not generate metrics report.'
            ], 500);
        }
    }

    /**
     * Run A/B test comparison between algorithm variants.
     */
    public function runABTest(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'variant_a' => 'required|string',
                'variant_b' => 'required|string',
                'days' => 'nullable|integer|min:1|max:90'
            ]);

            $days = $validated['days'] ?? 7;

            $results = $this->metricsService->getABTestResults(
                $validated['variant_a'],
                $validated['variant_b'],
                $days
            );

            return response()->json([
                'success' => true,
                'results' => $results
            ]);

        } catch (\Exception $e) {
            Log::error('Error running A/B test', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Could not run A/B test.'
            ], 500);
        }
    }

    /**
     * Update user profile manually.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $sessionId = $request->session()->getId();
            $userId = Auth::id();

            $profile = $this->userProfileService->updateUserProfile($sessionId, $userId);

            return response()->json([
                'success' => true,
                'profile' => [
                    'user_cluster' => $profile->user_cluster,
                    'cluster_confidence' => $profile->cluster_confidence,
                    'engagement_rate' => $profile->engagement_rate,
                    'total_posts_read' => $profile->total_posts_read,
                    'last_updated' => $profile->profile_updated_at
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating user profile', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Could not update profile.'
            ], 500);
        }
    }

    /**
     * Clear ML caches.
     */
    public function clearCaches(Request $request): JsonResponse
    {
        try {
            $this->contentAnalysisV2->clearCaches();

            // Clear ML caches (check if driver supports tags)
            try {
                if (method_exists(Cache::getStore(), 'tags')) {
                    Cache::tags(['ml_recommendations', 'ml_metrics', 'ml_clustering'])->flush();
                } else {
                    // Fallback: clear specific keys
                    $this->clearMLCacheKeys();
                }
            } catch (\BadMethodCallException $e) {
                // Driver doesn't support tags, use fallback
                $this->clearMLCacheKeys();
            }

            Log::info('ML caches cleared by admin', [
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'ML caches cleared successfully.',
                'cleared_at' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            Log::error('Error clearing ML caches', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Could not clear caches.',
                'error_code' => 'CACHE_CLEAR_ERROR'
            ], 500);
        }
    }

    /**
     * Get clustering analysis.
     */
    public function getClusteringAnalysis(Request $request): JsonResponse
    {
        try {
            $profiles = MLUserProfile::whereNotNull('category_preferences')
                ->where('total_posts_read', '>', 5)
                ->get();

            if ($profiles->count() < 5) {
                return response()->json([
                    'success' => false,
                    'error' => 'Insufficient data for clustering analysis.',
                    'error_code' => 'INSUFFICIENT_DATA'
                ], 400);
            }

            // Get current clustering state
            $clusterDistribution = $profiles->groupBy('user_cluster')
                ->map(fn($group) => $group->count())
                ->toArray();

            // Calculate cluster quality metrics
            $avgConfidence = $profiles->avg('cluster_confidence');

            // Get cluster characteristics
            $clusterCharacteristics = [];
            for ($c = 0; $c < 5; $c++) {
                $clusterProfiles = $profiles->where('user_cluster', $c);

                if ($clusterProfiles->isNotEmpty()) {
                    $clusterCharacteristics[$c] = [
                        'size' => $clusterProfiles->count(),
                        'avg_engagement' => round($clusterProfiles->avg('engagement_rate'), 3),
                        'avg_return_rate' => round($clusterProfiles->avg('return_rate'), 3),
                        'avg_posts_read' => round($clusterProfiles->avg('total_posts_read'), 1),
                        'avg_reading_time' => round($clusterProfiles->avg('avg_reading_time'), 1)
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'analysis' => [
                    'total_profiles' => $profiles->count(),
                    'cluster_distribution' => $clusterDistribution,
                    'avg_confidence' => round($avgConfidence, 3),
                    'cluster_characteristics' => $clusterCharacteristics,
                    'analyzed_at' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting clustering analysis', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Could not generate clustering analysis.',
                'error_code' => 'CLUSTERING_ANALYSIS_ERROR'
            ], 500);
        }
    }

    /**
     * Retrain clustering with K-Means.
     */
    public function retrainClustering(Request $request = null)
    {
        try {
            // Get clustering configuration from settings
            $clusteringConfig = MLSettingsHelper::getClusteringConfig();

            // Skip if clustering is disabled
            if (!$clusteringConfig['enabled']) {
                Log::info('Clustering is disabled in settings, skipping retrain');
                return response()->json([
                    'success' => false,
                    'message' => 'Clustering is disabled in settings',
                    'profiles_updated' => 0
                ]);
            }

        $profiles = MLUserProfile::whereNotNull('category_preferences')
            ->where('total_posts_read', '>', 5)
            ->get();

        $minProfiles = max(5, $clusteringConfig['cluster_count']);
        if ($profiles->count() < $minProfiles) {
            throw MLTrainingException::insufficientData('user profiles', $minProfiles, $profiles->count());
        }

        // Perform clustering with configured cluster count
        $result = $this->clusteringService->cluster($profiles, $clusteringConfig['cluster_count']);

        // Update profiles with new cluster assignments
        $updated = 0;
        foreach ($result['assignments'] as $i => $cluster) {
            $profileId = $result['profile_ids'][$i] ?? null;
            if ($profileId) {
                $profile = $profiles->firstWhere('id', $profileId);
                if ($profile) {
                    $confidence = $this->clusteringService->getClusterConfidence(
                        $profile,
                        $result['centroids']
                    );

                    $profile->update([
                        'user_cluster' => $cluster,
                        'cluster_confidence' => $confidence
                    ]);
                    $updated++;
                }
            }
        }

            // Cache centroids for future confidence calculations
            Cache::put('ml_cluster_centroids', $result['centroids'], now()->addDays(7));

            Log::info('Clustering retrained', [
                'profiles_updated' => $updated,
                'iterations' => $result['iterations'],
                'silhouette_score' => $result['metrics']['silhouette_score']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Clustering retrained successfully',
                'profiles_updated' => $updated,
                'iterations' => $result['iterations'],
                'metrics' => $result['metrics']
            ]);

        } catch (\Exception $e) {
            Log::error('Error retraining clustering', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrain clustering',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate explanations for recommendations.
     */
    private function generateExplanations(array $recommendations): array
    {
        $explanations = [];

        foreach ($recommendations as $rec) {
            // Use explanation from ExplainableAI if available
            if (isset($rec['explanation'])) {
                $explanations[] = [
                    'post_id' => $rec['post']->id,
                    'primary_reason' => $rec['explanation']['primary_reason'] ?? $rec['reason'],
                    'detailed_reasons' => $rec['explanation']['detailed_reasons'] ?? [$rec['reason']],
                    'algorithm' => $rec['explanation']['algorithm'] ?? 'Unknown',
                    'confidence' => round(($rec['combined_score'] ?? $rec['score']) * 100, 1),
                    'technical_details' => $rec['explanation']['technical_details'] ?? [],
                    'feature_importance' => $rec['explanation']['feature_importance'] ?? [],
                ];
            } else {
                // Fallback to basic explanation
                $explanations[] = [
                    'post_id' => $rec['post']->id,
                    'reason' => $rec['reason'],
                    'confidence' => round(($rec['combined_score'] ?? $rec['score']) * 100, 1),
                    'factors' => $rec['metadata'] ?? []
                ];
            }
        }

        return $explanations;
    }

    /**
     * Get ML system health status
     *
     * @return JsonResponse
     */
    public function getHealthStatus(Request $request): JsonResponse
    {
        try {
            $detailed = $request->boolean('detailed', false);

            $healthStatus = $this->healthMonitor->getHealthStatus($detailed);

            return response()->json([
                'success' => true,
                'data' => $healthStatus
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting ML health status', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to retrieve health status',
                'error_code' => 'HEALTH_CHECK_ERROR'
            ], 500);
        }
    }

    /**
     * Detect anomalies in recent interactions
     *
     * @return JsonResponse
     */
    public function detectAnomalies(Request $request): JsonResponse
    {
        try {
            $sessionId = $request->input('session_id');
            $limit = $request->input('limit', 100);

            // Get recent interactions
            $query = MLInteractionLog::orderBy('created_at', 'desc')
                ->limit($limit);

            if ($sessionId) {
                $query->where('session_id', $sessionId);
            }

            $interactions = $query->get();

            $anomalies = [];
            foreach ($interactions as $interaction) {
                $metadata = $interaction->interaction_metadata ?? [];
                if (isset($metadata['anomaly_detection']) && $metadata['anomaly_detection']['has_anomalies']) {
                    $anomalies[] = [
                        'interaction_id' => $interaction->id,
                        'post_id' => $interaction->post_id,
                        'session_id' => $interaction->session_id,
                        'anomaly_score' => $metadata['anomaly_detection']['anomaly_score'],
                        'risk_level' => $metadata['anomaly_detection']['risk_level'],
                        'anomalies' => $metadata['anomaly_detection']['anomalies'],
                        'timestamp' => $interaction->created_at->toIso8601String()
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'total_checked' => $interactions->count(),
                    'anomalies_found' => count($anomalies),
                    'anomaly_rate' => $interactions->count() > 0 ?
                        round(count($anomalies) / $interactions->count() * 100, 2) : 0,
                    'anomalies' => $anomalies
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error detecting anomalies', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to detect anomalies',
                'error_code' => 'ANOMALY_DETECTION_ERROR'
            ], 500);
        }
    }

    /**
     * Calculate engagement score for interaction data.
     */
    private function calculateEngagementScore(array $data): float
    {
        $score = 0;

        // Time spent component (0-30 points)
        if (isset($data['time_spent_seconds'])) {
            $score += min(30, $data['time_spent_seconds'] / 10);
        }

        // Scroll percentage component (0-20 points)
        if (isset($data['scroll_percentage'])) {
            $score += ($data['scroll_percentage'] / 100) * 20;
        }

        // Completed reading bonus (20 points)
        if ($data['completed_reading'] ?? false) {
            $score += 20;
        }

        // Engagement metrics from metadata (0-30 points)
        $metadata = $data['interaction_metadata'] ?? [];
        $engagementMetrics = $metadata['engagement_metrics'] ?? [];

        if (isset($engagementMetrics['clicks_count'])) {
            $score += min(10, $engagementMetrics['clicks_count'] * 2);
        }

        if (isset($engagementMetrics['copy_events'])) {
            $score += min(5, $engagementMetrics['copy_events'] * 2.5);
        }

        if (isset($engagementMetrics['highlight_events'])) {
            $score += min(5, $engagementMetrics['highlight_events'] * 2.5);
        }

        if (isset($engagementMetrics['pause_count'])) {
            $score += min(10, $engagementMetrics['pause_count']);
        }

        // Normalize to 0-100
        return min(100, max(0, $score));
    }

    /**
     * Clear ML cache keys (fallback when tags not supported).
     */
    private function clearMLCacheKeys(): void
    {
        $keysToForget = [
            'ml_user_factors',
            'ml_item_factors',
            'ml_cluster_centroids',
            'ml_settings_cache',
            'ml_health_status',
        ];

        foreach ($keysToForget as $key) {
            Cache::forget($key);
        }

        // Clear user profile caches (pattern-based)
        // Note: This is limited without tag support
        Log::info('ML caches cleared using fallback method (no tag support)');
    }
}



