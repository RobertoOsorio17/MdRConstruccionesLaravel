<?php

namespace App\Services\ML;

use App\Models\Post;
use App\Models\MLUserProfile;
use App\Models\MLPostVector;
use Illuminate\Support\Facades\Log;

/**
 * Explainable AI Service
 * 
 * Genera explicaciones detalladas de por qué se recomiendan ciertos posts
 * Implementa técnicas de XAI (Explainable AI) para transparencia del sistema ML
 */
class ExplainableAIService
{
    /**
     * Generar explicación completa para una recomendación
     */
    public function explainRecommendation(
        Post $post,
        ?MLUserProfile $userProfile,
        array $mlData
    ): array {
        $explanations = [];
        $source = $mlData['source'] ?? 'unknown';
        $score = $mlData['score'] ?? 0;

        // Explicación basada en el algoritmo usado
        switch ($source) {
            case 'content_based':
                $explanations = $this->explainContentBased($post, $userProfile, $mlData);
                break;
            
            case 'collaborative':
                $explanations = $this->explainCollaborative($post, $userProfile, $mlData);
                break;
            
            case 'personalized':
                $explanations = $this->explainPersonalized($post, $userProfile, $mlData);
                break;
            
            case 'trending':
                $explanations = $this->explainTrending($post, $mlData);
                break;
            
            case 'hybrid':
                $explanations = $this->explainHybrid($post, $userProfile, $mlData);
                break;
            
            default:
                $explanations = $this->explainGeneric($post, $mlData);
        }

        // Agregar feature importance
        $explanations['feature_importance'] = $this->calculateFeatureImportance($post, $userProfile, $mlData);
        
        // Agregar confidence breakdown
        $explanations['confidence_breakdown'] = $this->explainConfidence($score, $mlData);
        
        // Agregar counterfactual explanation
        $explanations['counterfactual'] = $this->generateCounterfactual($post, $userProfile);

        return $explanations;
    }

    /**
     * Explicar recomendación basada en contenido
     */
    private function explainContentBased(Post $post, ?MLUserProfile $userProfile, array $mlData): array
    {
        $similarity = $mlData['content_similarity'] ?? 0;
        $matchingCategories = $mlData['matching_categories'] ?? [];
        $matchingTags = $mlData['matching_tags'] ?? [];

        $reasons = [];

        // Similitud de contenido
        if ($similarity > 0.7) {
            $reasons[] = "Este artículo es muy similar a contenido que has disfrutado anteriormente";
        } elseif ($similarity > 0.5) {
            $reasons[] = "Este artículo tiene similitudes con tus lecturas recientes";
        }

        // Categorías coincidentes
        if (!empty($matchingCategories)) {
            $categoryNames = implode(', ', array_column($matchingCategories, 'name'));
            $reasons[] = "Coincide con tus categorías favoritas: {$categoryNames}";
        }

        // Tags coincidentes
        if (!empty($matchingTags)) {
            $tagCount = count($matchingTags);
            $reasons[] = "Comparte {$tagCount} etiquetas con artículos que te han interesado";
        }

        // Análisis de tópicos
        if (isset($mlData['topic_overlap'])) {
            $overlap = round($mlData['topic_overlap'] * 100);
            $reasons[] = "Trata temas similares ({$overlap}% de coincidencia temática)";
        }

        return [
            'primary_reason' => $reasons[0] ?? 'Contenido similar a tus intereses',
            'detailed_reasons' => $reasons,
            'algorithm' => 'Similitud de Contenido (TF-IDF)',
            'technical_details' => [
                'similarity_score' => round($similarity, 3),
                'matching_categories' => count($matchingCategories),
                'matching_tags' => count($matchingTags),
                'method' => 'Cosine Similarity con vectores TF-IDF'
            ]
        ];
    }

    /**
     * Explicar recomendación colaborativa
     */
    private function explainCollaborative(Post $post, ?MLUserProfile $userProfile, array $mlData): array
    {
        $similarUsers = $mlData['similar_users_count'] ?? 0;
        $avgRating = $mlData['avg_rating'] ?? 0;

        $reasons = [];

        if ($similarUsers > 10) {
            $reasons[] = "Más de {$similarUsers} usuarios con gustos similares a los tuyos disfrutaron este artículo";
        } elseif ($similarUsers > 5) {
            $reasons[] = "{$similarUsers} usuarios con intereses similares leyeron y valoraron positivamente este contenido";
        } else {
            $reasons[] = "Usuarios con perfil similar al tuyo han mostrado interés en este artículo";
        }

        if ($avgRating > 0.8) {
            $reasons[] = "Tiene una valoración muy alta entre usuarios similares a ti";
        }

        // Cluster information
        if ($userProfile && isset($mlData['cluster_popularity'])) {
            $clusterName = $this->getClusterName($userProfile->user_cluster);
            $popularity = round($mlData['cluster_popularity'] * 100);
            $reasons[] = "Popular entre usuarios del grupo '{$clusterName}' ({$popularity}% de engagement)";
        }

        return [
            'primary_reason' => $reasons[0] ?? 'Recomendado por usuarios similares',
            'detailed_reasons' => $reasons,
            'algorithm' => 'Filtrado Colaborativo (Matrix Factorization)',
            'technical_details' => [
                'similar_users' => $similarUsers,
                'avg_implicit_rating' => round($avgRating, 3),
                'method' => 'Alternating Least Squares (ALS)',
                'latent_factors' => 50
            ]
        ];
    }

