<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Defines RBAC roles and their relationships to users and permissions within the authorization layer.
 * Provides helper methods for granting, revoking, and grouping permissions by domain.
 */
class Role extends Model
{
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'level',
    ];

    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'level' => 'integer',
    ];

    /**
     * Usuarios que tienen este rol
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user')
                    ->withTimestamps();
    }

    /**
     * Permisos asignados a este rol
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role')
                    ->withTimestamps();
    }

    /**
     * Scope para ordenar por nivel jerarquico
     */
    public function scopeByLevel($query)
    {
        return $query->orderBy('level', 'desc');
    }

    /**
     * Verificar si el rol tiene un permiso especifico
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions()->where('name', $permission)->exists();
    }

    /**
     * Verificar si el rol tiene permisos en un grupo
     */
    public function hasGroupAccess(string $group): bool
    {
        return $this->permissions()->where('group', $group)->exists();
    }

    /**
     * Obtener permisos agrupados por grupo
     */
    public function getPermissionsByGroup()
    {
        return $this->permissions()->get()->groupBy('group');
    }

    /**
     * Asignar permiso al rol
     */
    public function givePermissionTo(Permission|string $permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        if (!$this->hasPermission($permission->name)) {
            $this->permissions()->attach($permission->id);
        }
    }

    /**
     * Revocar permiso del rol
     */
    public function revokePermissionTo(Permission|string $permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        $this->permissions()->detach($permission->id);
    }

    /**
     * Sincronizar permisos del rol
     */
    public function syncPermissions(array $permissions): void
    {
        $permissionIds = collect($permissions)->map(function ($permission) {
            if ($permission instanceof Permission) {
                return $permission->id;
            }
            return Permission::where('name', $permission)->firstOrFail()->id;
        })->toArray();

        $this->permissions()->sync($permissionIds);
    }
}

