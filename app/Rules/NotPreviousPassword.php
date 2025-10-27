<?php

namespace App\Rules;

use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Hash;

/**
 * Validation rule to prevent password reuse
 * 
 * Checks if the new password matches the user's current password
 * to prevent password reuse.
 */
class NotPreviousPassword implements ValidationRule
{
    /**
     * The user whose password is being changed
     *
     * @var User|null
     */
    private ?User $user;

    /**
     * Create a new rule instance.
     *
     * @param User|null $user
     */
    public function __construct(?User $user = null)
    {
        $this->user = $user;
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // If no user provided, skip validation (for new user registration)
        if (!$this->user) {
            return;
        }

        // Check if new password matches current password
        if (Hash::check($value, $this->user->password)) {
            $fail('La nueva contraseña no puede ser igual a tu contraseña actual. Por favor elige una contraseña diferente.');
            return;
        }

        // Optional: Check against password history if you implement it
        // This would require a password_history table to store hashed previous passwords
        if ($this->matchesPasswordHistory($value)) {
            $fail('Esta contraseña ya ha sido utilizada anteriormente. Por favor elige una contraseña diferente.');
            return;
        }
    }

    /**
     * Check if password matches any in password history
     * 
     * Note: This requires implementing a password_history table
     * For now, this is a placeholder for future implementation
     *
     * @param string $password
     * @return bool
     */
    private function matchesPasswordHistory(string $password): bool
    {
        // TODO: Implement password history checking
        // This would require:
        // 1. A password_history table with columns: user_id, password_hash, created_at
        // 2. Storing last N password hashes when password is changed
        // 3. Checking new password against stored hashes
        
        // Example implementation:
        /*
        $passwordHistory = DB::table('password_history')
            ->where('user_id', $this->user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5) // Check last 5 passwords
            ->get();

        foreach ($passwordHistory as $history) {
            if (Hash::check($password, $history->password_hash)) {
                return true;
            }
        }
        */

        return false;
    }
}