    /**
     * Explicar recomendación personalizada
     */
    private function explainPersonalized(Post $post, ?MLUserProfile $userProfile, array $mlData): array
    {
        $profileMatch = $mlData['profile_match'] ?? 0;
        
        $reasons = [];

        if ($userProfile) {
            // Análisis de patrones de lectura
            if ($userProfile->avg_reading_time > 180) {
                $reasons[] = "Artículo extenso que coincide con tu preferencia por lecturas profundas";
            }

            // Horario de lectura
            $currentHour = now()->hour;
            if ($this->matchesReadingPattern($userProfile, $currentHour)) {
                $reasons[] = "Recomendado para tu horario habitual de lectura";
            }

            // Nivel de engagement
            if ($userProfile->engagement_rate > 0.7) {
                $reasons[] = "Contenido de alta calidad que coincide con tu alto nivel de engagement";
            }

            // Preferencias de categorías
            $topCategories = json_decode($userProfile->category_preferences ?? '[]', true);
            if (!empty($topCategories)) {
                $topCat = array_key_first($topCategories);
                $reasons[] = "Relacionado con tu categoría favorita: {$topCat}";
            }
        }

        if ($profileMatch > 0.8) {
            $matchPercent = round($profileMatch * 100);
            $reasons[] = "Coincidencia del {$matchPercent}% con tu perfil de lectura";
        }

        return [
            'primary_reason' => $reasons[0] ?? 'Personalizado según tu perfil',
            'detailed_reasons' => $reasons,
            'algorithm' => 'Recomendación Personalizada (Perfil de Usuario)',
            'technical_details' => [
                'profile_match_score' => round($profileMatch, 3),
                'user_cluster' => $userProfile?->user_cluster ?? 'unknown',
                'engagement_rate' => $userProfile?->engagement_rate ?? 0,
                'method' => 'K-Means Clustering + Feature Matching'
            ]
        ];
    }

    /**
     * Explicar recomendación trending
     */
    private function explainTrending(Post $post, array $mlData): array
    {
        $recentEngagement = $mlData['recent_engagement'] ?? 0;
        $viewsGrowth = $mlData['views_growth'] ?? 0;
        
        $reasons = [];

        if ($recentEngagement > 0.8) {
            $reasons[] = "Artículo muy popular en las últimas 24 horas";
        } elseif ($recentEngagement > 0.6) {
            $reasons[] = "Contenido con alto engagement reciente";
        }

        if ($viewsGrowth > 2.0) {
            $growthPercent = round(($viewsGrowth - 1) * 100);
            $reasons[] = "Crecimiento del {$growthPercent}% en visualizaciones";
        }

        $reasons[] = "Trending ahora en la comunidad";

        return [
            'primary_reason' => $reasons[0] ?? 'Contenido popular actualmente',
            'detailed_reasons' => $reasons,
            'algorithm' => 'Trending (Popularidad Reciente)',
            'technical_details' => [
                'recent_engagement' => round($recentEngagement, 3),
                'views_growth_rate' => round($viewsGrowth, 2),
                'time_window' => '24 hours',
                'method' => 'Time-decayed popularity score'
            ]
        ];
    }

    /**
     * Explicar recomendación híbrida
     */
    private function explainHybrid(Post $post, ?MLUserProfile $userProfile, array $mlData): array
    {
        $weights = $mlData['algorithm_weights'] ?? [];
        
        $reasons = [];
        $algorithms = [];

        foreach ($weights as $algo => $weight) {
            if ($weight > 0.2) {
                $algorithms[] = $this->getAlgorithmName($algo);
            }
        }

        $reasons[] = "Recomendación combinada usando " . implode(', ', $algorithms);
        
        if (isset($weights['content_based']) && $weights['content_based'] > 0.3) {
            $reasons[] = "Fuerte similitud de contenido con tus intereses";
        }
        
        if (isset($weights['collaborative']) && $weights['collaborative'] > 0.3) {
            $reasons[] = "Valorado positivamente por usuarios similares";
        }

        return [
            'primary_reason' => 'Recomendación optimizada combinando múltiples algoritmos',
            'detailed_reasons' => $reasons,
            'algorithm' => 'Híbrido (Ensemble)',
            'technical_details' => [
                'algorithm_weights' => $weights,
                'method' => 'Weighted ensemble of multiple algorithms',
                'optimization' => 'Diversity-aware ranking'
            ]
        ];
    }

