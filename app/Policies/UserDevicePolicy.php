<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserDevice;

/**
 * Restricts management of tracked devices to the owning user for privacy and security.
 * Applies the same check across view, update, and delete operations.
 */
class UserDevicePolicy
{
    /**
     * Determine if the user can view the device.
     */
    public function view(User $user, UserDevice $device): bool
    {
        return $user->id === $device->user_id;
    }

    /**
     * Determine if the user can update the device.
     */
    public function update(User $user, UserDevice $device): bool
    {
        return $user->id === $device->user_id;
    }

    /**
     * Determine if the user can delete the device.
     */
    public function delete(User $user, UserDevice $device): bool
    {
        return $user->id === $device->user_id;
    }
}

