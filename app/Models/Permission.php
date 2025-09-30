<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'module',
        'action',
    ];

    /**
     * Roles que tienen este permiso
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permission')
                    ->withTimestamps();
    }

    /**
     * Scope para filtrar por mÃƒÆ’Ã‚Â³dulo
     */
    public function scopeByModule($query, string $module)
    {
        return $query->where('module', $module);
    }

    /**
     * Scope para filtrar por acciÃƒÆ’Ã‚Â³n
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Obtener permisos agrupados por mÃƒÆ’Ã‚Â³dulo
     */
    public static function getByModules()
    {
        return static::all()->groupBy('module');
    }

    /**
     * Obtener nombre completo del permiso
     */
    public function getFullNameAttribute()
    {
        return $this->module . '.' . $this->action;
    }
}
