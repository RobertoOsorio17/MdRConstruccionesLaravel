<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply ensure two factor middleware logic.
 */
class EnsureTwoFactorChallenge
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only apply to 2FA challenge routes
        if (!$request->routeIs('two-factor.login') && !$request->routeIs('two-factor.verify')) {
            return $next($request);
        }

        // Verify session has required data
        if (!session()->has('login.id')) {
            return redirect()->route('login')->withErrors([
                'email' => 'Session expired. Please login again.'
            ]);
        }

        if (!session()->has('login.challenge_signature')
            && !session()->has('login.password_signature')
            && !session()->has('login.password_hash')) {
            session()->forget([
                'login.id',
                'login.remember',
                'login.challenge_nonce',
                'login.challenge_signature',
                'login.password_signature',
                'login.password_hash',
                'login.attempt_time'
            ]);

            return redirect()->route('login')->withErrors([
                'email' => 'Session expired. Please login again.'
            ]);
        }

        // Check if 2FA attempt has expired (5 minutes)
        $attemptTime = session('login.attempt_time');
        if ($attemptTime && (now()->timestamp - $attemptTime) > 300) {
            session()->forget([
                'login.id',
                'login.remember',
                'login.challenge_nonce',
                'login.challenge_signature',
                'login.password_signature',
                'login.password_hash',
                'login.attempt_time'
            ]);
            return redirect()->route('login')->withErrors([
                'email' => '2FA challenge expired. Please login again.'
            ]);
        }

        // Verify user exists
        $userId = session('login.id');
        $user = \App\Models\User::find($userId);
        
        if (!$user) {
            session()->forget([
                'login.id',
                'login.remember',
                'login.challenge_nonce',
                'login.challenge_signature',
                'login.password_signature',
                'login.password_hash',
                'login.attempt_time'
            ]);
            return redirect()->route('login')->withErrors([
                'email' => 'User not found. Please login again.'
            ]);
        }

        // Verify 2FA is still enabled
        if (!$user->two_factor_secret || !$user->two_factor_confirmed_at) {
            session()->forget([
                'login.id',
                'login.remember',
                'login.challenge_nonce',
                'login.challenge_signature',
                'login.password_signature',
                'login.password_hash',
                'login.attempt_time'
            ]);
            return redirect()->route('login')->withErrors([
                'email' => '2FA is not enabled for this account.'
            ]);
        }

        return $next($request);
    }
}

