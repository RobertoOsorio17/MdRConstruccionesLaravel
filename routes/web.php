<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Auth\SocialAuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\MLController;

// Public Routes
Route::get('/', [HomeController::class, 'index'])->name('home');

// Services Routes
Route::get('/servicios', [ServiceController::class, 'index'])->name('services.index');
Route::get('/servicios/{service:slug}', [ServiceController::class, 'show'])->name('services.show');

// ✅ ServicesV2 Route - Nueva landing con componentes modulares
Route::get('/servicios-v2/{service:slug}', [ServiceController::class, 'showV2'])->name('services.show.v2');

// ✅ TEST ROUTE - ServicesV2 Components Testing (REMOVE IN PRODUCTION)
Route::get('/test/services-v2', function () {
    return Inertia::render('Services/Show.test', [
        'service' => [
            'slug' => 'construccion-viviendas',
            'title' => 'Construcción de Viviendas Premium',
            'excerpt' => 'Transformamos tus ideas en espacios únicos'
        ]
    ]);
})->name('test.services.v2');

// Projects Routes
Route::get('/proyectos', [ProjectController::class, 'index'])->name('projects.index');
Route::get('/proyectos/{project:slug}', [ProjectController::class, 'show'])->name('projects.show');

// Blog Routes (protected by blog enabled check)
Route::middleware('check.blog')->group(function () {
    Route::get('/blog', [PostController::class, 'enhancedIndex'])->name('blog.index');
    Route::get('/blog/classic', [PostController::class, 'index'])->name('blog.classic'); // Vista clásica como backup
    Route::get('/blog/{post:slug}', [PostController::class, 'show'])->name('blog.show');
});

// ✅ Search Routes (with rate limiting - reduced from 60 to 20 req/min to prevent scraping)
Route::middleware(['throttle:20,1'])->group(function () {
    Route::get('/search', [SearchController::class, 'index'])->name('search.index');
});

// ✅ Testimonials Routes
Route::get('/testimonials', [TestimonialController::class, 'index'])->name('testimonials.index');
Route::get('/testimonials/create', [TestimonialController::class, 'create'])->name('testimonials.create');
Route::post('/testimonials', [TestimonialController::class, 'store'])->name('testimonials.store')->middleware('throttle:5,60');
Route::get('/testimonials/{testimonial}', [TestimonialController::class, 'show'])->name('testimonials.show');

// ✅ Newsletter Routes (with rate limiting)
Route::post('/newsletter/subscribe', [App\Http\Controllers\NewsletterController::class, 'subscribe'])
    ->name('newsletter.subscribe')
    ->middleware('throttle:3,60');
Route::get('/newsletter/verify/{token}', [App\Http\Controllers\NewsletterController::class, 'verify'])
    ->name('newsletter.verify');
Route::get('/newsletter/unsubscribe/{token}', [App\Http\Controllers\NewsletterController::class, 'unsubscribe'])
    ->name('newsletter.unsubscribe');
Route::post('/newsletter/preferences/{token}', [App\Http\Controllers\NewsletterController::class, 'updatePreferences'])
    ->name('newsletter.preferences')
    ->middleware('throttle:10,60');

// ✅ Notification Routes (authenticated users only)
Route::middleware(['auth'])->prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [App\Http\Controllers\NotificationController::class, 'index'])->name('index');
    Route::get('/unread-count', [App\Http\Controllers\NotificationController::class, 'getUnreadCount'])->name('unread-count');
    Route::get('/recent', [App\Http\Controllers\NotificationController::class, 'getRecent'])->name('recent');
    Route::post('/{notification}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('mark-read');
    Route::post('/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
    Route::delete('/{notification}', [App\Http\Controllers\NotificationController::class, 'destroy'])->name('destroy');
    Route::delete('/read/all', [App\Http\Controllers\NotificationController::class, 'deleteAllRead'])->name('delete-all-read');
});

// ✅ FIXED: Reduced rate limiting to prevent abuse (was 20/min, now 10/min)
// Guest recommendations for personalized suggestions (throttled)
Route::post('/api/guest-recommendations', [PostController::class, 'getGuestRecommendations'])
    ->middleware('throttle:10,1')
    ->name('guest.recommendations');

// Debug routes (only available in development environment)
if (config('app.debug')) {
    Route::middleware(['auth', 'auth.enhanced'])->prefix('debug')->name('debug.')->group(function () {
        Route::get('/', [App\Http\Controllers\DebugController::class, 'index'])->name('index');
        Route::get('/system-info', [App\Http\Controllers\DebugController::class, 'systemInfo'])->name('system-info');
        Route::post('/clear-logs', [App\Http\Controllers\DebugController::class, 'clearLogs'])->name('clear-logs');
        Route::get('/auth', [App\Http\Controllers\DebugController::class, 'debugAuth'])->name('auth');
        Route::get('/blog', [App\Http\Controllers\DebugController::class, 'debugBlog'])->name('blog');
    });
}

