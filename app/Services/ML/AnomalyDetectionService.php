<?php

namespace App\Services\ML;

use App\Models\MLInteractionLog;
use App\Models\MLUserProfile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * Anomaly Detection Service
 * 
 * Detecta comportamientos sospechosos y anomalías en las interacciones de usuarios
 * Implementa múltiples técnicas de detección de anomalías
 */
class AnomalyDetectionService
{
    private const CACHE_PREFIX = 'anomaly_detection:';
    private const CACHE_TTL = 3600; // 1 hour

    /**
     * Detectar anomalías en una interacción
     */
    public function detectAnomalies(array $interactionData, ?string $sessionId = null): array
    {
        $anomalies = [];
        $score = 0;

        // 1. Detección de velocidad de interacción anormal
        $speedAnomaly = $this->detectSpeedAnomaly($sessionId);
        if ($speedAnomaly['is_anomaly']) {
            $anomalies[] = $speedAnomaly;
            $score += $speedAnomaly['severity'];
        }

        // 2. Detección de patrones de bot
        $botAnomaly = $this->detectBotPattern($interactionData, $sessionId);
        if ($botAnomaly['is_anomaly']) {
            $anomalies[] = $botAnomaly;
            $score += $botAnomaly['severity'];
        }

        // 3. Detección de engagement imposible
        $engagementAnomaly = $this->detectImpossibleEngagement($interactionData);
        if ($engagementAnomaly['is_anomaly']) {
            $anomalies[] = $engagementAnomaly;
            $score += $engagementAnomaly['severity'];
        }

        // 4. Detección de comportamiento repetitivo
        $repetitiveAnomaly = $this->detectRepetitiveBehavior($sessionId);
        if ($repetitiveAnomaly['is_anomaly']) {
            $anomalies[] = $repetitiveAnomaly;
            $score += $repetitiveAnomaly['severity'];
        }

        // 5. Detección de outliers estadísticos
        $statisticalAnomaly = $this->detectStatisticalOutlier($interactionData);
        if ($statisticalAnomaly['is_anomaly']) {
            $anomalies[] = $statisticalAnomaly;
            $score += $statisticalAnomaly['severity'];
        }

        // 6. Detección de device fingerprint sospechoso
        $deviceAnomaly = $this->detectDeviceAnomaly($interactionData);
        if ($deviceAnomaly['is_anomaly']) {
            $anomalies[] = $deviceAnomaly;
            $score += $deviceAnomaly['severity'];
        }

        return [
            'has_anomalies' => !empty($anomalies),
            'anomaly_score' => min($score, 100),
            'risk_level' => $this->getRiskLevel($score),
            'anomalies' => $anomalies,
            'recommended_action' => $this->getRecommendedAction($score),
            'timestamp' => now()->toIso8601String()
        ];
    }

    /**
     * Detectar velocidad de interacción anormal
     */
    private function detectSpeedAnomaly(?string $sessionId): array
    {
        if (!$sessionId) {
            return ['is_anomaly' => false];
        }

        $cacheKey = self::CACHE_PREFIX . "speed:{$sessionId}";
        $interactions = Cache::get($cacheKey, []);

        // Agregar timestamp actual
        $interactions[] = now()->timestamp;
        
        // Mantener solo últimos 60 segundos
        $interactions = array_filter($interactions, function($ts) {
            return $ts > (now()->timestamp - 60);
        });

        Cache::put($cacheKey, $interactions, self::CACHE_TTL);

        // Detectar si hay más de 30 interacciones en 60 segundos
        if (count($interactions) > 30) {
            return [
                'is_anomaly' => true,
                'type' => 'speed_anomaly',
                'severity' => 30,
                'description' => 'Velocidad de interacción inusualmente alta',
                'details' => [
                    'interactions_per_minute' => count($interactions),
                    'threshold' => 30
                ]
            ];
        }

        return ['is_anomaly' => false];
    }

