<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply enhanced auth middleware logic.
 */
class EnhancedAuthMiddleware
{
    /**
     * Routes that banned users should be able to access.
     *
     * @var array
     */
    protected $exceptRoutes = [
        'ban-appeal.create',
        'ban-appeal.store',
        'ban-appeal.status',
        'logout',
    ];

    /**
     * URL patterns that should be excluded from ban checks.
     *
     * @var array
     */
    protected $exceptPatterns = [
        'ban-appeal/*',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // ✅ SECURITY: Skip ban check for ban appeal routes (even without auth)
        foreach ($this->exceptPatterns as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        // Check authentication and ban status
        if (Auth::check()) {
            try {
                $user = Auth::user();

                // Check if user is banned
                if ($user->isBanned()) {
                    // ✅ SECURITY: Allow banned users to access ban appeal routes
                    $currentRoute = $request->route()?->getName();
                    if ($currentRoute && in_array($currentRoute, $this->exceptRoutes)) {
                        // Allow access to ban appeal routes
                        return $next($request);
                    }

                    $banStatus = $user->getBanStatus();

                    // Log out the banned user
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    // Redirect to login with error message
                    $errorMessage = 'Tu cuenta ha sido suspendida y no puedes acceder.';
                    if ($banStatus['reason']) {
                        $errorMessage .= ' Motivo: ' . $banStatus['reason'];
                    }
                    if ($banStatus['expires_at']) {
                        $errorMessage .= ' La suspensión expira el: ' . $banStatus['expires_at'];
                    } else {
                        $errorMessage .= ' Esta suspensión es permanente.';
                    }

                    return redirect()->route('login')->withErrors([
                        'email' => $errorMessage
                    ]);
                }

                // ⚡ PERFORMANCE: Update last_login_at in cache, sync to DB hourly
                // This reduces DB writes from ~240/hour to ~1/hour per active user
                $cacheKey = "user_last_activity:{$user->id}";
                $lastCachedUpdate = \Cache::get($cacheKey);

                // Update cache every request (cheap operation)
                \Cache::put($cacheKey, now(), now()->addHours(2));

                // Only write to DB every 60 minutes (expensive operation)
                $lastDbUpdate = $user->last_login_at;
                $shouldUpdateDb = !$lastDbUpdate || $lastDbUpdate->diffInMinutes(now()) >= 60;

                if ($shouldUpdateDb) {
                    // Use updateQuietly to avoid firing model events
                    $user->updateQuietly(['last_login_at' => now()]);
                }
            } catch (\Exception $e) {
                // Silence errors to not affect navigation
                Log::warning('Error in EnhancedAuthMiddleware: ' . $e->getMessage());
            }
        }

        return $next($request);
    }
}