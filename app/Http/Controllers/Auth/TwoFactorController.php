<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;

/**
 * Manages two-factor authentication enrollment and recovery workflows for authenticated users.
 * Wraps Fortify actions to expose setup, QR generation, confirmation, and disablement endpoints consistently.
 */
class TwoFactorController extends Controller
{
    /**
     * Show the two factor authentication setup page.
     */
    public function show(Request $request): Response
    {
        $user = $request->user();
        
        return Inertia::render('Auth/TwoFactorSetup', [
            'twoFactorEnabled' => !is_null($user->two_factor_secret),
            'twoFactorConfirmed' => !is_null($user->two_factor_confirmed_at),
        ]);
    }

    /**
     * Enable two factor authentication for the user.
     */
    public function store(Request $request, EnableTwoFactorAuthentication $enable): RedirectResponse
    {
        $enable($request->user());

        return back()->with('status', 'two-factor-authentication-enabled');
    }

    /**
     * Get the two factor authentication QR code.
     */
    public function qrCode(Request $request)
    {
        $user = $request->user();

        if (is_null($user->two_factor_secret)) {
            return response()->json(['error' => 'Two factor authentication is not enabled.'], 400);
        }

        return response()->json([
            'svg' => $user->twoFactorQrCodeSvg(),
            'url' => $user->twoFactorQrCodeUrl(),
        ]);
    }

