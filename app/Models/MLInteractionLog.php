<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MLInteractionLog extends Model
{
    use HasFactory;

    protected $table = 'ml_interaction_logs';

    protected $fillable = [
        'session_id',
        'user_id',
        'post_id',
        'interaction_type',
        'recommendation_source',
        'recommendation_context',
        'recommendation_score',
        'recommendation_position',
        'time_spent_seconds',
        'scroll_percentage',
        'completed_reading',
        'interaction_metadata',
        'implicit_rating',
        'engagement_score'
    ];

    protected $casts = [
        'recommendation_context' => 'array',
        'interaction_metadata' => 'array',
        'recommendation_score' => 'float',
        'scroll_percentage' => 'float',
        'implicit_rating' => 'float',
        'engagement_score' => 'float',
        'completed_reading' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Registra una interacción de usuario
     */
    public static function logInteraction(array $data): self
    {
        // Calcular rating implícito basado en el comportamiento
        $implicitRating = self::calculateImplicitRating($data);
        
        // Calcular engagement score
        $engagementScore = self::calculateEngagementScore($data);

        return self::create(array_merge($data, [
            'implicit_rating' => $implicitRating,
            'engagement_score' => $engagementScore
        ]));
    }

    /**
     * Calcula rating implícito basado en comportamiento
     */
    private static function calculateImplicitRating(array $data): float
    {
        $rating = 0;

        // Base por tipo de interacción
        $typeWeights = [
            'view' => 0.1,
            'click' => 0.3,
            'like' => 0.8,
            'share' => 0.9,
            'comment' => 1.0,
            'bookmark' => 0.9,
            'recommendation_click' => 0.4
        ];

        $rating += $typeWeights[$data['interaction_type']] ?? 0;

        // Bonus por tiempo gastado
        if (!empty($data['time_spent_seconds'])) {
            $timeBonus = min($data['time_spent_seconds'] / 300, 0.5); // Max 0.5 por 5 minutos
            $rating += $timeBonus;
        }

        // Bonus por scroll
        if (!empty($data['scroll_percentage'])) {
            $scrollBonus = $data['scroll_percentage'] / 100 * 0.3;
            $rating += $scrollBonus;
        }

        // Bonus por lectura completa
        if (!empty($data['completed_reading'])) {
            $rating += 0.3;
        }

        return min($rating, 5.0); // Rating máximo de 5
    }

    /**
     * Calcula score de engagement
     */
    private static function calculateEngagementScore(array $data): float
    {
        $score = 0;

        // Componentes del engagement
        $components = [
            'interaction_depth' => 0,
            'time_investment' => 0,
            'completion_rate' => 0,
            'social_engagement' => 0
        ];

        // Profundidad de interacción
        $depthWeights = [
            'view' => 0.1,
            'click' => 0.2,
            'like' => 0.6,
            'share' => 0.8,
            'comment' => 1.0,
            'bookmark' => 0.7,
            'recommendation_click' => 0.3
        ];
        $components['interaction_depth'] = $depthWeights[$data['interaction_type']] ?? 0;

        // Inversión de tiempo
        if (!empty($data['time_spent_seconds'])) {
            $components['time_investment'] = min($data['time_spent_seconds'] / 180, 1.0); // 3 minutos = máximo
        }

        // Tasa de completación
        if (!empty($data['scroll_percentage'])) {
            $components['completion_rate'] = $data['scroll_percentage'] / 100;
        }

        // Engagement social
        if (in_array($data['interaction_type'], ['like', 'share', 'comment'])) {
            $components['social_engagement'] = 1.0;
        }

        // Promedio ponderado
        $weights = [
            'interaction_depth' => 0.3,
            'time_investment' => 0.3,
            'completion_rate' => 0.2,
            'social_engagement' => 0.2
        ];

        foreach ($components as $component => $value) {
            $score += $value * $weights[$component];
        }

        return $score;
    }

    /**
     * Obtiene métricas de rendimiento de recomendaciones
     */
    public static function getRecommendationMetrics(string $source, \DateTime $from = null, \DateTime $to = null): array
    {
        $query = self::where('recommendation_source', $source);
        
        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        
        if ($to) {
            $query->where('created_at', '<=', $to);
        }

        $logs = $query->get();
        
        $metrics = [
            'total_recommendations' => $logs->count(),
            'click_through_rate' => 0,
            'avg_engagement_score' => 0,
            'avg_implicit_rating' => 0,
            'conversion_rate' => 0
        ];

        if ($metrics['total_recommendations'] > 0) {
            $clicks = $logs->where('interaction_type', 'recommendation_click')->count();
            $metrics['click_through_rate'] = $clicks / $metrics['total_recommendations'];
            
            $metrics['avg_engagement_score'] = $logs->avg('engagement_score') ?? 0;
            $metrics['avg_implicit_rating'] = $logs->avg('implicit_rating') ?? 0;
            
            $conversions = $logs->whereIn('interaction_type', ['like', 'share', 'comment', 'bookmark'])->count();
            $metrics['conversion_rate'] = $conversions / $metrics['total_recommendations'];
        }

        return $metrics;
    }
}