<?php

namespace App\Policies;

use App\Models\ContactRequest;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Defines access control for managing contact requests throughout the administrative backend.
 * Distinguishes between view, manage, and destructive operations based on roles and permissions.
 */
class ContactRequestPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Only admins and editors can view contact requests
        return $user->hasPermission('contact.view') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ContactRequest $contactRequest): bool
    {
        // Only admins and editors can view contact requests
        return $user->hasPermission('contact.view') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(?User $user): bool
    {
        // Anyone can create contact requests (including guests)
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ContactRequest $contactRequest): bool
    {
        // Only admins and editors can update contact requests
        return $user->hasPermission('contact.manage') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ContactRequest $contactRequest): bool
    {
        // Only admins can delete contact requests
        return $user->hasPermission('contact.delete') || 
               $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ContactRequest $contactRequest): bool
    {
        // Only admins can restore deleted contact requests
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ContactRequest $contactRequest): bool
    {
        // Only admins can permanently delete contact requests
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can mark the request as read.
     */
    public function markAsRead(User $user, ContactRequest $contactRequest): bool
    {
        return $user->hasPermission('contact.manage') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    /**
     * Determine whether the user can mark the request as responded.
     */
    public function markAsResponded(User $user, ContactRequest $contactRequest): bool
    {
        return $user->hasPermission('contact.manage') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    /**
     * Determine whether the user can archive the request.
     */
    public function archive(User $user, ContactRequest $contactRequest): bool
    {
        return $user->hasPermission('contact.manage') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    /**
     * Determine whether the user can add notes to the request.
     */
    public function addNotes(User $user, ContactRequest $contactRequest): bool
    {
        return $user->hasPermission('contact.manage') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    /**
     * Determine whether the user can download attachments.
     */
    public function downloadAttachment(User $user, ContactRequest $contactRequest): bool
    {
        return $user->hasPermission('contact.view') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    /**
     * Determine whether the user can perform bulk actions.
     */
    public function bulkAction(User $user): bool
    {
        return $user->hasPermission('contact.manage') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }
}

