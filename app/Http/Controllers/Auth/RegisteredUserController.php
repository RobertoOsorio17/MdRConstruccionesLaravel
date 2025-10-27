<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AdminSetting;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Coordinates the public registration workflow, from form rendering to account provisioning and policy enforcement.
 * Applies dynamic password rules, audit logging, and optional approval flows to protect onboarding quality.
 */
class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/RegisterNew');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Check if registration is enabled
        $registrationEnabled = AdminSetting::getCachedValue('registration_enabled', true, 300);

        if (!$registrationEnabled) {
            abort(403, 'El registro de nuevos usuarios está deshabilitado temporalmente.');
        }

        // ✅ SECURITY FIX: Stronger password requirements (minimum 12 characters)
        $minLength = max(12, AdminSetting::getCachedValue('password_min_length', 12, 300));
        $requireSpecial = AdminSetting::getCachedValue('password_require_special', true, 300);

        // Build password rules dynamically with stronger requirements
        $passwordRules = Rules\Password::min($minLength)
            ->letters()
            ->mixedCase()
            ->numbers()
            ->symbols() // ✅ Require special characters
            ->uncompromised();

        // Add symbols requirement if enabled
        if ($requireSpecial) {
            $passwordRules->symbols();
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => [
                'required',
                'confirmed',
                $passwordRules
            ],
            'terms' => 'required|accepted',
        ]);

        // Check if auto-approve is enabled
        $autoApprove = AdminSetting::getCachedValue('registration_auto_approve', true, 300);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'status' => $autoApprove ? 'active' : 'pending',
            'password_changed_at' => now(),
        ]);

        // Check if email verification is required
        $requireEmailVerification = AdminSetting::getCachedValue('registration_require_email_verification', true, 300);

        if ($requireEmailVerification) {
            event(new Registered($user));
        }

        // Only login if user is auto-approved (status is 'active')
        if ($autoApprove) {
            Auth::login($user);

            // Redirect based on email verification requirement
            if ($requireEmailVerification && !$user->hasVerifiedEmail()) {
                return redirect(route('verification.notice'))
                    ->with('success', 'Registrado correctamente. Por favor verifica tu email.');
            }

            // Redirect all users to their dashboard with success message
            return redirect(route('user.dashboard', absolute: false))
                ->with('success', 'Registrado correctamente');
        }

        // If not auto-approved, redirect to login with pending message
        return redirect(route('login'))
            ->with('info', 'Tu cuenta ha sido creada y está pendiente de aprobación. Te notificaremos cuando sea activada.');
    }
}
