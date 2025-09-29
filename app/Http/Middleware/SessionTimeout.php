<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SessionTimeout
{
    /**
     * Handle an incoming request.
     * 
     * Gestiona el timeout de sesión y cierra sesiones inactivas
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            $userId = $user->id;
            $lastActivity = session('last_activity');
            $currentTime = time();

            // Get role-based timeout (admin users get shorter timeout for security)
            $timeout = $this->getRoleBasedTimeout($user);

            $timeSinceActivity = $lastActivity ? ($currentTime - $lastActivity) : 0;

            Log::debug('Session timeout check', [
                'user_id' => $userId,
                'user_roles' => $this->getUserRoles($user),
                'timeout_minutes' => $timeout / 60,
                'last_activity' => $lastActivity ? date('Y-m-d H:i:s', $lastActivity) : 'nunca',
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
                        'error' => 'Sesión expirada',
                        'message' => 'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.',
                        'timeout_minutes' => $timeout / 60
                    ], 401);
                }

                return redirect()->route('login')
                    ->with('warning', 'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.');
            }

            // Actualizar tiempo de última actividad
            session(['last_activity' => $currentTime]);

            // Log cada 15 minutos para monitoreo (reduced from 30 minutes)
            if (!$lastActivity || $timeSinceActivity > 900) { // 15 minutos
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
            // Usuario no autenticado - limpiar cualquier actividad residual
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
     * Get role-based session timeout in seconds
     * Admin users get shorter timeout for enhanced security
     */
    private function getRoleBasedTimeout($user): int
    {
        $defaultTimeout = config('session.lifetime') * 60; // Convert minutes to seconds

        // Admin and editor roles get shorter timeout (20 minutes)
        if ($user->hasRole('admin') || $user->hasRole('editor')) {
            return 20 * 60; // 20 minutes for admin users
        }

        // Regular users use the configured session lifetime
        return $defaultTimeout;
    }

    /**
     * Get user roles for logging purposes
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