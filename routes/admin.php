<?php

use Illuminate\Support\Facades\Route;

// All admin routes require authentication and admin/editor role with enhanced security
Route::middleware(['auth', 'verified', 'auth.enhanced', 'role:admin,editor', 'admin.timeout', 'admin.audit'])->group(function () {
    
    // Admin Dashboard
    Route::get('/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])
        ->name('dashboard');

    // Admin Notifications API
    Route::prefix('api')->group(function () {
        Route::get('/notifications', [App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('admin.api.notifications.index');
        Route::post('/notifications', [App\Http\Controllers\Admin\NotificationController::class, 'store'])->name('admin.api.notifications.store');
        Route::patch('/notifications/{notification}/read', [App\Http\Controllers\Admin\NotificationController::class, 'markAsRead'])->name('admin.api.notifications.read');
        Route::patch('/notifications/{notification}/unread', [App\Http\Controllers\Admin\NotificationController::class, 'markAsUnread'])->name('admin.api.notifications.unread');
        Route::patch('/notifications/mark-all-read', [App\Http\Controllers\Admin\NotificationController::class, 'markAllAsRead'])->name('admin.api.notifications.mark-all-read');
        Route::delete('/notifications/{notification}', [App\Http\Controllers\Admin\NotificationController::class, 'destroy'])->name('admin.api.notifications.destroy');
        Route::get('/notifications/stats', [App\Http\Controllers\Admin\NotificationController::class, 'stats'])->name('admin.api.notifications.stats');
        Route::post('/notifications/cleanup', [App\Http\Controllers\Admin\NotificationController::class, 'cleanup'])->name('admin.api.notifications.cleanup');
    });

    // Audit Logs
    Route::get('/audit-logs', [App\Http\Controllers\Admin\AuditLogController::class, 'index'])->name('admin.audit-logs.index');
    Route::get('/audit-logs/data', [App\Http\Controllers\Admin\AuditLogController::class, 'data'])->name('admin.audit-logs.data');
    Route::get('/audit-logs/stats', [App\Http\Controllers\Admin\AuditLogController::class, 'stats'])->name('admin.audit-logs.stats');
    Route::get('/audit-logs/filter-options', [App\Http\Controllers\Admin\AuditLogController::class, 'filterOptions'])->name('admin.audit-logs.filter-options');
    Route::get('/audit-logs/{auditLog}', [App\Http\Controllers\Admin\AuditLogController::class, 'show'])->name('admin.audit-logs.show');
    Route::post('/audit-logs/export', [App\Http\Controllers\Admin\AuditLogController::class, 'export'])->name('admin.audit-logs.export');

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
    Route::get('/projects/export', [App\Http\Controllers\Admin\ProjectManagementController::class, 'export'])->name('projects.export');

    // Posts Management
    Route::resource('posts', App\Http\Controllers\Admin\PostController::class)
        ->names([
            'index' => 'admin.posts.index',
            'create' => 'admin.posts.create',
            'store' => 'admin.posts.store',
            'show' => 'admin.posts.show',
            'edit' => 'admin.posts.edit',
            'update' => 'admin.posts.update',
            'destroy' => 'admin.posts.destroy',
        ]);
    
    // Additional post actions
    Route::post('posts/{post}/toggle-featured', [App\Http\Controllers\Admin\PostController::class, 'toggleFeatured'])
        ->name('admin.posts.toggle-featured');
    Route::patch('posts/{post}/status', [App\Http\Controllers\Admin\PostController::class, 'changeStatus'])
        ->name('admin.posts.change-status');
    Route::post('posts/{post}/duplicate', [App\Http\Controllers\Admin\PostController::class, 'duplicate'])
        ->name('admin.posts.duplicate');
    
    // Categories Management
    Route::resource('categories', App\Http\Controllers\Admin\CategoryController::class)
        ->names([
            'index' => 'admin.categories.index',
            'create' => 'admin.categories.create',
            'store' => 'admin.categories.store',
            'show' => 'admin.categories.show',
            'edit' => 'admin.categories.edit',
            'update' => 'admin.categories.update',
            'destroy' => 'admin.categories.destroy',
        ]);
    
    // Additional category actions
    Route::post('categories/{category}/toggle-status', [App\Http\Controllers\Admin\CategoryController::class, 'toggleStatus'])
        ->name('admin.categories.toggle-status');
    Route::post('categories/update-order', [App\Http\Controllers\Admin\CategoryController::class, 'updateOrder'])
        ->name('admin.categories.update-order');
    
    // Tags Management
    Route::resource('tags', App\Http\Controllers\Admin\TagController::class)
        ->names([
            'index' => 'admin.tags.index',
            'create' => 'admin.tags.create',
            'store' => 'admin.tags.store',
            'show' => 'admin.tags.show',
            'edit' => 'admin.tags.edit',
            'update' => 'admin.tags.update',
            'destroy' => 'admin.tags.destroy',
        ]);
    
    // Additional tag actions
    Route::delete('tags/bulk-delete-unused', [App\Http\Controllers\Admin\TagController::class, 'bulkDeleteUnused'])
        ->name('admin.tags.bulk-delete-unused');
    
    // Comments Management (only index, update, destroy)
    Route::resource('comments', App\Http\Controllers\Admin\CommentController::class)
        ->only(['index', 'show', 'update', 'destroy'])
        ->names([
            'index' => 'admin.comments.index',
            'show' => 'admin.comments.show',
            'update' => 'admin.comments.update',
            'destroy' => 'admin.comments.destroy',
        ]);
    
    // Additional comment actions
    Route::post('comments/{comment}/approve', [App\Http\Controllers\Admin\CommentController::class, 'approve'])
        ->name('admin.comments.approve');
    Route::post('comments/{comment}/spam', [App\Http\Controllers\Admin\CommentController::class, 'markAsSpam'])
        ->name('admin.comments.spam');
    Route::post('comments/bulk-approve', [App\Http\Controllers\Admin\CommentController::class, 'bulkApprove'])
        ->name('admin.comments.bulk-approve');
    Route::delete('comments/bulk-delete', [App\Http\Controllers\Admin\CommentController::class, 'bulkDelete'])
        ->name('admin.comments.bulk-delete');
    Route::post('comments/bulk-spam', [App\Http\Controllers\Admin\CommentController::class, 'bulkMarkAsSpam'])
        ->name('admin.comments.bulk-spam');
    
    // Comment Management (new routes for likes/dislikes and reports)
    Route::get('comment-management', [App\Http\Controllers\Admin\CommentManagementController::class, 'index'])
        ->name('admin.comment-management.index');
    Route::get('comment-reports', [App\Http\Controllers\Admin\CommentManagementController::class, 'reports'])
        ->name('admin.comment-reports.index');
    Route::post('comments/{comment}/status', [App\Http\Controllers\Admin\CommentManagementController::class, 'updateStatus'])
        ->name('admin.comments.update-status');
    Route::post('comment-reports/{report}/resolve', [App\Http\Controllers\Admin\CommentManagementController::class, 'resolveReport'])
        ->name('admin.comment-reports.resolve');
    Route::get('comment-statistics', [App\Http\Controllers\Admin\CommentManagementController::class, 'statistics'])
        ->name('admin.comment-statistics');
    
    // Bulk comment actions for improved moderation
    Route::post('comment-management/bulk-approve', [App\Http\Controllers\Admin\CommentManagementController::class, 'bulkApprove'])
        ->name('admin.comment-management.bulk-approve');
    Route::post('comment-management/bulk-reject', [App\Http\Controllers\Admin\CommentManagementController::class, 'bulkReject'])
        ->name('admin.comment-management.bulk-reject');
    Route::delete('comment-management/bulk-delete', [App\Http\Controllers\Admin\CommentManagementController::class, 'bulkDelete'])
        ->name('admin.comment-management.bulk-delete');
    Route::post('comments/{comment}/spam', [App\Http\Controllers\Admin\CommentManagementController::class, 'markAsSpam'])
        ->name('admin.comment-management.spam');
    Route::get('comment-management/pending', [App\Http\Controllers\Admin\CommentManagementController::class, 'getPendingComments'])
        ->name('admin.comment-management.pending');
    
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
    
    // Settings Management (TODO: Create SettingController)
    /*
    Route::get('/settings', [App\Http\Controllers\Admin\SettingController::class, 'index'])
        ->name('admin.settings.index');
    Route::post('/settings', [App\Http\Controllers\Admin\SettingController::class, 'update'])
        ->name('admin.settings.update');
    */
    
    // Media Management (TODO: Create MediaController)
    /*
    Route::post('/media/upload', [App\Http\Controllers\Admin\MediaController::class, 'upload'])
        ->name('admin.media.upload');
    Route::delete('/media/{id}', [App\Http\Controllers\Admin\MediaController::class, 'destroy'])
        ->name('admin.media.destroy');
    */
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
    
    // System Settings (TODO: Create SystemController)
    /*
    Route::get('/system', [App\Http\Controllers\Admin\SystemController::class, 'index'])
        ->name('admin.system.index');
    Route::post('/system/cache-clear', [App\Http\Controllers\Admin\SystemController::class, 'clearCache'])
        ->name('admin.system.cache-clear');
    */
});