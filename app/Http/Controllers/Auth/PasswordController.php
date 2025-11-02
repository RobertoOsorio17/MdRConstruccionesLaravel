<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AdminSetting;
use App\Notifications\PasswordChangedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules\Password;

/**
 * Updates authenticated users' passwords while enforcing dynamic policy rules and audit metadata.
 * Validates the current credential, applies configurable complexity requirements, and records the change timestamp.
 */
class PasswordController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Update the specified resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return RedirectResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function update(Request $request): RedirectResponse
    {
        // ✅ SECURITY FIX: Minimum 12 characters (increased from 8)
        $minLength = max(12, AdminSetting::getCachedValue('password_min_length', 12, 300));

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => [
                'required',
                Password::min($minLength)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
                new \App\Rules\NotCommonPassword(), // ✅ Prevent common passwords
                new \App\Rules\NotPreviousPassword($request->user()), // ✅ Prevent password reuse
                'confirmed'
            ],
        ]);

        $user = $request->user();

        DB::transaction(function () use ($request, $user, $validated) {
            $attributes = [
                'password' => Hash::make($validated['password']),
            ];

            if (Schema::hasColumn($user->getTable(), 'password_changed_at')) {
                $attributes['password_changed_at'] = now();
            }

            $user->forceFill($attributes)->save();

            DB::table('sessions')
                ->where('user_id', $user->getAuthIdentifier())
                ->where('id', '!=', $request->session()->getId())
                ->delete();
        });

        $request->session()->regenerate(true);

        // ✅ SECURITY FIX: Log password change event
        \App\Services\SecurityLogger::logPasswordChange($user, [
            'method' => 'user_initiated',
            'sessions_invalidated' => true,
        ]);

        // ✅ SECURITY FIX: Send notification
        $user->notify(new PasswordChangedNotification([
            'ip' => $request->ip(),
            'method' => 'user_initiated',
        ]));

        return back();
    }
}
