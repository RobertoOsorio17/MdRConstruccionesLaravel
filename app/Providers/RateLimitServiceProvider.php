<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

/**
 * Registers named rate limiters that throttle critical application endpoints.
 * Centralizes configuration so comment, admin, and authentication limits remain consistent.
 */
class RateLimitServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        // ✅ Comments for authenticated users
        RateLimiter::for('comments-auth', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Too many comments. Please wait before posting again.',
                        'error' => 'RATE_LIMIT_EXCEEDED'
                    ], 429, $headers);
                });
        });

        // ✅ Comments for guest users
        RateLimiter::for('comments-guest', function (Request $request) {
            return Limit::perMinute(3)
                ->by($request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Too many comments from this location. Please wait or sign in to continue.',
                        'error' => 'RATE_LIMIT_EXCEEDED'
                    ], 429, $headers);
                });
        });

        // ✅ Admin actions
        RateLimiter::for('admin-actions', function (Request $request) {
            return Limit::perMinute(60)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Too many admin actions. Please slow down.',
                        'error' => 'RATE_LIMIT_EXCEEDED'
                    ], 429, $headers);
                });
        });

        // ✅ Bulk operations
        RateLimiter::for('bulk-operations', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Too many bulk operations. Please wait before trying again.',
                        'error' => 'RATE_LIMIT_EXCEEDED'
                    ], 429, $headers);
                });
        });

        // ✅ API rate limiting
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // ✅ Login attempts
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // ✅ Registration attempts
        RateLimiter::for('register', function (Request $request) {
            return Limit::perHour(3)->by($request->ip());
        });

        // ✅ Password reset attempts
        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perHour(5)->by($request->ip());
        });

        // ✅ Email verification resend
        RateLimiter::for('email-verification', function (Request $request) {
            return Limit::perHour(3)->by($request->user()?->id ?: $request->ip());
        });

        // ✅ Comment reports
        RateLimiter::for('comment-reports', function (Request $request) {
            return Limit::perHour(10)->by($request->user()?->id ?: $request->ip());
        });

        // ✅ Admin comment restore operations
        RateLimiter::for('admin-restore', function (Request $request) {
            return Limit::perMinute(20)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Demasiadas operaciones de restauración. Espere antes de continuar.',
                        'error' => 'RATE_LIMIT_EXCEEDED'
                    ], 429, $headers);
                });
        });

        // ✅ Post interactions (likes, bookmarks)
        RateLimiter::for('post-interactions', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });

        // ✅ Admin heartbeat (inactivity detection)
        RateLimiter::for('admin-heartbeat', function (Request $request) {
            return Limit::perMinute(40)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Demasiados heartbeats. Posible intento de abuso.',
                        'error' => 'RATE_LIMIT_EXCEEDED',
                        'force_logout' => true
                    ], 429, $headers);
                });
        });

        // ✅ User impersonation (critical security feature)
        RateLimiter::for('impersonation', function (Request $request) {
            return Limit::perMinute(3)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Too many impersonation attempts. Please wait before trying again.',
                        'error' => 'RATE_LIMIT_EXCEEDED'
                    ], 429, $headers);
                });
        });

        // ✅ Ban appeals (prevent abuse of appeal system)
        RateLimiter::for('ban-appeals', function (Request $request) {
            return Limit::perHour(3)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Demasiados intentos de apelación. Solo puedes enviar 3 apelaciones por hora.',
                        'error' => 'RATE_LIMIT_EXCEEDED'
                    ], 429, $headers);
                });
        });
    }
}

