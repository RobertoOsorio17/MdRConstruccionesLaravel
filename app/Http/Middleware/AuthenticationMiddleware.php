<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnhancedAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Actualizar último acceso si el usuario está autenticado
        if (Auth::check()) {
            try {
                $user = Auth::user();
                
                // Actualizar last_login_at cada 15 minutos para no sobrecargar la DB
                $lastUpdate = $user->last_login_at;
                $shouldUpdate = !$lastUpdate || $lastUpdate->diffInMinutes(now()) >= 15;
                
                if ($shouldUpdate) {
                    $user->forceFill(['last_login_at' => now()])->save();
                }
            } catch (\Exception $e) {
                // Silenciar errores para no afectar la navegación
                \Log::warning('Error updating user last_login_at: ' . $e->getMessage());
            }
        }

        return $next($request);
    }
}

class AuthStateMiddleware
{
    /**
     * Handle an incoming request.
     * 
     * Este middleware agrega información del estado de autenticación 
     * a todas las respuestas de Inertia para uso del frontend
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Solo para respuestas de Inertia
        if ($request->inertia()) {
            $user = Auth::user();
            
            // Datos básicos del usuario
            $authData = [
                'isAuthenticated' => Auth::check(),
                'isGuest' => Auth::guest(),
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'avatar_url' => $user->avatar_url ?? null,
                    'role' => $user->role,
                    'bio' => $user->bio,
                    'profession' => $user->profession,
                    'profile_visibility' => $user->profile_visibility,
                    'initials' => $user->initials ?? null,
                    'profile_completeness' => $user->profile_completeness ?? 0,
                    'email_verified_at' => $user->email_verified_at,
                    'is_email_verified' => !is_null($user->email_verified_at),
                ] : null
            ];

            // Agregar estadísticas si el usuario está autenticado
            if ($user) {
                $authData['user']['stats'] = [
                    'comments_count' => method_exists($user, 'comments') ? $user->comments()->count() : 0,
                    'saved_posts_count' => method_exists($user, 'savedPosts') ? $user->savedPosts()->count() : 0,
                    'following_count' => method_exists($user, 'following') ? $user->following()->count() : 0,
                    'followers_count' => method_exists($user, 'followers') ? $user->followers()->count() : 0,
                ];

                // Agregar permisos para usuarios con roles
                if (method_exists($user, 'roles') && $user->roles()->exists()) {
                    $authData['user']['permissions'] = $user->roles()
                        ->with('permissions')
                        ->get()
                        ->flatMap(function ($role) {
                            return $role->permissions->pluck('name');
                        })
                        ->unique()
                        ->values()
                        ->toArray();
                }
            }

            // Compartir con Inertia
            inertia()->share('auth', $authData);
        }

        return $response;
    }
}

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
            $lastActivity = session('last_activity');
            $timeout = config('session.lifetime') * 60; // Convertir minutos a segundos
            
            if ($lastActivity && (time() - $lastActivity) > $timeout) {
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
            session(['last_activity' => time()]);
        }

        return $next($request);
    }
}