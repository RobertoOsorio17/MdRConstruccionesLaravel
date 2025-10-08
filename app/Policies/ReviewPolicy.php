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
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can view the model.
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
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only authenticated users can create reviews
        return true;
    }

    /**
     * Determine whether the user can update the model.
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
     * Determine whether the user can delete the model.
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
     * Determine whether the user can moderate reviews.
     */
    public function moderate(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can approve reviews.
     */
    public function approve(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('editor');
    }

    /**
     * Determine whether the user can reject reviews.
     */
    public function reject(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('editor');
    }
}
