<?php

namespace App\Helpers;

use App\Models\AdminSetting;
use Illuminate\Support\Facades\Cache;

/**
 * Helper class for accessing ML settings from the database
 * with caching for better performance
 */
class MLSettingsHelper
{
    /**
     * Cache key for ML settings
     */
    private const CACHE_KEY = 'ml_settings_cache';

    /**
     * Cache duration in seconds (1 hour)
     */
    private const CACHE_DURATION = 3600;

    /**
     * Get all ML settings as an array
     */
    public static function all(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_DURATION, function () {
            return AdminSetting::where('group', 'ml')
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    /**
     * Get a specific ML setting value
     */
    public static function get(string $key, $default = null)
    {
        $settings = self::all();
        $fullKey = str_starts_with($key, 'ml_') ? $key : "ml_{$key}";
        
        return $settings[$fullKey] ?? $default;
    }

    /**
     * Get a boolean ML setting
     */
    public static function getBool(string $key, bool $default = false): bool
    {
        $value = self::get($key, $default);
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Get an integer ML setting
     */
    public static function getInt(string $key, int $default = 0): int
    {
        $value = self::get($key, $default);
        return (int) $value;
    }

    /**
     * Get a float ML setting
     */
    public static function getFloat(string $key, float $default = 0.0): float
    {
        $value = self::get($key, $default);
        return (float) $value;
    }

    /**
     * Get algorithm weights
     */
    public static function getAlgorithmWeights(): array
    {
        return [
            'hybrid' => self::getFloat('hybrid_weight', 0.4),
            'content' => self::getFloat('content_weight', 0.3),
            'collaborative' => self::getFloat('collaborative_weight', 0.2),
            'trending' => self::getFloat('trending_weight', 0.1),
        ];
    }

    /**
     * Check if an algorithm is enabled
     */
    public static function isAlgorithmEnabled(string $algorithm): bool
    {
        return self::getBool("enable_{$algorithm}", true);
    }

    /**
     * Get recommendation parameters
     */
    public static function getRecommendationParams(): array
    {
        return [
            'default_limit' => self::getInt('default_limit', 10),
            'diversity_boost' => self::getFloat('diversity_boost', 0.3),
            'min_confidence' => self::getFloat('min_confidence', 0.4),
            'cache_timeout' => self::getInt('cache_timeout', 300),
        ];
    }

    /**
     * Get clustering configuration
     */
    public static function getClusteringConfig(): array
    {
        return [
            'enabled' => self::getBool('enable_clustering', true),
            'cluster_count' => self::getInt('cluster_count', 5),
            'algorithm' => self::get('clustering_algorithm', 'kmeans'),
        ];
    }

    /**
     * Get anomaly detection configuration
     */
    public static function getAnomalyDetectionConfig(): array
    {
        return [
            'enabled' => self::getBool('enable_anomaly_detection', true),
            'threshold' => self::getInt('anomaly_threshold', 70),
            'auto_block' => self::getBool('auto_block_suspicious', false),
        ];
    }

    /**
     * Get performance configuration
     */
    public static function getPerformanceConfig(): array
    {
        return [
            'enable_caching' => self::getBool('enable_caching', true),
            'enable_queue_jobs' => self::getBool('enable_queue_jobs', true),
            'batch_size' => self::getInt('batch_size', 100),
        ];
    }

    /**
     * Get explainable AI configuration
     */
    public static function getExplainableAIConfig(): array
    {
        return [
            'include_explanations' => self::getBool('include_explanations', true),
            'detail_level' => self::get('explanation_detail', 'medium'),
        ];
    }

    /**
     * Clear the ML settings cache
     */
    public static function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Refresh the ML settings cache
     */
    public static function refreshCache(): array
    {
        self::clearCache();
        return self::all();
    }
}

