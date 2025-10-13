<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to check if user is blocked by ML system
 */
class CheckMLBlocked
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user && $user->isMLBlocked()) {
            Auth::logout();

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Your account has been temporarily blocked due to suspicious activity. Please contact support.',
                    'error_code' => 'ML_BLOCKED',
                    'block_info' => $user->getMLBlockInfo()
                ], 403);
            }

            return redirect()->route('login')
                ->with('error', 'Your account has been temporarily blocked due to suspicious activity. Please contact support.');
        }

        return $next($request);
    }
}

