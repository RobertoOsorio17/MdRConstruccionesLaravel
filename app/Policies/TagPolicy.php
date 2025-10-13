<?php

namespace App\Policies;

use App\Models\Tag;
use App\Models\User;

/**
 * Handles authorization for tag maintenance, allowing editors and admins to curate taxonomy entries.
 * Applies stricter rules when tags are associated with existing posts.
 */
class TagPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        // Anyone can view tags
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Tag $tag): bool
    {
        // Anyone can view tags
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admins and editors can create tags
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Tag $tag): bool
    {
        // Only admins and editors can update tags
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Tag $tag): bool
    {
        // Check if tag has posts
        if ($tag->posts()->count() > 0) {
            // Only admins can delete tags with posts
            return $user->hasRole('admin');
        }

        // Editors can delete empty tags
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Tag $tag): bool
    {
        // Only admins can restore tags
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Tag $tag): bool
    {
        // Only admins can permanently delete tags
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can merge tags.
     */
    public function merge(User $user): bool
    {
        // Only admins can merge tags
        return $user->hasRole('admin');
    }
}

