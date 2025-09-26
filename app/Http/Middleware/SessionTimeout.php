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
            $userId = Auth::id();
            $lastActivity = session('last_activity');
            $currentTime = time();
            $timeout = config('session.lifetime') * 60; // Convertir minutos a segundos
            
            // Solo aplicar timeout si han pasado más de 6 horas (360 minutos)
            $extendedTimeout = 360 * 60; // 6 horas en segundos
            
            $timeSinceActivity = $lastActivity ? ($currentTime - $lastActivity) : 0;
            
            Log::debug('Session timeout check', [
                'user_id' => $userId,
                'last_activity' => $lastActivity ? date('Y-m-d H:i:s', $lastActivity) : 'nunca',
                'current_time' => date('Y-m-d H:i:s', $currentTime),
                'time_since_activity_minutes' => round($timeSinceActivity / 60, 2),
                'extended_timeout_minutes' => $extendedTimeout / 60,
                'will_timeout' => $lastActivity && $timeSinceActivity > $extendedTimeout,
                'route' => $request->route()?->getName(),
                'url' => $request->url(),
                'session_id' => session()->getId()
            ]);
            
            if ($lastActivity && $timeSinceActivity > $extendedTimeout) {
                Log::warning('Session timeout triggered - forcing logout', [
                    'user_id' => $userId,
                    'user_email' => Auth::user()->email,
                    'last_activity' => date('Y-m-d H:i:s', $lastActivity),
                    'time_since_activity_hours' => round($timeSinceActivity / 3600, 2),
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'route' => $request->route()?->getName(),
                    'session_id' => session()->getId()
                ]);
                
                Auth::logout();
                session()->invalidate();
                session()->regenerateToken();
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'error' => 'Sesión expirada',
                        'message' => 'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.'
                    ], 401);
                }
                
                return redirect()->route('login')
                    ->with('warning', 'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.');
            }
            
            // Actualizar tiempo de última actividad
            session(['last_activity' => $currentTime]);
            
            // Log cada 30 minutos para monitoreo
            if (!$lastActivity || $timeSinceActivity > 1800) { // 30 minutos
                Log::info('Session activity update', [
                    'user_id' => $userId,
                    'route' => $request->route()?->getName(),
                    'last_activity_updated' => date('Y-m-d H:i:s', $currentTime),
                    'session_id' => session()->getId()
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
}