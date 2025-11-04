<?php

namespace App\Http\Controllers\Auth\Concerns;

use App\Models\AdminSetting;
use App\Models\TrustedDevice;
use App\Services\SecurityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Shared helpers to finalize interactive logins while enforcing 2FA and trusted devices.
 */
trait HandlesTwoFactorLogin
{
    
    
    
    
    /**

    
    
    
     * Handle complete interactive login.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param \App\Models\User $user The user.

    
    
    
     * @param bool $remember The remember.

    
    
    
     * @param ?string $intended The intended.

    
    
    
     * @param string $twoFactorMode The twoFactorMode.

    
    
    
     * @return RedirectResponse

    
    
    
     */
    
    
    
    
    
    
    
    protected function completeInteractiveLogin(
        Request $request,
        \App\Models\User $user,
        bool $remember = false,
        ?string $intended = null,
        string $twoFactorMode = 'validation'
    ): RedirectResponse {
        $intendedUrl = $this->determineIntendedUrl($user, $intended);

        if ($user->two_factor_secret && $user->two_factor_confirmed_at) {
            $trustedDeviceToken = $request->cookie('trusted_device_token');

            if ($trustedDeviceToken) {
                // ✅ SECURITY FIX: Validate cookie origin and format
                // Ensure token is properly formatted and not tampered with
                if (!is_string($trustedDeviceToken) || strlen($trustedDeviceToken) < 32) {
                    Log::warning('Invalid trusted device token format', [
                        'user_id' => $user->id,
                        'ip' => $request->ip(),
                        'timestamp' => now()->toISOString(),
                    ]);

                    SecurityLogger::logSuspiciousActivity('invalid_trusted_device_token_format', $user, [
                        'token_length' => strlen($trustedDeviceToken ?? ''),
                    ]);

                    // Don't proceed with invalid token
                    $trustedDeviceToken = null;
                }

                if ($trustedDeviceToken) {
                    $tokenHash = TrustedDevice::hashToken($trustedDeviceToken);

                    $trustedDevice = $user->trustedDevices()
                        ->where('token_hash', $tokenHash)
                        ->valid()
                        ->first();

                    if ($trustedDevice) {
                        $expectedFingerprint = TrustedDevice::fingerprintFor($request->userAgent(), $request->ip());

                        if (! $trustedDevice->fingerprint || ! hash_equals($trustedDevice->fingerprint, $expectedFingerprint)) {
                            Log::warning('Trusted device fingerprint mismatch', [
                                'user_id' => $user->id,
                                'device_id' => $trustedDevice->id,
                                'ip' => $request->ip(),
                                'timestamp' => now()->toISOString(),
                            ]);

                            SecurityLogger::logSuspiciousActivity('trusted_device_fingerprint_mismatch', $user, [
                                'device_id' => $trustedDevice->id,
                            ]);

                            $trustedDevice->delete();
                            $trustedDevice = null;
                        }
                    }

                    if ($trustedDevice) {
                        $trustedDevice->updateLastUsed();

                        Log::info('Login via trusted device - skipping 2FA', [
                            'user_id' => $user->id,
                            'device_id' => $trustedDevice->id,
                            'ip' => $request->ip(),
                            'timestamp' => now()->toISOString(),
                        ]);

                        $this->logUserIn($request, $user, $remember);

                        return redirect()->intended($intendedUrl);
                    }
                }
            }

            Log::info('User has 2FA enabled, requiring 2FA verification', [
                'user_id' => $user->id,
                'timestamp' => now()->toISOString(),
            ]);

            $this->prepareTwoFactorChallenge($request, $user, $remember, $intendedUrl);

            if ($twoFactorMode === 'redirect') {
                return redirect()->route('two-factor.login');
            }

            throw ValidationException::withMessages([
                'requires2FA' => 'true',
            ]);
        }

        $response = $this->logUserIn($request, $user, $remember);

        // ✅ NEW: Force 2FA for admins (always mandatory, regardless of settings)
        if ($user->hasRole('admin') && !$user->two_factor_secret) {
            session()->put('2fa_setup_mandatory', true);
            session()->put('2fa_setup_user_id', $user->id);
            session()->put('2fa_setup_timestamp', now()->timestamp);

            Log::warning('Admin login without 2FA - redirecting to profile with mandatory setup', [
                'user_id' => $user->id,
                'role' => 'admin',
                'timestamp' => now()->toISOString(),
            ]);

            return redirect()->route('profile.settings', ['tab' => 'security'])
                ->with('error', 'La autenticación de dos factores es obligatoria para administradores. Por favor, configúrala ahora.');
        }

        // Check if 2FA is enabled for editors (based on settings)
        $twoFactorEnabled = AdminSetting::getCachedValue('enable_2fa', false, 300);
        if ($twoFactorEnabled && $user->hasRole('editor') && !$user->two_factor_secret) {
            session()->put('2fa_setup_mandatory', true);
            session()->put('2fa_setup_user_id', $user->id);
            session()->put('2fa_setup_timestamp', now()->timestamp);

            Log::warning('Editor login without 2FA - redirecting to profile with mandatory setup', [
                'user_id' => $user->id,
                'role' => 'editor',
                'timestamp' => now()->toISOString(),
            ]);

            return redirect()->route('profile.settings', ['tab' => 'security'])
                ->with('error', 'La autenticación de dos factores es obligatoria para editores. Por favor, configúrala ahora.');
        }

        return $response ?: redirect()->intended($intendedUrl);
    }

    
    
    
    
