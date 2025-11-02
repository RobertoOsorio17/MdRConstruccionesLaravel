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

    
    
    
     * Handle view any.

    
    
    
     *

    
    
    
     * @param ?User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function viewAny(?User $user): bool
    {
        // Anyone can view projects
        return true;
    }

    
    
    
    
    /**

    
    
    
     * Handle view.

    
    
    
     *

    
    
    
     * @param ?User $user The user.

    
    
    
     * @param Project $project The project.

    
    
    
     * @return bool

    
    
    
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

    
    
    
     * Show the form for creating a new resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function create(User $user): bool
    {
        // Only admins and editors can create projects
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Update the specified resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Project $project The project.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function update(User $user, Project $project): bool
    {
        // Only admins and editors can update projects
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Remove the specified resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Project $project The project.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function delete(User $user, Project $project): bool
    {
        // Only admins can delete projects
        return $user->hasRole('admin');
    }

    
    
    
    
    /**

    
    
    
     * Handle restore.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Project $project The project.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function restore(User $user, Project $project): bool
    {
        // Only admins can restore projects
        return $user->hasRole('admin');
    }

    
    
    
    
    /**

    
    
    
     * Handle force delete.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Project $project The project.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function forceDelete(User $user, Project $project): bool
    {
        // Only admins can permanently delete projects
        return $user->hasRole('admin');
    }

    
    
    
    
    /**

    
    
    
     * Handle toggle status.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Project $project The project.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function toggleStatus(User $user, Project $project): bool
    {
        // Only admins and editors can toggle status
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Handle bulk action.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function bulkAction(User $user): bool
    {
        // Only admins and editors can perform bulk actions
        return $user->hasRole('admin') || $user->hasRole('editor');
    }
}

