<?php

use App\Http\Controllers\Api\SearchController;
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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| User Profile API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
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
    
    // Search analytics (can be protected with middleware if needed)
    Route::get('/analytics', [SearchController::class, 'analytics'])->name('api.search.analytics');
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
