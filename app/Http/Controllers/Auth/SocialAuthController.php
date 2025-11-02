<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Auth\Concerns\HandlesTwoFactorLogin;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SecurityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;
use Exception;

/**
 * Bridges OAuth providers with the local authentication system to streamline social logins.
 * Validates provider support, handles callback exceptions gracefully, and provisions or links user accounts securely.
 */
class SocialAuthController extends Controller
{
    use HandlesTwoFactorLogin;
    /**
     * Supported OAuth providers
     */
    private const SUPPORTED_PROVIDERS = ['google', 'facebook', 'github'];

    
    
    
    
    /**

    
    
    
     * Handle redirect.

    
    
    
     *

    
    
    
     * @param string $provider The provider.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function redirect(string $provider)
    {
        if (!in_array($provider, self::SUPPORTED_PROVIDERS)) {
            // Flash error to session for Inertia to pick up
            session()->flash('error', 'Proveedor de autenticación no soportado.');
            return redirect()->route('login');
        }

        try {
            $state = Str::random(40);
            // ✅ SECURITY FIX: Store state with timestamp and session ID
            $stateData = [
                'value' => $state,
                'created_at' => now()->timestamp,
                'session_id' => session()->getId(),
            ];
            session()->put("oauth_state:{$provider}", $stateData);

            return Socialite::driver($provider)
                ->with(['state' => $state])
                ->redirect();
        } catch (Exception $e) {
            // Flash error to session for Inertia to pick up
            session()->flash('error', 'Error al conectar con ' . ucfirst($provider) . '. Por favor, intenta de nuevo.');
            return redirect()->route('login');
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle callback.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param string $provider The provider.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function callback(Request $request, string $provider)
    {
        if (!in_array($provider, self::SUPPORTED_PROVIDERS)) {
            session()->flash('error', 'Proveedor de autenticación no soportado.');
            return redirect()->route('login');
        }

        $stateData = session()->pull("oauth_state:{$provider}");

        // ✅ SECURITY FIX: Validate state timeout (5 minutes)
        if (!$stateData || !is_array($stateData)) {
            Log::warning('OAuth state missing or invalid', [
                'provider' => $provider,
                'ip' => $request->ip(),
            ]);
            session()->flash('error', 'La sesión de autenticación expiró. Intenta nuevamente.');
            return redirect()->route('login');
        }

        $stateAge = now()->timestamp - ($stateData['created_at'] ?? 0);
        if ($stateAge > 300) { // 5 minutes
            Log::warning('OAuth state expired', [
                'provider' => $provider,
                'age_seconds' => $stateAge,
                'ip' => $request->ip(),
            ]);
            session()->flash('error', 'La sesión de autenticación expiró. Intenta nuevamente.');
            return redirect()->route('login');
        }

        // ✅ SECURITY FIX: Validate session ID
        if (($stateData['session_id'] ?? null) !== session()->getId()) {
            Log::warning('OAuth state session mismatch', [
                'provider' => $provider,
                'ip' => $request->ip(),
            ]);
            session()->flash('error', 'Error de validación de sesión.');
            return redirect()->route('login');
        }

        // Validate state value
        if (empty($stateData['value']) || !hash_equals($stateData['value'], (string) $request->input('state'))) {
            Log::warning('OAuth state mismatch detected', [
                'provider' => $provider,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            session()->flash('error', 'No pudimos verificar la sesión de autenticación. Por favor, intenta nuevamente.');
            return redirect()->route('login');
        }

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (Exception $e) {
            session()->flash('error', 'Error al autenticar con ' . ucfirst($provider) . '. Por favor, intenta de nuevo.');
            return redirect()->route('login');
        }

        // ✅ SECURITY FIX: Validate email format and check blacklist
        $email = $socialUser->getEmail();

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Log::warning('Invalid email from OAuth provider', [
                'provider' => $provider,
                'email_provided' => !empty($email),
                'ip' => $request->ip(),
            ]);
            session()->flash('error', 'El proveedor no devolvió un correo electrónico válido. No se pudo completar el acceso.');
            return redirect()->route('login');
        }

        // Check if email domain is blacklisted (disposable email services)
        $disposableDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com', 'throwaway.email'];
        $emailDomain = strtolower(substr(strrchr($email, "@"), 1));

        if (in_array($emailDomain, $disposableDomains)) {
            Log::warning('Disposable email attempted OAuth login', [
                'email_hash' => hash('sha256', strtolower($email)),
                'provider' => $provider,
                'ip' => $request->ip(),
            ]);
            session()->flash('error', 'Este correo electrónico no puede ser utilizado.');
            return redirect()->route('login');
        }

        $emailVerified = $this->providerMarksEmailVerified($socialUser);

        $user = $this->findOrCreateUser($socialUser, $provider, $emailVerified);

        // ✅ SECURITY FIX: Check if user is banned BEFORE completing login
        // This prevents session regeneration, trusted device creation, and audit log pollution
        if ($user->isBanned()) {
            $banInfo = $user->currentBan();

            Log::warning('Banned user attempted social login', [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', strtolower($user->email)),
                'provider' => $provider,
                'ip' => $request->ip(),
                'ban_reason' => $banInfo?->reason,
                'ban_type' => $banInfo?->is_permanent ? 'permanent' : 'temporary',
                'ban_expires_at' => $banInfo?->expires_at?->toISOString(),
            ]);

            // Don't regenerate session or authenticate - just redirect with error
            session()->flash('error', 'Tu cuenta ha sido suspendida. No puedes iniciar sesión en este momento.');
            return redirect()->route('login');
        }

        // ✅ SECURITY FIX: Regenerate session BEFORE authentication to prevent session fixation
        $request->session()->regenerate();

        $intended = $user->hasRole('admin') || $user->hasRole('editor')
            ? route('admin.dashboard', absolute: false)
            : route('dashboard', absolute: false);

        $response = $this->completeInteractiveLogin(
            $request,
            $user,
            remember: false,
            intended: $intended,
            twoFactorMode: 'redirect'
        );

        // ✅ SECURITY FIX: Regenerate CSRF token after authentication
        $request->session()->regenerateToken();

        if (Auth::check() && Auth::id() === $user->id) {
            // Log successful OAuth login
            SecurityLogger::logSuccessfulLogin($user, [
                'method' => 'oauth',
                'provider' => $provider,
            ]);
            session()->flash('success', '¡Bienvenido de vuelta, ' . $user->name . '!');
        } else {
            session()->flash('info', 'Completa la verificación de dos factores para finalizar el acceso.');
        }

        return $response;
    }

    
    
    
    
    /**

    
    
    
     * Handle find or create user.

    
    
    
     *

    
    
    
     * @param mixed $socialUser The socialUser.

    
    
    
     * @param string $provider The provider.

    
    
    
     * @param bool $emailVerified The emailVerified.

    
    
    
     * @return User

    
    
    
     */
    
    
    
    
    
    
    
