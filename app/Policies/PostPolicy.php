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

    
    
    
     * Handle view any.

    
    
    
     *

    
    
    
     * @param ?User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function viewAny(?User $user): bool
    {
        // Anyone can view published posts
        return true;
    }

    
    
    
    
    /**

    
    
    
     * Handle view.

    
    
    
     *

    
    
    
     * @param ?User $user The user.

    
    
    
     * @param Post $post The post.

    
    
    
     * @return bool

    
    
    
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

    
    
    
     * Show the form for creating a new resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function create(User $user): bool
    {
        // Only authenticated users with appropriate roles can create posts
        return $user->hasRole('admin') ||
               $user->hasRole('editor') ||
               $user->hasRole('author');
    }

    
    
    
    
    /**

    
    
    
     * Update the specified resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Post $post The post.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function update(User $user, Post $post): bool
    {
        // Authors can update their own posts, admins and editors can update any post
        return $user->id === $post->user_id ||
               $user->hasRole('admin') ||
               $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Remove the specified resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Post $post The post.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function delete(User $user, Post $post): bool
    {
        // Authors can delete their own posts, admins can delete any post
        return $user->id === $post->user_id ||
               $user->hasRole('admin');
    }

    
    
    
    
    /**

    
    
    
     * Handle restore.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Post $post The post.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function restore(User $user, Post $post): bool
    {
        // Only admins can restore posts
        return $user->hasRole('admin');
    }

    
    
    
    
    /**

    
    
    
     * Handle force delete.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Post $post The post.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function forceDelete(User $user, Post $post): bool
    {
        // Only admins can permanently delete posts
        return $user->hasRole('admin');
    }

    
    
    
    
    /**

    
    
    
     * Handle publish.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Post $post The post.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function publish(User $user, Post $post): bool
    {
        // Authors can publish their own posts, admins and editors can publish any post
        return $user->id === $post->user_id ||
               $user->hasRole('admin') ||
               $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Handle feature.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Post $post The post.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function feature(User $user, Post $post): bool
    {
        // Only admins and editors can feature posts
        return $user->hasRole('admin') ||
               $user->hasRole('editor');
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

