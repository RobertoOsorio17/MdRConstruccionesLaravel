<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply admin middleware logic.
 */
class AdminOnly
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para realizar esta acciÃƒÆ’Ã‚Â³n.'
                ], 403);
            }
            
            return redirect()->route('login')->with('error', 'Debes iniciar sesiÃƒÆ’Ã‚Â³n para acceder a esta pÃƒÆ’Ã‚Â¡gina.');
        }

        $user = Auth::user();

        // Check if user has admin role
        if (!$user->hasRole('admin')) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos de administrador para realizar esta acciÃƒÆ’Ã‚Â³n.'
                ], 403);
            }
            
            return redirect()->route('home')->with('error', 'No tienes permisos de administrador.');
        }

        return $next($request);
    }
}
