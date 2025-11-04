<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enforce session limits and detect remotely terminated sessions
 */
class EnforceSessionLimit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only apply to authenticated users
        if (!Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();
        $currentSessionId = session()->getId();

        // Check if current session still exists in database
        $sessionExists = DB::table('sessions')
            ->where('id', $currentSessionId)
            ->where('user_id', $user->id)
            ->exists();

        if (!$sessionExists) {
            // Session was terminated remotely
            Log::warning('Session terminated remotely', [
                'user_id' => $user->id,
                'email' => $user->email,
                'session_id' => $currentSessionId,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            // Log security event
            \App\Services\SecurityLogger::logSecurityEvent(
                'session_terminated_remotely',
                'User session was terminated because a new session was created',
                $user,
                [
                    'session_id' => hash('sha256', $currentSessionId),
                    'ip' => $request->ip(),
                ]
            );

            // Logout user
            Auth::logout();
            session()->invalidate();
            session()->regenerateToken();

            // Redirect with message
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo.',
                    'reason' => 'new_device_login',
                    'session_terminated' => true
                ], 401);
            }

            return redirect()->route('login')
                ->with('session_terminated', 'new_device_login')
                ->with('error', 'Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo.');
        }

        return $next($request);
    }
}

