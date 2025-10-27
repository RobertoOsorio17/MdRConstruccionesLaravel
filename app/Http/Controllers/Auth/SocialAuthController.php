<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Auth\Concerns\HandlesTwoFactorLogin;
use App\Http\Controllers\Controller;
use App\Models\User;
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
     * Redirect the user to the OAuth provider authentication page.
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
            session()->put("oauth_state:{$provider}", $state);

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
     * Obtain the user information from OAuth provider.
     */
    public function callback(Request $request, string $provider)
    {
        if (!in_array($provider, self::SUPPORTED_PROVIDERS)) {
            session()->flash('error', 'Proveedor de autenticación no soportado.');
            return redirect()->route('login');
        }

        $expectedState = session()->pull("oauth_state:{$provider}");

        if (empty($expectedState) || !hash_equals($expectedState, (string) $request->input('state'))) {
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

        if (empty($socialUser->getEmail())) {
            session()->flash('error', 'El proveedor no devolvió un correo electrónico válido. No se pudo completar el acceso.');
            return redirect()->route('login');
        }

        $emailVerified = $this->providerMarksEmailVerified($socialUser);

        $user = $this->findOrCreateUser($socialUser, $provider, $emailVerified);

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

        if (Auth::check() && Auth::id() === $user->id) {
            session()->flash('success', '¡Bienvenido de vuelta, ' . $user->name . '!');
        } else {
            session()->flash('info', 'Completa la verificación de dos factores para finalizar el acceso.');
        }

        return $response;
    }

    /**
     * Find or create a user based on OAuth provider data.
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
     * Unlink OAuth provider from user account.
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
     * Show connected accounts page.
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
     * Determine if the provider explicitly marks the email as verified.
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
