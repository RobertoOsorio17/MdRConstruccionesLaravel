<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Manages authorization for customer reviews, distinguishing self-service edits from moderator controls.
 * Restricts moderation powers to admins and editors while allowing users to manage their pending feedback.
 */
class ReviewPolicy
{
    
    
    
    
    /**

    
    
    
     * Handle view any.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Handle view.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Review $review The review.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function view(User $user, Review $review): bool
    {
        // Admins and editors can view all reviews
        if ($user->hasRole('admin') || $user->hasRole('editor')) {
            return true;
        }

        // Users can view their own reviews
        return $user->id === $review->user_id;
    }

    
    
    
    
    /**

    
    
    
     * Show the form for creating a new resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function create(User $user): bool
    {
        // Only authenticated users can create reviews
        return true;
    }

    
    
    
    
    /**

    
    
    
     * Update the specified resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Review $review The review.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function update(User $user, Review $review): bool
    {
        // Admins and editors can update any review
        if ($user->hasRole('admin') || $user->hasRole('editor')) {
            return true;
        }

        // Users can only update their own pending reviews
        return $user->id === $review->user_id && $review->status === 'pending';
    }

    
    
    
    
    /**

    
    
    
     * Remove the specified resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Review $review The review.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function delete(User $user, Review $review): bool
    {
        // Admins can delete any review
        if ($user->hasRole('admin')) {
            return true;
        }

        // Users can delete their own pending reviews
        return $user->id === $review->user_id && $review->status === 'pending';
    }

    
    
    
    
    /**

    
    
    
     * Handle moderate.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function moderate(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Handle approve.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function approve(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Handle reject.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function reject(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('editor');
    }
}