    private function findOrCreateUser($socialUser, string $provider, bool $emailVerified): User
    {
        // Check if user already exists with this provider
        $user = User::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($user) {
            // Tokens will be automatically encrypted by the model mutators
            $user->update([
                'provider_token' => $socialUser->token,
                'provider_refresh_token' => $socialUser->refreshToken,
                'provider_token_expires_at' => now()->addHour(), // ✅ SECURITY FIX: Token expiration
            ]);

            if (!$user->hasVerifiedEmail() && $emailVerified) {
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            return $user;
        }

        // Check if user exists with same email
        $existingUser = User::where('email', $socialUser->getEmail())->first();

        if ($existingUser) {
            // Link OAuth account to existing user
            // Tokens will be automatically encrypted by the model mutators
            $existingUser->update([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'provider_token' => $socialUser->token,
                'provider_refresh_token' => $socialUser->refreshToken,
                'provider_token_expires_at' => now()->addHour(), // ✅ SECURITY FIX: Token expiration
            ]);

            if (!$existingUser->hasVerifiedEmail() && $emailVerified) {
                $existingUser->forceFill(['email_verified_at' => now()])->save();
            }

            return $existingUser;
        }

        // Tokens will be automatically encrypted by the model mutators
        $user = User::create([
            'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'Usuario',
            'email' => $socialUser->getEmail(),
            'email_verified_at' => $emailVerified ? now() : null,
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'provider_token' => $socialUser->token,
            'provider_refresh_token' => $socialUser->refreshToken,
            'provider_token_expires_at' => now()->addHour(), // ✅ SECURITY FIX: Token expiration
            'password' => null,
            'avatar' => $socialUser->getAvatar() ?? null,
        ]);

        if (!$emailVerified) {
            try {
                $user->sendEmailVerificationNotification();
            } catch (Exception $e) {
                Log::warning('Failed to queue email verification after social signup', [
                    'user_id' => $user->id,
                    'provider' => $provider,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Assign default role using Spatie method (role column doesn't exist)
        $user->assignRole('user');

        return $user;
    }

    
    
    
    
    /**

    
    
    
     * Handle unlink.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param string $provider The provider.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function unlink(Request $request, string $provider)
    {
        $user = $request->user();

        // Check if user has a password set (can't unlink if it's the only auth method)
        if (!$user->password) {
            session()->flash('error', 'No puedes desvincular tu cuenta de ' . ucfirst($provider) . ' sin establecer una contraseña primero.');
            return redirect()->back();
        }

        // Check if this is the correct provider
        if ($user->provider !== $provider) {
            session()->flash('error', 'Esta cuenta no está vinculada con ' . ucfirst($provider) . '.');
            return redirect()->back();
        }

        // Unlink provider
        $user->update([
            'provider' => null,
            'provider_id' => null,
            'provider_token' => null,
            'provider_refresh_token' => null,
        ]);

        session()->flash('success', 'Cuenta de ' . ucfirst($provider) . ' desvinculada exitosamente.');
        return redirect()->back();
    }

    
    
    
    
    /**

    
    
    
     * Display a listing of the resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function index(Request $request)
    {
        $user = $request->user();

        $connectedAccounts = [];
        if ($user->provider) {
            $connectedAccounts[] = [
                'provider' => $user->provider,
                'provider_id' => $user->provider_id,
                'created_at' => $user->created_at,
            ];
        }

        return Inertia::render('Profile/ConnectedAccounts', [
            'connectedAccounts' => $connectedAccounts,
            'hasPassword' => !empty($user->password),
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle provider marks email verified.

    
    
    
     *

    
    
    
     * @param mixed $socialUser The socialUser.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    private function providerMarksEmailVerified($socialUser): bool
    {
        $raw = method_exists($socialUser, 'getRaw') ? $socialUser->getRaw() : [];
        $boolishKeys = [
            'email_verified', 'verified_email', 'verified', 'email_verified_at', 'email_verified_at_seconds'
        ];

        foreach ($boolishKeys as $key) {
            $value = Arr::get($raw, $key);

            if (is_bool($value) && $value === true) {
                return true;
            }

            if (is_string($value) && in_array(strtolower($value), ['true', '1', 'yes'], true)) {
                return true;
            }

            if (is_numeric($value) && (int) $value === 1) {
                return true;
            }

            if ($value instanceof \DateTimeInterface) {
                return true;
            }
        }

        return false;
    }
}
