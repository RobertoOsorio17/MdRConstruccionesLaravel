<?php

use Illuminate\Support\Facades\Route;

// Admin Authentication Routes (no middleware required)
Route::prefix('auth')->name('auth.')->group(function () {
    Route::get('/login', [App\Http\Controllers\Admin\Auth\AdminAuthController::class, 'create'])
        ->middleware('guest')
        ->name('login');

    Route::post('/login', [App\Http\Controllers\Admin\Auth\AdminAuthController::class, 'store'])
        ->middleware('guest')
        ->name('login.store');

    Route::post('/logout', [App\Http\Controllers\Admin\Auth\AdminAuthController::class, 'destroy'])
        ->middleware('auth')
        ->name('logout');

    Route::get('/status', [App\Http\Controllers\Admin\Auth\AdminAuthController::class, 'status'])
        ->middleware('auth')
        ->name('status');

    Route::post('/extend-session', [App\Http\Controllers\Admin\Auth\AdminAuthController::class, 'extendSession'])
        ->middleware('auth')
        ->name('extend-session');

    Route::get('/login-stats', [App\Http\Controllers\Admin\Auth\AdminAuthController::class, 'loginStats'])
        ->middleware(['auth', 'role:admin,editor'])
        ->name('login-stats');
});

// Admin Login Route (alternative)
Route::get('/login', [App\Http\Controllers\Admin\Auth\AdminAuthController::class, 'create'])
    ->middleware('guest')
    ->name('login');