    /**
     * Explicación genérica
     */
    private function explainGeneric(Post $post, array $mlData): array
    {
        return [
            'primary_reason' => 'Recomendado para ti',
            'detailed_reasons' => ['Contenido seleccionado por nuestro sistema de IA'],
            'algorithm' => 'Sistema de Recomendación',
            'technical_details' => $mlData
        ];
    }

    /**
     * Calcular importancia de features
     */
    private function calculateFeatureImportance(Post $post, ?MLUserProfile $userProfile, array $mlData): array
    {
        $importance = [];

        // Content features
        $importance['content_similarity'] = $mlData['content_similarity'] ?? 0;
        $importance['category_match'] = isset($mlData['matching_categories']) ? 
            count($mlData['matching_categories']) / 5 : 0;
        $importance['tag_match'] = isset($mlData['matching_tags']) ? 
            count($mlData['matching_tags']) / 10 : 0;
        
        // Collaborative features
        $importance['user_similarity'] = ($mlData['similar_users_count'] ?? 0) / 50;
        
        // Popularity features
        $importance['popularity'] = min(($post->views_count ?? 0) / 1000, 1);
        $importance['recency'] = $this->calculateRecencyScore($post);

        // Normalize to sum to 1
        $total = array_sum($importance);
        if ($total > 0) {
            foreach ($importance as $key => $value) {
                $importance[$key] = round($value / $total, 3);
            }
        }

        arsort($importance);
        return $importance;
    }

    /**
     * Explicar nivel de confianza
     */
    private function explainConfidence(float $score, array $mlData): array
    {
        $confidence = $mlData['confidence'] ?? $score;
        
        $breakdown = [
            'overall_confidence' => round($confidence, 3),
            'level' => $this->getConfidenceLevel($confidence),
            'factors' => []
        ];

        if ($confidence > 0.8) {
            $breakdown['factors'][] = 'Alta certeza basada en múltiples señales';
        } elseif ($confidence > 0.6) {
            $breakdown['factors'][] = 'Confianza moderada con buenas señales';
        } else {
            $breakdown['factors'][] = 'Recomendación exploratoria';
        }

        // Data quality
        $dataQuality = $mlData['data_quality'] ?? 0.5;
        if ($dataQuality > 0.7) {
            $breakdown['factors'][] = 'Basado en datos de alta calidad';
        }

        return $breakdown;
    }

    /**
     * Generar explicación contrafactual
     */
    private function generateCounterfactual(Post $post, ?MLUserProfile $userProfile): array
    {
        $suggestions = [];

        if ($userProfile) {
            if ($userProfile->engagement_rate < 0.5) {
                $suggestions[] = "Interactuar más con contenido similar aumentaría la precisión de futuras recomendaciones";
            }

            if ($userProfile->posts_read < 10) {
                $suggestions[] = "Leer más artículos nos ayudaría a entender mejor tus preferencias";
            }
        }

        return [
            'what_if' => $suggestions,
            'improvement_tips' => [
                'Dar feedback (like/bookmark) mejora las recomendaciones',
                'Completar la lectura de artículos ayuda al sistema a aprender',
                'Explorar diferentes categorías enriquece tu perfil'
            ]
        ];
    }

    /**
     * Helpers
     */
    private function getClusterName(int $cluster): string
    {
        $names = [
            0 => 'Lectores Casuales',
            1 => 'Entusiastas Técnicos',
            2 => 'Lectores Profundos',
            3 => 'Exploradores Diversos',
            4 => 'Lectores Frecuentes'
        ];

        return $names[$cluster] ?? "Grupo {$cluster}";
    }

    private function getAlgorithmName(string $algo): string
    {
        $names = [
            'content_based' => 'Similitud de Contenido',
            'collaborative' => 'Filtrado Colaborativo',
            'personalized' => 'Personalización',
            'trending' => 'Trending'
        ];

        return $names[$algo] ?? $algo;
    }

    private function matchesReadingPattern(?MLUserProfile $profile, int $hour): bool
    {
        if (!$profile) return false;

        $patterns = json_decode($profile->reading_patterns ?? '[]', true);
        $preferredHours = $patterns['preferred_hours'] ?? [];

        return in_array($hour, $preferredHours);
    }

    private function calculateRecencyScore(Post $post): float
    {
        $daysOld = now()->diffInDays($post->published_at);
        return max(0, 1 - ($daysOld / 365));
    }

    private function getConfidenceLevel(float $confidence): string
    {
        if ($confidence > 0.8) return 'high';
        if ($confidence > 0.6) return 'medium';
        if ($confidence > 0.4) return 'low';
        return 'exploratory';
    }
}

