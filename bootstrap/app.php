<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\AuthStateMiddleware::class,
            \App\Http\Middleware\Require2FAVerification::class,
        ]);

        // Add security headers to all web requests
        $middleware->web(append: [
            \App\Http\Middleware\SecurityHeadersMiddleware::class,
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
            // Only handle 500 errors for non-debug mode
            if (!config('app.debug') && !$request->expectsJson()) {
                if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
                    return null; // Let other handlers deal with HTTP exceptions
                }

                return app(\App\Http\Controllers\ErrorController::class)->serverError($request, $e);
            }

            return null; // Let default handler deal with it
        });
    })->create();
