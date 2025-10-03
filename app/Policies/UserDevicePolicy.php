<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserDevice;

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

