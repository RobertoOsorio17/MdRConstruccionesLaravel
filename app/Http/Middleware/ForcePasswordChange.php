<?php

namespace App\Http\Middleware;

use App\Models\AdminSetting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Force users to change their password after a certain number of days.
 * 
 * This middleware checks if the user's password is older than the configured
 * require_password_change setting (in days) and redirects them to change it.
 */
class ForcePasswordChange
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return $next($request);
        }

        // Get password change requirement in days (0 = disabled)
        $requirePasswordChangeDays = AdminSetting::getCachedValue('require_password_change', 0, 300);

        // If disabled (0), skip check
        if ($requirePasswordChangeDays == 0) {
            return $next($request);
        }

        // Skip check if user is on password change routes
        $passwordChangeRoutes = [
            'password.update',
            'password.confirm',
            'user-password.update',
            'logout',
        ];

        if (in_array($request->route()?->getName(), $passwordChangeRoutes)) {
            return $next($request);
        }

        // Check if password_changed_at exists and is older than required days
        $passwordChangedAt = $user->password_changed_at;

        if (!$passwordChangedAt) {
            // If no password_changed_at, set it to now and continue
            $user->update(['password_changed_at' => now()]);
            return $next($request);
        }

        $daysSinceChange = now()->diffInDays($passwordChangedAt);

        if ($daysSinceChange >= $requirePasswordChangeDays) {
            // Password is too old, force change
            return redirect()->route('user.dashboard')
                ->with('warning', "Tu contraseña tiene más de {$requirePasswordChangeDays} días. Por favor cámbiala por seguridad.");
        }

        return $next($request);
    }
}

