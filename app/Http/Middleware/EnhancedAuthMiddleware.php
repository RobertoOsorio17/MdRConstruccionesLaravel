<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply enhanced auth middleware logic.
 */
class EnhancedAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check authentication and ban status
        if (Auth::check()) {
            try {
                $user = Auth::user();

                // Check if user is banned
                if ($user->isBanned()) {
                    $banStatus = $user->getBanStatus();

                    // Log out the banned user
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    // Redirect to login with error message
                    $errorMessage = 'Tu cuenta ha sido suspendida y no puedes acceder.';
                    if ($banStatus['reason']) {
                        $errorMessage .= ' Motivo: ' . $banStatus['reason'];
                    }
                    if ($banStatus['expires_at']) {
                        $errorMessage .= ' La suspensión expira el: ' . $banStatus['expires_at'];
                    } else {
                        $errorMessage .= ' Esta suspensión es permanente.';
                    }

                    return redirect()->route('login')->withErrors([
                        'email' => $errorMessage
                    ]);
                }

                // Update last_login_at every 15 minutes to avoid DB overload
                $lastUpdate = $user->last_login_at;
                $shouldUpdate = !$lastUpdate || $lastUpdate->diffInMinutes(now()) >= 15;

                if ($shouldUpdate) {
                    $user->forceFill(['last_login_at' => now()])->save();
                }
            } catch (\Exception $e) {
                // Silence errors to not affect navigation
                Log::warning('Error in EnhancedAuthMiddleware: ' . $e->getMessage());
            }
        }

        return $next($request);
    }
}