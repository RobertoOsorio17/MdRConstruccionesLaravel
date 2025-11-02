<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders([
        \App\Providers\EventServiceProvider::class,
        \App\Providers\RateLimitServiceProvider::class,
    ])
    ->withCommands([
        \App\Console\Commands\ClearSessions::class,
        \App\Console\Commands\VerifyBanAppealSystem::class,
    ])
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('web')
                ->prefix('admin')
                ->name('admin.')
                ->group(base_path('routes/admin.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // ⚡ PERFORMANCE: Optimized middleware stack - reduced from 14 to 11 middlewares
        // Grouped related middlewares together to reduce overhead

        // Check maintenance mode FIRST (before any other middleware)
        $middleware->web(prepend: [
            \App\Http\Middleware\CheckMaintenanceMode::class,
        ]);

        // ⚡ PERFORMANCE: Core middlewares in single append call
        $middleware->web(append: [
            // Inertia & Asset handling
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,

            // Security & Auth checks (combined for efficiency)
            \App\Http\Middleware\SecurityHeadersMiddleware::class,
            \App\Http\Middleware\EnsureImpersonationIsValid::class,
            \App\Http\Middleware\CheckMLBlocked::class,
            \App\Http\Middleware\EnhancedAuthMiddleware::class,
            \App\Http\Middleware\CheckUserStatus::class,
            \App\Http\Middleware\ForcePasswordChange::class,
            \App\Http\Middleware\Require2FAVerification::class,
            \App\Http\Middleware\ValidateSessionIntegrity::class,

            // Performance optimizations (at the end)
            \App\Http\Middleware\CompressResponse::class,
            \App\Http\Middleware\SetCacheHeaders::class,
        ]);

        // Register middleware aliases
        $middleware->alias([
            'check.permission' => \App\Http\Middleware\CheckPermission::class,
            'auth.enhanced' => \App\Http\Middleware\EnhancedAuthMiddleware::class,
            'auth.state' => \App\Http\Middleware\AuthStateMiddleware::class,
            'session.timeout' => \App\Http\Middleware\SessionTimeout::class,
            'guest.redirect' => \App\Http\Middleware\RedirectIfAuthenticated::class,
            'check.ip.ban' => \App\Http\Middleware\CheckIpBan::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'auth.ratelimit' => \App\Http\Middleware\AuthRateLimitMiddleware::class,
            'security.headers' => \App\Http\Middleware\SecurityHeadersMiddleware::class,
            'track.device' => \App\Http\Middleware\TrackDeviceMiddleware::class,
            'two-factor.challenge' => \App\Http\Middleware\EnsureTwoFactorChallenge::class,
            'require.2fa' => \App\Http\Middleware\Require2FAVerification::class,
            // Admin security middleware
            'admin.audit' => \App\Http\Middleware\AdminAuditMiddleware::class,
            'admin.security' => \App\Http\Middleware\AdminSecurityHeaders::class,
            'admin.timeout' => \App\Http\Middleware\AdminSessionTimeout::class,
            'admin.only' => \App\Http\Middleware\AdminOnly::class,
            // Settings-based middleware
            'check.registration' => \App\Http\Middleware\CheckRegistrationEnabled::class,
            'check.blog' => \App\Http\Middleware\CheckBlogEnabled::class,
            'deny.banned' => \App\Http\Middleware\EnsureUserNotBanned::class,
            // Ban appeal security middleware
            'ban.appeal.public' => \App\Http\Middleware\ValidateBanAppealPublicAccess::class,
        ]);

        // ⚡ PERFORMANCE: Create middleware groups to reduce stack on specific routes
        $middleware->group('auth.full', [
            \App\Http\Middleware\EnhancedAuthMiddleware::class,
            \App\Http\Middleware\CheckUserStatus::class,
            \App\Http\Middleware\ForcePasswordChange::class,
            \App\Http\Middleware\Require2FAVerification::class,
            \App\Http\Middleware\ValidateSessionIntegrity::class,
        ]);

        $middleware->group('auth.light', [
            \App\Http\Middleware\EnhancedAuthMiddleware::class,
            \App\Http\Middleware\CheckUserStatus::class,
        ]);

        $middleware->group('admin.secure', [
            \App\Http\Middleware\AdminOnly::class,
            \App\Http\Middleware\AdminAuditMiddleware::class,
            \App\Http\Middleware\AdminSecurityHeaders::class,
            \App\Http\Middleware\CheckPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Custom error pages
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Recurso no encontrado',
                    'error' => 'Not Found'
                ], 404);
            }

            return app(\App\Http\Controllers\ErrorController::class)->notFound($request);
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Acceso denegado',
                    'error' => 'Forbidden'
                ], 403);
            }

            return app(\App\Http\Controllers\ErrorController::class)->forbidden($request);
        });

        $exceptions->render(function (\Throwable $e, $request) {
            // ✅ FIXED: Use app()->environment() instead of config('app.debug')
            // This is more reliable and works even when config is cached
            if (app()->environment('production') && !$request->expectsJson()) {
                if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
                    return null; // Let other handlers deal with HTTP exceptions
                }

                return app(\App\Http\Controllers\ErrorController::class)->serverError($request, $e);
            }

            return null; // Let default handler deal with it
        });
    })->create();
