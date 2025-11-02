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

    
    
    
     * Handle view any.

    
    
    
     *

    
    
    
     * @param ?User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function viewAny(?User $user): bool
    {
        // Anyone can view categories
        return true;
    }

    
    
    
    
    /**

    
    
    
     * Handle view.

    
    
    
     *

    
    
    
     * @param ?User $user The user.

    
    
    
     * @param Category $category The category.

    
    
    
     * @return bool

    
    
    
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

    
    
    
     * Show the form for creating a new resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function create(User $user): bool
    {
        // Only admins and editors can create categories
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Update the specified resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Category $category The category.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function update(User $user, Category $category): bool
    {
        // Only admins and editors can update categories
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Remove the specified resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Category $category The category.

    
    
    
     * @return bool

    
    
    
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

    
    
    
     * Handle restore.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Category $category The category.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function restore(User $user, Category $category): bool
    {
        // Only admins can restore categories
        return $user->hasRole('admin');
    }

    
    
    
    
    /**

    
    
    
     * Handle force delete.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Category $category The category.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function forceDelete(User $user, Category $category): bool
    {
        // Only admins can permanently delete categories
        return $user->hasRole('admin');
    }

    
    
    
    
    /**

    
    
    
     * Handle toggle status.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Category $category The category.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function toggleStatus(User $user, Category $category): bool
    {
        // Only admins and editors can toggle status
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Handle update order.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function updateOrder(User $user): bool
    {
        // Only admins and editors can reorder categories
        return $user->hasRole('admin') || $user->hasRole('editor');
    }
}

