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

    
    
    
     * Handle password rules.

    
    
    
     *

    
    
    
     * @return array

    
    
    
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

    
    
    
     * Handle password update rules.

    
    
    
     *

    
    
    
     * @param mixed $user The user.

    
    
    
     * @return array

    
    
    
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
