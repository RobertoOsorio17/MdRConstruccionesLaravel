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

    
    
    
     * Handle roles.

    
    
    
     *

    
    
    
     * @return BelongsToMany

    
    
    
     */
    
    
    
    
    
    
    
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'permission_role')
                    ->withTimestamps();
    }

    
    
    
    
    /**

    
    
    
     * Handle users.

    
    
    
     *

    
    
    
     * @return BelongsToMany

    
    
    
     */
    
    
    
    
    
    
    
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'permission_user')
                    ->withPivot('granted')
                    ->withTimestamps();
    }

    
    
    
    
    /**

    
    
    
     * Handle scope by group.

    
    
    
     *

    
    
    
     * @param mixed $query The query.

    
    
    
     * @param string $group The group.

    
    
    
     * @return void

    
    
    
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

    
    
    
     * Determine whether user.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function hasUser(User $user): bool
    {
        return $this->users()->where('user_id', $user->id)->exists();
    }
}

