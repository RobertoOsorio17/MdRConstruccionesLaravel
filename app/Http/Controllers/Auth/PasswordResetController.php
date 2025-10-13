<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Orchestrates password reset link distribution by validating requests and delegating to Laravel's broker services.
 * Provides actionable feedback for the front-end flow while preserving localized messaging for end users.
 */
class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'Introduce un email vÃƒÆ’Ã‚Â¡lido.',
        ]);

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}

/**
 * Finalizes password reset attempts by validating tokens and persisting new credentials securely.
 * Applies comprehensive password rules, emits lifecycle events, and ensures sensitive session cleanup.
 */
class NewPasswordController extends Controller
{
    /**
     * Display the password reset view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => [
                'required',
                'confirmed',
                Rules\Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
            ],
        ], [
            'token.required' => 'Token de recuperaciÃƒÆ’Ã‚Â³n requerido.',
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'Introduce un email vÃƒÆ’Ã‚Â¡lido.',
            'password.required' => 'La contraseÃƒÆ’Ã‚Â±a es obligatoria.',
            'password.confirmed' => 'Las contraseÃƒÆ’Ã‚Â±as no coinciden.',
            'password.min' => 'La contraseÃƒÆ’Ã‚Â±a debe tener al menos 8 caracteres.',
            'password.letters' => 'La contraseÃƒÆ’Ã‚Â±a debe contener al menos una letra.',
            'password.mixed_case' => 'La contraseÃƒÆ’Ã‚Â±a debe contener mayÃƒÆ’Ã‚Âºsculas y minÃƒÆ’Ã‚Âºsculas.',
            'password.numbers' => 'La contraseÃƒÆ’Ã‚Â±a debe contener al menos un nÃƒÆ’Ã‚Âºmero.',
            'password.symbols' => 'La contraseÃƒÆ’Ã‚Â±a debe contener al menos un sÃƒÆ’Ã‚Â­mbolo.',
            'password.uncompromised' => 'Esta contraseÃƒÆ’Ã‚Â±a ha aparecido en filtraciones de datos. Elige una diferente.',
        ]);

        // Here we will attempt to reset the user's password. If it is successful we
        // will update the password on an actual user model and persist it to the
        // database. Otherwise we will parse the error and return the response.
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('status', 'Tu contraseÃƒÆ’Ã‚Â±a ha sido restablecida correctamente. Ya puedes iniciar sesiÃƒÆ’Ã‚Â³n.');
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}
