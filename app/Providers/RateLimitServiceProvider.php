<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

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

        // ✅ Post interactions (likes, bookmarks)
        RateLimiter::for('post-interactions', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });
    }
}

