<?php

return [
    /*
    |--------------------------------------------------------------------------
    | ML Recommendation System Configuration
    |--------------------------------------------------------------------------
    |
    | ✅ FIXED: Centralized configuration for ML system parameters
    | Makes the system more flexible and easier to tune
    |
    */

    'candidate_posts_limit' => env('ML_CANDIDATE_POSTS_LIMIT', 100),

    'recommendation_defaults' => [
        'limit' => env('ML_DEFAULT_RECOMMENDATION_LIMIT', 10),
        'cache_timeout' => env('ML_CACHE_TIMEOUT', 3600), // 1 hour
    ],

    'performance' => [
        'enable_caching' => env('ML_ENABLE_CACHING', true),
        'enable_precomputation' => env('ML_ENABLE_PRECOMPUTATION', false),
    ],

    'clustering' => [
        'num_clusters' => env('ML_NUM_CLUSTERS', 5),
        'min_samples' => env('ML_MIN_SAMPLES_FOR_CLUSTERING', 50),
    ],

    'anomaly_detection' => [
        'enabled' => env('ML_ANOMALY_DETECTION_ENABLED', true),
        'threshold' => env('ML_ANOMALY_THRESHOLD', 0.7),
    ],
];
