<?php

namespace App\Services\ML;

use App\Models\MLInteractionLog;
use App\Models\MLUserProfile;
use App\Models\MLPostVector;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * ML Health Monitor Service
 * 
 * Monitorea la salud del sistema de Machine Learning
 * Detecta problemas de rendimiento, calidad de datos y degradación del modelo
 */
class MLHealthMonitorService
{
    private const CACHE_KEY = 'ml_health_status';
    private const CACHE_TTL = 300; // 5 minutes

    /**
     * Obtener estado completo de salud del sistema ML
     */
    public function getHealthStatus(bool $detailed = false): array
    {
        if (!$detailed) {
            return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function() {
                return $this->calculateHealthStatus();
            });
        }

        return $this->calculateHealthStatus();
    }

    /**
     * Calcular estado de salud
     */
    private function calculateHealthStatus(): array
    {
        $checks = [
            'data_quality' => $this->checkDataQuality(),
            'model_performance' => $this->checkModelPerformance(),
            'system_resources' => $this->checkSystemResources(),
            'data_freshness' => $this->checkDataFreshness(),
            'recommendation_quality' => $this->checkRecommendationQuality(),
            'anomaly_rate' => $this->checkAnomalyRate(),
        ];

        $overallScore = $this->calculateOverallScore($checks);
        $status = $this->getStatusLevel($overallScore);

        return [
            'status' => $status,
            'overall_score' => round($overallScore, 2),
            'checks' => $checks,
            'alerts' => $this->generateAlerts($checks),
            'recommendations' => $this->generateRecommendations($checks),
            'last_check' => now()->toIso8601String(),
            'next_check' => now()->addMinutes(5)->toIso8601String()
        ];
    }

    /**
     * Verificar calidad de datos
     */
    private function checkDataQuality(): array
    {
        $issues = [];
        $score = 100;

        // 1. Verificar interacciones recientes
        $recentInteractions = MLInteractionLog::where('created_at', '>', now()->subHours(24))
            ->count();

        if ($recentInteractions < 10) {
            $issues[] = 'Pocas interacciones en las últimas 24 horas';
            $score -= 20;
        }

        // 2. Verificar perfiles de usuario
        $totalProfiles = MLUserProfile::count();
        $activeProfiles = MLUserProfile::where('updated_at', '>', now()->subDays(7))
            ->count();

        $activeRatio = $totalProfiles > 0 ? $activeProfiles / $totalProfiles : 0;
        
        if ($activeRatio < 0.3) {
            $issues[] = 'Baja tasa de perfiles activos';
            $score -= 15;
        }

        // 3. Verificar vectores de posts
        $totalPosts = DB::table('posts')->where('status', 'published')->count();
        $vectorizedPosts = MLPostVector::count();

        $vectorizationRatio = $totalPosts > 0 ? $vectorizedPosts / $totalPosts : 0;

        if ($vectorizationRatio < 0.8) {
            $issues[] = 'Posts sin vectorizar';
            $score -= 10;
        }

        // 4. Verificar datos nulos o inválidos
        $invalidInteractions = MLInteractionLog::whereNull('post_id')
            ->orWhereNull('interaction_type')
            ->where('created_at', '>', now()->subDays(7))
            ->count();

        if ($invalidInteractions > 0) {
            $issues[] = "{$invalidInteractions} interacciones con datos inválidos";
            $score -= 5;
        }

        return [
            'status' => $this->getCheckStatus($score),
            'score' => max(0, $score),
            'metrics' => [
                'recent_interactions' => $recentInteractions,
                'active_profiles_ratio' => round($activeRatio * 100, 2),
                'vectorization_ratio' => round($vectorizationRatio * 100, 2),
                'invalid_interactions' => $invalidInteractions
            ],
            'issues' => $issues
        ];
    }

    /**
     * Verificar rendimiento del modelo
     */
    private function checkModelPerformance(): array
    {
        $issues = [];
        $score = 100;

        // 1. Verificar tasa de clicks en recomendaciones
        $recommendationClicks = MLInteractionLog::where('interaction_type', 'recommendation_click')
            ->where('created_at', '>', now()->subDays(7))
            ->count();

        // Use 'view' as the base interaction type for recommendations
        $totalViews = MLInteractionLog::where('interaction_type', 'view')
            ->whereNotNull('recommendation_source')
            ->where('created_at', '>', now()->subDays(7))
            ->count();

        $ctr = $totalViews > 0 ? $recommendationClicks / $totalViews : 0;

        if ($ctr < 0.05) {
            $issues[] = 'CTR de recomendaciones bajo';
            $score -= 20;
        }

        // 2. Verificar engagement promedio
        $avgEngagement = MLInteractionLog::where('created_at', '>', now()->subDays(7))
            ->whereNotNull('engagement_score')
            ->avg('engagement_score');

        if ($avgEngagement < 30) {
            $issues[] = 'Engagement promedio bajo';
            $score -= 15;
        }

        // 3. Verificar diversidad de recomendaciones
        $uniqueRecommendedPosts = MLInteractionLog::where('interaction_type', 'view')
            ->whereNotNull('recommendation_source')
            ->where('created_at', '>', now()->subDays(7))
            ->distinct('post_id')
            ->count('post_id');

        if ($uniqueRecommendedPosts < 20) {
            $issues[] = 'Baja diversidad en recomendaciones';
            $score -= 10;
        }

        return [
            'status' => $this->getCheckStatus($score),
            'score' => max(0, $score),
            'metrics' => [
                'ctr' => round($ctr * 100, 2),
                'avg_engagement' => round($avgEngagement ?? 0, 2),
                'unique_recommendations' => $uniqueRecommendedPosts
            ],
            'issues' => $issues
        ];
    }

    /**
     * Verificar recursos del sistema
     */
    private function checkSystemResources(): array
    {
        $issues = [];
        $score = 100;

        // 1. Verificar tamaño de caché
        try {
            $cacheSize = Cache::get('ml_cache_size', 0);
            if ($cacheSize > 100000) { // 100MB
                $issues[] = 'Caché ML muy grande';
                $score -= 10;
            }
        } catch (\Exception $e) {
            Log::warning('Error checking cache size', ['error' => $e->getMessage()]);
        }

        // 2. Verificar tamaño de tabla de interacciones
        $interactionCount = MLInteractionLog::count();
        if ($interactionCount > 1000000) {
            $issues[] = 'Tabla de interacciones muy grande (considerar archivado)';
            $score -= 5;
        }

        // 3. Verificar memoria de PHP
        $memoryUsage = memory_get_usage(true) / 1024 / 1024; // MB
        $memoryLimit = ini_get('memory_limit');
        
        if ($memoryUsage > 100) {
            $issues[] = 'Alto uso de memoria';
            $score -= 10;
        }

        return [
            'status' => $this->getCheckStatus($score),
            'score' => max(0, $score),
            'metrics' => [
                'cache_size_mb' => round($cacheSize / 1024 / 1024, 2),
                'interaction_count' => $interactionCount,
                'memory_usage_mb' => round($memoryUsage, 2),
                'memory_limit' => $memoryLimit
            ],
            'issues' => $issues
        ];
    }

    /**
     * Verificar frescura de datos
     */
    private function checkDataFreshness(): array
    {
        $issues = [];
        $score = 100;

        // 1. Verificar última actualización de vectores
        $lastVectorUpdate = MLPostVector::max('updated_at');
        
        if ($lastVectorUpdate) {
            $hoursSinceUpdate = Carbon::parse($lastVectorUpdate)->diffInHours(now());
            
            if ($hoursSinceUpdate > 48) {
                $issues[] = 'Vectores de posts desactualizados';
                $score -= 20;
            }
        } else {
            $issues[] = 'No hay vectores de posts';
            $score -= 30;
        }

        // 2. Verificar última actualización de perfiles
        $lastProfileUpdate = MLUserProfile::max('updated_at');
        
        if ($lastProfileUpdate) {
            $hoursSinceProfileUpdate = Carbon::parse($lastProfileUpdate)->diffInHours(now());
            
            if ($hoursSinceProfileUpdate > 24) {
                $issues[] = 'Perfiles de usuario desactualizados';
                $score -= 15;
            }
        }

        // 3. Verificar última interacción
        $lastInteraction = MLInteractionLog::max('created_at');
        
        if ($lastInteraction) {
            $hoursSinceInteraction = Carbon::parse($lastInteraction)->diffInHours(now());
            
            if ($hoursSinceInteraction > 12) {
                $issues[] = 'Sin interacciones recientes';
                $score -= 10;
            }
        }

        return [
            'status' => $this->getCheckStatus($score),
            'score' => max(0, $score),
            'metrics' => [
                'last_vector_update' => $lastVectorUpdate?->toIso8601String(),
                'last_profile_update' => $lastProfileUpdate?->toIso8601String(),
                'last_interaction' => $lastInteraction?->toIso8601String()
            ],
            'issues' => $issues
        ];
    }

    /**
     * Verificar calidad de recomendaciones
     */
    private function checkRecommendationQuality(): array
    {
        $issues = [];
        $score = 100;

        // 1. Verificar tasa de feedback positivo
        $positiveFeedback = MLInteractionLog::where('interaction_type', 'like')
            ->where('created_at', '>', now()->subDays(7))
            ->count();

        $totalInteractions = MLInteractionLog::where('created_at', '>', now()->subDays(7))
            ->count();

        $positiveRate = $totalInteractions > 0 ? $positiveFeedback / $totalInteractions : 0;

        if ($positiveRate < 0.1) {
            $issues[] = 'Baja tasa de feedback positivo';
            $score -= 15;
        }

        // 2. Verificar tiempo promedio de lectura
        $avgReadingTime = MLInteractionLog::where('created_at', '>', now()->subDays(7))
            ->whereNotNull('time_spent_seconds')
            ->avg('time_spent_seconds');

        if ($avgReadingTime < 30) {
            $issues[] = 'Tiempo de lectura promedio muy bajo';
            $score -= 10;
        }

        return [
            'status' => $this->getCheckStatus($score),
            'score' => max(0, $score),
            'metrics' => [
                'positive_feedback_rate' => round($positiveRate * 100, 2),
                'avg_reading_time' => round($avgReadingTime ?? 0, 2)
            ],
            'issues' => $issues
        ];
    }

    /**
     * Verificar tasa de anomalías
     */
    private function checkAnomalyRate(): array
    {
        $issues = [];
        $score = 100;

        // Verificar interacciones marcadas como anómalas
        $anomalousInteractions = MLInteractionLog::where('created_at', '>', now()->subDays(7))
            ->where('metadata->is_anomalous', true)
            ->count();

        $totalInteractions = MLInteractionLog::where('created_at', '>', now()->subDays(7))
            ->count();

        $anomalyRate = $totalInteractions > 0 ? $anomalousInteractions / $totalInteractions : 0;

        if ($anomalyRate > 0.1) {
            $issues[] = 'Alta tasa de anomalías detectadas';
            $score -= 20;
        }

        return [
            'status' => $this->getCheckStatus($score),
            'score' => max(0, $score),
            'metrics' => [
                'anomaly_rate' => round($anomalyRate * 100, 2),
                'anomalous_interactions' => $anomalousInteractions
            ],
            'issues' => $issues
        ];
    }

    /**
     * Calcular score general
     */
    private function calculateOverallScore(array $checks): float
    {
        $weights = [
            'data_quality' => 0.25,
            'model_performance' => 0.25,
            'system_resources' => 0.15,
            'data_freshness' => 0.15,
            'recommendation_quality' => 0.15,
            'anomaly_rate' => 0.05
        ];

        $totalScore = 0;
        foreach ($checks as $key => $check) {
            $totalScore += $check['score'] * ($weights[$key] ?? 0);
        }

        return $totalScore;
    }

    /**
     * Generar alertas
     */
    private function generateAlerts(array $checks): array
    {
        $alerts = [];

        foreach ($checks as $checkName => $check) {
            if ($check['status'] === 'critical' || $check['status'] === 'warning') {
                foreach ($check['issues'] as $issue) {
                    $alerts[] = [
                        'severity' => $check['status'],
                        'check' => $checkName,
                        'message' => $issue,
                        'timestamp' => now()->toIso8601String()
                    ];
                }
            }
        }

        return $alerts;
    }

    /**
     * Generar recomendaciones
     */
    private function generateRecommendations(array $checks): array
    {
        $recommendations = [];

        if ($checks['data_quality']['score'] < 70) {
            $recommendations[] = 'Ejecutar proceso de limpieza de datos';
            $recommendations[] = 'Vectorizar posts faltantes';
        }

        if ($checks['model_performance']['score'] < 70) {
            $recommendations[] = 'Re-entrenar modelos de recomendación';
            $recommendations[] = 'Ajustar parámetros de algoritmos';
        }

        if ($checks['data_freshness']['score'] < 70) {
            $recommendations[] = 'Actualizar vectores de posts';
            $recommendations[] = 'Recalcular perfiles de usuario';
        }

        if ($checks['system_resources']['score'] < 70) {
            $recommendations[] = 'Limpiar caché ML';
            $recommendations[] = 'Archivar interacciones antiguas';
        }

        return $recommendations;
    }

    /**
     * Helpers
     */
    private function getCheckStatus(float $score): string
    {
        if ($score >= 80) return 'healthy';
        if ($score >= 60) return 'warning';
        return 'critical';
    }

    private function getStatusLevel(float $score): string
    {
        if ($score >= 90) return 'excellent';
        if ($score >= 75) return 'good';
        if ($score >= 60) return 'fair';
        if ($score >= 40) return 'poor';
        return 'critical';
    }
}

