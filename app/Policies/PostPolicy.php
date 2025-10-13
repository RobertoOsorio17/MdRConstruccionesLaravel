<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Encapsulates authorization logic for creating, editing, and maintaining blog posts.
 * Applies different permissions for authors, editors, and administrators depending on the action.
 */
class PostPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        // Anyone can view published posts
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Post $post): bool
    {
        // Published posts can be viewed by anyone
        if ($post->status === 'published' && $post->published_at <= now()) {
            return true;
        }

        // Unpublished posts can only be viewed by the author or admins
        if ($user) {
            return $user->id === $post->user_id ||
                   $user->hasRole('admin') ||
                   $user->hasRole('editor');
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only authenticated users with appropriate roles can create posts
        return $user->hasRole('admin') ||
               $user->hasRole('editor') ||
               $user->hasRole('author');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Post $post): bool
    {
        // Authors can update their own posts, admins and editors can update any post
        return $user->id === $post->user_id ||
               $user->hasRole('admin') ||
               $user->hasRole('editor');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Post $post): bool
    {
        // Authors can delete their own posts, admins can delete any post
        return $user->id === $post->user_id ||
               $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Post $post): bool
    {
        // Only admins can restore posts
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Post $post): bool
    {
        // Only admins can permanently delete posts
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can publish the model.
     */
    public function publish(User $user, Post $post): bool
    {
        // Authors can publish their own posts, admins and editors can publish any post
        return $user->id === $post->user_id ||
               $user->hasRole('admin') ||
               $user->hasRole('editor');
    }

    /**
     * Determine whether the user can feature the model.
     */
    public function feature(User $user, Post $post): bool
    {
        // Only admins and editors can feature posts
        return $user->hasRole('admin') ||
               $user->hasRole('editor');
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

