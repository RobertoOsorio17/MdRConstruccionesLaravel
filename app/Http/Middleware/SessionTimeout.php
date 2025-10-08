<?php

namespace App\Http\Middleware;

use App\Models\AdminSetting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply session middleware logic.
 */
class SessionTimeout
{
    /**
     * Handle an incoming request.
     *
     * Manages session timeouts and terminates inactive sessions.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            $userId = $user->id;
            $lastActivity = session('last_activity');
            $currentTime = time();

        // Get role-based timeout (admin users get shorter timeout for security).
            $timeout = $this->getRoleBasedTimeout($user);

            $timeSinceActivity = $lastActivity ? ($currentTime - $lastActivity) : 0;

            Log::debug('Session timeout check', [
                'user_id' => $userId,
                'user_roles' => $this->getUserRoles($user),
                'timeout_minutes' => $timeout / 60,
                'last_activity' => $lastActivity ? date('Y-m-d H:i:s', $lastActivity) : 'never',
                'current_time' => date('Y-m-d H:i:s', $currentTime),
                'time_since_activity_minutes' => round($timeSinceActivity / 60, 2),
                'will_timeout' => $lastActivity && $timeSinceActivity > $timeout,
                'route' => $request->route()?->getName(),
                'url' => $request->url(),
                'session_id' => session()->getId()
            ]);

            if ($lastActivity && $timeSinceActivity > $timeout) {
                Log::warning('Session timeout triggered - forcing logout', [
                    'user_id' => $userId,
                    'user_email' => $user->email,
                    'user_roles' => $this->getUserRoles($user),
                    'timeout_minutes' => $timeout / 60,
                    'last_activity' => date('Y-m-d H:i:s', $lastActivity),
                    'time_since_activity_minutes' => round($timeSinceActivity / 60, 2),
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'route' => $request->route()?->getName(),
                    'session_id' => session()->getId(),
                    'timestamp' => now()->toISOString()
                ]);

                Auth::logout();
                session()->invalidate();
                session()->regenerateToken();

                if ($request->expectsJson()) {
                    return response()->json([
                        'error' => 'Session expired.',
                        'message' => 'Your session expired due to inactivity. Please log in again.',
                        'timeout_minutes' => $timeout / 60
                    ], 401);
                }

                return redirect()->route('login')
                    ->with('warning', 'Your session expired due to inactivity. Please log in again.');
            }

            // Update the last activity timestamp.
            session(['last_activity' => $currentTime]);

            // Log activity updates every 15 minutes for monitoring.
            if (!$lastActivity || $timeSinceActivity > 900) { // 15 minutes
                Log::info('Session activity update', [
                    'user_id' => $userId,
                    'user_roles' => $this->getUserRoles($user),
                    'route' => $request->route()?->getName(),
                    'last_activity_updated' => date('Y-m-d H:i:s', $currentTime),
                    'session_id' => session()->getId(),
                    'timeout_minutes' => $timeout / 60
                ]);
            }
        } else {
            // Unauthenticated userâ€”clear any residual activity markers.
            if (session()->has('last_activity')) {
                Log::debug('Cleaning last_activity for unauthenticated request', [
                    'route' => $request->route()?->getName(),
                    'session_id' => session()->getId()
                ]);
                session()->forget('last_activity');
            }
        }

        return $next($request);
    }

    /**
     * Determine the role-based session timeout in seconds.
     * Admin users get shorter timeout for enhanced security.
     * Uses session_timeout setting from admin settings.
     */
    private function getRoleBasedTimeout($user): int
    {
        // Get session timeout from admin settings (in minutes, default: 120)
        $sessionTimeoutMinutes = AdminSetting::getCachedValue('session_timeout', 120, 300);
        $defaultTimeout = $sessionTimeoutMinutes * 60; // Convert minutes to seconds

        // Admin and editor roles get shorter timeout (20 minutes) for security.
        if ($user->hasRole('admin') || $user->hasRole('editor')) {
            return 20 * 60; // 20 minutes for admin users
        }

        // Regular users use the configured session timeout from settings.
        return $defaultTimeout;
    }

    /**
     * Get user roles for logging purposes.
     */
    private function getUserRoles($user): array
    {
        $userRoles = [];

        // First priority: roles relationship
        if (method_exists($user, 'roles') && $user->roles()->exists()) {
            $userRoles = $user->roles->pluck('name')->toArray();
        }

        // Fallback: simple role field
        if (empty($userRoles) && !empty($user->role)) {
            $userRoles = [$user->role];
        }

        return array_unique($userRoles);
    }
}
