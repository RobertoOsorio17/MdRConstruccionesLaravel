<?php

namespace App\Policies;

use App\Models\Service;
use App\Models\User;

/**
 * Restricts management of service offerings to authorized staff while keeping published listings public.
 * Governs create, update, delete, and bulk operations within the services module.
 */
class ServicePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        // Anyone can view services
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Service $service): bool
    {
        // Anyone can view active services
        if ($service->is_active) {
            return true;
        }

        // Inactive services can only be viewed by admins/editors
        return $user && ($user->hasRole('admin') || $user->hasRole('editor'));
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admins and editors can create services
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Service $service): bool
    {
        // Only admins and editors can update services
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Service $service): bool
    {
        // Only admins can delete services
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Service $service): bool
    {
        // Only admins can restore services
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Service $service): bool
    {
        // Only admins can permanently delete services
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can toggle service status.
     */
    public function toggleStatus(User $user, Service $service): bool
    {
        // Only admins and editors can toggle status
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can perform bulk actions.
     */
    public function bulkAction(User $user): bool
    {
        // Only admins and editors can perform bulk actions
        return $user->hasRole('admin') || $user->hasRole('editor');
    }
}

