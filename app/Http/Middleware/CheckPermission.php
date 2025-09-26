<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $permission = null): Response
    {
        // Verificar si el usuario está autenticado
        if (!Auth::check()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'No autenticado'], 401);
            }
            return redirect()->route('login');
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Si no se especifica permiso, solo verificar acceso al dashboard
        if (!$permission) {
            if (!$user->hasPermission('dashboard.access')) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Acceso denegado'], 403);
                }
                abort(403, 'No tienes permisos para acceder al panel de administración');
            }
            return $next($request);
        }

        // Verificar permiso específico
        if (!$user->hasPermission($permission)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'No tienes permisos para realizar esta acción',
                    'required_permission' => $permission
                ], 403);
            }
            
            abort(403, 'No tienes permisos para realizar esta acción');
        }

        return $next($request);
    }
}
