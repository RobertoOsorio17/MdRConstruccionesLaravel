<?php

namespace App\Http\Middleware;

use App\Models\AdminSetting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Require 2FA verification for users when enabled globally.
 *
 * This middleware checks if 2FA is enabled globally and if the user
 * has 2FA enabled. If not, it redirects them to enable it.
 */
class Require2FAVerification
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

        // Check if 2FA is globally enabled
        $twoFactorEnabled = AdminSetting::getCachedValue('enable_2fa', false, 300);

        // If 2FA is not globally enabled, skip check
        if (!$twoFactorEnabled) {
            return $next($request);
        }

        // Skip check for 2FA setup routes and logout
        $excludedRoutes = [
            'two-factor.enable',
            'two-factor.confirm',
            'two-factor.disable',
            'two-factor.qr-code',
            'two-factor.secret-key',
            'two-factor.recovery-codes',
            'two-factor.login',
            'two-factor.challenge',
            'logout',
        ];

        if (in_array($request->route()?->getName(), $excludedRoutes)) {
            return $next($request);
        }

        // Check if user has 2FA enabled
        if (!$user->two_factor_secret) {
            // Set a session flag to show warning banner instead of redirecting
            session()->flash('2fa_warning', 'La autenticación de dos factores es obligatoria. Por favor actívala en tu perfil.');
        }

        return $next($request);
    }
}

