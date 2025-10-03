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
     */
    public function recoveryCodes(Request $request)
    {
        $user = $request->user();

        if (is_null($user->two_factor_secret)) {
            return response()->json(['error' => 'Two factor authentication is not enabled.'], 400);
        }

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
                'user_email' => $user->email,
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
                'user_email' => $user->email,
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
            return back()->withErrors([
                'code' => 'Too many attempts. Please try again in 1 minute.'
            ]);
        }

        $userId = session('login.id');
        $passwordHash = session('login.password_hash');
        $attemptTime = session('login.attempt_time');

        // Verify session data exists
        if (!$userId || !$passwordHash || !$attemptTime) {
            session()->forget(['login.id', 'login.remember', 'login.password_hash', 'login.attempt_time']);
            return redirect()->route('login')->withErrors([
                'code' => 'Session expired. Please login again.'
            ]);
        }

        // Check if 2FA attempt has expired (5 minutes)
        if ((now()->timestamp - $attemptTime) > 300) {
            session()->forget(['login.id', 'login.remember', 'login.password_hash', 'login.attempt_time']);
            return redirect()->route('login')->withErrors([
                'code' => '2FA challenge expired. Please login again.'
            ]);
        }

        $user = \App\Models\User::find($userId);
        if (!$user) {
            session()->forget(['login.id', 'login.remember', 'login.password_hash', 'login.attempt_time']);
            return redirect()->route('login')->withErrors([
                'code' => 'User not found.'
            ]);
        }

        // Verify password hasn't changed during 2FA challenge
        if ($user->password !== $passwordHash) {
            session()->forget(['login.id', 'login.remember', 'login.password_hash', 'login.attempt_time']);
            return redirect()->route('login')->withErrors([
                'code' => 'Security error. Please login again.'
            ]);
        }

        // Verify 2FA is still enabled
        if (!$user->two_factor_secret || !$user->two_factor_confirmed_at) {
            session()->forget(['login.id', 'login.remember', 'login.password_hash', 'login.attempt_time']);
            return redirect()->route('login')->withErrors([
                'code' => '2FA is not enabled for this account.'
            ]);
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
                    'user_email' => $user->email,
                    'ip' => $request->ip(),
                    'attempts' => $attempts + 1
                ]);

                return back()->withErrors([
                    'code' => 'The provided code was invalid.'
                ]);
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
                        'user_email' => $user->email,
                        'remaining_codes' => count($recoveryCodes) - 1,
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
                    'user_email' => $user->email,
                    'ip' => $request->ip(),
                    'attempts' => $attempts + 1
                ]);

                return back()->withErrors([
                    'recovery_code' => 'The provided recovery code was invalid.'
                ]);
            }
        }
        else {
            return back()->withErrors([
                'code' => 'Please provide a code or recovery code.'
            ]);
        }

        // Clear rate limit counter on success
        cache()->forget($key);

        // Login the user
        Auth::login($user, session('login.remember', false));

        // Update last login
        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip()
        ])->save();

        // Log successful 2FA verification
        \Log::info('2FA verification successful', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'ip' => $request->ip(),
            'method' => $request->filled('code') ? 'code' : 'recovery_code'
        ]);

        // Regenerate session to prevent fixation
        $request->session()->regenerate();

        // Clear 2FA session data
        session()->forget(['login.id', 'login.remember', 'login.password_hash', 'login.attempt_time']);

        // Redirect to intended URL
        $intended = session()->pull('url.intended', route('dashboard'));

        return redirect($intended);
    }
}

