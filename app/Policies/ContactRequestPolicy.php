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

    
    
    
     * Handle view any.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function viewAny(User $user): bool
    {
        // Only admins and editors can view contact requests
        return $user->hasPermission('contact.view') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Handle view.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param ContactRequest $contactRequest The contactRequest.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function view(User $user, ContactRequest $contactRequest): bool
    {
        // Only admins and editors can view contact requests
        return $user->hasPermission('contact.view') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Show the form for creating a new resource.

    
    
    
     *

    
    
    
     * @param ?User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function create(?User $user): bool
    {
        // Anyone can create contact requests (including guests)
        return true;
    }

    
    
    
    
    /**

    
    
    
     * Update the specified resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param ContactRequest $contactRequest The contactRequest.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function update(User $user, ContactRequest $contactRequest): bool
    {
        // Only admins and editors can update contact requests
        return $user->hasPermission('contact.manage') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Remove the specified resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param ContactRequest $contactRequest The contactRequest.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function delete(User $user, ContactRequest $contactRequest): bool
    {
        // Only admins can delete contact requests
        return $user->hasPermission('contact.delete') || 
               $user->hasRole('admin');
    }

    
    
    
    
    /**

    
    
    
     * Handle restore.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param ContactRequest $contactRequest The contactRequest.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function restore(User $user, ContactRequest $contactRequest): bool
    {
        // Only admins can restore deleted contact requests
        return $user->hasRole('admin');
    }

    
    
    
    
    /**

    
    
    
     * Handle force delete.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param ContactRequest $contactRequest The contactRequest.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function forceDelete(User $user, ContactRequest $contactRequest): bool
    {
        // Only admins can permanently delete contact requests
        return $user->hasRole('admin');
    }

    
    
    
    
    /**

    
    
    
     * Handle mark as read.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param ContactRequest $contactRequest The contactRequest.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function markAsRead(User $user, ContactRequest $contactRequest): bool
    {
        return $user->hasPermission('contact.manage') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Handle mark as responded.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param ContactRequest $contactRequest The contactRequest.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function markAsResponded(User $user, ContactRequest $contactRequest): bool
    {
        return $user->hasPermission('contact.manage') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Handle archive.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param ContactRequest $contactRequest The contactRequest.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function archive(User $user, ContactRequest $contactRequest): bool
    {
        return $user->hasPermission('contact.manage') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Handle add notes.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param ContactRequest $contactRequest The contactRequest.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function addNotes(User $user, ContactRequest $contactRequest): bool
    {
        return $user->hasPermission('contact.manage') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }

    
    
    
    
    /**

    
    
    
     * Handle download attachment.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param ContactRequest $contactRequest The contactRequest.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function downloadAttachment(User $user, ContactRequest $contactRequest): bool
    {
        return $user->hasPermission('contact.view') || 
               $user->hasRole('admin') || 
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
        return $user->hasPermission('contact.manage') || 
               $user->hasRole('admin') || 
               $user->hasRole('editor');
    }
}

