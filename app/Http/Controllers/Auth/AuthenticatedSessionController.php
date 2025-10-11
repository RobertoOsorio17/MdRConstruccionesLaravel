<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
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
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        Log::info('Login page accessed', [
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'session_id' => session()->getId(),
            'timestamp' => now()->toISOString()
        ]);

        return Inertia::render('Auth/LoginMUI', [
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
            'email_hash' => hash('sha256', $request->email), // Hash instead of plain email
            'ip' => $request->ip(),
            'user_agent' => substr($request->userAgent(), 0, 100), // Limit length
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
                    'user_email' => $user->email,
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

            // Check if user has 2FA enabled
            if ($user->two_factor_secret && $user->two_factor_confirmed_at) {

                // Check for trusted device FIRST
                $trustedDeviceToken = $request->cookie('trusted_device_token');

                if ($trustedDeviceToken) {
                    $tokenHash = \App\Models\TrustedDevice::hashToken($trustedDeviceToken);

                    $trustedDevice = $user->trustedDevices()
                        ->where('token_hash', $tokenHash)
                        ->valid()
                        ->first();

                    if ($trustedDevice) {
                        // Update last used
                        $trustedDevice->updateLastUsed();

                        Log::info('Login via trusted device - skipping 2FA', [
                            'user_id' => $user->id,
                            'device_id' => $trustedDevice->id,
                            'ip' => $request->ip(),
                            'timestamp' => now()->toISOString()
                        ]);

                        // Skip 2FA challenge - allow direct login
                        Auth::login($user, $request->boolean('remember'));

                        $user->forceFill([
                            'last_login_at' => now(),
                            'last_login_ip' => $request->ip()
                        ])->save();

                        $request->session()->regenerate();

                        $intended = $user->hasPermission('dashboard.access')
                            ? route('dashboard', absolute: false)
                            : route('user.dashboard', absolute: false);

                        return redirect()->intended($intended);
                    }
                }

                // No trusted device found - require 2FA
                Log::info('User has 2FA enabled, requiring 2FA verification', [
                    'user_id' => $user->id,
                    'timestamp' => now()->toISOString()
                ]);

                // Store intended URL before 2FA challenge
                session()->put('url.intended', $user->hasPermission('dashboard.access')
                    ? route('dashboard', absolute: false)
                    : route('user.dashboard', absolute: false));

                // Store user ID and credentials hash for 2FA verification
                // DO NOT authenticate the user yet!
                session()->put('2fa_required', true);
                session()->put('login.id', $user->id);
                session()->put('login.remember', $request->boolean('remember'));
                session()->put('login.password_hash', $user->password); // Verify password hasn't changed
                session()->put('login.attempt_time', now()->timestamp); // Expire after 5 minutes

                // ✅ FIXED: Don't log email
                Log::info('2FA required - user NOT authenticated yet', [
                    'user_id' => $user->id,
                    'timestamp' => now()->toISOString()
                ]);

                // Throw validation exception to trigger 2FA modal in frontend
                // The frontend checks if errors.requires2FA is truthy
                throw ValidationException::withMessages([
                    'requires2FA' => 'true'
                ]);
            }

            // No 2FA required - authenticate user now
            Auth::login($user, $request->boolean('remember'));

            // Enhanced session security: regenerate session ID and token
            $request->session()->regenerate();
            $request->session()->regenerateToken();

            // Initialize session activity tracking
            session(['last_activity' => time()]);

            // Update last_login_at and IP
            $user->forceFill([
                'last_login_at' => now(),
                'last_login_ip' => $request->ip()
            ])->save();

            // ✅ FIXED: Don't log email
            Log::info('User authenticated successfully (no 2FA)', [
                'user_id' => $user->id,
                'timestamp' => now()->toISOString()
            ]);

            // Redirect based on user permissions
            if ($user && $user->hasPermission('dashboard.access')) {
                return redirect()->intended(route('dashboard', absolute: false));
            } else {
                return redirect()->intended(route('user.dashboard', absolute: false));
            }
            
        } catch (\Exception $e) {
            // ✅ FIXED: Don't log email or session ID
            Log::error('Login failed', [
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
                'user_agent' => substr($request->userAgent(), 0, 100),
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
        $userId = Auth::id();

        // ✅ FIXED: Don't log email or session IDs
        Log::info('Logout initiated', [
            'user_id' => $userId,
            'ip' => $request->ip(),
            'timestamp' => now()->toISOString()
        ]);

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
