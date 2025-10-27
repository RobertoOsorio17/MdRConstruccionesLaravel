<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Auth\Concerns\HandlesTwoFactorLogin;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Governs the lifecycle of user sessions, overseeing login rendering, authentication, and secure logout routines.
 * Integrates logging, policy enforcement, and multi-factor hooks to uphold platform security standards.
 */
class AuthenticatedSessionController extends Controller
{
    use HandlesTwoFactorLogin;

    /**
     * Display the login view.
     */
    public function create(): Response
    {
        Log::info('Login page accessed', [
            'ip' => request()->ip(),
            'user_agent_hash' => hash('sha256', substr(request()->userAgent() ?? 'unknown', 0, 100)),
            'timestamp' => now()->toISOString()
        ]);

        return Inertia::render('Auth/LoginNew', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // ✅ FIXED: Don't log full email, use masked version
        Log::info('Login attempt started', [
            'email_hash' => hash('sha256', strtolower($request->email)),
            'ip' => $request->ip(),
            'user_agent_hash' => hash('sha256', substr($request->userAgent(), 0, 100)),
            'timestamp' => now()->toISOString()
        ]);

        try {
            // Verify credentials WITHOUT authenticating yet
            $credentials = $request->only('email', 'password');

            if (!Auth::validate($credentials)) {
                throw ValidationException::withMessages([
                    'email' => __('auth.failed'),
                ]);
            }

            // Get user without authenticating
            $user = \App\Models\User::where('email', $request->email)->first();
            if ($user->isBanned()) {
                $banStatus = $user->getBanStatus();

                // Log the banned login attempt
                Log::warning('Banned user attempted login', [
                    'user_id' => $user->id,
                    'email_hash' => hash('sha256', strtolower($user->email)),
                    'ban_reason' => $banStatus['reason'],
                    'ban_expires' => $banStatus['expires_at'],
                    'ip' => $request->ip(),
                    'timestamp' => now()->toISOString()
                ]);

                // User is not authenticated yet, so no need to logout
                // Just clear any session data and regenerate token
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                // Redirect back to login with error message
                $errorMessage = 'Tu cuenta ha sido suspendida.';
                if ($banStatus['reason']) {
                    $errorMessage .= ' Motivo: ' . $banStatus['reason'];
                }
                if ($banStatus['expires_at']) {
                    $errorMessage .= ' La suspensión expira el: ' . $banStatus['expires_at'];
                } else {
                    $errorMessage .= ' Esta suspensión es permanente.';
                }

                // Throw validation exception for Inertia
                throw ValidationException::withMessages([
                    'email' => $errorMessage
                ]);
            }

            // ✅ FIXED: Don't log email in success logs
            Log::info('Credentials verified successfully', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
                'timestamp' => now()->toISOString()
            ]);

            // ✅ SECURITY FIX: Regenerate session BEFORE authentication to prevent session fixation
            // This ensures any session ID set by an attacker is replaced with a new one
            $request->session()->regenerate();

            return $this->completeInteractiveLogin(
                $request,
                $user,
                $request->boolean('remember')
            );

        } catch (\Exception $e) {
            // ✅ FIXED: Don't log email or session ID
            Log::error('Login failed', [
                'error' => class_basename($e),
                'ip' => $request->ip(),
                'user_agent_hash' => hash('sha256', substr($request->userAgent(), 0, 100)),
                'timestamp' => now()->toISOString()
            ]);

            throw $e;
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $userId = Auth::id();

        // ✅ FIXED: Don't log email or session IDs
        Log::info('Logout initiated', [
            'user_id' => $userId,
            'ip' => $request->ip(),
            'timestamp' => now()->toISOString()
        ]);

        // ✅ SECURITY FIX: Log logout event before logging out
        if ($user) {
            \App\Services\SecurityLogger::logLogout($user, 'user_initiated');
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // ✅ FIXED: Minimal logging
        Log::info('Logout completed', [
            'former_user_id' => $userId,
            'ip' => $request->ip(),
            'timestamp' => now()->toISOString()
        ]);

        return redirect('/');
    }
}
