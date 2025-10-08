<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Centralizes authorization rules for comment creation, moderation, and engagement features.
 * Differentiates between guests, authors, and elevated roles when enforcing policies.
 */
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
        // Users can only update their own comments within 24 hours
        if ($user->id === $comment->user_id) {
            return $comment->created_at->diffInHours(now()) < 24;
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

    /**
     * Determine whether the user can approve comments.
     */
    public function approve(User $user): bool
    {
        // Only admins and moderators can approve comments
        return $user->hasRole('admin') || $user->hasRole('moderator') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can reject comments.
     */
    public function reject(User $user): bool
    {
        // Only admins and moderators can reject comments
        return $user->hasRole('admin') || $user->hasRole('moderator') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can mark comments as spam.
     */
    public function markAsSpam(User $user): bool
    {
        // Only admins and moderators can mark as spam
        return $user->hasRole('admin') || $user->hasRole('moderator') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can like a comment.
     */
    public function like(User $user, Comment $comment): bool
    {
        // Users cannot like their own comments
        if ($user->id === $comment->user_id) {
            return false;
        }

        // Can only like approved comments
        return $comment->status === 'approved';
    }

    /**
     * Determine whether the user can unlike a comment.
     */
    public function unlike(User $user, Comment $comment): bool
    {
        // Same rules as like
        return $this->like($user, $comment);
    }
}
