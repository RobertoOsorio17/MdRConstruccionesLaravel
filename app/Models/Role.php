<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'color',
        'level',
        'is_active',
    ];

    protected $casts = [
        'level' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Usuarios que tienen este rol
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user')
                    ->withPivot(['assigned_at', 'assigned_by'])
                    ->withTimestamps();
    }

    /**
     * Permisos asignados a este rol
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permission')
                    ->withTimestamps();
    }

    /**
     * Scope para roles activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para ordenar por nivel jerÃƒÆ’Ã‚Â¡rquico
     */
    public function scopeByLevel($query)
    {
        return $query->orderBy('level', 'desc');
    }

    /**
     * Verificar si el rol tiene un permiso especÃƒÆ’Ã‚Â­fico
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions()->where('name', $permission)->exists();
    }

    /**
     * Verificar si el rol tiene permisos en un mÃƒÆ’Ã‚Â³dulo
     */
    public function hasModuleAccess(string $module): bool
    {
        return $this->permissions()->where('module', $module)->exists();
    }

    /**
     * Obtener permisos agrupados por mÃƒÆ’Ã‚Â³dulo
     */
    public function getPermissionsByModule()
    {
        return $this->permissions()->get()->groupBy('module');
    }
}
