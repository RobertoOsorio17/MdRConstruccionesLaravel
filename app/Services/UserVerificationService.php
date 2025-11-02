<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * User Verification Service
 * 
 * Handles all business logic related to user verification including
 * verification, unverification, and logging of verification actions.
 * 
 * @package App\Services
 */
class UserVerificationService
{
    /**
     * Verify a user account.
     * 
     * Marks the user as verified, records the verifying administrator,
     * and logs the action for audit purposes.
     *
     * @param User $user The user to verify.
     * @param User $admin The administrator performing the verification.
     * @param string|null $notes Optional verification notes.
     * @return bool True if verification was successful.
     * 
     * @throws \Exception If verification fails.
     * 
     * @example
     * $service = new UserVerificationService();
     * $success = $service->verifyUser($user, $admin, 'Identity documents verified');
     */
    public function verifyUser(User $user, User $admin, ?string $notes = null): bool
    {
        $success = $user->verify($admin, $notes);

        if ($success) {
            Log::info('User verified', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'verified_by' => $admin->id,
                'verification_notes' => $notes,
                'timestamp' => now()->toISOString()
            ]);
        }

        return $success;
    }

    /**
     * Remove verification from a user account.
     * 
     * Marks the user as unverified, records the administrator who removed verification,
     * and logs the action for audit purposes.
     *
     * @param User $user The user to unverify.
     * @param User $admin The administrator performing the unverification.
     * @param string|null $notes Optional notes explaining the unverification.
     * @return bool True if unverification was successful.
     * 
     * @throws \Exception If unverification fails.
     * 
     * @example
     * $service = new UserVerificationService();
     * $success = $service->unverifyUser($user, $admin, 'Suspicious activity detected');
     */
    public function unverifyUser(User $user, User $admin, ?string $notes = null): bool
    {
        $success = $user->unverify($admin, $notes);

        if ($success) {
            Log::info('User unverified', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'unverified_by' => $admin->id,
                'verification_notes' => $notes,
                'timestamp' => now()->toISOString()
            ]);
        }

        return $success;
    }

    /**
     * Check if a user can be verified by the given administrator.
     * 
     * Validates that the administrator has permission to verify users
     * and that they are not attempting to verify themselves.
     *
     * @param User $user The user to verify.
     * @param User $admin The administrator attempting verification.
     * @return array{canVerify: bool, reason: string|null} Validation result.
     * 
     * @example
     * $service = new UserVerificationService();
     * $result = $service->canVerifyUser($user, $admin);
     * if (!$result['canVerify']) {
     *     throw new \Exception($result['reason']);
     * }
     */
    public function canVerifyUser(User $user, User $admin): array
    {
        if (!$admin->hasRole('admin')) {
            return [
                'canVerify' => false,
                'reason' => 'You do not have permission to verify users.'
            ];
        }

        if ($user->id === $admin->id) {
            return [
                'canVerify' => false,
                'reason' => 'You cannot verify yourself.'
            ];
        }

        return [
            'canVerify' => true,
            'reason' => null
        ];
    }

    /**
     * Check if a user can be unverified by the given administrator.
     * 
     * Validates that the administrator has permission to unverify users
     * and that they are not attempting to unverify themselves.
     *
     * @param User $user The user to unverify.
     * @param User $admin The administrator attempting unverification.
     * @return array{canUnverify: bool, reason: string|null} Validation result.
     * 
     * @example
     * $service = new UserVerificationService();
     * $result = $service->canUnverifyUser($user, $admin);
     * if (!$result['canUnverify']) {
     *     throw new \Exception($result['reason']);
     * }
     */
    public function canUnverifyUser(User $user, User $admin): array
    {
        if (!$admin->hasRole('admin')) {
            return [
                'canUnverify' => false,
                'reason' => 'You do not have permission to unverify users.'
            ];
        }

        if ($user->id === $admin->id) {
            return [
                'canUnverify' => false,
                'reason' => 'You cannot unverify yourself.'
            ];
        }

        return [
            'canUnverify' => true,
            'reason' => null
        ];
    }
}