    /**
     * Get the two factor authentication recovery codes.
     * Requires password verification for security.
     */
    public function recoveryCodes(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'error' => 'La contraseña es incorrecta.'
            ], 422);
        }

        if (is_null($user->two_factor_secret)) {
            return response()->json(['error' => 'Two factor authentication is not enabled.'], 400);
        }

        // ✅ FIXED: Don't log user email in plain text
        \Log::info('Recovery codes accessed', [
            'user_id' => $user->id,
            'email_hash' => hash('sha256', $user->email),
            'ip' => $request->ip(),
            'timestamp' => now()->toISOString()
        ]);

        return response()->json([
            'recoveryCodes' => json_decode(decrypt($user->two_factor_recovery_codes), true),
        ]);
    }

    /**
     * Confirm two factor authentication for the user.
     */
    public function confirm(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (is_null($user->two_factor_secret)) {
            return back()->withErrors(['code' => 'Two factor authentication is not enabled.']);
        }

        // Rate limiting for confirmation attempts
        $key = '2fa-confirm:' . $user->id;
        $attempts = cache()->get($key, 0);

        if ($attempts >= 5) {
            \Log::warning('Too many 2FA confirmation attempts', [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', $user->email),
                'ip' => $request->ip()
            ]);

            return back()->withErrors([
                'code' => 'Too many attempts. Please try again in 1 minute.'
            ]);
        }

        $provider = app(TwoFactorAuthenticationProvider::class);

        try {
            $valid = $provider->verify(decrypt($user->two_factor_secret), $request->code);
        } catch (\Exception $e) {
            \Log::error('2FA confirmation verification error', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return back()->withErrors(['code' => 'Error verifying code.']);
        }

        if (!$valid) {
            cache()->put($key, $attempts + 1, now()->addMinutes(1));

            \Log::warning('Invalid 2FA confirmation code', [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', $user->email),
                'ip' => $request->ip(),
                'attempts' => $attempts + 1
            ]);

            return back()->withErrors(['code' => 'The provided code was invalid.']);
        }

        // Clear rate limit on success
        cache()->forget($key);

        $user->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();

        return back()->with('status', 'two-factor-authentication-confirmed');
    }

    /**
     * Regenerate the two factor authentication recovery codes.
     */
    public function regenerate(Request $request, GenerateNewRecoveryCodes $generate): RedirectResponse
    {
        $generate($request->user());

        return back()->with('status', 'recovery-codes-generated');
    }

    /**
     * Disable two factor authentication for the user.
     */
    public function destroy(Request $request, DisableTwoFactorAuthentication $disable): RedirectResponse
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        // Verify password
        if (!Hash::check($request->password, $request->user()->password)) {
            return back()->withErrors([
                'password' => 'La contraseña es incorrecta.'
            ]);
        }

        $disable($request->user());

        return back()->with('status', 'two-factor-authentication-disabled');
    }

    /**
     * Show the two factor challenge page.
     */
    public function challenge()
    {
        // Verify session has required data
        if (!session()->has('login.id')) {
            return redirect()->route('login')->withErrors([
                'email' => 'Session expired. Please login again.'
            ]);
        }

        // Check if 2FA attempt has expired (5 minutes)
        $attemptTime = session('login.attempt_time');
        if ($attemptTime && (now()->timestamp - $attemptTime) > 300) {
            session()->forget(['login.id', 'login.remember', 'login.password_hash', 'login.attempt_time']);
            return redirect()->route('login')->withErrors([
                'email' => '2FA challenge expired. Please login again.'
            ]);
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    /**
     * Verify the two factor authentication code.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'nullable|string|size:6',
            'recovery_code' => 'nullable|string',
        ]);

        // Check rate limiting (5 attempts per minute)
        $key = 'two-factor-attempts:' . $request->ip();
        $attempts = cache()->get($key, 0);

        if ($attempts >= 5) {
            $retryAfter = 60; // 60 seconds
            $error = ['code' => 'Too many attempts. Please try again in 1 minute.'];

            \Log::warning('2FA rate limit exceeded', [
                'ip' => $request->ip(),
                'attempts' => $attempts,
                'retry_after' => $retryAfter,
                'timestamp' => now()->toISOString()
            ]);

            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'errors' => $error,
                    'rate_limited' => true,
                    'retry_after' => $retryAfter,
                    'attempts' => $attempts,
                    'max_attempts' => 5
                ], 429);
            }
            return back()->withErrors($error);
        }

        $userId = session('login.id');
        $passwordHash = session('login.password_hash');
        $attemptTime = session('login.attempt_time');

        // Verify session data exists
        if (!$userId || !$passwordHash || !$attemptTime) {
            session()->forget(['login.id', 'login.remember', 'login.password_hash', 'login.attempt_time']);
            $error = ['code' => 'Session expired. Please login again.'];
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['errors' => $error, 'session_expired' => true], 422);
            }
            return redirect()->route('login')->withErrors($error);
        }

        // Check if 2FA attempt has expired (5 minutes)
        if ((now()->timestamp - $attemptTime) > 300) {
            session()->forget(['login.id', 'login.remember', 'login.password_hash', 'login.attempt_time']);
            $error = ['code' => '2FA challenge expired. Please login again.'];
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['errors' => $error, 'session_expired' => true], 422);
            }
            return redirect()->route('login')->withErrors($error);
        }

        $user = \App\Models\User::find($userId);
        if (!$user) {
            session()->forget(['login.id', 'login.remember', 'login.password_hash', 'login.attempt_time']);
            $error = ['code' => 'User not found.'];
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['errors' => $error, 'session_expired' => true], 422);
            }
            return redirect()->route('login')->withErrors($error);
        }

        // Verify password hasn't changed during 2FA challenge
        // Use hash_equals to prevent timing attacks
        if (!hash_equals($user->password, $passwordHash)) {
            session()->forget(['login.id', 'login.remember', 'login.password_hash', 'login.attempt_time']);
            $error = ['code' => 'Security error. Please login again.'];
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['errors' => $error, 'session_expired' => true], 422);
            }
            return redirect()->route('login')->withErrors($error);
        }

        // Verify 2FA is still enabled
        if (!$user->two_factor_secret || !$user->two_factor_confirmed_at) {
            session()->forget(['login.id', 'login.remember', 'login.password_hash', 'login.attempt_time']);
            $error = ['code' => '2FA is not enabled for this account.'];
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['errors' => $error, 'session_expired' => true], 422);
            }
            return redirect()->route('login')->withErrors($error);
        }

        $provider = app(TwoFactorAuthenticationProvider::class);
        $valid = false;

        // Try authentication code first
        if ($request->filled('code')) {
            try {
                $valid = $provider->verify(decrypt($user->two_factor_secret), $request->code);
            } catch (\Exception $e) {
                \Log::error('2FA verification error', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                    'ip' => $request->ip()
                ]);
                $valid = false;
            }

            if (!$valid) {
                // Increment rate limit counter
                cache()->put($key, $attempts + 1, now()->addMinutes(1));

                \Log::warning('Invalid 2FA code attempt', [
                    'user_id' => $user->id,
                    'email_hash' => hash('sha256', $user->email),
                    'ip' => $request->ip(),
                    'attempts' => $attempts + 1,
                    'code_provided' => substr($request->code, 0, 2) . '****', // Log only first 2 digits for security
                    'timestamp' => now()->toISOString()
                ]);

                $error = ['code' => 'The provided code was invalid.'];
                if ($request->expectsJson() || $request->wantsJson()) {
                    return response()->json([
                        'errors' => $error,
                        'attempts' => $attempts + 1,
                        'max_attempts' => 5
                    ], 422);
                }
                return back()->withErrors($error);
            }
        }
        // Try recovery code
        elseif ($request->filled('recovery_code')) {
            try {
                $recoveryCodes = json_decode(decrypt($user->two_factor_recovery_codes), true);
            } catch (\Exception $e) {
                \Log::error('2FA recovery codes decryption error', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
                return back()->withErrors([
                    'recovery_code' => 'Error processing recovery code.'
                ]);
            }

            foreach ($recoveryCodes as $index => $recoveryCode) {
                if (hash_equals($recoveryCode, $request->recovery_code)) {
                    // Remove used recovery code
                    unset($recoveryCodes[$index]);
                    $user->forceFill([
                        'two_factor_recovery_codes' => encrypt(json_encode(array_values($recoveryCodes))),
                    ])->save();

                    \Log::info('2FA recovery code used', [
                        'user_id' => $user->id,
                        'email_hash' => hash('sha256', $user->email),
                        'remaining_codes' => count($recoveryCodes),
                        'ip' => $request->ip()
                    ]);

                    $valid = true;
                    break;
                }
            }

            if (!$valid) {
                // Increment rate limit counter
                cache()->put($key, $attempts + 1, now()->addMinutes(1));

                \Log::warning('Invalid 2FA recovery code attempt', [
                    'user_id' => $user->id,
                    'email_hash' => hash('sha256', $user->email),
                    'ip' => $request->ip(),
                    'attempts' => $attempts + 1,
                    'timestamp' => now()->toISOString()
                ]);

                $error = ['recovery_code' => 'The provided recovery code was invalid.'];
                if ($request->expectsJson() || $request->wantsJson()) {
                    return response()->json([
                        'errors' => $error,
                        'attempts' => $attempts + 1,
                        'max_attempts' => 5
                    ], 422);
                }
                return back()->withErrors($error);
            }
        }
        else {
            $error = ['code' => 'Please provide a code or recovery code.'];
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['errors' => $error], 422);
            }
            return back()->withErrors($error);
        }

        // Clear rate limit counter on success
        cache()->forget($key);

        // Authenticate the user NOW (after successful 2FA verification)
        // User was NOT authenticated before - only credentials were verified
        Auth::login($user, session('login.remember', false));

        // Update last login
        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip()
        ])->save();

        // Log successful 2FA verification
        \Log::info('2FA verification successful', [
            'user_id' => $user->id,
            'email_hash' => hash('sha256', $user->email),
            'ip' => $request->ip(),
            'method' => $request->filled('code') ? 'code' : 'recovery_code'
        ]);

        // Handle trusted device if requested
        $lowRecoveryCodes = false;
        $remainingCodes = 0;

        if ($request->boolean('remember_device')) {
            try {
                $token = \App\Models\TrustedDevice::generateToken();
                $tokenHash = \App\Models\TrustedDevice::hashToken($token);

                $device = $user->trustedDevices()->create([
                    'token_hash' => $tokenHash,
                    'device_name' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                    'last_used_at' => now(),
                    'expires_at' => now()->addDays(30),
                ]);

                \Log::info('Trusted device created', [
                    'user_id' => $user->id,
                    'device_id' => $device->id,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);

                // Set secure cookie
                cookie()->queue(
                    'trusted_device_token',
                    $token,
                    43200, // 30 days in minutes
                    null,
                    null,
                    true, // secure
                    true, // httpOnly
                    false,
                    'strict' // sameSite
                );
            } catch (\Exception $e) {
                \Log::error('Failed to create trusted device', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Check for low recovery codes
        if ($request->filled('recovery_code')) {
            try {
                $recoveryCodes = json_decode(decrypt($user->two_factor_recovery_codes), true);
                $remainingCodes = count($recoveryCodes);

                if ($remainingCodes <= 2) {
                    $lowRecoveryCodes = true;

                    \Log::warning('Low recovery codes', [
                        'user_id' => $user->id,
                        'remaining' => $remainingCodes
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('Error checking recovery codes', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Regenerate session to prevent fixation
        $request->session()->regenerate();

        // Clear 2FA session data
        session()->forget(['2fa_required', 'login.id', 'login.remember', 'login.password_hash', 'login.attempt_time']);

        // Get intended URL
        $intended = session()->pull('url.intended', route('dashboard'));

        // Return JSON response for AJAX requests
        if ($request->expectsJson() || $request->wantsJson()) {
            $response = [
                'success' => true,
                'redirect' => $intended
            ];

            if ($lowRecoveryCodes) {
                $response['low_recovery_codes'] = true;
                $response['remaining_codes'] = $remainingCodes;
            }

            return response()->json($response);
        }

        return redirect($intended);
    }
}