// Machine Learning API Routes
Route::prefix('api/ml')->name('ml.')->group(function () {
    // ✅ SECURITY FIX: Public routes with aggressive rate limiting to prevent abuse
    Route::middleware(['throttle:10,1'])->group(function () {
        Route::get('/recommendations', [MLController::class, 'getRecommendations'])->name('recommendations');
    });

    // User routes (require authentication and ban check)
    Route::middleware(['auth', 'auth.enhanced'])->group(function () {
        Route::post('/interaction', [MLController::class, 'logInteraction'])->name('interaction');
        Route::get('/insights', [MLController::class, 'getUserInsights'])->name('insights');
        Route::get('/metrics', [MLController::class, 'getMetrics'])->name('metrics');
        Route::post('/profile/update', [MLController::class, 'updateProfile'])->name('profile.update');
    });

    // Admin only routes
    Route::middleware(['auth', 'auth.enhanced', 'role:admin'])->group(function () {
        Route::post('/train', [MLController::class, 'trainModels'])->name('train');
        Route::get('/metrics/report', [MLController::class, 'getMetricsReport'])->name('metrics.report');
        Route::post('/ab-test', [MLController::class, 'runABTest'])->name('ab-test');
        Route::post('/cache/clear', [MLController::class, 'clearCaches'])->name('cache.clear');
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

// ✅ Comment Routes (with granular rate limiting, IP ban protection, and blog enabled check)
Route::middleware(['check.blog', 'throttle:comments-auth', 'check.ip.ban'])->group(function () {
    Route::post('/blog/{post:slug}/comments', [App\Http\Controllers\CommentController::class, 'store'])->name('comments.store');
    Route::get('/blog/{post:slug}/comments', [App\Http\Controllers\CommentController::class, 'getComments'])->name('comments.get');
});

// ✅ Comment Edit Routes (authenticated users only)
Route::middleware(['auth'])->group(function () {
    Route::put('/comments/{comment}', [App\Http\Controllers\CommentController::class, 'update'])->name('comments.update');
    Route::get('/comments/{comment}/edit-history', [App\Http\Controllers\CommentController::class, 'editHistory'])->name('comments.edit-history');
});

// ✅ Comment Reports (with dedicated rate limiting)
Route::middleware(['throttle:comment-reports', 'check.ip.ban'])->group(function () {
    Route::post('/comments/{comment}/report', [App\Http\Controllers\CommentInteractionController::class, 'report'])->name('comments.report');
});

// Social Authentication Routes
Route::prefix('auth')->name('auth.social.')->group(function () {
    Route::get('/{provider}/redirect', [SocialAuthController::class, 'redirect'])->name('redirect');
    Route::get('/{provider}/callback', [SocialAuthController::class, 'callback'])->name('callback');

    Route::middleware(['auth', 'auth.enhanced'])->group(function () {
        Route::delete('/{provider}/unlink', [SocialAuthController::class, 'unlink'])->name('unlink');
    });
});

// Institutional Pages
Route::get('/empresa', [PageController::class, 'about'])->name('pages.about');
Route::get('/contacto', [PageController::class, 'contact'])->name('pages.contact');

// Admin Routes
Route::prefix('admin')->name('admin.')->group(function () {
    require base_path('routes/admin.php');
});

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
Route::middleware(['auth', 'auth.enhanced', 'track.device'])->group(function () {
    // Dashboard Route (protected) - Main Dashboard
    Route::get('/dashboard', [App\Http\Controllers\UserDashboardController::class, 'index'])
        ->middleware(['check.permission'])
        ->name('dashboard');
    
    // Profile Settings (new unified settings page)
    Route::get('/profile/settings', [ProfileController::class, 'settings'])->name('profile.settings');

    // Legacy profile routes (redirect to settings)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Device/Session Management Routes
    Route::prefix('devices')->name('devices.')->group(function () {
        Route::get('/', [App\Http\Controllers\DeviceSessionController::class, 'index'])->name('index');
        Route::patch('/{device}', [App\Http\Controllers\DeviceSessionController::class, 'update'])->name('update');
        Route::post('/{device}/trust', [App\Http\Controllers\DeviceSessionController::class, 'trust'])->name('trust');
        Route::delete('/{device}', [App\Http\Controllers\DeviceSessionController::class, 'destroy'])->name('destroy');
        Route::delete('/', [App\Http\Controllers\DeviceSessionController::class, 'destroyInactive'])->name('destroy-inactive');
    });

    // ✅ Two Factor Authentication Routes (with rate limiting to prevent brute force)
    Route::prefix('user/two-factor-authentication')->name('two-factor.')->group(function () {
        Route::get('/', [App\Http\Controllers\Auth\TwoFactorController::class, 'show'])->name('show');
        Route::post('/', [App\Http\Controllers\Auth\TwoFactorController::class, 'store'])
            ->middleware('throttle:5,1') // Max 5 enable attempts per minute
            ->name('enable');
        Route::post('/confirm', [App\Http\Controllers\Auth\TwoFactorController::class, 'confirm'])
            ->middleware('throttle:5,1') // Max 5 verification attempts per minute (critical!)
            ->name('confirm');
        Route::delete('/', [App\Http\Controllers\Auth\TwoFactorController::class, 'destroy'])
            ->middleware('throttle:3,1') // Max 3 disable attempts per minute
            ->name('disable');
        Route::get('/qr-code', [App\Http\Controllers\Auth\TwoFactorController::class, 'qrCode'])
            ->middleware('throttle:10,1') // Max 10 QR code generations per minute
            ->name('qr-code');
        Route::post('/recovery-codes', [App\Http\Controllers\Auth\TwoFactorController::class, 'recoveryCodes'])
            ->middleware('throttle:5,1') // Max 5 recovery code requests per minute
            ->name('recovery-codes');
        Route::post('/recovery-codes/regenerate', [App\Http\Controllers\Auth\TwoFactorController::class, 'regenerate'])
            ->middleware('throttle:3,1') // Max 3 regenerations per minute
            ->name('recovery-codes.regenerate');
    });

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