    /**
     * Detectar patrones de bot
     */
    private function detectBotPattern(array $interactionData, ?string $sessionId): array
    {
        $botIndicators = 0;
        $details = [];

        // 1. User agent sospechoso
        $userAgent = $interactionData['user_agent'] ?? '';
        if ($this->isSuspiciousUserAgent($userAgent)) {
            $botIndicators++;
            $details[] = 'User agent sospechoso';
        }

        // 2. Tiempo de lectura imposible (muy corto)
        $timeSpent = $interactionData['time_spent_seconds'] ?? 0;
        $scrollPercentage = $interactionData['scroll_percentage'] ?? 0;
        
        if ($timeSpent < 5 && $scrollPercentage > 80) {
            $botIndicators++;
            $details[] = 'Scroll completo en tiempo imposible';
        }

        // 3. Patrón de clicks perfectamente regular
        if ($sessionId) {
            $clickPattern = $this->analyzeClickPattern($sessionId);
            if ($clickPattern['is_regular']) {
                $botIndicators++;
                $details[] = 'Patrón de clicks demasiado regular';
            }
        }

        // 4. Sin movimiento de mouse (si está disponible)
        if (isset($interactionData['metadata']['mouse_movements']) && 
            $interactionData['metadata']['mouse_movements'] === 0) {
            $botIndicators++;
            $details[] = 'Sin movimiento de mouse detectado';
        }

        if ($botIndicators >= 2) {
            return [
                'is_anomaly' => true,
                'type' => 'bot_pattern',
                'severity' => $botIndicators * 15,
                'description' => 'Comportamiento similar a bot detectado',
                'details' => [
                    'indicators' => $botIndicators,
                    'reasons' => $details
                ]
            ];
        }

        return ['is_anomaly' => false];
    }

    /**
     * Detectar engagement imposible
     */
    private function detectImpossibleEngagement(array $interactionData): array
    {
        $timeSpent = $interactionData['time_spent_seconds'] ?? 0;
        $scrollPercentage = $interactionData['scroll_percentage'] ?? 0;
        $engagementScore = $interactionData['engagement_score'] ?? 0;

        $issues = [];

        // Tiempo negativo o excesivo
        if ($timeSpent < 0 || $timeSpent > 7200) { // Max 2 horas
            $issues[] = 'Tiempo de lectura fuera de rango normal';
        }

        // Scroll percentage imposible
        if ($scrollPercentage < 0 || $scrollPercentage > 100) {
            $issues[] = 'Porcentaje de scroll inválido';
        }

        // Engagement score inconsistente
        if ($timeSpent < 10 && $engagementScore > 80) {
            $issues[] = 'Engagement score inconsistente con tiempo de lectura';
        }

        if (!empty($issues)) {
            return [
                'is_anomaly' => true,
                'type' => 'impossible_engagement',
                'severity' => 25,
                'description' => 'Métricas de engagement imposibles o inconsistentes',
                'details' => [
                    'issues' => $issues,
                    'time_spent' => $timeSpent,
                    'scroll_percentage' => $scrollPercentage,
                    'engagement_score' => $engagementScore
                ]
            ];
        }

        return ['is_anomaly' => false];
    }

    /**
     * Detectar comportamiento repetitivo
     */
    private function detectRepetitiveBehavior(?string $sessionId): array
    {
        if (!$sessionId) {
            return ['is_anomaly' => false];
        }

        // Obtener últimas interacciones
        $recentInteractions = MLInteractionLog::where('session_id', $sessionId)
            ->where('created_at', '>', now()->subHours(1))
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        if ($recentInteractions->count() < 5) {
            return ['is_anomaly' => false];
        }

        // Analizar patrones
        $postIds = $recentInteractions->pluck('post_id')->toArray();
        $interactionTypes = $recentInteractions->pluck('interaction_type')->toArray();

        // Detectar mismo post repetido
        $postCounts = array_count_values($postIds);
        $maxPostRepetition = max($postCounts);

        // Detectar mismo tipo de interacción repetido
        $typeCounts = array_count_values($interactionTypes);
        $maxTypeRepetition = max($typeCounts);

        if ($maxPostRepetition > 5 || $maxTypeRepetition > 10) {
            return [
                'is_anomaly' => true,
                'type' => 'repetitive_behavior',
                'severity' => 20,
                'description' => 'Comportamiento excesivamente repetitivo detectado',
                'details' => [
                    'max_post_repetition' => $maxPostRepetition,
                    'max_type_repetition' => $maxTypeRepetition,
                    'total_interactions' => $recentInteractions->count()
                ]
            ];
        }

        return ['is_anomaly' => false];
    }

