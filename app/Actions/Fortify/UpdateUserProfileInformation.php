<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\UpdatesUserProfileInformation;

/**
 * Implements Fortify's profile-update contract, validating core identity fields and handling email verification resets.
 * Keeps user records synchronized while respecting unique constraints and re-triggering verification when needed.
 */
class UpdateUserProfileInformation implements UpdatesUserProfileInformation
{
    
    
    
    
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
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
        ])->validateWithBag('updateProfileInformation');

        if ($input['email'] !== $user->email &&
            $user instanceof MustVerifyEmail) {
            $this->updateVerifiedUser($user, $input);
        } else {
            $user->forceFill([
                'name' => $input['name'],
                'email' => $input['email'],
            ])->save();
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle update verified user.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param array $input The input.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    protected function updateVerifiedUser(User $user, array $input): void
    {
        $user->forceFill([
            'name' => $input['name'],
            'email' => $input['email'],
            'email_verified_at' => null,
        ])->save();

        $user->sendEmailVerificationNotification();
    }
}
