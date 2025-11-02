<?php

namespace App\Traits;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Adds role and permission management helpers to Eloquent models participating in RBAC.
 * Provides relationships and convenience methods for checking and syncing authorization capabilities.
 */
trait HasPermissions
{
    
    
    
    
    /**

    
    
    
     * Handle roles.

    
    
    
     *

    
    
    
     * @return BelongsToMany

    
    
    
     */
    
    
    
    
    
    
    
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user')
                    ->withTimestamps();
    }

    
    
    
    
    /**

    
    
    
     * Handle permissions.

    
    
    
     *

    
    
    
     * @return BelongsToMany

    
    
    
     */
    
    
    
    
    
    
    
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_user')
                    ->withPivot('granted')
                    ->withTimestamps();
    }

    
    
    
    
    /**

    
    
    
     * Determine whether role.

    
    
    
     *

    
    
    
     * @param string|array $roles The roles.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function hasRole(string|array $roles): bool
    {
        if (is_array($roles)) {
            return $this->roles()->whereIn('name', $roles)->exists();
        }

        return $this->roles()->where('name', $roles)->exists();
    }

    
    
    
    
    /**

    
    
    
     * Determine whether all roles.

    
    
    
     *

    
    
    
     * @param array $roles The roles.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function hasAllRoles(array $roles): bool
    {
        foreach ($roles as $role) {
            if (!$this->hasRole($role)) {
                return false;
            }
        }

        return true;
    }

    
    
    
    
    /**

    
    
    
     * Determine whether any role.

    
    
    
     *

    
    
    
     * @param array $roles The roles.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function hasAnyRole(array $roles): bool
    {
        return $this->hasRole($roles);
    }

    
    
    
    
    /**

    
    
    
     * Determine whether permission.

    
    
    
     *

    
    
    
     * @param string $permission The permission.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function hasPermission(string $permission): bool
    {
        // Verificar permiso directo
        $directPermission = $this->permissions()
            ->where('name', $permission)
            ->wherePivot('granted', true)
            ->exists();

        if ($directPermission) {
            return true;
        }

        // Verificar permiso a traves de roles
        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permission) {
                $query->where('name', $permission);
            })
            ->exists();
    }

    
    
    
    
    /**

    
    
    
     * Determine whether all permissions.

    
    
    
     *

    
    
    
     * @param array $permissions The permissions.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    
    
    
    
    /**

    
    
    
     * Determine whether any permission.

    
    
    
     *

    
    
    
     * @param array $permissions The permissions.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    
    
    
    
    /**

    
    
    
     * Handle assign role.

    
    
    
     *

    
    
    
     * @param Role|string $role The role.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function assignRole(Role|string $role): void
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        if (!$this->hasRole($role->name)) {
            $this->roles()->attach($role->id);
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle remove role.

    
    
    
     *

    
    
    
     * @param Role|string $role The role.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function removeRole(Role|string $role): void
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $this->roles()->detach($role->id);
    }

    
    
    
    
    /**

    
    
    
     * Handle sync roles.

    
    
    
     *

    
    
    
     * @param array $roles The roles.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function syncRoles(array $roles): void
    {
        $roleIds = collect($roles)->map(function ($role) {
            if ($role instanceof Role) {
                return $role->id;
            }
            return Role::where('name', $role)->firstOrFail()->id;
        })->toArray();

        $this->roles()->sync($roleIds);
    }

    
    
    
    
    /**

    
    
    
     * Handle give permission to.

    
    
    
     *

    
    
    
     * @param Permission|string $permission The permission.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function givePermissionTo(Permission|string $permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        $this->permissions()->syncWithoutDetaching([
            $permission->id => ['granted' => true]
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle revoke permission to.

    
    
    
     *

    
    
    
     * @param Permission|string $permission The permission.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function revokePermissionTo(Permission|string $permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        $this->permissions()->syncWithoutDetaching([
            $permission->id => ['granted' => false]
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Get all permissions.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getAllPermissions()
    {
        $directPermissions = $this->permissions()
            ->wherePivot('granted', true)
            ->get();

        $rolePermissions = Permission::whereHas('roles', function ($query) {
            $query->whereIn('roles.id', $this->roles()->pluck('roles.id'));
        })->get();

        return $directPermissions->merge($rolePermissions)->unique('id');
    }

    
    
    
    
    /**

    
    
    
     * Determine whether admin.

    
    
    
     *

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function isAdmin(): bool
    {
        return $this->hasRole('admin') || $this->role === 'admin';
    }

    
    
    
    
    /**

    
    
    
     * Determine whether editor.

    
    
    
     *

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function isEditor(): bool
    {
        return $this->hasRole('editor') || $this->role === 'editor';
    }

    
    
    
    
    /**

    
    
    
     * Determine whether moderator.

    
    
    
     *

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function isModerator(): bool
    {
        return $this->hasRole('moderator');
    }
}
