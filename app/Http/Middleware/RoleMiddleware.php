<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'No autenticado'], 401);
            }
            return redirect()->route('login');
        }

        $user = $request->user();

        // Get user roles (handle both simple role field and complex roles relationship)
        $userRoles = [];

        // Check simple role field first
        if ($user->role) {
            $userRoles[] = $user->role;
        }

        // Also check roles relationship if it exists
        if ($user->roles && $user->roles->count() > 0) {
            $userRoles = array_merge($userRoles, $user->roles->pluck('name')->toArray());
        }

        $userRoles = array_unique($userRoles);

        // Check if user has any of the required roles
        if (!array_intersect($userRoles, $roles)) {
            \Log::warning('Access denied - insufficient role', [
                'user_id' => $user->id,
                'user_roles' => $userRoles,
                'required_roles' => $roles,
                'url' => $request->fullUrl(),
                'ip' => $request->ip()
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'No tienes permisos para acceder a esta sección',
                    'required_roles' => $roles
                ], 403);
            }

            abort(403, 'No tienes permisos para acceder a esta sección.');
        }

        // Log successful access for audit trail
        \Log::info('Role-based access granted', [
            'user_id' => $user->id,
            'user_roles' => $userRoles,
            'required_roles' => $roles,
            'url' => $request->fullUrl()
        ]);

        return $next($request);
    }
}
