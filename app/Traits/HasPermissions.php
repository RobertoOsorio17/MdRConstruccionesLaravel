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
     * Roles del usuario
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user')
                    ->withTimestamps();
    }

    /**
     * Permisos directos del usuario
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_user')
                    ->withPivot('granted')
                    ->withTimestamps();
    }

    /**
     * Verificar si el usuario tiene un rol especifico
     */
    public function hasRole(string|array $roles): bool
    {
        if (is_array($roles)) {
            return $this->roles()->whereIn('name', $roles)->exists();
        }

        return $this->roles()->where('name', $roles)->exists();
    }

    /**
     * Verificar si el usuario tiene todos los roles especificados
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
     * Verificar si el usuario tiene algun rol especificado
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->hasRole($roles);
    }

    /**
     * Verificar si el usuario tiene un permiso especifico
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
     * Verificar si el usuario tiene todos los permisos especificados
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
     * Verificar si el usuario tiene algun permiso especificado
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
     * Asignar rol al usuario
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
     * Remover rol del usuario
     */
    public function removeRole(Role|string $role): void
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $this->roles()->detach($role->id);
    }

    /**
     * Sincronizar roles del usuario
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
     * Dar permiso directo al usuario
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
     * Revocar permiso directo del usuario
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
     * Obtener todos los permisos del usuario (directos + de roles)
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
     * Verificar si el usuario es admin
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin') || $this->role === 'admin';
    }

    /**
     * Verificar si el usuario es editor
     */
    public function isEditor(): bool
    {
        return $this->hasRole('editor') || $this->role === 'editor';
    }

    /**
     * Verificar si el usuario es moderador
     */
    public function isModerator(): bool
    {
        return $this->hasRole('moderator');
    }
}
