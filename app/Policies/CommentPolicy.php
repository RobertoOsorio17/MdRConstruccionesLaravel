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

    
    
    
     * Handle view any.

    
    
    
     *

    
    
    
     * @param ?User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function viewAny(?User $user): bool
    {
        // Anyone can view approved comments
        return true;
    }

    
    
    
    
    /**

    
    
    
     * Handle view.

    
    
    
     *

    
    
    
     * @param ?User $user The user.

    
    
    
     * @param Comment $comment The comment.

    
    
    
     * @return bool

    
    
    
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

    
    
    
     * Show the form for creating a new resource.

    
    
    
     *

    
    
    
     * @param ?User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function create(?User $user): bool
    {
        // Anyone can create comments (including guests)
        return true;
    }

    
    
    
    
    /**

    
    
    
     * Update the specified resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Comment $comment The comment.

    
    
    
     * @return bool

    
    
    
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

    
    
    
     * Remove the specified resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Comment $comment The comment.

    
    
    
     * @return bool

    
    
    
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

    
    
    
     * Handle restore.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Comment $comment The comment.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function restore(User $user, Comment $comment): bool
    {
        // Only admins and moderators can restore comments
        return $user->hasRole('admin') || $user->hasRole('moderator');
    }

    
    
    
    
    /**

    
    
    
     * Handle force delete.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Comment $comment The comment.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function forceDelete(User $user, Comment $comment): bool
    {
        // Only admins can permanently delete comments
        return $user->hasRole('admin');
    }

    
    
    
    
    /**

    
    
    
     * Handle moderate.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Comment $comment The comment.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function moderate(User $user, Comment $comment): bool
    {
        // Only admins and moderators can moderate comments
        return $user->hasRole('admin') || $user->hasRole('moderator');
    }

    
    
    
    
    /**

    
    
    
     * Handle reply.

    
    
    
     *

    
    
    
     * @param ?User $user The user.

    
    
    
     * @param Comment $comment The comment.

    
    
    
     * @return bool

    
    
    
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

    
    
    
     * Handle approve.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function approve(User $user): bool
    {
        // Only admins and moderators can approve comments
        return $user->hasRole('admin') || $user->hasRole('moderator') || $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Handle reject.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function reject(User $user): bool
    {
        // Only admins and moderators can reject comments
        return $user->hasRole('admin') || $user->hasRole('moderator') || $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Handle mark as spam.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function markAsSpam(User $user): bool
    {
        // Only admins and moderators can mark as spam
        return $user->hasRole('admin') || $user->hasRole('moderator') || $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Handle like.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Comment $comment The comment.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function like(User $user, Comment $comment): bool
    {
        // Cannot like deleted comments
        if ($comment->trashed()) {
            return false;
        }

        // Can only like approved comments
        return $comment->status === 'approved';
    }

    
    
    
    
    /**

    
    
    
     * Handle unlike.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Comment $comment The comment.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function unlike(User $user, Comment $comment): bool
    {
        // Same rules as like
        return $this->like($user, $comment);
    }
}
