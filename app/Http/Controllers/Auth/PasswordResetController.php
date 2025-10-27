<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Schema;
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
        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_THROTTLED) {
            throw ValidationException::withMessages([
                'email' => __('Demasiadas solicitudes de recuperación. Intenta nuevamente en unos minutos.'),
            ]);
        }

        if ($status !== Password::RESET_LINK_SENT) {
            Log::notice('Password reset link request for non-matching account', [
                'email_hash' => sha1(strtolower($request->input('email'))),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return back()->with('status', __('Si el correo electrónico existe en nuestros registros, recibirás un enlace de recuperación en los próximos minutos.'));
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
     * ✅ SECURITY FIX: Stronger password requirements
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
                Rules\Password::min(12) // ✅ SECURITY FIX: Increased from 8 to 12
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
                new \App\Rules\NotCommonPassword(), // ✅ Prevent common passwords
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
        $tokenKey = 'password_reset_used:' . hash('sha256', (string) $request->input('token'));

        if (Cache::has($tokenKey)) {
            Log::warning('Password reset token reuse attempt detected', [
                'email_hash' => sha1(strtolower($request->input('email'))),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            throw ValidationException::withMessages([
                'token' => __('Este enlace de recuperación ya fue utilizado. Solicita uno nuevo para continuar.'),
            ]);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request, $tokenKey) {
                $attributes = [
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ];

                if (Schema::hasColumn($user->getTable(), 'password_changed_at')) {
                    $attributes['password_changed_at'] = now();
                }

                $user->forceFill($attributes)->save();

                Cache::put($tokenKey, true, now()->addHour());

                DB::table('sessions')->where('user_id', $user->getAuthIdentifier())->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('status', 'Tu contraseÃƒÆ’Ã‚Â±a ha sido restablecida correctamente. Ya puedes iniciar sesiÃƒÆ’Ã‚Â³n.');
        }

        Log::notice('Password reset attempt failed', [
            'status' => $status,
            'email_hash' => sha1(strtolower($request->input('email'))),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        throw ValidationException::withMessages([
            'email' => __('No fue posible restablecer la contraseña con la información proporcionada. Solicita un nuevo enlace e inténtalo nuevamente.'),
        ]);
    }
}
