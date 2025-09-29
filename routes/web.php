<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\Admin\ServiceController as AdminServiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\MLController;

// Public Routes
Route::get('/', [HomeController::class, 'index'])->name('home');

// Services Routes
Route::get('/servicios', [ServiceController::class, 'index'])->name('services.index');
Route::get('/servicios/{service:slug}', [ServiceController::class, 'show'])->name('services.show');

// Projects Routes
Route::get('/proyectos', [ProjectController::class, 'index'])->name('projects.index');
Route::get('/proyectos/{project:slug}', [ProjectController::class, 'show'])->name('projects.show');

// Blog Routes
Route::get('/blog', [PostController::class, 'enhancedIndex'])->name('blog.index');
Route::get('/blog/classic', [PostController::class, 'index'])->name('blog.classic'); // Vista clásica como backup
Route::get('/blog/{post:slug}', [PostController::class, 'show'])->name('blog.show');

// Guest recommendations for personalized suggestions (throttled)
Route::post('/api/guest-recommendations', [PostController::class, 'getGuestRecommendations'])
    ->middleware('throttle:20,1')
    ->name('guest.recommendations');

// Debug routes (for development)
Route::middleware(['auth', 'auth.enhanced'])->prefix('debug')->name('debug.')->group(function () {
    Route::get('/', [App\Http\Controllers\DebugController::class, 'index'])->name('index');
    Route::get('/system-info', [App\Http\Controllers\DebugController::class, 'systemInfo'])->name('system-info');
    Route::post('/clear-logs', [App\Http\Controllers\DebugController::class, 'clearLogs'])->name('clear-logs');
    Route::get('/auth', [App\Http\Controllers\DebugController::class, 'debugAuth'])->name('auth');
    Route::get('/blog', [App\Http\Controllers\DebugController::class, 'debugBlog'])->name('blog');
});

// Machine Learning API Routes
Route::prefix('api/ml')->name('ml.')->group(function () {
    // Public routes (no authentication required)
    Route::get('/recommendations', [MLController::class, 'getRecommendations'])->name('recommendations');

    // User routes (require authentication and ban check)
    Route::middleware(['auth', 'auth.enhanced'])->group(function () {
        Route::post('/interaction', [MLController::class, 'logInteraction'])->name('interaction');
        Route::get('/insights', [MLController::class, 'getUserInsights'])->name('insights');
        Route::get('/metrics', [MLController::class, 'getMetrics'])->name('metrics');
    });

    // Admin only routes
    Route::middleware(['auth', 'auth.enhanced', 'role:admin'])->group(function () {
        Route::post('/train', [MLController::class, 'trainModels'])->name('train');
    });
});

// Service Favorites API Routes
Route::prefix('api/services')->name('api.services.')->group(function () {
    Route::get('/{service:slug}/favorite-status', [App\Http\Controllers\Api\ServiceFavoriteController::class, 'check'])->name('favorite.check');

    Route::middleware(['auth', 'auth.enhanced'])->group(function () {
        Route::post('/{service:slug}/favorite', [App\Http\Controllers\Api\ServiceFavoriteController::class, 'toggle'])->name('favorite.toggle');
        Route::get('/favorites', [App\Http\Controllers\Api\ServiceFavoriteController::class, 'index'])->name('favorites.index');
    });
});

// Post Interaction Status (available for all users)
Route::get('/posts/{post}/interaction-status', [App\Http\Controllers\UserInteractionController::class, 'getInteractionStatus'])->name('posts.interaction-status');

// Comment Routes (with rate limiting and IP ban protection)
Route::middleware(['throttle:10,1', 'check.ip.ban'])->group(function () {
    Route::post('/blog/{post:slug}/comments', [App\Http\Controllers\CommentController::class, 'store'])->name('comments.store');
    Route::get('/blog/{post:slug}/comments', [App\Http\Controllers\CommentController::class, 'getComments'])->name('comments.get');
});

// Comment Reports (accessible to all users, protected by IP ban check and rate limiting)
Route::middleware(['throttle:5,10', 'check.ip.ban'])->group(function () {
    Route::post('/comments/{comment}/report', [App\Http\Controllers\CommentInteractionController::class, 'report'])->name('comments.report');
});

// Institutional Pages
Route::get('/empresa', [PageController::class, 'about'])->name('pages.about');
Route::get('/contacto', [PageController::class, 'contact'])->name('pages.contact');

// Admin Routes
Route::prefix('admin')->name('admin.')->group(base_path('routes/admin.php'));

