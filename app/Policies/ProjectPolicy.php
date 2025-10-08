<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

/**
 * Controls who can manage construction projects within the admin suite.
 * Grants viewing to the public while restricting edits, deletions, and status changes to elevated roles.
 */
class ProjectPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        // Anyone can view projects
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Project $project): bool
    {
        // Anyone can view active projects
        if ($project->is_active) {
            return true;
        }

        // Inactive projects can only be viewed by admins/editors
        return $user && ($user->hasRole('admin') || $user->hasRole('editor'));
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admins and editors can create projects
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Project $project): bool
    {
        // Only admins and editors can update projects
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Project $project): bool
    {
        // Only admins can delete projects
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Project $project): bool
    {
        // Only admins can restore projects
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Project $project): bool
    {
        // Only admins can permanently delete projects
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can toggle project status.
     */
    public function toggleStatus(User $user, Project $project): bool
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