    /**
     * Detectar outliers estadísticos
     */
    private function detectStatisticalOutlier(array $interactionData): array
    {
        $timeSpent = $interactionData['time_spent_seconds'] ?? 0;
        
        // Obtener estadísticas globales (cached)
        $stats = Cache::remember('ml_interaction_stats', 3600, function() {
            $interactions = MLInteractionLog::where('created_at', '>', now()->subDays(7))
                ->whereNotNull('time_spent_seconds')
                ->pluck('time_spent_seconds');

            if ($interactions->isEmpty()) {
                return null;
            }

            return [
                'mean' => $interactions->avg(),
                'std' => $this->calculateStdDev($interactions->toArray()),
                'median' => $interactions->median()
            ];
        });

        if (!$stats) {
            return ['is_anomaly' => false];
        }

        // Detectar outliers usando Z-score
        $zScore = abs(($timeSpent - $stats['mean']) / max($stats['std'], 1));

        if ($zScore > 3) { // 3 desviaciones estándar
            return [
                'is_anomaly' => true,
                'type' => 'statistical_outlier',
                'severity' => 15,
                'description' => 'Valor estadísticamente anormal',
                'details' => [
                    'z_score' => round($zScore, 2),
                    'value' => $timeSpent,
                    'mean' => round($stats['mean'], 2),
                    'std_dev' => round($stats['std'], 2)
                ]
            ];
        }

        return ['is_anomaly' => false];
    }

    /**
     * Detectar anomalías en device fingerprint
     */
    private function detectDeviceAnomaly(array $interactionData): array
    {
        $issues = [];

        // Viewport dimensions sospechosas
        $viewportWidth = $interactionData['viewport_width'] ?? 0;
        $viewportHeight = $interactionData['viewport_height'] ?? 0;

        if ($viewportWidth < 320 || $viewportWidth > 7680 || 
            $viewportHeight < 240 || $viewportHeight > 4320) {
            $issues[] = 'Dimensiones de viewport inusuales';
        }

        // Device type inconsistente con viewport
        $deviceType = $interactionData['device_type'] ?? '';
        if ($deviceType === 'mobile' && $viewportWidth > 1024) {
            $issues[] = 'Device type inconsistente con viewport';
        }

        // Referrer sospechoso
        $referrer = $interactionData['referrer'] ?? '';
        if ($this->isSuspiciousReferrer($referrer)) {
            $issues[] = 'Referrer sospechoso';
        }

        if (!empty($issues)) {
            return [
                'is_anomaly' => true,
                'type' => 'device_anomaly',
                'severity' => 10,
                'description' => 'Información de dispositivo sospechosa',
                'details' => ['issues' => $issues]
            ];
        }

        return ['is_anomaly' => false];
    }

    /**
     * Helpers
     */
    private function isSuspiciousUserAgent(string $userAgent): bool
    {
        $suspiciousPatterns = [
            'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
            'python-requests', 'java/', 'go-http-client'
        ];

        $userAgentLower = strtolower($userAgent);
        
        foreach ($suspiciousPatterns as $pattern) {
            if (str_contains($userAgentLower, $pattern)) {
                return true;
            }
        }

        return false;
    }

    private function isSuspiciousReferrer(string $referrer): bool
    {
        if (empty($referrer)) {
            return false;
        }

        $suspiciousDomains = ['spam', 'casino', 'porn', 'viagra'];
        
        foreach ($suspiciousDomains as $domain) {
            if (str_contains(strtolower($referrer), $domain)) {
                return true;
            }
        }

        return false;
    }

    private function analyzeClickPattern(?string $sessionId): array
    {
        $interactions = MLInteractionLog::where('session_id', $sessionId)
            ->where('created_at', '>', now()->subMinutes(10))
            ->orderBy('created_at')
            ->pluck('created_at')
            ->toArray();

        if (count($interactions) < 5) {
            return ['is_regular' => false];
        }

        // Calcular intervalos entre clicks
        $intervals = [];
        for ($i = 1; $i < count($interactions); $i++) {
            $intervals[] = Carbon::parse($interactions[$i])->diffInSeconds($interactions[$i-1]);
        }

        // Calcular desviación estándar de intervalos
        $stdDev = $this->calculateStdDev($intervals);

        // Si la desviación es muy baja, el patrón es muy regular (sospechoso)
        return ['is_regular' => $stdDev < 1];
    }

    private function calculateStdDev(array $values): float
    {
        if (empty($values)) {
            return 0;
        }

        $mean = array_sum($values) / count($values);
        $variance = array_sum(array_map(function($x) use ($mean) {
            return pow($x - $mean, 2);
        }, $values)) / count($values);

        return sqrt($variance);
    }

    private function getRiskLevel(float $score): string
    {
        if ($score >= 70) return 'critical';
        if ($score >= 50) return 'high';
        if ($score >= 30) return 'medium';
        if ($score >= 10) return 'low';
        return 'none';
    }

    private function getRecommendedAction(float $score): string
    {
        if ($score >= 70) return 'block_and_review';
        if ($score >= 50) return 'flag_for_review';
        if ($score >= 30) return 'monitor_closely';
        if ($score >= 10) return 'log_only';
        return 'none';
    }
}

