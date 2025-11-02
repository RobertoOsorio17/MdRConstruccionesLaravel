<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\ResetsUserPasswords;

/**
 * Drives Fortify's password reset workflow by validating input and securely rotating credentials.
 * Applies shared password policy traits and records change metadata once the hash is updated.
 */
class ResetUserPassword implements ResetsUserPasswords
{
    use PasswordValidationRules;

    
    
    
    
    /**

    
    
    
     * Handle reset.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param array $input The input.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function reset(User $user, array $input): void
    {
        Validator::make($input, [
            'password' => $this->passwordRules(),
        ])->validate();

        // ✅ SECURITY FIX: Save current password to history before resetting
        if ($user->password) {
            DB::table('password_history')->insert([
                'user_id' => $user->id,
                'password_hash' => $user->password,
                'created_at' => now(),
            ]);

            // Keep only last 5 passwords in history
            $oldPasswords = DB::table('password_history')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->skip(5)
                ->pluck('id');

            if ($oldPasswords->isNotEmpty()) {
                DB::table('password_history')->whereIn('id', $oldPasswords)->delete();
            }
        }

        $user->forceFill([
            'password' => Hash::make($input['password']),
            'password_changed_at' => now(),
        ])->save();
    }
}
