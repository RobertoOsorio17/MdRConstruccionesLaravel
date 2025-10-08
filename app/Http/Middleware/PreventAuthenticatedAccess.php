<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply prevent authenticated middleware logic.
 */
class PreventAuthenticatedAccess
{
    /**
     * Handle an incoming request.
     * Prevent authenticated users from accessing guest routes.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If user is authenticated, redirect to dashboard
        if (Auth::check()) {
            $user = Auth::user();
            
            if ($user->hasPermission('dashboard.access')) {
                return redirect()->route('dashboard');
            }
            
            return redirect()->route('user.dashboard');
        }

        return $next($request);
    }
}

