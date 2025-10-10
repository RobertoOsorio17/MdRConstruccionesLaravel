<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply role middleware logic.
 */
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

        // Use the User model's hasAnyRole method for consistent role checking
        // This method properly handles both the role field and roles relationship
        $hasRequiredRole = false;

        // Check each required role using the model's secure method
        foreach ($roles as $role) {
            if ($user->hasRole($role)) {
                $hasRequiredRole = true;
                break;
            }
        }

        if (!$hasRequiredRole) {
            // Get user roles for logging (using secure method)
            $userRoles = $this->getUserRoles($user);

            Log::warning('Access denied - insufficient role', [
                'user_id' => $user->id,
                'user_roles' => $userRoles,
                'required_roles' => $roles,
                'url' => $request->fullUrl(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'timestamp' => now()->toISOString()
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
        Log::info('Role-based access granted', [
            'user_id' => $user->id,
            'user_roles' => $this->getUserRoles($user),
            'required_roles' => $roles,
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'timestamp' => now()->toISOString()
        ]);

        return $next($request);
    }

    /**
     * Get user roles in a secure, consistent manner
     * Prioritizes roles relationship over simple role field
     */
    private function getUserRoles($user): array
    {
        $userRoles = [];

        // First priority: roles relationship (more secure and flexible)
        if (method_exists($user, 'roles') && $user->roles()->exists()) {
            $userRoles = $user->roles->pluck('name')->toArray();
        }

        // Fallback: simple role field (only if no roles relationship exists)
        if (empty($userRoles) && !empty($user->role)) {
            $userRoles = [$user->role];
        }

        return array_unique($userRoles);
    }
}
