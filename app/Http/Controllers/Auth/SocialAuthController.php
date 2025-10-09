<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
            return Socialite::driver($provider)->redirect();
        } catch (Exception $e) {
            // Flash error to session for Inertia to pick up
            session()->flash('error', 'Error al conectar con ' . ucfirst($provider) . '. Por favor, intenta de nuevo.');
            return redirect()->route('login');
        }
    }

    /**
     * Obtain the user information from OAuth provider.
     */
    public function callback(string $provider)
    {
        if (!in_array($provider, self::SUPPORTED_PROVIDERS)) {
            session()->flash('error', 'Proveedor de autenticación no soportado.');
            return redirect()->route('login');
        }

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (Exception $e) {
            session()->flash('error', 'Error al autenticar con ' . ucfirst($provider) . '. Por favor, intenta de nuevo.');
            return redirect()->route('login');
        }

        // Find or create user
        $user = $this->findOrCreateUser($socialUser, $provider);

        // Log the user in
        Auth::login($user, true);

        // Redirect based on role (use hasRole method from Spatie)
        if ($user->hasRole('admin')) {
            session()->flash('success', '¡Bienvenido de vuelta, ' . $user->name . '!');
            return redirect()->route('admin.dashboard');
        }

        session()->flash('success', '¡Bienvenido de vuelta, ' . $user->name . '!');
        return redirect()->route('dashboard');
    }

    /**
     * Find or create a user based on OAuth provider data.
     */
    private function findOrCreateUser($socialUser, string $provider): User
    {
        // Check if user already exists with this provider
        $user = User::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($user) {
            // Update tokens
            $user->update([
                'provider_token' => $socialUser->token,
                'provider_refresh_token' => $socialUser->refreshToken ?? null,
            ]);

            return $user;
        }

        // Check if user exists with same email
        $existingUser = User::where('email', $socialUser->getEmail())->first();

        if ($existingUser) {
            // Link OAuth account to existing user
            $existingUser->update([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'provider_token' => $socialUser->token,
                'provider_refresh_token' => $socialUser->refreshToken ?? null,
            ]);

            return $existingUser;
        }

        // Create new user
        $user = User::create([
            'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'Usuario',
            'email' => $socialUser->getEmail(),
            'email_verified_at' => now(), // OAuth users are pre-verified
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'provider_token' => $socialUser->token,
            'provider_refresh_token' => $socialUser->refreshToken ?? null,
            'password' => null, // OAuth users don't need password
            'avatar' => $socialUser->getAvatar() ?? null,
        ]);

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
}

