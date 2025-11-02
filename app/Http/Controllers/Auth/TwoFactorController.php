<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AdminSetting;
use App\Notifications\RecoveryCodeUsedNotification;
use App\Notifications\RecoveryCodesRegeneratedNotification;
use App\Notifications\TwoFactorDisabledNotification;
use App\Notifications\TwoFactorEnabledNotification;
use App\Services\SecurityLogger;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;

/**
 * Manages two-factor authentication (2FA) for authenticated users.
 *
 * Features:
 * - Enrollment and confirmation using Laravel Fortify actions.
 * - QR provisioning for authenticator apps.
 * - Recovery code retrieval and regeneration.
 * - Disablement flow with password confirmation.
 * - Challenge + verification endpoints with rate limiting.
 * - Trusted device support via secure cookie.
 */
class TwoFactorController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Display the specified resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return Response

    
    
    
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

    
    
    
     * Store a newly created resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param EnableTwoFactorAuthentication $enable The enable.

    
    
    
     * @return RedirectResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function store(Request $request, EnableTwoFactorAuthentication $enable): RedirectResponse
    {
        $user = $request->user();
        $enable($user);

        // ✅ SECURITY FIX: Log 2FA enable event
        \App\Services\SecurityLogger::log2FAEvent('enabled', $user, [
            'method' => 'totp',
        ]);

        // ✅ SECURITY FIX: Send notification
        $user->notify(new TwoFactorEnabledNotification([
            'ip' => $request->ip(),
        ]));

        return back()->with('status', 'two-factor-authentication-enabled');
    }

    
    
    
    
    /**

    
    
    
     * Handle qr code.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function qrCode(Request $request)
    {
        $user = $request->user();

        if (is_null($user->two_factor_secret)) {
            return response()->json(['error' => 'Two factor authentication is not enabled.'], 400);
        }

        if (!is_null($user->two_factor_confirmed_at)) {
            return response()->json([
                'error' => '2FA ya fue confirmado. Usa la sección de códigos de recuperación (requiere contraseña).',
                'requires_password' => true
            ], 403);
        }

        try {
            return response()->json([
                'svg' => $user->twoFactorQrCodeSvg(),
                'url' => $user->twoFactorQrCodeUrl(),
            ]);
        } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
            // Secret was encrypted with a different APP_KEY.
            // Reset corrupted 2FA and ask the user to enable it again.
            \Log::warning('2FA secret corrupto detectado para usuario', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            $user->forceFill([
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ])->save();

            return response()->json([
                'error' => 'Tu configuración de 2FA estaba corrupta y ha sido reiniciada. Por favor, habilita 2FA nuevamente.',
                'reset' => true
            ], 400);
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle initial recovery codes.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function initialRecoveryCodes(Request $request)
    {
        $user = $request->user();

        if (is_null($user->two_factor_secret)) {
            return response()->json(['error' => 'Two factor authentication is not enabled.'], 400);
        }

        // Security: Only allow during initial setup (before confirmation)
        if (!is_null($user->two_factor_confirmed_at)) {
            return response()->json([
                'error' => '2FA ya está confirmado. Usa el endpoint de recovery codes con contraseña.',
                'requires_password' => true
            ], 403);
        }

        try {
            $codes = json_decode(decrypt($user->two_factor_recovery_codes), true);

            \Log::info('Initial recovery codes accessed during setup', [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', strtolower($user->email)),
                'ip' => $request->ip(),
                'timestamp' => now()->toISOString()
            ]);

            return response()->json([
                'recoveryCodes' => $codes,
            ]);
        } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
            \Log::warning('2FA recovery codes corruptos detectados para usuario', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            $user->forceFill([
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ])->save();

            return response()->json([
                'error' => 'Tu configuración de 2FA estaba corrupta y ha sido reiniciada. Por favor, habilita 2FA nuevamente.',
                'reset' => true
            ], 400);
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle recovery codes.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
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

        if (is_null($user->two_factor_confirmed_at)) {
            return response()->json(['error' => 'La autenticación de dos factores aún está pendiente de confirmación.'], 400);
        }

        // Do not log user email in plain text for privacy.
        \Log::info('Recovery codes accessed', [
            'user_id' => $user->id,
            'email_hash' => hash('sha256', strtolower($user->email)),
            'ip' => $request->ip(),
            'timestamp' => now()->toISOString()
        ]);

        try {
            return response()->json([
                'recoveryCodes' => json_decode(decrypt($user->two_factor_recovery_codes), true),
            ]);
        } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
            // Secret was encrypted with a different APP_KEY.
            \Log::warning('2FA recovery codes corruptos detectados para usuario', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            $user->forceFill([
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ])->save();

            return response()->json([
                'error' => 'Tu configuración de 2FA estaba corrupta y ha sido reiniciada. Por favor, habilita 2FA nuevamente.',
                'reset' => true
            ], 400);
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle confirm.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return RedirectResponse

    
    
    
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
                'email_hash' => hash('sha256', strtolower($user->email)),
                'ip' => $request->ip()
            ]);

            return back()->withErrors([
                'code' => 'Too many attempts. Please try again in 1 minute.'
            ]);
        }

        $provider = app(TwoFactorAuthenticationProvider::class);

        try {
            \Log::info('2FA confirmation attempt', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
                'timestamp' => now()->toISOString(),
            ]);

            $valid = $provider->verify(decrypt($user->two_factor_secret), $request->code);

            \Log::info('2FA confirmation result', [
                'user_id' => $user->id,
                'status' => $valid ? 'valid' : 'invalid',
            ]);
        } catch (\Exception $e) {
            \Log::error('2FA confirmation verification error', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['code' => 'Error verifying code.']);
        }

        if (!$valid) {
            cache()->put($key, $attempts + 1, now()->addMinutes(1));

            \Log::warning('Invalid 2FA confirmation code', [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', strtolower($user->email)),
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

        // ✅ SECURITY FIX: Clear mandatory 2FA setup flag when 2FA is confirmed
        $wasMandatory = session()->has('2fa_setup_mandatory');

        if ($wasMandatory) {
            session()->forget(['2fa_setup_mandatory', '2fa_setup_user_id', '2fa_setup_timestamp']);

            \Log::info('2FA setup completed - mandatory flag cleared', [
                'user_id' => $user->id,
                'timestamp' => now()->toISOString()
            ]);
        }

        // ✅ FIX: If it was mandatory setup, redirect to appropriate dashboard
        if ($wasMandatory) {
            // Determine redirect based on user role
            if ($user->hasRole('admin') || $user->hasRole('editor')) {
                return redirect()->route('admin.dashboard')
                    ->with('status', 'two-factor-authentication-confirmed')
                    ->with('success', '2FA configurado exitosamente. Bienvenido al panel de administración.');
            } else {
                return redirect()->route('home')
                    ->with('status', 'two-factor-authentication-confirmed')
                    ->with('success', '2FA configurado exitosamente.');
            }
        }

        return back()->with('status', 'two-factor-authentication-confirmed');
    }

    
    
    
    
    /**

    
    
    
     * Handle regenerate.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param GenerateNewRecoveryCodes $generate The generate.

    
    
    
     * @return RedirectResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function regenerate(Request $request, GenerateNewRecoveryCodes $generate): RedirectResponse
    {
        // ✅ SECURITY FIX: Require password confirmation
        $request->validate([
            'password' => 'required|current_password',
        ]);

        // ✅ SECURITY FIX: Rate limiting - max 3 regenerations per hour
        $key = "recovery_codes_regen:{$request->user()->id}";
        if (RateLimiter::tooManyAttempts($key, 3)) {
            return back()->withErrors([
                'password' => 'Demasiadas regeneraciones de códigos. Intenta en 1 hora.'
            ]);
        }

        RateLimiter::hit($key, 3600); // 1 hour

        $generate($request->user());

        // ✅ SECURITY FIX: Log and notify
        SecurityLogger::log2FAEvent('recovery_codes_regenerated', $request->user(), [
            'ip' => $request->ip(),
        ]);

        $request->user()->notify(new RecoveryCodesRegeneratedNotification([
            'ip' => $request->ip(),
        ]));

        return back()->with('status', 'recovery-codes-generated');
    }

    
    
    
    
    /**

    
    
    
     * Remove the specified resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param DisableTwoFactorAuthentication $disable The disable.

    
    
    
     * @return RedirectResponse

    
    
    
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

        $user = $request->user();
        $twoFactorMandatory = AdminSetting::getCachedValue('enable_2fa', false, 300);
        $isPrivileged = $user->hasRole('admin') || $user->hasRole('editor');

        if ($twoFactorMandatory && $isPrivileged) {
            return back()->withErrors([
                'password' => 'La autenticación de dos factores es obligatoria para tu cuenta y no puede desactivarse.'
            ]);
        }

        $disable($user);

        $user->trustedDevices()->delete();
        cookie()->queue(cookie()->forget('trusted_device_token'));

        // ✅ SECURITY FIX: Log 2FA disable event
        \App\Services\SecurityLogger::log2FAEvent('disabled', $user, [
            'trusted_devices_removed' => true,
        ]);

        // ✅ SECURITY FIX: Send notification
        $user->notify(new TwoFactorDisabledNotification([
            'ip' => $request->ip(),
        ]));

        return back()->with('status', 'two-factor-authentication-disabled');
    }

    
    
    
    
    /**

    
    
    
     * Handle challenge.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function challenge()
    {
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

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    
    
    
    
    /**

    
    
    
     * Handle verify.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function verify(Request $request)
    {
        // 🔍 DEBUG LOG - Entry point
        \Log::debug('2FA verify() method called', [
            'has_code' => $request->filled('code'),
            'has_recovery_code' => $request->filled('recovery_code'),
            'expects_json' => $request->expectsJson(),
            'wants_json' => $request->wantsJson(),
            'ip' => $request->ip(),
        ]);

        $request->validate([
            'code' => 'nullable|string|size:6',
            'recovery_code' => 'nullable|string',
        ]);

        // Check rate limiting (5 attempts per minute)
        $rateLimitKeyParts = [$request->ip()];
        if ($sessionUserId = session('login.id')) {
            $rateLimitKeyParts[] = $sessionUserId;
        }
        $key = 'two-factor-attempts:' . implode(':', $rateLimitKeyParts);
        $attempts = cache()->get($key, 0);

        if ($attempts >= 5) {
            $retryAfter = 60; // 60 seconds
            $error = ['code' => 'Too many attempts. Please try again in 1 minute.'];

            $userForLog = $sessionUserId ? \App\Models\User::find($sessionUserId) : null;
            SecurityLogger::logSuspiciousActivity('two_factor_rate_limit_exceeded', $userForLog, [
                'attempts' => $attempts,
            ]);

            \Log::warning('2FA rate limit exceeded', [
                'ip' => $request->ip(),
                'user_id' => $sessionUserId,
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
        $challengeNonce = session('login.challenge_nonce');
        $challengeSignature = session('login.challenge_signature');
        $legacyPasswordSignature = session('login.password_signature');
        $legacyPasswordHash = session('login.password_hash');
        $attemptTime = session('login.attempt_time');

        // 🔍 DEBUG LOG - Session data check
        \Log::debug('2FA verify() - Session data retrieved', [
            'has_user_id' => !empty($userId),
            'user_id' => $userId,
            'has_challenge_nonce' => !empty($challengeNonce),
            'has_challenge_signature' => !empty($challengeSignature),
            'has_legacy_password_signature' => !empty($legacyPasswordSignature),
            'has_legacy_password_hash' => !empty($legacyPasswordHash),
            'has_attempt_time' => !empty($attemptTime),
            'attempt_time' => $attemptTime,
            'time_elapsed' => $attemptTime ? (now()->timestamp - $attemptTime) : null,
        ]);

        // Verify session data exists
        if (!$userId || (!$challengeSignature && !$legacyPasswordSignature && !$legacyPasswordHash) || !$attemptTime) {
            \Log::warning('2FA verify() - Session data missing or invalid');
            session()->forget([
                'login.id',
                'login.remember',
                'login.challenge_nonce',
                'login.challenge_signature',
                'login.password_signature',
                'login.password_hash',
                'login.attempt_time'
            ]);
            $error = ['code' => 'Session expired. Please login again.'];
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['errors' => $error, 'session_expired' => true], 422);
            }
            return redirect()->route('login')->withErrors($error);
        }

        // Check if 2FA attempt has expired (5 minutes)
        if ((now()->timestamp - $attemptTime) > 300) {
            session()->forget([
                'login.id',
                'login.remember',
                'login.challenge_nonce',
                'login.challenge_signature',
                'login.password_signature',
                'login.password_hash',
                'login.attempt_time'
            ]);
            $error = ['code' => '2FA challenge expired. Please login again.'];
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['errors' => $error, 'session_expired' => true], 422);
            }
            return redirect()->route('login')->withErrors($error);
        }

        $user = \App\Models\User::find($userId);

        // 🔍 DEBUG LOG - User lookup
        \Log::debug('2FA verify() - User lookup', [
            'user_id' => $userId,
            'user_found' => !empty($user),
            'has_2fa_secret' => $user ? !empty($user->two_factor_secret) : false,
            'has_2fa_confirmed' => $user ? !empty($user->two_factor_confirmed_at) : false,
        ]);

        if (!$user) {
            \Log::error('2FA verify() - User not found in database', ['user_id' => $userId]);
            session()->forget([
                'login.id',
                'login.remember',
                'login.challenge_nonce',
                'login.challenge_signature',
                'login.password_signature',
                'login.password_hash',
                'login.attempt_time'
            ]);
            $error = ['code' => 'User not found.'];
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['errors' => $error, 'session_expired' => true], 422);
            }
            return redirect()->route('login')->withErrors($error);
        }

        // Verify password hasn't changed during 2FA challenge
        // Use hash_equals to prevent timing attacks
        $signatureValid = false;
        if ($challengeSignature && $challengeNonce) {
            $expected = hash_hmac('sha256', $challengeNonce . '|' . $user->password, config('app.key', 'app-key') . '|2fa');
            $signatureValid = hash_equals($expected, $challengeSignature);

            // 🔍 DEBUG LOG
            \Log::debug('2FA Signature Verification (Challenge)', [
                'user_id' => $user->id,
                'has_nonce' => !empty($challengeNonce),
                'has_signature' => !empty($challengeSignature),
                'signature_valid' => $signatureValid,
            ]);
        } elseif ($legacyPasswordSignature) {
            $expectedLegacy = hash_hmac('sha256', $user->password, config('app.key', 'app-key') . '|2fa');
            $signatureValid = hash_equals($expectedLegacy, $legacyPasswordSignature);

            // 🔍 DEBUG LOG
            \Log::debug('2FA Signature Verification (Legacy Password)', [
                'user_id' => $user->id,
                'has_signature' => !empty($legacyPasswordSignature),
                'signature_valid' => $signatureValid,
            ]);
        } elseif ($legacyPasswordHash) {
            $signatureValid = hash_equals($user->password, $legacyPasswordHash);

            // 🔍 DEBUG LOG
            \Log::debug('2FA Signature Verification (Legacy Hash)', [
                'user_id' => $user->id,
                'has_hash' => !empty($legacyPasswordHash),
                'signature_valid' => $signatureValid,
            ]);
        }

        if (!$signatureValid) {
            // 🔍 DEBUG LOG
            \Log::warning('2FA Signature Validation Failed', [
                'user_id' => $user->id,
                'has_challenge_signature' => !empty($challengeSignature),
                'has_challenge_nonce' => !empty($challengeNonce),
                'has_legacy_password_signature' => !empty($legacyPasswordSignature),
                'has_legacy_password_hash' => !empty($legacyPasswordHash),
            ]);
            session()->forget([
                'login.id',
                'login.remember',
                'login.challenge_nonce',
                'login.challenge_signature',
                'login.password_signature',
                'login.password_hash',
                'login.attempt_time'
            ]);
            $error = ['code' => 'Security error. Please login again.'];
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['errors' => $error, 'session_expired' => true], 422);
            }
            return redirect()->route('login')->withErrors($error);
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
            $error = ['code' => '2FA is not enabled for this account.'];
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['errors' => $error, 'session_expired' => true], 422);
            }
            return redirect()->route('login')->withErrors($error);
        }

        $provider = app(TwoFactorAuthenticationProvider::class);
        $valid = false;
        $remainingCodes = null;

        // Try authentication code first
        if ($request->filled('code')) {
            // 🔍 DEBUG LOG - Code verification starting
            \Log::debug('2FA verify() - Starting code verification', [
                'user_id' => $user->id,
                'code_length' => strlen($request->code),
                'ip' => $request->ip(),
            ]);

            try {
                \Log::info('2FA verification attempt', [
                    'user_id' => $user->id,
                    'ip' => $request->ip(),
                    'timestamp' => now()->toISOString(),
                ]);

                $valid = $provider->verify(decrypt($user->two_factor_secret), $request->code);

                // 🔍 DEBUG LOG - Verification result
                \Log::debug('2FA verify() - Code verification result', [
                    'user_id' => $user->id,
                    'valid' => $valid,
                ]);

                \Log::info('2FA verification result', [
                    'user_id' => $user->id,
                    'status' => $valid ? 'valid' : 'invalid',
                ]);
            } catch (\Exception $e) {
                \Log::error('2FA verification error', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'ip' => $request->ip()
                ]);
                $valid = false;
            }

            if (!$valid) {
                // Increment rate limit counter
                cache()->put($key, $attempts + 1, now()->addMinutes(1));

                \Log::warning('Invalid 2FA code attempt', [
                    'user_id' => $user->id,
                    'email_hash' => hash('sha256', strtolower($user->email)),
                    'ip' => $request->ip(),
                    'attempts' => $attempts + 1,
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
            // ✅ SECURITY FIX: Stricter rate limiting for recovery codes (3 attempts per 5 minutes)
            $recoveryRateLimitKey = 'two-factor-recovery-attempts:' . implode(':', $rateLimitKeyParts);
            $recoveryAttempts = cache()->get($recoveryRateLimitKey, 0);

            if ($recoveryAttempts >= 3) {
                $retryAfter = 300; // 5 minutes
                $error = ['recovery_code' => 'Too many recovery code attempts. Please try again in 5 minutes.'];

                SecurityLogger::logSuspiciousActivity('two_factor_recovery_rate_limit_exceeded', $user, [
                    'attempts' => $recoveryAttempts,
                    'retry_after' => $retryAfter,
                ]);

                \Log::warning('2FA recovery code rate limit exceeded', [
                    'ip' => $request->ip(),
                    'user_id' => $userId,
                    'attempts' => $recoveryAttempts,
                    'retry_after' => $retryAfter,
                    'timestamp' => now()->toISOString()
                ]);

                if ($request->expectsJson() || $request->wantsJson()) {
                    return response()->json([
                        'errors' => $error,
                        'rate_limited' => true,
                        'retry_after' => $retryAfter,
                        'attempts' => $recoveryAttempts,
                        'max_attempts' => 3
                    ], 429);
                }
                return back()->withErrors($error);
            }

            [$user, $valid, $remainingCodes] = DB::transaction(function () use ($user, $request) {
                $lockedUser = \App\Models\User::whereKey($user->id)->lockForUpdate()->first();
                $validRecovery = false;
                $remaining = 0;

                try {
                    $recoveryCodes = json_decode(decrypt($lockedUser->two_factor_recovery_codes), true);
                } catch (\Exception $e) {
                    \Log::error('2FA recovery codes decryption error', [
                        'user_id' => $lockedUser->id,
                        'error' => $e->getMessage()
                    ]);
                    $recoveryCodes = [];
                }

                foreach ($recoveryCodes as $index => $recoveryCode) {
                    if (hash_equals($recoveryCode, $request->recovery_code)) {
                        // ✅ SECURITY FIX: Log recovery code usage
                        DB::table('recovery_code_usage')->insert([
                            'user_id' => $lockedUser->id,
                            'code_hash' => hash('sha256', $recoveryCode),
                            'ip_address' => request()->ip(),
                            'user_agent' => request()->userAgent(),
                            'used_at' => now(),
                        ]);

                        unset($recoveryCodes[$index]);
                        $lockedUser->forceFill([
                            'two_factor_recovery_codes' => encrypt(json_encode(array_values($recoveryCodes))),
                        ])->save();
                        $validRecovery = true;
                        $remaining = count($recoveryCodes);

                        // ✅ SECURITY FIX: Log security event
                        SecurityLogger::log2FAEvent('recovery_code_used', $lockedUser, [
                            'ip' => request()->ip(),
                            'remaining_codes' => $remaining,
                        ]);

                        // ✅ SECURITY FIX: Send notification
                        $lockedUser->notify(new RecoveryCodeUsedNotification([
                            'ip' => request()->ip(),
                            'remaining_codes' => $remaining,
                        ]));

                        break;
                    }
                }

                if (!$validRecovery) {
                    $remaining = count($recoveryCodes);
                }

                return [$lockedUser, $validRecovery, $remaining];
            });

            if (!$valid) {
                // ✅ SECURITY FIX: Increment both general and recovery-specific rate limiters
                cache()->put($key, $attempts + 1, now()->addMinutes(1));
                cache()->put($recoveryRateLimitKey, $recoveryAttempts + 1, now()->addMinutes(5));

                \Log::warning('Invalid 2FA recovery code attempt', [
                    'user_id' => $user->id,
                    'email_hash' => hash('sha256', strtolower($user->email)),
                    'ip' => $request->ip(),
                    'attempts' => $attempts + 1,
                    'recovery_attempts' => $recoveryAttempts + 1,
                    'timestamp' => now()->toISOString()
                ]);

                $error = ['recovery_code' => 'The provided recovery code was invalid.'];
                if ($request->expectsJson() || $request->wantsJson()) {
                    return response()->json([
                        'errors' => $error,
                        'attempts' => $attempts + 1,
                        'max_attempts' => 5,
                        'recovery_attempts' => $recoveryAttempts + 1,
                        'max_recovery_attempts' => 3
                    ], 422);
                }
                return back()->withErrors($error);
            }

            // ✅ SECURITY FIX: Clear recovery-specific rate limiter on success
            cache()->forget($recoveryRateLimitKey);

            \Log::info('2FA recovery code used', [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', strtolower($user->email)),
                'remaining_codes' => $remainingCodes,
                'ip' => $request->ip()
            ]);
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

        // 🔍 DEBUG LOG - About to authenticate user
        \Log::debug('2FA verify() - About to authenticate user', [
            'user_id' => $user->id,
            'remember' => session('login.remember', false),
            'current_auth_check' => Auth::check(),
            'current_auth_id' => Auth::id(),
        ]);

        // Authenticate the user NOW (after successful 2FA verification)
        // User was NOT authenticated before - only credentials were verified
        Auth::login($user, session('login.remember', false));
        $request->session()->regenerate();
        $request->session()->regenerateToken();

        // 🔍 DEBUG LOG - User authenticated
        \Log::debug('2FA verify() - User authenticated', [
            'user_id' => $user->id,
            'auth_check' => Auth::check(),
            'auth_id' => Auth::id(),
            'session_id' => session()->getId(),
        ]);

        // Update last login
        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip()
        ])->save();

        // Log successful 2FA verification
        \Log::info('2FA verification successful', [
            'user_id' => $user->id,
            'email_hash' => hash('sha256', strtolower($user->email)),
            'ip' => $request->ip(),
            'method' => $request->filled('code') ? 'code' : 'recovery_code'
        ]);

        // ✅ SECURITY FIX: Detect new device login after 2FA
        if (method_exists($this, 'detectNewDevice')) {
            try {
                $this->detectNewDevice($request, $user);
            } catch (\Exception $e) {
                // Log error but don't block login
                \Log::error('Failed to detect new device after 2FA', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        // Handle trusted device if requested
        $lowRecoveryCodes = false;

        if ($request->boolean('remember_device')) {
            try {
                $token = \App\Models\TrustedDevice::generateToken();
                $tokenHash = \App\Models\TrustedDevice::hashToken($token);

                $device = $user->trustedDevices()->create([
                    'token_hash' => $tokenHash,
                    'device_name' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                    'fingerprint' => \App\Models\TrustedDevice::fingerprintFor($request->userAgent(), $request->ip()),
                    'last_used_at' => now(),
                    'expires_at' => now()->addDays(30),
                ]);

                \Log::info('Trusted device created', [
                    'user_id' => $user->id,
                    'device_id' => $device->id,
                    'ip' => $request->ip(),
                    'user_agent_hash' => hash('sha256', substr($request->userAgent() ?? 'unknown', 0, 100))
                ]);

                SecurityLogger::logSuspiciousActivity('trusted_device_created', $user, [
                    'device_id' => $device->id,
                ]);

                // ✅ SECURITY FIX: Set secure cookie with partitioned attribute
                // This prevents cookie injection from compromised subdomains
                cookie()->queue(
                    cookie(
                        'trusted_device_token',
                        $token,
                        43200, // 30 days in minutes
                        '/', // path
                        config('session.domain'), // domain from config
                        config('session.secure', true), // secure (HTTPS only)
                        true, // httpOnly
                        false, // raw
                        config('session.same_site', 'strict') // sameSite
                    )->withPartitioned() // ✅ Partitioned attribute for better isolation
                );
            } catch (\Exception $e) {
                \Log::error('Failed to create trusted device', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Check for low recovery codes
        if ($request->filled('recovery_code') && $remainingCodes !== null) {
            if ($remainingCodes <= 2) {
                $lowRecoveryCodes = true;

                \Log::warning('Low recovery codes', [
                    'user_id' => $user->id,
                    'remaining' => $remainingCodes
                ]);
            }
        }

        // Clear 2FA session data
        session()->forget([
            '2fa_required',
            'login.id',
            'login.remember',
            'login.challenge_nonce',
            'login.challenge_signature',
            'login.password_signature',
            'login.password_hash',
            'login.attempt_time'
        ]);

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

            // 🔍 DEBUG LOG - Returning JSON response
            \Log::debug('2FA verify() returning JSON response', [
                'user_id' => $user->id,
                'redirect' => $intended,
                'low_recovery_codes' => $lowRecoveryCodes ?? false,
            ]);

            return response()->json($response);
        }

        // 🔍 DEBUG LOG - Returning redirect response
        \Log::debug('2FA verify() returning redirect', [
            'user_id' => $user->id,
            'redirect' => $intended,
        ]);

        return redirect($intended);
    }
}
