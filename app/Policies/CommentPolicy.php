<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CommentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        // Anyone can view approved comments
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Comment $comment): bool
    {
        // Approved comments can be viewed by anyone
        if ($comment->status === 'approved') {
            return true;
        }

        // Pending/rejected comments can only be viewed by the author or admins
        if ($user) {
            return $user->id === $comment->user_id ||
                   $user->hasRole('admin') ||
                   $user->hasRole('moderator');
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(?User $user): bool
    {
        // Anyone can create comments (including guests)
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Comment $comment): bool
    {
        // Users can only update their own comments within 15 minutes
        if ($user->id === $comment->user_id) {
            return $comment->created_at->diffInMinutes(now()) <= 15;
        }

        // Admins and moderators can update any comment
        return $user->hasRole('admin') || $user->hasRole('moderator');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Comment $comment): bool
    {
        // Users can delete their own comments
        if ($user->id === $comment->user_id) {
            return true;
        }

        // Admins and moderators can delete any comment
        return $user->hasRole('admin') || $user->hasRole('moderator');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Comment $comment): bool
    {
        // Only admins and moderators can restore comments
        return $user->hasRole('admin') || $user->hasRole('moderator');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Comment $comment): bool
    {
        // Only admins can permanently delete comments
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can moderate the model.
     */
    public function moderate(User $user, Comment $comment): bool
    {
        // Only admins and moderators can moderate comments
        return $user->hasRole('admin') || $user->hasRole('moderator');
    }

    /**
     * Determine whether the user can reply to the model.
     */
    public function reply(?User $user, Comment $comment): bool
    {
        // Can only reply to approved comments
        if ($comment->status !== 'approved') {
            return false;
        }

        // Anyone can reply (including guests)
        return true;
    }
}
