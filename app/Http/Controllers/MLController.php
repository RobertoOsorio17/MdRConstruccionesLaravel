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
     * Obtiene recomendaciones ML para un usuario
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
                'error' => 'No se pudieron generar recomendaciones',
                'recommendations' => []
            ], 500);
        }
    }

    /**
     * Registra una interacción de usuario para el sistema ML
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

            // Registrar la interacción
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

            // Actualizar perfil de usuario si es necesario
            $this->updateUserProfile($sessionId, $userId, $interaction);

            return response()->json([
                'success' => true,
                'message' => 'Interacción registrada correctamente',
                'interaction_id' => $interaction->id
            ]);

        } catch (\Exception $e) {
            Log::error('Error logging ML interaction', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'No se pudo registrar la interacción'
            ], 500);
        }
    }

    /**
     * Obtiene insights ML para un usuario
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
                        'message' => 'Sigue explorando para obtener recomendaciones personalizadas',
                        'reading_time' => 0,
                        'posts_read' => 0,
                        'top_categories' => [],
                        'reading_patterns' => []
                    ]
                ]);
            }

            $insights = [
                'reading_time' => round($profile->avg_reading_time / 60, 1), // en minutos
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
                'error' => 'No se pudieron obtener los insights'
            ], 500);
        }
    }

    /**
     * Fuerza el entrenamiento de modelos ML
     */
    public function trainModels(Request $request): JsonResponse
    {
        try {
            // Solo permitir a administradores (simplificado - verificar role de otra manera)
            $user = Auth::user();
            if (!$user || !$user->is_admin) {
                return response()->json([
                    'success' => false,
                    'error' => 'No autorizado'
                ], 403);
            }

            // Analizar todos los posts
            $this->contentAnalysis->analyzeAllPosts();
            
            // Entrenar clustering de usuarios (simplificado)
            $this->trainUserClustering();
            
            return response()->json([
                'success' => true,
                'message' => 'Modelos entrenados correctamente',
                'trained_at' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            Log::error('Error training ML models', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error entrenando modelos'
            ], 500);
        }
    }

    /**
     * Obtiene métricas de rendimiento del sistema ML
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
                'error' => 'No se pudieron obtener las métricas'
            ], 500);
        }
    }

    /**
     * Formatea las recomendaciones para el frontend
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
                    'name' => $rec['post']->author->name ?? 'Anónimo',
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
     * Actualiza el perfil de usuario basado en interacciones
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

        // Actualizar métricas básicas
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

        // Actualizar preferencias de categorías
        $post = Post::with(['categories', 'tags'])->find($interaction->post_id);
        if ($post && $post->categories->isNotEmpty()) {
            $categoryWeights = [];
            foreach ($post->categories as $category) {
                $weight = $this->calculateInteractionWeight($interaction);
                $categoryWeights[$category->id] = $weight;
            }
            $profile->updateCategoryPreferences($categoryWeights);
        }

        // Actualizar intereses de tags
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
     * Calcula el peso de una interacción para actualizar preferencias
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
        
        // Boost por tiempo gastado
        if ($interaction->time_spent_seconds > 60) {
            $baseWeight *= 1.5;
        }
        
        // Boost por engagement score
        if ($interaction->engagement_score > 0.7) {
            $baseWeight *= 1.3;
        }

        return min($baseWeight, 2.0);
    }

    /**
     * Obtiene top categorías del usuario
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
     * Obtiene patrones de lectura
     */
    private function getReadingPatterns(MLUserProfile $profile): array
    {
        $patterns = $profile->reading_patterns ?? [];
        
        return [
            'preferred_time' => $patterns['preferred_time'] ?? 'No definido',
            'avg_session_duration' => round(($patterns['avg_session_duration'] ?? 0) / 60, 1),
            'reading_frequency' => $patterns['reading_frequency'] ?? 'No definido'
        ];
    }

    /**
     * Obtiene descripción del cluster de usuario
     */
    private function getClusterDescription(int $cluster = null): string
    {
        $descriptions = [
            0 => 'Lector ocasional - Explora diversos temas ocasionalmente',
            1 => 'Entusiasta de la construcción - Le interesan proyectos y técnicas',
            2 => 'Profesional del sector - Busca información técnica especializada',
            3 => 'Aprendiz activo - Constantemente busca nueva información',
            4 => 'Lector social - Le gusta interactuar y compartir contenido'
        ];

        return $descriptions[$cluster] ?? 'Perfil en desarrollo';
    }

    /**
     * Calcula precisión de recomendaciones
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
     * Entrenar clustering de usuarios (simplificado)
     */
    private function trainUserClustering(): void
    {
        // Implementación simplificada de K-means
        // En producción se usaría una librería ML más robusta
        
        $profiles = MLUserProfile::whereNotNull('category_preferences')->get();
        
        if ($profiles->count() < 5) {
            return; // Necesitamos más datos
        }

        // Asignar clusters basados en preferencias dominantes
        foreach ($profiles as $profile) {
            $cluster = $this->assignUserCluster($profile);
            $profile->update([
                'user_cluster' => $cluster,
                'cluster_confidence' => 0.8 // Simplificado
            ]);
        }
    }

    /**
     * Asigna cluster a usuario basado en preferencias
     */
    private function assignUserCluster(MLUserProfile $profile): int
    {
        $preferences = $profile->category_preferences ?? [];
        
        if (empty($preferences)) {
            return 0; // Cluster por defecto
        }

        // Lógica simplificada basada en categorías dominantes
        $maxPreference = max($preferences);
        $dominantCategory = array_search($maxPreference, $preferences);
        
        // Mapear categorías a clusters (simplificado)
        $categoryToCluster = [
            1 => 1, // Construcción general
            2 => 2, // Técnico/profesional
            3 => 3, // Diseño/innovación
            4 => 4, // Social/tendencias
        ];

        return $categoryToCluster[$dominantCategory] ?? 0;
    }

    /**
     * Obtiene métricas generales del sistema
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