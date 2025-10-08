<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply redirect if middleware logic.
 */
class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();

                // Determine redirect URL based on user permissions
                $redirectUrl = ($user && $user->hasPermission('dashboard.access'))
                    ? route('dashboard')
                    : route('user.dashboard');

                // Handle Inertia requests
                if ($request->inertia()) {
                    return \Inertia\Inertia::location($redirectUrl);
                }

                // Handle regular requests
                return redirect($redirectUrl);
            }
        }

        return $next($request);
    }
}