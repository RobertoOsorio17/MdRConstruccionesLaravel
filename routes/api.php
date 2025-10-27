<?php

use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\ErrorLogController;
use App\Http\Controllers\UserProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware(['auth:sanctum', 'deny.banned'])->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| User Profile API Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'deny.banned'])->group(function () {
    // Get current user's comments with pagination
    Route::get('/user/comments', [UserProfileController::class, 'getUserComments'])->name('api.user.comments');

    // Get specific user's comments with pagination (public profiles only)
    Route::get('/user/{userId}/comments', [UserProfileController::class, 'getUserComments'])->name('api.user.comments.public');
});

/*
|--------------------------------------------------------------------------
| Search API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('search')->group(function () {
    // Main search endpoint with pagination and filters
    Route::get('/', [SearchController::class, 'search'])->name('api.search');

    // Quick search for instant results (lighter version)
    Route::get('/quick', [SearchController::class, 'quick'])->name('api.search.quick');

    // Search suggestions for autocomplete
    Route::get('/suggestions', [SearchController::class, 'suggestions'])->name('api.search.suggestions');

    // Popular search terms
    Route::get('/popular', [SearchController::class, 'popular'])->name('api.search.popular');

    // Search analytics (protected - admin only)
    Route::middleware(['auth:sanctum', 'deny.banned', 'auth.enhanced', 'role:admin,editor'])
        ->get('/analytics', [SearchController::class, 'analytics'])
        ->name('api.search.analytics');
});

/*
|--------------------------------------------------------------------------
| Error Logging API Routes
|--------------------------------------------------------------------------
*/

// Error logging endpoint (no auth required, but rate limited)
Route::middleware(['throttle:60,1'])->group(function () {
    Route::post('/log-error', [ErrorLogController::class, 'logError'])->name('api.log-error');
});

// Error statistics (admin only)
Route::middleware(['auth:sanctum', 'deny.banned', 'role:admin'])->group(function () {
    Route::get('/error-stats', [ErrorLogController::class, 'getErrorStats'])->name('api.error-stats');
});

/*
|--------------------------------------------------------------------------
| Rate Limiting for Search API
|--------------------------------------------------------------------------
*/

Route::middleware(['throttle:search'])->group(function () {
    // Apply rate limiting to search endpoints if needed
    // This can be configured in app/Http/Kernel.php
});

/*
|--------------------------------------------------------------------------
| Machine Learning API Routes
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\MLController;

Route::prefix('ml')->name('api.ml.')->group(function () {

    // Public ML endpoints with rate limiting
    Route::middleware(['throttle:60,1'])->group(function () {

        // Get personalized recommendations
        Route::post('/recommendations', [MLController::class, 'getRecommendations'])
            ->name('recommendations');

        // Log user interaction
        Route::post('/interactions', [MLController::class, 'logInteraction'])
            ->middleware(['throttle:120,1']) // Higher limit for interactions
            ->name('log-interaction');

        // Get user ML insights (works for both authenticated and guest users)
        Route::get('/insights', [MLController::class, 'getUserInsights'])
            ->name('insights');
    });

    // Authenticated user endpoints
    Route::middleware(['auth:sanctum', 'deny.banned'])->group(function () {

        // Update user profile manually
        Route::post('/profile/update', [MLController::class, 'updateProfile'])
            ->name('profile.update');

        // Get user's recommendation history
        Route::get('/recommendations/history', [MLController::class, 'getRecommendationHistory'])
            ->name('recommendations.history');

        // Provide feedback on recommendation
        Route::post('/recommendations/{id}/feedback', [MLController::class, 'submitRecommendationFeedback'])
            ->name('recommendations.feedback');
    });

    // Admin-only ML management endpoints
    Route::middleware(['auth:sanctum', 'deny.banned', 'role:admin'])->group(function () {

        // Train ML models
        Route::post('/train', [MLController::class, 'trainModels'])
            ->name('train');

        // Get ML system metrics
        Route::get('/metrics', [MLController::class, 'getMetrics'])
            ->name('metrics');

        // Get comprehensive metrics report
        Route::get('/metrics/report', [MLController::class, 'getMetricsReport'])
            ->name('metrics.report');

        // Run A/B test
        Route::post('/ab-test', [MLController::class, 'runABTest'])
            ->name('ab-test');

        // Get A/B test results
        Route::get('/ab-test/{id}/results', [MLController::class, 'getABTestResults'])
            ->name('ab-test.results');

        // Clear ML caches
        Route::post('/cache/clear', [MLController::class, 'clearCaches'])
            ->name('cache.clear');

        // Get clustering analysis
        Route::get('/clustering/analysis', [MLController::class, 'getClusteringAnalysis'])
            ->name('clustering.analysis');

        // Retrain clustering
        Route::post('/clustering/retrain', [MLController::class, 'retrainClustering'])
            ->name('clustering.retrain');

        // Get feature importance
        Route::get('/features/importance', [MLController::class, 'getFeatureImportance'])
            ->name('features.importance');

        // Get model performance over time
        Route::get('/performance/timeline', [MLController::class, 'getPerformanceTimeline'])
            ->name('performance.timeline');

        // Export ML data for analysis
        Route::get('/export/{type}', [MLController::class, 'exportMLData'])
            ->name('export')
            ->where('type', 'vectors|profiles|interactions|metrics');

        // Get system health check (V2.0: Enhanced with MLHealthMonitorService)
        Route::get('/health', [MLController::class, 'getHealthStatus'])
            ->name('health');

        // Get anomaly detection report (V2.0: New endpoint)
        Route::get('/anomalies', [MLController::class, 'detectAnomalies'])
            ->name('anomalies');

        // Get recommendation explanations
        Route::get('/explain/{postId}', [MLController::class, 'explainRecommendation'])
            ->name('explain');
    });
});
