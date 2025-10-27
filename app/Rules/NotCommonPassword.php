<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validation rule to prevent use of common passwords
 * 
 * Checks against a list of the most commonly used passwords
 * to prevent weak password selection.
 */
class NotCommonPassword implements ValidationRule
{
    /**
     * List of common passwords to reject
     * 
     * @var array
     */
    private array $commonPasswords = [
        'password',
        'password123',
        '12345678',
        '123456789',
        '1234567890',
        'qwerty',
        'qwerty123',
        'abc123',
        'password1',
        'admin',
        'admin123',
        'letmein',
        'welcome',
        'welcome123',
        'monkey',
        'dragon',
        'master',
        'sunshine',
        'princess',
        'football',
        'iloveyou',
        'trustno1',
        'starwars',
        'passw0rd',
        'p@ssw0rd',
        'password!',
        'Password1',
        'Password123',
        'Admin123',
        'Welcome123',
        'Qwerty123',
        '1q2w3e4r',
        'zxcvbnm',
        'asdfghjkl',
        'qwertyuiop',
    ];

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Check if password is in common passwords list (case-insensitive)
        $lowercaseValue = strtolower($value);
        
        foreach ($this->commonPasswords as $commonPassword) {
            if ($lowercaseValue === strtolower($commonPassword)) {
                $fail('La contraseña es demasiado común. Por favor elige una contraseña más segura.');
                return;
            }
        }

        // Check for simple patterns
        if ($this->isSimplePattern($value)) {
            $fail('La contraseña contiene un patrón demasiado simple. Por favor elige una contraseña más compleja.');
            return;
        }

        // Check for keyboard patterns
        if ($this->isKeyboardPattern($value)) {
            $fail('La contraseña contiene un patrón de teclado común. Por favor elige una contraseña más segura.');
            return;
        }
    }

    /**
     * Check if password is a simple pattern (e.g., 11111111, aaaaaaaa)
     *
     * @param string $password
     * @return bool
     */
    private function isSimplePattern(string $password): bool
    {
        // Check for repeated characters
        if (preg_match('/^(.)\1+$/', $password)) {
            return true;
        }

        // Check for sequential numbers
        if (preg_match('/^(0123456789|1234567890|9876543210)/', $password)) {
            return true;
        }

        // Check for sequential letters
        if (preg_match('/^(abcdefgh|bcdefghi|cdefghij|defghijk)/i', $password)) {
            return true;
        }

        return false;
    }

    /**
     * Check if password is a keyboard pattern
     *
     * @param string $password
     * @return bool
     */
    private function isKeyboardPattern(string $password): bool
    {
        $keyboardPatterns = [
            'qwertyuiop',
            'asdfghjkl',
            'zxcvbnm',
            'qweasd',
            'asdzxc',
            '1qaz2wsx',
            'zaq1xsw2',
        ];

        $lowercasePassword = strtolower($password);

        foreach ($keyboardPatterns as $pattern) {
            if (str_contains($lowercasePassword, $pattern)) {
                return true;
            }
        }

        return false;
    }
}

