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
        // Get minimum password length from settings (default: 8)
        $minLength = AdminSetting::getCachedValue('password_min_length', 8, 300);

        return [
            'required',
            'string',
            Password::min($minLength)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->uncompromised(),
            'confirmed'
        ];
    }
}
