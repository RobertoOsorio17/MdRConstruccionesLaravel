<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\UpdatesUserPasswords;

/**
 * Supports authenticated password changes by validating the current credential and applying new policy rules.
 * Integrates with Fortify so in-session users can rotate their passwords without leaving the application.
 */
class UpdateUserPassword implements UpdatesUserPasswords
{
    use PasswordValidationRules;

    
    
    
    
    /**

    
    
    
     * Update the specified resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param array $input The input.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function update(User $user, array $input): void
    {
        Validator::make($input, [
            'current_password' => ['required', 'string', 'current_password:web'],
            'password' => $this->passwordUpdateRules($user), // ✅ SECURITY FIX: Use update rules with previous password check
        ], [
            'current_password.current_password' => __('The provided password does not match your current password.'),
        ])->validateWithBag('updatePassword');

        // ✅ SECURITY FIX: Save current password to history before updating
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
