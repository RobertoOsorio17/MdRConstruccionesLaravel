<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AdminSetting;
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
 * Completes the password reset process once users arrive from their emailed token link.
 * Validates the reset payload, enforces policy settings, and rotates credentials while emitting password reset events.
 */
class NewPasswordController extends Controller
{
    /**
     * Display the password reset view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPasswordNew', [
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
        // ✅ SECURITY FIX: Minimum 12 characters (increased from 8)
        $minLength = max(12, AdminSetting::getCachedValue('password_min_length', 12, 300));

        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => [
                'required',
                'confirmed',
                Rules\Password::min($minLength)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
                new \App\Rules\NotCommonPassword(), // ✅ Prevent common passwords
            ],
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
                'token' => __('This password reset link has already been used. Please request a new link.'),
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

        // If the password was successfully reset, we will redirect the user back to
        // the application's home authenticated view. If there is an error we can
        // redirect them back to where they came from with their error message.
        if ($status == Password::PASSWORD_RESET) {
            session()->flash('status', __($status));
            return redirect()->route('login');
        }

        Log::notice('Password reset attempt failed', [
            'status' => $status,
            'email_hash' => sha1(strtolower($request->input('email'))),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        throw ValidationException::withMessages([
            'email' => __('We could not reset your password with the supplied information. Please request a new recovery email and try again.'),
        ]);
    }
}
