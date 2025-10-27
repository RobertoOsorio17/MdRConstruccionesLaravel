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
            $sessionStart = session('session_start');
            $currentTime = time();

            // ✅ FIXED: Initialize session start time if not set
            if (!$sessionStart) {
                session(['session_start' => $currentTime]);
                $sessionStart = $currentTime;
            }

            // Get role-based timeout (admin users get shorter timeout for security).
            $timeout = $this->getRoleBasedTimeout($user);

            $timeSinceActivity = $lastActivity ? ($currentTime - $lastActivity) : 0;
            $totalSessionTime = $currentTime - $sessionStart;

            // ✅ FIXED: Absolute session timeout (max 8 hours for regular users, 4 hours for admins)
            $absoluteTimeout = $this->getAbsoluteTimeout($user);

            Log::debug('Session timeout check', [
                'user_id' => $userId,
                'user_roles' => $this->getUserRoles($user),
                'idle_timeout_minutes' => $timeout / 60,
                'absolute_timeout_minutes' => $absoluteTimeout / 60,
                'last_activity' => $lastActivity ? date('Y-m-d H:i:s', $lastActivity) : 'never',
                'session_start' => date('Y-m-d H:i:s', $sessionStart),
                'current_time' => date('Y-m-d H:i:s', $currentTime),
                'time_since_activity_minutes' => round($timeSinceActivity / 60, 2),
                'total_session_minutes' => round($totalSessionTime / 60, 2),
                'will_timeout_idle' => $lastActivity && $timeSinceActivity > $timeout,
                'will_timeout_absolute' => $totalSessionTime > $absoluteTimeout,
                'route' => $request->route()?->getName(),
                'url' => $request->url()
            ]);

            // ✅ FIXED: Check both idle timeout AND absolute timeout
            $idleExpired = $lastActivity && $timeSinceActivity > $timeout;
            $absoluteExpired = $totalSessionTime > $absoluteTimeout;

            if ($idleExpired || $absoluteExpired) {
                $reason = $idleExpired ? 'inactivity' : 'maximum session duration reached';

                Log::warning('Session timeout triggered - forcing logout', [
                    'user_id' => $userId,
                    'user_roles' => $this->getUserRoles($user),
                    'reason' => $reason,
                    'idle_timeout_minutes' => $timeout / 60,
                    'absolute_timeout_minutes' => $absoluteTimeout / 60,
                    'last_activity' => date('Y-m-d H:i:s', $lastActivity),
                    'session_start' => date('Y-m-d H:i:s', $sessionStart),
                    'time_since_activity_minutes' => round($timeSinceActivity / 60, 2),
                    'total_session_minutes' => round($totalSessionTime / 60, 2),
                    'ip' => $request->ip(),
                    'user_agent' => substr($request->userAgent(), 0, 100),
                    'route' => $request->route()?->getName(),
                    'timestamp' => now()->toISOString()
                ]);

                Auth::logout();
                session()->invalidate();
                session()->regenerateToken();

                $message = $absoluteExpired
                    ? 'Your session expired after reaching the maximum duration. Please log in again for security.'
                    : 'Your session expired due to inactivity. Please log in again.';

                if ($request->expectsJson()) {
                    return response()->json([
                        'error' => 'Session expired.',
                        'message' => $message,
                        'reason' => $reason,
                        'timeout_minutes' => $timeout / 60
                    ], 401);
                }

                return redirect()->route('login')
                    ->with('warning', $message);
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
     * ✅ SECURITY FIX: Stricter timeouts following industry best practices
     */
    private function getRoleBasedTimeout($user): int
    {
        // ✅ SECURITY FIX: Admin and editor roles get 15 minutes timeout (was 20)
        // Industry standard: 15-30 minutes for privileged accounts
        if ($user->hasRole('admin') || $user->hasRole('editor')) {
            return 15 * 60; // 15 minutes for admin/editor users
        }

        // ✅ SECURITY FIX: Regular users get 60 minutes timeout (was 120)
        // Industry standard: 30-60 minutes for regular users
        $sessionTimeoutMinutes = AdminSetting::getCachedValue('session_timeout', 60, 300);
        $maxTimeout = 60; // Maximum 60 minutes for regular users
        $actualTimeout = min($sessionTimeoutMinutes, $maxTimeout);

        return $actualTimeout * 60; // Convert minutes to seconds
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

    /**
     * Get absolute session timeout (maximum session duration regardless of activity)
     *
     * ✅ SECURITY FIX: Stricter absolute timeouts to prevent session hijacking
     *
     * @param $user
     * @return int Timeout in seconds
     */
    private function getAbsoluteTimeout($user): int
    {
        // ✅ SECURITY FIX: Admin and editor roles get 2 hours absolute timeout (was 4)
        // Even with activity, admin sessions should not last more than 2 hours
        if ($user->hasRole('admin') || $user->hasRole('editor')) {
            return 2 * 3600; // 2 hours maximum
        }

        // ✅ SECURITY FIX: Regular users get 4 hours maximum session duration (was 8)
        // Reduces window for session hijacking attacks
        return 4 * 3600; // 4 hours maximum
    }
}