// Legal Pages
Route::get('/aviso-legal', [PageController::class, 'legal'])->name('pages.legal');
Route::get('/politica-privacidad', [PageController::class, 'privacy'])->name('pages.privacy');
Route::get('/politica-cookies', [PageController::class, 'cookies'])->name('pages.cookies');

// Contact Forms (with rate limiting)
Route::middleware(['throttle:5,1'])->group(function () {
    Route::post('/contacto', [ContactController::class, 'submit'])->name('contact.submit');
    Route::post('/presupuesto', [ContactController::class, 'budgetRequest'])->name('contact.budget');
});

// Profile Routes (protected)
Route::middleware(['auth', 'auth.enhanced'])->group(function () {
    // Dashboard Route (protected) - Main Dashboard
    Route::get('/dashboard', [App\Http\Controllers\UserDashboardController::class, 'index'])
        ->middleware(['check.permission'])
        ->name('dashboard');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // User Profile Management
    Route::get('/profile/edit', [App\Http\Controllers\UserProfileController::class, 'edit'])->name('user.profile.edit');
    Route::put('/profile/update', [App\Http\Controllers\UserProfileController::class, 'update'])->name('user.profile.update');
    Route::post('/profile/avatar', [App\Http\Controllers\UserProfileController::class, 'uploadAvatar'])->name('user.profile.avatar');
    Route::delete('/profile/avatar', [App\Http\Controllers\UserProfileController::class, 'deleteAvatar'])->name('user.profile.avatar.delete');
    Route::get('/profile/suggestions', [App\Http\Controllers\UserProfileController::class, 'suggestions'])->name('user.profile.suggestions');
    
    // User Premium Features
    Route::post('/posts/{post}/like', [App\Http\Controllers\UserInteractionController::class, 'toggleLike'])->name('posts.like');
    Route::post('/posts/{post}/bookmark', [App\Http\Controllers\UserInteractionController::class, 'toggleBookmark'])->name('posts.bookmark');
    Route::post('/users/{user}/follow', [App\Http\Controllers\UserFollowController::class, 'toggle'])->name('users.follow');
    
    // Comment Interactions (only for authenticated users)
    Route::post('/comments/{comment}/like', [App\Http\Controllers\CommentInteractionController::class, 'like'])->name('comments.like');
    Route::post('/comments/{comment}/dislike', [App\Http\Controllers\CommentInteractionController::class, 'dislike'])->name('comments.dislike');

    // Admin Comment Management
    Route::delete('/comments/{comment}', [App\Http\Controllers\CommentController::class, 'destroy'])
        ->middleware('admin.only')
        ->name('comments.destroy');
    
    // User Dashboard Routes (alternatives with user prefix)
    Route::get('/user/dashboard', [App\Http\Controllers\UserProfileController::class, 'dashboard'])->name('user.dashboard');
    Route::get('/my/comments', [App\Http\Controllers\UserDashboardController::class, 'comments'])->name('user.comments');
    Route::get('/my/saved-posts', [App\Http\Controllers\UserDashboardController::class, 'savedPosts'])->name('user.saved-posts');
    Route::get('/my/following', [App\Http\Controllers\UserDashboardController::class, 'following'])->name('user.following');
    Route::get('/my/preferences', [App\Http\Controllers\UserDashboardController::class, 'preferences'])->name('user.preferences');
    Route::post('/my/preferences', [App\Http\Controllers\UserDashboardController::class, 'updatePreferences'])->name('user.preferences.update');
    
    // Dashboard Actions
    Route::delete('/my/saved-posts/{post}', [App\Http\Controllers\UserDashboardController::class, 'removeSavedPost'])->name('user.saved-posts.remove');
    Route::delete('/my/comments/{comment}', [App\Http\Controllers\UserDashboardController::class, 'deleteComment'])->name('user.comments.delete');
    Route::delete('/my/following/{user}', [App\Http\Controllers\UserDashboardController::class, 'unfollowUser'])->name('user.following.remove');
    
    // Old Dashboard Routes (keeping for compatibility)
    Route::get('/my/bookmarks', [App\Http\Controllers\UserDashboardController::class, 'bookmarks'])->name('user.bookmarks');
    Route::get('/my/liked-posts', [App\Http\Controllers\UserDashboardController::class, 'likedPosts'])->name('user.liked-posts');
    Route::get('/my/liked-comments', [App\Http\Controllers\UserDashboardController::class, 'likedComments'])->name('user.liked-comments');
});

// Public User Profiles
Route::get('/user/{user}', [App\Http\Controllers\UserProfileController::class, 'show'])->name('user.profile.show');

// Auth Routes
require __DIR__.'/auth.php';
