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

// Inactivity Detection Routes (require auth but less strict middleware)
// ✅ OPTIMIZED: Removed 'auth.enhanced' - now global middleware
Route::middleware(['auth', 'role:admin,editor,moderator', 'throttle:admin-heartbeat'])->group(function () {
    Route::post('/heartbeat', [App\Http\Controllers\Admin\InactivityController::class, 'heartbeat'])
        ->name('heartbeat');
    Route::post('/logout-inactivity', [App\Http\Controllers\Admin\InactivityController::class, 'logoutInactivity'])
        ->name('logout-inactivity');
    Route::get('/inactivity-config', [App\Http\Controllers\Admin\InactivityController::class, 'getConfig'])
        ->name('inactivity-config');
});

// Update inactivity config (admin only)
// ✅ OPTIMIZED: Removed 'auth.enhanced' - now global middleware
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::post('/inactivity-config', [App\Http\Controllers\Admin\InactivityController::class, 'updateConfig'])
        ->name('inactivity-config.update');
});

// All admin routes require authentication and admin/editor role with enhanced security
// ✅ OPTIMIZED: Removed 'auth.enhanced' - now global middleware
Route::middleware(['auth', 'role:admin,editor', 'admin.timeout', 'admin.audit'])->group(function () {

    // Admin root redirect to dashboard
    Route::get('/', function () {
        return redirect()->route('admin.dashboard');
    });

    // Admin Dashboard
    Route::get('/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])
        ->name('dashboard');

    // Machine Learning Dashboard
    Route::get('/ml/dashboard', [App\Http\Controllers\MLController::class, 'adminDashboard'])
        ->name('ml.dashboard');

    // Export Routes
    Route::prefix('export')->name('export.')->group(function () {
        Route::get('/', [App\Http\Controllers\ExportController::class, 'index'])->name('index');
        Route::get('/posts', [App\Http\Controllers\ExportController::class, 'exportPosts'])->name('posts');
        Route::get('/posts/pdf', [App\Http\Controllers\ExportController::class, 'exportPostsPdf'])->name('posts.pdf');
        Route::get('/comments', [App\Http\Controllers\ExportController::class, 'exportComments'])->name('comments');
        Route::get('/comments/pdf', [App\Http\Controllers\ExportController::class, 'exportCommentsPdf'])->name('comments.pdf');
        Route::get('/users', [App\Http\Controllers\ExportController::class, 'exportUsers'])->name('users');
    });

    // Admin Notifications API
    Route::prefix('api')->group(function () {
        Route::get('/notifications', [App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('api.notifications.index');
        Route::get('/notifications/recent', [App\Http\Controllers\Admin\NotificationController::class, 'recent'])->name('api.notifications.recent');
        Route::get('/notifications/unread-count', [App\Http\Controllers\Admin\NotificationController::class, 'unreadCount'])->name('api.notifications.unread-count');
        Route::get('/notifications/wait-updates', [App\Http\Controllers\Admin\NotificationController::class, 'waitUpdates'])->name('api.notifications.wait-updates');
        Route::post('/notifications', [App\Http\Controllers\Admin\NotificationController::class, 'store'])->name('api.notifications.store');
        Route::patch('/notifications/{notification}/read', [App\Http\Controllers\Admin\NotificationController::class, 'markAsRead'])->name('api.notifications.read');
        Route::patch('/notifications/{notification}/unread', [App\Http\Controllers\Admin\NotificationController::class, 'markAsUnread'])->name('api.notifications.unread');
        Route::patch('/notifications/mark-all-read', [App\Http\Controllers\Admin\NotificationController::class, 'markAllAsRead'])->name('api.notifications.mark-all-read');
        Route::delete('/notifications/{notification}', [App\Http\Controllers\Admin\NotificationController::class, 'destroy'])->name('api.notifications.destroy');
        Route::delete('/notifications/delete-all-read', [App\Http\Controllers\Admin\NotificationController::class, 'deleteAllRead'])->name('api.notifications.delete-all-read');
        Route::get('/notifications/stats', [App\Http\Controllers\Admin\NotificationController::class, 'stats'])->name('api.notifications.stats');
        Route::post('/notifications/cleanup', [App\Http\Controllers\Admin\NotificationController::class, 'cleanup'])->name('api.notifications.cleanup');
    });

    // Audit Logs
    Route::get('/audit-logs', [App\Http\Controllers\Admin\AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/audit-logs/export', [App\Http\Controllers\Admin\AuditLogController::class, 'export'])->name('audit-logs.export');
    Route::get('/audit-logs/data', [App\Http\Controllers\Admin\AuditLogController::class, 'data'])->name('audit-logs.data');
    Route::get('/audit-logs/stats', [App\Http\Controllers\Admin\AuditLogController::class, 'stats'])->name('audit-logs.stats');
    Route::get('/audit-logs/filter-options', [App\Http\Controllers\Admin\AuditLogController::class, 'filterOptions'])->name('audit-logs.filter-options');
    Route::get('/audit-logs/{auditLog}', [App\Http\Controllers\Admin\AuditLogController::class, 'show'])->name('audit-logs.show');

    // NOTE: User Management and Impersonation routes moved to ADMIN-ONLY group (see line ~380)

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
    // âœ… Bulk action with dedicated rate limiting
    Route::post('/services/bulk-action', [App\Http\Controllers\Admin\ServiceManagementController::class, 'bulkAction'])
        ->middleware('throttle:bulk-operations')
        ->name('services.bulk-action');
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
    // âœ… Bulk action with dedicated rate limiting
    Route::post('/projects/bulk-action', [App\Http\Controllers\Admin\ProjectManagementController::class, 'bulkAction'])
        ->middleware('throttle:bulk-operations')
        ->name('projects.bulk-action');
    Route::get('/projects/analytics', [App\Http\Controllers\Admin\ProjectManagementController::class, 'analytics'])->name('projects.analytics');
    Route::get('/projects/export', [App\Http\Controllers\Admin\ProjectManagementController::class, 'export'])->name('projects.export');

    // Testimonials Management
    Route::resource('testimonials', App\Http\Controllers\Admin\TestimonialController::class);
    Route::post('/testimonials/{testimonial}/approve', [App\Http\Controllers\Admin\TestimonialController::class, 'approve'])->name('testimonials.approve');
    Route::post('/testimonials/{testimonial}/reject', [App\Http\Controllers\Admin\TestimonialController::class, 'reject'])->name('testimonials.reject');

    // NOTE: Newsletter and Backup Management routes moved to ADMIN-ONLY group (see line ~380)

    // Posts Management
    // âš ï¸ IMPORTANT: Specific routes MUST come BEFORE Route::resource to avoid conflicts

    // Additional post actions (BEFORE resource routes)
    Route::get('posts/analytics', [App\Http\Controllers\Admin\PostController::class, 'analytics'])
        ->name('posts.analytics');
    Route::get('posts/export', [App\Http\Controllers\Admin\PostController::class, 'export'])
        ->name('posts.export');
    Route::post('posts/bulk-action', [App\Http\Controllers\Admin\PostController::class, 'bulkAction'])
        ->middleware('throttle:bulk-operations')
        ->name('posts.bulk-action');
    Route::post('posts/{post}/toggle-featured', [App\Http\Controllers\Admin\PostController::class, 'toggleFeatured'])
        ->name('posts.toggle-featured');
    Route::patch('posts/{post}/status', [App\Http\Controllers\Admin\PostController::class, 'changeStatus'])
        ->name('posts.change-status');
    Route::post('posts/{post}/duplicate', [App\Http\Controllers\Admin\PostController::class, 'duplicate'])
        ->name('posts.duplicate');

    // Resource routes (AFTER specific routes)
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

    // Comment restore (with rate limiting to prevent abuse)
    Route::post('comments/{id}/restore', [App\Http\Controllers\Admin\CommentController::class, 'restore'])
        ->middleware('throttle:admin-restore')
        ->name('comments.restore');

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

    // Comment restore in management controller (with rate limiting)
    Route::post('comment-management/{id}/restore', [App\Http\Controllers\Admin\CommentManagementController::class, 'restore'])
        ->middleware('throttle:admin-restore')
        ->name('comment-management.restore');

    Route::get('comment-management/export', [App\Http\Controllers\Admin\CommentManagementController::class, 'export'])
        ->name('comment-management.export');

    // NOTE: Settings and Maintenance Mode Management routes moved to ADMIN-ONLY group (see line ~380)

    // Media Management
    Route::get('/media', [App\Http\Controllers\Admin\MediaController::class, 'index'])
        ->name('media.index');
    Route::get('/media/list', [App\Http\Controllers\Admin\MediaController::class, 'list'])
        ->name('media.list');

    // Media upload with rate limiting (20 uploads per minute)
    Route::post('/media/upload', [App\Http\Controllers\Admin\MediaController::class, 'upload'])
        ->middleware('throttle:20,1')
        ->name('media.upload');

    Route::delete('/media/delete', [App\Http\Controllers\Admin\MediaController::class, 'destroy'])
        ->name('media.destroy');

    // Bulk delete with rate limiting (10 operations per minute)
    Route::delete('/media/bulk-delete', [App\Http\Controllers\Admin\MediaController::class, 'bulkDelete'])
        ->middleware('throttle:10,1')
        ->name('media.bulk-delete');
});

// Admin only routes (restricted to admin role) with enhanced security
// ✅ OPTIMIZED: Removed 'auth.enhanced' - now global middleware
Route::middleware(['auth', 'role:admin', 'admin.security', 'admin.timeout', 'admin.audit'])->group(function () {

    // ========================================
    // USER NOTIFICATIONS (Admin Only)
    // ========================================
    Route::get('/user-notifications/send', [App\Http\Controllers\Admin\UserNotificationController::class, 'create'])
        ->name('user-notifications.send');
    Route::post('/user-notifications/send', [App\Http\Controllers\Admin\UserNotificationController::class, 'store'])
        ->middleware('throttle:10,1') // Rate limit: 10 requests per minute
        ->name('user-notifications.store');
    Route::get('/user-notifications/history', [App\Http\Controllers\Admin\UserNotificationController::class, 'history'])
        ->name('user-notifications.history');

    // ========================================
    // USER MANAGEMENT (Admin Only)
    // ========================================
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

    // Bulk action with dedicated rate limiting
    Route::post('/users/bulk-action', [App\Http\Controllers\Admin\UserManagementController::class, 'bulkAction'])
        ->middleware('throttle:bulk-operations')
        ->name('users.bulk-action');
    Route::get('/users/export', [App\Http\Controllers\Admin\UserManagementController::class, 'export'])->name('users.export');

    // User Ban Management
    Route::post('/users/{user}/ban', [App\Http\Controllers\Admin\UserManagementController::class, 'banUser'])->name('users.ban');
    Route::patch('/users/{user}/ban', [App\Http\Controllers\Admin\UserManagementController::class, 'modifyBan'])->name('users.ban.modify');
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

    // ========================================
    // BAN APPEAL MANAGEMENT (Admin Only)
    // ========================================
    Route::prefix('ban-appeals')->name('ban-appeals.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\BanAppealManagementController::class, 'index'])->name('index');
        Route::get('/{appeal}', [App\Http\Controllers\Admin\BanAppealManagementController::class, 'show'])->name('show');
        Route::post('/{appeal}/approve', [App\Http\Controllers\Admin\BanAppealManagementController::class, 'approve'])->name('approve');
        Route::post('/{appeal}/reject', [App\Http\Controllers\Admin\BanAppealManagementController::class, 'reject'])->name('reject');
        Route::post('/{appeal}/request-info', [App\Http\Controllers\Admin\BanAppealManagementController::class, 'requestInfo'])->name('request-info');
    });

    // ========================================
    // USER IMPERSONATION (Admin Only)
    // ========================================
    Route::get('/impersonation/sessions', [App\Http\Controllers\Admin\UserImpersonationController::class, 'index'])
        ->name('impersonation.sessions.index');
    Route::get('/impersonation/sessions/api', [App\Http\Controllers\Admin\UserImpersonationController::class, 'apiIndex'])
        ->name('impersonation.sessions.api');
    Route::delete('/impersonation/sessions/{sessionId}', [App\Http\Controllers\Admin\UserImpersonationController::class, 'forceTerminate'])
        ->name('impersonation.sessions.terminate');
    Route::post('/users/{user}/impersonate', [App\Http\Controllers\Admin\UserImpersonationController::class, 'store'])
        ->middleware('throttle:impersonation')
        ->name('users.impersonate');

    // ========================================
    // NEWSLETTER MANAGEMENT (Admin Only)
    // ========================================
    Route::get('/newsletter', [App\Http\Controllers\Admin\NewsletterController::class, 'index'])->name('newsletter.index');
    Route::post('/newsletter/send-campaign', [App\Http\Controllers\Admin\NewsletterController::class, 'sendCampaign'])->name('newsletter.send-campaign');
    Route::get('/newsletter/export', [App\Http\Controllers\Admin\NewsletterController::class, 'export'])->name('newsletter.export');
    Route::delete('/newsletter/{newsletter}', [App\Http\Controllers\Admin\NewsletterController::class, 'destroy'])->name('newsletter.destroy');
    Route::post('/newsletter/bulk-action', [App\Http\Controllers\Admin\NewsletterController::class, 'bulkAction'])
        ->middleware('throttle:bulk-operations')
        ->name('newsletter.bulk-action');

    // ========================================
    // BACKUP MANAGEMENT (Admin Only)
    // ========================================
    Route::get('/backup', [App\Http\Controllers\Admin\BackupController::class, 'index'])->name('backup.index');
    Route::post('/backup/create', [App\Http\Controllers\Admin\BackupController::class, 'create'])->name('backup.create');
    Route::get('/backup/download/{filename}', [App\Http\Controllers\Admin\BackupController::class, 'download'])->name('backup.download');
    Route::delete('/backup/{filename}', [App\Http\Controllers\Admin\BackupController::class, 'destroy'])->name('backup.destroy');
    Route::post('/backup/clean', [App\Http\Controllers\Admin\BackupController::class, 'clean'])->name('backup.clean');

    // ========================================
    // SETTINGS MANAGEMENT (Admin Only)
    // ========================================
    Route::get('/settings', [App\Http\Controllers\Admin\SettingController::class, 'index'])
        ->name('settings.index');
    Route::post('/settings', [App\Http\Controllers\Admin\SettingController::class, 'update'])
        ->name('settings.update');
    Route::post('/settings/initialize', [App\Http\Controllers\Admin\SettingController::class, 'initializeDefaults'])
        ->name('settings.initialize');
    Route::post('/settings/upload', [App\Http\Controllers\Admin\SettingController::class, 'uploadFile'])
        ->name('settings.upload');
    Route::get('/settings/history/{key}', [App\Http\Controllers\Admin\SettingController::class, 'getHistory'])
        ->name('settings.history');
    Route::post('/settings/revert/{key}', [App\Http\Controllers\Admin\SettingController::class, 'revert'])
        ->name('settings.revert');
    Route::get('/settings/export', [App\Http\Controllers\Admin\SettingController::class, 'export'])
        ->name('settings.export');
    Route::post('/settings/import', [App\Http\Controllers\Admin\SettingController::class, 'import'])
        ->name('settings.import');
    Route::post('/settings/reset-all', [App\Http\Controllers\Admin\SettingController::class, 'resetAll'])
        ->name('settings.reset-all');

    // ========================================
    // MAINTENANCE MODE MANAGEMENT (Admin Only)
    // ========================================
    Route::post('/maintenance/toggle', [App\Http\Controllers\Admin\MaintenanceModeController::class, 'toggle'])
        ->name('maintenance.toggle');
    Route::post('/maintenance/schedule', [App\Http\Controllers\Admin\MaintenanceModeController::class, 'schedule'])
        ->name('maintenance.schedule');
    Route::get('/maintenance/preview', [App\Http\Controllers\Admin\MaintenanceModeController::class, 'preview'])
        ->name('maintenance.preview');
    Route::post('/maintenance/ip/add', [App\Http\Controllers\Admin\MaintenanceModeController::class, 'addIp'])
        ->name('maintenance.ip.add');
    Route::delete('/maintenance/ip/{ip}', [App\Http\Controllers\Admin\MaintenanceModeController::class, 'removeIp'])
        ->name('maintenance.ip.remove');
    Route::get('/maintenance/status', [App\Http\Controllers\Admin\MaintenanceModeController::class, 'status'])
        ->name('maintenance.status');

    // ========================================
    // System Management & Utilities
    // ========================================
    Route::get('/system/stats', [App\Http\Controllers\Admin\AdminController::class, 'getSystemStats'])
        ->name('system.stats');
    Route::get('/system/activity', [App\Http\Controllers\Admin\AdminController::class, 'getRecentActivity'])
        ->name('system.activity');
    Route::get('/system/health', [App\Http\Controllers\Admin\AdminController::class, 'getSystemHealth'])
        ->name('system.health');
    Route::post('/system/cache-clear', [App\Http\Controllers\Admin\AdminController::class, 'clearCaches'])
        ->middleware('throttle:5,60') // Security fix: Rate limit to 5 requests per hour
        ->name('system.cache-clear');

    // Analytics & Reporting
    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\AnalyticsController::class, 'index'])
            ->name('index');
        Route::get('/dashboard', function () {
            return \Inertia\Inertia::render('Admin/Analytics/Dashboard');
        })->name('dashboard');
    });

    // Analytics API Routes
    Route::prefix('api/analytics')->name('api.analytics.')->group(function () {
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

    // Contact Requests Management
    Route::prefix('contact-requests')->name('contact-requests.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\ContactRequestController::class, 'index'])
            ->name('index');
        Route::get('/{contactRequest}', [App\Http\Controllers\Admin\ContactRequestController::class, 'show'])
            ->name('show');
        Route::post('/{contactRequest}/mark-read', [App\Http\Controllers\Admin\ContactRequestController::class, 'markAsRead'])
            ->name('mark-read');
        Route::post('/{contactRequest}/mark-responded', [App\Http\Controllers\Admin\ContactRequestController::class, 'markAsResponded'])
            ->name('mark-responded');
        Route::post('/{contactRequest}/archive', [App\Http\Controllers\Admin\ContactRequestController::class, 'archive'])
            ->name('archive');
        Route::post('/{contactRequest}/notes', [App\Http\Controllers\Admin\ContactRequestController::class, 'addNotes'])
            ->name('add-notes');
        Route::get('/{contactRequest}/attachments/{attachment}/download', [App\Http\Controllers\Admin\ContactRequestController::class, 'downloadAttachment'])
            ->name('attachments.download');
        Route::delete('/{contactRequest}', [App\Http\Controllers\Admin\ContactRequestController::class, 'destroy'])
            ->name('destroy');
        Route::post('/bulk-action', [App\Http\Controllers\Admin\ContactRequestController::class, 'bulkAction'])
            ->name('bulk-action');
    });

    // Admin Notifications
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\NotificationController::class, 'index'])
            ->name('index');
        Route::get('/stats', [App\Http\Controllers\Admin\NotificationController::class, 'stats'])
            ->name('stats');
        Route::post('/{notification}/mark-read', [App\Http\Controllers\Admin\NotificationController::class, 'markAsRead'])
            ->name('mark-read');
        Route::post('/{notification}/mark-unread', [App\Http\Controllers\Admin\NotificationController::class, 'markAsUnread'])
            ->name('mark-unread');
        Route::post('/mark-all-read', [App\Http\Controllers\Admin\NotificationController::class, 'markAllAsRead'])
            ->name('mark-all-read');
        Route::delete('/{notification}', [App\Http\Controllers\Admin\NotificationController::class, 'destroy'])
            ->name('destroy');
        Route::post('/cleanup', [App\Http\Controllers\Admin\NotificationController::class, 'cleanup'])
            ->name('cleanup');
        Route::post('/', [App\Http\Controllers\Admin\NotificationController::class, 'store'])
            ->name('store');
    });

    // Machine Learning Management
    Route::prefix('ml')->name('ml.')->group(function () {
        Route::get('/dashboard', function () {
            return \Inertia\Inertia::render('Admin/ML/Dashboard');
        })->name('dashboard');
    });
});

