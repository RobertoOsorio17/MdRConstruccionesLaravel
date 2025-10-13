<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

/**
 * Governs authorization for category management tasks across the admin panel.
 * Differentiates permissions for viewing, editing, and reordering taxonomy records.
 */
class CategoryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        // Anyone can view categories
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Category $category): bool
    {
        // Anyone can view active categories
        if ($category->is_active) {
            return true;
        }

        // Inactive categories can only be viewed by admins/editors
        return $user && ($user->hasRole('admin') || $user->hasRole('editor'));
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admins and editors can create categories
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Category $category): bool
    {
        // Only admins and editors can update categories
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Category $category): bool
    {
        // Check if category has posts
        if ($category->posts()->count() > 0) {
            // Only admins can delete categories with posts
            return $user->hasRole('admin');
        }

        // Editors can delete empty categories
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Category $category): bool
    {
        // Only admins can restore categories
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Category $category): bool
    {
        // Only admins can permanently delete categories
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can toggle category status.
     */
    public function toggleStatus(User $user, Category $category): bool
    {
        // Only admins and editors can toggle status
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can reorder categories.
     */
    public function updateOrder(User $user): bool
    {
        // Only admins and editors can reorder categories
        return $user->hasRole('admin') || $user->hasRole('editor');
    }
}

