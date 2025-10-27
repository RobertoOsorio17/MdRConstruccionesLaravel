<?php

namespace App\Actions\Fortify;

use App\Models\AdminSetting;
use Illuminate\Validation\Rules\Password;

/**
 * Reusable password validation constraints aligned with configurable security policies.
 * Provides Fortify actions a single source of truth for minimum length and complexity requirements.
 */
trait PasswordValidationRules
{
    /**
     * Get the validation rules used to validate passwords.
     * Uses password_min_length setting from admin settings.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function passwordRules(): array
    {
        // ✅ SECURITY FIX: Increased minimum password length from 8 to 12 characters
        $minLength = max(12, AdminSetting::getCachedValue('password_min_length', 12, 300));

        return [
            'required',
            'string',
            Password::min($minLength)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->uncompromised(), // Laravel's built-in check against pwned passwords
            new \App\Rules\NotCommonPassword(), // ✅ SECURITY FIX: Prevent common passwords
            'confirmed'
        ];
    }

    /**
     * Get password rules for password updates (includes previous password check)
     *
     * @param \App\Models\User|null $user
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function passwordUpdateRules($user = null): array
    {
        $minLength = max(12, AdminSetting::getCachedValue('password_min_length', 12, 300));

        return [
            'required',
            'string',
            Password::min($minLength)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->uncompromised(),
            new \App\Rules\NotCommonPassword(),
            new \App\Rules\NotPreviousPassword($user), // ✅ SECURITY FIX: Prevent password reuse
            'confirmed'
        ];
    }
}
