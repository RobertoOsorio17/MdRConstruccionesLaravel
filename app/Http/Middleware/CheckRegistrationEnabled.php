<?php

namespace App\Http\Middleware;

use App\Models\AdminSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Check if user registration is enabled.
 * 
 * This middleware blocks access to registration routes when the
 * 'registration_enabled' setting is disabled in admin settings.
 */
class CheckRegistrationEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get registration_enabled setting (default: true)
        $registrationEnabled = AdminSetting::getCachedValue('registration_enabled', true, 300);

        // If registration is disabled, abort with 403
        if (!$registrationEnabled) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'El registro de nuevos usuarios está deshabilitado temporalmente.',
                ], 403);
            }

            abort(403, 'El registro de nuevos usuarios está deshabilitado temporalmente.');
        }

        return $next($request);
    }
}

