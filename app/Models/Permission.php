<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Defines granular permissions within the RBAC system and their relationships to roles and users.
 * Supplies query helpers for grouping and assignment checks used across authorization logic.
 */
class Permission extends Model
{
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'group',
    ];

    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];

    /**
     * Roles que tienen este permiso
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'permission_role')
                    ->withTimestamps();
    }

    /**
     * Usuarios que tienen este permiso directamente
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'permission_user')
                    ->withPivot('granted')
                    ->withTimestamps();
    }

    /**
     * Scope para filtrar por grupo
     */
    public function scopeByGroup($query, string $group)
    {
        return $query->where('group', $group);
    }

    /**
     * Obtener permisos agrupados por grupo
     */
    public static function getByGroups()
    {
        return static::all()->groupBy('group');
    }

    /**
     * Verificar si un usuario tiene este permiso
     */
    public function hasUser(User $user): bool
    {
        return $this->users()->where('user_id', $user->id)->exists();
    }
}

