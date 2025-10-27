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
            'two-factor.initial-recovery-codes', // ✅ Allow initial recovery codes during setup
            'two-factor.login',
            'two-factor.challenge',
            'logout',
            'profile.settings', // Allow access to settings page to enable 2FA
            'profile.edit', // Legacy profile route
            'profile.update',
            'user-profile-information.update',
            'admin.auth.logout', // Admin logout
            'admin.heartbeat', // Allow heartbeat to keep session alive
            'admin.logout-inactivity', // Allow inactivity logout
            'admin.inactivity-config', // Allow inactivity config access
            'notifications.unread-count', // Allow notification count check
            'notifications.recent', // Allow recent notifications
        ];

        if (in_array($request->route()?->getName(), $excludedRoutes)) {
            return $next($request);
        }

        // Check if user has 2FA enabled and confirmado
        if (!$user->two_factor_secret || !$user->two_factor_confirmed_at) {
            // ✅ SECURITY FIX: Enforce 2FA for admins and editors, warn for regular users
            if ($user->hasRole('admin') || $user->hasRole('editor')) {
                // Set mandatory flag if not already set
                if (!session()->has('2fa_setup_mandatory')) {
                    session()->put('2fa_setup_mandatory', true);
                    session()->put('2fa_setup_user_id', $user->id);
                    session()->put('2fa_setup_timestamp', now()->timestamp);
                }

                // Log security event
                \App\Services\SecurityLogger::logSecurityViolation(
                    '2fa_not_enabled',
                    'Admin/Editor attempted to access system without 2FA enabled',
                    $user,
                    [
                        'route' => $request->route()?->getName(),
                        'url' => $request->fullUrl(),
                        'method' => $request->method(),
                    ]
                );

                // MANDATORY for admins/editors - redirect to profile settings with security tab
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'La autenticación de dos factores es obligatoria para administradores y editores.',
                        'redirect' => route('profile.settings', ['tab' => 'security']),
                        'requires_2fa' => true,
                        'force_2fa_setup' => true
                    ], 403);
                }

                // Don't use flash session - the persistent flag '2fa_setup_mandatory' is enough
                return redirect()->route('profile.settings', ['tab' => 'security'])
                    ->with('error', 'La autenticación de dos factores es obligatoria para administradores y editores.');
            } else {
                // OPTIONAL for regular users - just show warning
                session()->flash('2fa_warning', 'La autenticación de dos factores es recomendada. Por favor actívala en tu perfil para mayor seguridad.');
            }
        } else {
            // User has 2FA enabled - clear mandatory flag if it exists
            if (session()->has('2fa_setup_mandatory')) {
                session()->forget(['2fa_setup_mandatory', '2fa_setup_user_id', '2fa_setup_timestamp']);
            }
        }

        return $next($request);
    }
}