    /**

    
    
    
     * Handle determine intended url.

    
    
    
     *

    
    
    
     * @param \App\Models\User $user The user.

    
    
    
     * @param ?string $provided The provided.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    protected function determineIntendedUrl(\App\Models\User $user, ?string $provided = null): string
    {
        if ($provided) {
            return $provided;
        }

        return $user->hasPermission('dashboard.access')
            ? route('dashboard', absolute: false)
            : route('user.dashboard', absolute: false);
    }

    
    
    
    
    /**

    
    
    
     * Handle prepare two factor challenge.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param \App\Models\User $user The user.

    
    
    
     * @param bool $remember The remember.

    
    
    
     * @param string $intended The intended.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    protected function prepareTwoFactorChallenge(
        Request $request,
        \App\Models\User $user,
        bool $remember,
        string $intended
    ): void {
        // ✅ SECURITY FIX: Session regeneration moved to AFTER 2FA verification
        // to prevent CSRF token mismatch when 2FA modal is shown
        // Session will be regenerated in TwoFactorController@verify after successful 2FA

        session()->put('url.intended', $intended);
        session()->put('2fa_required', true);
        session()->put('login.id', $user->id);
        session()->put('login.remember', $remember);

        // Generate per-challenge nonce to avoid tying validation to stored secrets
        try {
            $nonce = bin2hex(random_bytes(32));
        } catch (\Exception $e) {
            $nonce = Str::random(64);
        }
        session()->put('login.challenge_nonce', $nonce);
        $signature = hash_hmac('sha256', $nonce . '|' . $user->password, config('app.key', 'app-key') . '|2fa');
        session()->put('login.challenge_signature', $signature);

        // Clean ONLY legacy keys (not the ones we just created)
        session()->forget(['login.password_signature', 'login.password_hash']);

        session()->put('login.attempt_time', now()->timestamp);
    }

    
    
    
    
    /**

    
    
    
     * Handle log user in.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param \App\Models\User $user The user.

    
    
    
     * @param bool $remember The remember.

    
    
    
     * @return ?RedirectResponse

    
    
    
     */
    
    
    
    
    
    
    
    protected function logUserIn(
        Request $request,
        \App\Models\User $user,
        bool $remember
    ): ?RedirectResponse {
        Auth::login($user, $remember);

        // Regenerate session after authentication (defense-in-depth)
        $request->session()->regenerate();
        $request->session()->regenerateToken();

        // Get current session ID AFTER login and regeneration
        $currentSessionId = session()->getId();

        // ✅ NEW: Store session metadata for tracking
        $sessionManagement = app(\App\Services\SessionManagementService::class);
        $sessionManagement->storeSessionMetadata($currentSessionId, [
            'initial_ip' => $request->ip(),
            'initial_user_agent_hash' => hash('sha256', $request->userAgent()),
            'created_at' => now()->timestamp,
        ]);

        // ✅ NEW: Terminate previous sessions based on role limit
        try {
            $terminated = $sessionManagement->terminatePreviousSessions($user, $currentSessionId);

            if ($terminated > 0) {
                Log::info('Previous sessions terminated on login', [
                    'user_id' => $user->id,
                    'role' => $user->role,
                    'terminated_count' => $terminated,
                    'new_session_id' => hash('sha256', $currentSessionId),
                ]);
            }
        } catch (\Exception $e) {
            // Log error but don't block login
            Log::error('Failed to terminate previous sessions', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        session(['last_activity' => time()]);

        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->save();

        Log::info('User authenticated successfully', [
            'user_id' => $user->id,
            'timestamp' => now()->toISOString(),
        ]);

        // ✅ SECURITY FIX: Log successful login event
        SecurityLogger::logSuccessfulLogin($user, [
            'remember' => $remember,
            'has_2fa' => !is_null($user->two_factor_secret),
        ]);

        // ✅ SECURITY FIX: Detect new device login
        if (method_exists($this, 'detectNewDevice')) {
            try {
                $this->detectNewDevice($request, $user);
            } catch (\Exception $e) {
                // Log error but don't block login
                Log::error('Failed to detect new device', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        return null;
    }
}
