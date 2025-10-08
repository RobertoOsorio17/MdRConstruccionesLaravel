<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Check if the authenticated user's account status is active.
 * 
 * This middleware blocks access for users with 'pending', 'suspended', or 'banned' status.
 */
class CheckUserStatus
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

        // Check user status
        $status = $user->status ?? 'active';

        switch ($status) {
            case 'pending':
                Auth::logout();
                return redirect()->route('login')
                    ->withErrors(['email' => 'Tu cuenta está pendiente de aprobación por un administrador.']);

            case 'suspended':
                Auth::logout();
                return redirect()->route('login')
                    ->withErrors(['email' => 'Tu cuenta ha sido suspendida. Contacta al administrador.']);

            case 'banned':
                Auth::logout();
                return redirect()->route('login')
                    ->withErrors(['email' => 'Tu cuenta ha sido bloqueada permanentemente.']);

            case 'active':
            default:
                return $next($request);
        }
    }
}

