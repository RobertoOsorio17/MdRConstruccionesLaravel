<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Outlines authorization rules for managing user accounts, including self-service exceptions.
 * Ensures administrative safeguards around role changes, banning, and verification.
 */
class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Only admins can view user lists
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        // Users can view their own profile
        if ($user->id === $model->id) {
            return true;
        }

        // Public profiles can be viewed by anyone
        if ($model->profile_visibility === 'public') {
            return true;
        }

        // Private profiles can only be viewed by admins
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admins can create users through admin panel
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        // Users can update their own profile
        if ($user->id === $model->id) {
            return true;
        }

        // Admins can update any user
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // Users cannot delete themselves
        if ($user->id === $model->id) {
            return false;
        }

        // Only admins can delete users
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        // Only admins can restore users
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        // Only admins can permanently delete users
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can manage roles for the model.
     */
    public function manageRoles(User $user, User $model): bool
    {
        // Users cannot manage their own roles
        if ($user->id === $model->id) {
            return false;
        }

        // Only admins can manage roles
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can ban the model.
     */
    public function ban(User $user, User $model): bool
    {
        // Users cannot ban themselves
        if ($user->id === $model->id) {
            return false;
        }

        // Cannot ban other admins
        if ($model->hasRole('admin')) {
            return false;
        }

        // Only admins can ban users
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can verify the model.
     */
    public function verify(User $user, User $model): bool
    {
        // Users cannot verify themselves
        if ($user->id === $model->id) {
            return false;
        }

        // Only admins can verify users
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can impersonate the model.
     */
    public function impersonate(User $admin, User $target): bool
    {
        // Cannot impersonate yourself
        if ($admin->id === $target->id) {
            return false;
        }

        // Only admins can impersonate
        if (!$admin->hasRole('admin')) {
            return false;
        }

        // Cannot impersonate other admins or super-admins
        $blockedRoles = config('impersonation.blocked_roles', ['admin', 'super-admin']);
        foreach ($blockedRoles as $role) {
            if ($target->hasRole($role)) {
                return false;
            }
        }

        // Cannot impersonate banned/suspended users
        if ($target->isBanned()) {
            return false;
        }

        // Check if admin has 2FA enabled (if required by config)
        if (config('impersonation.require_2fa', true)) {
            if (!$admin->two_factor_secret) {
                return false;
            }
        }

        return true;
    }
}