// All admin routes require authentication and admin/editor role with enhanced security
Route::middleware(['auth', 'verified', 'auth.enhanced', 'role:admin,editor', 'admin.timeout', 'admin.audit'])->group(function () {

    // Admin root redirect to dashboard
    Route::get('/', function () {
        return redirect()->route('admin.dashboard');
    });

    // Admin Dashboard
    Route::get('/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])
        ->name('dashboard');

    // Admin Notifications API
    Route::prefix('api')->group(function () {
        Route::get('/notifications', [App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('api.notifications.index');
        Route::post('/notifications', [App\Http\Controllers\Admin\NotificationController::class, 'store'])->name('api.notifications.store');
        Route::patch('/notifications/{notification}/read', [App\Http\Controllers\Admin\NotificationController::class, 'markAsRead'])->name('api.notifications.read');
        Route::patch('/notifications/{notification}/unread', [App\Http\Controllers\Admin\NotificationController::class, 'markAsUnread'])->name('api.notifications.unread');
        Route::patch('/notifications/mark-all-read', [App\Http\Controllers\Admin\NotificationController::class, 'markAllAsRead'])->name('api.notifications.mark-all-read');
        Route::delete('/notifications/{notification}', [App\Http\Controllers\Admin\NotificationController::class, 'destroy'])->name('api.notifications.destroy');
        Route::get('/notifications/stats', [App\Http\Controllers\Admin\NotificationController::class, 'stats'])->name('api.notifications.stats');
        Route::post('/notifications/cleanup', [App\Http\Controllers\Admin\NotificationController::class, 'cleanup'])->name('api.notifications.cleanup');
    });

    // Audit Logs
    Route::get('/audit-logs', [App\Http\Controllers\Admin\AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/audit-logs/data', [App\Http\Controllers\Admin\AuditLogController::class, 'data'])->name('audit-logs.data');
    Route::get('/audit-logs/stats', [App\Http\Controllers\Admin\AuditLogController::class, 'stats'])->name('audit-logs.stats');
    Route::get('/audit-logs/filter-options', [App\Http\Controllers\Admin\AuditLogController::class, 'filterOptions'])->name('audit-logs.filter-options');
    Route::get('/audit-logs/{auditLog}', [App\Http\Controllers\Admin\AuditLogController::class, 'show'])->name('audit-logs.show');
    Route::post('/audit-logs/export', [App\Http\Controllers\Admin\AuditLogController::class, 'export'])->name('audit-logs.export');

    // User Management
    Route::resource('users', App\Http\Controllers\Admin\UserManagementController::class)
        ->names([
            'index' => 'users.index',
            'create' => 'users.create',
            'store' => 'users.store',
            'show' => 'users.show',
            'edit' => 'users.edit',
            'update' => 'users.update',
            'destroy' => 'users.destroy',
        ]);
    Route::post('/users/bulk-action', [App\Http\Controllers\Admin\UserManagementController::class, 'bulkAction'])->name('users.bulk-action');
    Route::get('/users/export', [App\Http\Controllers\Admin\UserManagementController::class, 'export'])->name('users.export');

    // User Ban Management
    Route::post('/users/{user}/ban', [App\Http\Controllers\Admin\UserManagementController::class, 'banUser'])->name('users.ban');
    Route::post('/users/{user}/unban', [App\Http\Controllers\Admin\UserManagementController::class, 'unbanUser'])->name('users.unban');
    Route::get('/users/{user}/ban-history', [App\Http\Controllers\Admin\UserManagementController::class, 'getBanHistory'])->name('users.ban-history');

    // User Comment Management
    Route::get('/users/{user}/comments', [App\Http\Controllers\Admin\UserManagementController::class, 'getUserComments'])->name('users.comments');
    Route::patch('/users/{user}/comments/{comment}/status', [App\Http\Controllers\Admin\UserManagementController::class, 'updateCommentStatus'])->name('users.comments.status');
    Route::delete('/users/{user}/comments/{comment}', [App\Http\Controllers\Admin\UserManagementController::class, 'deleteComment'])->name('users.comments.delete');
    Route::post('/users/{user}/comments/bulk-actions', [App\Http\Controllers\Admin\UserManagementController::class, 'bulkCommentActions'])->name('users.comments.bulk');

    // User Verification Management
    Route::post('/users/{user}/verify', [App\Http\Controllers\Admin\UserManagementController::class, 'verifyUser'])->name('users.verify');
    Route::post('/users/{user}/unverify', [App\Http\Controllers\Admin\UserManagementController::class, 'unverifyUser'])->name('users.unverify');

    // Service Management
    Route::resource('services', App\Http\Controllers\Admin\ServiceManagementController::class)
        ->names([
            'index' => 'services.index',
            'create' => 'services.create',
            'store' => 'services.store',
            'show' => 'services.show',
            'edit' => 'services.edit',
            'update' => 'services.update',
            'destroy' => 'services.destroy',
        ]);
    Route::post('/services/bulk-action', [App\Http\Controllers\Admin\ServiceManagementController::class, 'bulkAction'])->name('services.bulk-action');
    Route::get('/services/analytics', [App\Http\Controllers\Admin\ServiceManagementController::class, 'analytics'])->name('services.analytics');
    Route::get('/services/export', [App\Http\Controllers\Admin\ServiceManagementController::class, 'export'])->name('services.export');

    // Project Management
    Route::resource('projects', App\Http\Controllers\Admin\ProjectManagementController::class)
        ->names([
            'index' => 'projects.index',
            'create' => 'projects.create',
            'store' => 'projects.store',
            'show' => 'projects.show',
            'edit' => 'projects.edit',
            'update' => 'projects.update',
            'destroy' => 'projects.destroy',
        ]);
    Route::post('/projects/bulk-action', [App\Http\Controllers\Admin\ProjectManagementController::class, 'bulkAction'])->name('projects.bulk-action');
    Route::get('/projects/analytics', [App\Http\Controllers\Admin\ProjectManagementController::class, 'analytics'])->name('projects.analytics');
    Route::get('/projects/export', [App\Http\Controllers\Admin\ProjectManagementController::class, 'export'])->name('projects.export');

    // Posts Management
    Route::resource('posts', App\Http\Controllers\Admin\PostController::class)
        ->names([
            'index' => 'posts.index',
            'create' => 'posts.create',
            'store' => 'posts.store',
            'show' => 'posts.show',
            'edit' => 'posts.edit',
            'update' => 'posts.update',
            'destroy' => 'posts.destroy',
        ]);
    
    // Additional post actions
    Route::post('posts/{post}/toggle-featured', [App\Http\Controllers\Admin\PostController::class, 'toggleFeatured'])
        ->name('posts.toggle-featured');
    Route::patch('posts/{post}/status', [App\Http\Controllers\Admin\PostController::class, 'changeStatus'])
        ->name('posts.change-status');
    Route::post('posts/{post}/duplicate', [App\Http\Controllers\Admin\PostController::class, 'duplicate'])
        ->name('posts.duplicate');
    Route::post('posts/bulk-action', [App\Http\Controllers\Admin\PostController::class, 'bulkAction'])
        ->name('posts.bulk-action');
    Route::get('posts/analytics', [App\Http\Controllers\Admin\PostController::class, 'analytics'])
        ->name('posts.analytics');
    Route::get('posts/export', [App\Http\Controllers\Admin\PostController::class, 'export'])
        ->name('posts.export');
    
    // Categories Management
    Route::resource('categories', App\Http\Controllers\Admin\CategoryController::class)
        ->names([
            'index' => 'categories.index',
            'create' => 'categories.create',
            'store' => 'categories.store',
            'show' => 'categories.show',
            'edit' => 'categories.edit',
            'update' => 'categories.update',
            'destroy' => 'categories.destroy',
        ]);

    // Additional category actions
    Route::post('categories/{category}/toggle-status', [App\Http\Controllers\Admin\CategoryController::class, 'toggleStatus'])
        ->name('categories.toggle-status');
    Route::post('categories/update-order', [App\Http\Controllers\Admin\CategoryController::class, 'updateOrder'])
        ->name('categories.update-order');
    
    // Tags Management
    Route::resource('tags', App\Http\Controllers\Admin\TagController::class)
        ->names([
            'index' => 'tags.index',
            'create' => 'tags.create',
            'store' => 'tags.store',
            'show' => 'tags.show',
            'edit' => 'tags.edit',
            'update' => 'tags.update',
            'destroy' => 'tags.destroy',
        ]);

    // Additional tag actions
    Route::delete('tags/bulk-delete-unused', [App\Http\Controllers\Admin\TagController::class, 'bulkDeleteUnused'])
        ->name('tags.bulk-delete-unused');
    
    // Comments Management (only index, update, destroy)
    Route::resource('comments', App\Http\Controllers\Admin\CommentController::class)
        ->only(['index', 'show', 'update', 'destroy'])
        ->names([
            'index' => 'comments.index',
            'show' => 'comments.show',
            'update' => 'comments.update',
            'destroy' => 'comments.destroy',
        ]);

    // Additional comment actions
    Route::post('comments/{comment}/approve', [App\Http\Controllers\Admin\CommentController::class, 'approve'])
        ->name('comments.approve');
    Route::post('comments/{comment}/spam', [App\Http\Controllers\Admin\CommentController::class, 'markAsSpam'])
        ->name('comments.spam');
    Route::post('comments/bulk-approve', [App\Http\Controllers\Admin\CommentController::class, 'bulkApprove'])
        ->name('comments.bulk-approve');
    Route::delete('comments/bulk-delete', [App\Http\Controllers\Admin\CommentController::class, 'bulkDelete'])
        ->name('comments.bulk-delete');
    Route::post('comments/bulk-spam', [App\Http\Controllers\Admin\CommentController::class, 'bulkMarkAsSpam'])
        ->name('comments.bulk-spam');
    
    // Comment Management (new routes for likes/dislikes and reports)
    Route::get('comment-management', [App\Http\Controllers\Admin\CommentManagementController::class, 'index'])
        ->name('comment-management.index');
    Route::get('comment-reports', [App\Http\Controllers\Admin\CommentManagementController::class, 'reports'])
        ->name('comment-reports.index');
    Route::post('comments/{comment}/status', [App\Http\Controllers\Admin\CommentManagementController::class, 'updateStatus'])
        ->name('comments.update-status');
    Route::post('comment-reports/{report}/resolve', [App\Http\Controllers\Admin\CommentManagementController::class, 'resolveReport'])
        ->name('comment-reports.resolve');
    Route::get('comment-statistics', [App\Http\Controllers\Admin\CommentManagementController::class, 'statistics'])
        ->name('comment-statistics');

    // Bulk comment actions for improved moderation
    Route::post('comment-management/bulk-approve', [App\Http\Controllers\Admin\CommentManagementController::class, 'bulkApprove'])
        ->name('comment-management.bulk-approve');
    Route::post('comment-management/bulk-reject', [App\Http\Controllers\Admin\CommentManagementController::class, 'bulkReject'])
        ->name('comment-management.bulk-reject');
    Route::delete('comment-management/bulk-delete', [App\Http\Controllers\Admin\CommentManagementController::class, 'bulkDelete'])
        ->name('comment-management.bulk-delete');
    Route::post('comments/{comment}/spam', [App\Http\Controllers\Admin\CommentManagementController::class, 'markAsSpam'])
        ->name('comment-management.spam');
    Route::get('comment-management/pending', [App\Http\Controllers\Admin\CommentManagementController::class, 'getPendingComments'])
        ->name('comment-management.pending');
    
    // Projects Management (TODO: Create ProjectController)
    /*
    Route::resource('projects', App\Http\Controllers\Admin\ProjectController::class)
        ->names([
            'index' => 'admin.projects.index',
            'create' => 'admin.projects.create',
            'store' => 'admin.projects.store',
            'show' => 'admin.projects.show',
            'edit' => 'admin.projects.edit',
            'update' => 'admin.projects.update',
            'destroy' => 'admin.projects.destroy',
        ]);
    */
    
    // Services Management (TODO: Create ServiceController for admin)
    /*
    Route::resource('services', App\Http\Controllers\Admin\ServiceController::class)
        ->names([
            'index' => 'admin.services.index',
            'create' => 'admin.services.create',
            'store' => 'admin.services.store',
            'show' => 'admin.services.show',
            'edit' => 'admin.services.edit',
            'update' => 'admin.services.update',
            'destroy' => 'admin.services.destroy',
        ]);
    */
    
    // Settings Management
    Route::get('/settings', [App\Http\Controllers\Admin\SettingController::class, 'index'])
        ->name('settings.index');
    Route::post('/settings', [App\Http\Controllers\Admin\SettingController::class, 'update'])
        ->name('settings.update');
    Route::post('/settings/initialize', [App\Http\Controllers\Admin\SettingController::class, 'initializeDefaults'])
        ->name('settings.initialize');

    // Media Management
    Route::get('/media', [App\Http\Controllers\Admin\MediaController::class, 'index'])
        ->name('media.index');
    Route::get('/media/list', [App\Http\Controllers\Admin\MediaController::class, 'list'])
        ->name('media.list');
    Route::post('/media/upload', [App\Http\Controllers\Admin\MediaController::class, 'upload'])
        ->name('media.upload');
    Route::delete('/media/delete', [App\Http\Controllers\Admin\MediaController::class, 'destroy'])
        ->name('media.destroy');
    Route::delete('/media/bulk-delete', [App\Http\Controllers\Admin\MediaController::class, 'bulkDelete'])
        ->name('media.bulk-delete');
});

// Admin only routes (restricted to admin role) with enhanced security
Route::middleware(['auth', 'verified', 'auth.enhanced', 'role:admin', 'admin.security', 'admin.timeout', 'admin.audit'])->group(function () {
    
    // Users Management (TODO: Create UserController)
    /*
    Route::resource('users', App\Http\Controllers\Admin\UserController::class)
        ->names([
            'index' => 'admin.users.index',
            'create' => 'admin.users.create',
            'store' => 'admin.users.store',
            'show' => 'admin.users.show',
            'edit' => 'admin.users.edit',
            'update' => 'admin.users.update',
            'destroy' => 'admin.users.destroy',
        ]);
    */
    
    // System Management & Utilities
    Route::get('/system/stats', [App\Http\Controllers\Admin\AdminController::class, 'getSystemStats'])
        ->name('system.stats');
    Route::get('/system/activity', [App\Http\Controllers\Admin\AdminController::class, 'getRecentActivity'])
        ->name('system.activity');
    Route::get('/system/health', [App\Http\Controllers\Admin\AdminController::class, 'getSystemHealth'])
        ->name('system.health');
    Route::post('/system/cache-clear', [App\Http\Controllers\Admin\AdminController::class, 'clearCaches'])
        ->name('system.cache-clear');

    // Analytics & Reporting
    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\AnalyticsController::class, 'index'])
            ->name('index');
        Route::get('/users', [App\Http\Controllers\Admin\AnalyticsController::class, 'getUserAnalytics'])
            ->name('users');
        Route::get('/content', [App\Http\Controllers\Admin\AnalyticsController::class, 'getContentAnalytics'])
            ->name('content');
        Route::get('/services', [App\Http\Controllers\Admin\AnalyticsController::class, 'getServiceAnalytics'])
            ->name('services');
        Route::get('/projects', [App\Http\Controllers\Admin\AnalyticsController::class, 'getProjectAnalytics'])
            ->name('projects');
        Route::get('/system', [App\Http\Controllers\Admin\AnalyticsController::class, 'getSystemAnalytics'])
            ->name('system');
    });
});