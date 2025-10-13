<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Traits\HasPermissions;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use App\Notifications\ResetPasswordNotification;

/**
 * Application user model providing authentication, profile attributes, permissions, and rich domain helpers.
 * Extends Laravel's Authenticatable with soft deletes, role management, and extensive relationship accessors.
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, SoftDeletes, HasPermissions;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    // ✅ Only safe fields that users can mass-assign
    protected $fillable = [
        'name',
        'email',
        'password',
        'password_changed_at', // ✅ Allow for registration flow
        'status', // ✅ Allow for registration flow (will be validated)
        'avatar',
        'bio',
        'website',
        'location',
        'profession',
        'phone',
        'birth_date',
        'gender',
        'social_links',
        'profile_visibility',
        'show_email',
        'profile_updated_at',
        'provider',
        'provider_id',
        'provider_token',
        'provider_refresh_token',
        'email_verified_at', // ✅ Allow for OAuth flow (will be validated)
    ];

    // ✅ Protected fields that should NOT be mass-assignable
    protected $guarded = [
        'id',
        'role', // ✅ CRITICAL: Prevent privilege escalation - use roles relationship
        'remember_token',
        'created_at',
        'updated_at',
        'ml_blocked', // ✅ ML auto-block protection
        'ml_blocked_at',
        'ml_blocked_reason',
        'ml_anomaly_score',
    ];

    /**
     * Fields that should only be updated by administrators
     */
    protected $adminOnlyFields = [
        'role',
        'is_verified',
        'verified_at',
        'verification_notes',
        'verified_by',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'provider_token',
        'provider_refresh_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'birth_date' => 'date',
            'profile_updated_at' => 'datetime',
            'social_links' => 'array',
            'preferences' => 'array',
            'profile_visibility' => 'boolean',
            'show_email' => 'boolean',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'verified_at' => 'datetime',
            'ml_blocked' => 'boolean',
            'ml_blocked_at' => 'datetime',
        ];
    }

    /**
     * Get the posts for the user.
     */
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Get the comments for the user.
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
    
    /**
     * Interacciones del usuario (likes, bookmarks, etc.)
     */
    public function interactions()
    {
        return $this->hasMany(UserInteraction::class);
    }

    /**
     * Get the user's favorite services.
     */
    public function favoriteServices()
    {
        return $this->belongsToMany(Service::class, 'user_service_favorites')
                    ->withTimestamps()
                    ->orderBy('user_service_favorites.created_at', 'desc');
    }

    /**
     * Get the user's service favorites (pivot model).
     */
    public function serviceFavorites()
    {
        return $this->hasMany(ServiceFavorite::class);
    }

    /**
     * Check if user has favorited a specific service.
     */
    public function hasFavorited(Service $service): bool
    {
        return $this->favoriteServices()->where('service_id', $service->id)->exists();
    }

    /**
     * Get the user's admin audit logs
     */
    public function adminAuditLogs(): HasMany
    {
        return $this->hasMany(AdminAuditLog::class);
    }

    /**
     * Get the user's admin notifications
     */
    public function adminNotifications(): HasMany
    {
        return $this->hasMany(AdminNotification::class);
    }

    /**
     * Get the user's notifications
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get unread notifications count
     */
    public function unreadNotificationsCount(): int
    {
        return $this->notifications()->whereNull('read_at')->count();
    }

    /**
     * Get the user's devices
     */
    public function devices(): HasMany
    {
        return $this->hasMany(UserDevice::class);
    }

    /**
     * Get the user's trusted devices
     */
    public function trustedDevices(): HasMany
    {
        return $this->hasMany(TrustedDevice::class);
    }

    /**
     * Get the user's dashboard widgets
     */
    public function dashboardWidgets(): HasMany
    {
        return $this->hasMany(AdminDashboardWidget::class);
    }

    /**
     * Get all bans for this user.
     */
    public function bans(): HasMany
    {
        return $this->hasMany(UserBan::class, 'user_id');
    }

    /**
     * Get bans issued by this user (admin).
     */
    public function issuedBans(): HasMany
    {
        return $this->hasMany(UserBan::class, 'banned_by');
    }

    /**
     * Get the current active ban for this user.
     */
    public function currentBan(): ?UserBan
    {
        return $this->bans()->active()->first();
    }

    /**
     * Check if the user is currently banned.
     */
    public function isBanned(): bool
    {
        return $this->bans()->active()->exists();
    }

    /**
     * Get ban status information.
     */
    public function getBanStatus(): array
    {
        $currentBan = $this->currentBan();

        if (!$currentBan) {
            return [
                'is_banned' => false,
                'status' => 'Active',
                'reason' => null,
                'banned_at' => null,
                'expires_at' => null,
                'banned_by' => null,
                'remaining_time' => null,
            ];
        }

        return [
            'is_banned' => true,
            'status' => $currentBan->isPermanent() ? 'Permanently Banned' : 'Temporarily Banned',
            'reason' => $currentBan->reason,
            'banned_at' => $currentBan->banned_at,
            'expires_at' => $currentBan->expires_at,
            'banned_by' => $currentBan->bannedBy->name ?? 'System',
            'remaining_time' => $currentBan->getRemainingTime(),
        ];
    }
    
    /**
     * Posts que le gustan al usuario
     */
    public function likedPosts()
    {
        return $this->morphedByMany(Post::class, 'interactable', 'user_interactions')
                    ->wherePivot('type', '=', 'like');
    }
    
    /**
     * Posts guardados por el usuario
     */
    public function bookmarkedPosts()
    {
        return $this->morphedByMany(Post::class, 'interactable', 'user_interactions')
                    ->wherePivot('type', '=', 'bookmark')
                    ->withPivot('created_at', 'updated_at');
    }
    
    /**
     * Alias para posts guardados (para compatibilidad con dashboard)
     */
    public function savedPosts()
    {
        return $this->bookmarkedPosts();
    }
    
    /**
     * Usuarios que sigue este usuario
     */
    public function following()
    {
        return $this->belongsToMany(User::class, 'user_follows', 'follower_id', 'following_id')
                    ->withPivot('followed_at')
                    ->withTimestamps();
    }
    
    /**
     * Usuarios que siguen a este usuario (seguidores)
     */
    public function followers()
    {
        return $this->belongsToMany(User::class, 'user_follows', 'following_id', 'follower_id')
                    ->withPivot('followed_at')
                    ->withTimestamps();
    }
    
    /**
     * Verificar si este usuario le gusta un post específico
     */
    public function hasLiked($post)
    {
        return $this->interactions()
                    ->where('interactable_type', get_class($post))
                    ->where('interactable_id', $post->id)
                    ->where('type', UserInteraction::TYPE_LIKE)
                    ->exists();
    }

    /**
     * Comentarios que le gustan al usuario
     */
    public function likedComments()
    {
        return $this->belongsToMany(Comment::class, 'comment_interactions')
                    ->where('type', 'like')
                    ->withTimestamps()
                    ->orderByPivot('created_at', 'desc');
    }
    
    /**
     * Verificar si este usuario tiene guardado un post específico
     */
    public function hasBookmarked($post)
    {
        return $this->interactions()
                    ->where('interactable_type', get_class($post))
                    ->where('interactable_id', $post->id)
                    ->where('type', UserInteraction::TYPE_BOOKMARK)
                    ->exists();
    }
    
    /**
     * Verificar si este usuario sigue a otro usuario
     */
    public function isFollowing($user)
    {
        return $this->following()->where('following_id', $user->id)->exists();
    }
    
    /**
     * Contar seguidores
     */
    public function getFollowersCountAttribute()
    {
        return $this->followers()->count();
    }
    
    /**
     * Contar usuarios seguidos
     */
    public function getFollowingCountAttribute()
    {
        return $this->following()->count();
    }

    /**
     * Get the comment interactions for the user.
     */
    public function commentInteractions()
    {
        return $this->hasMany(CommentInteraction::class);
    }

    /**
     * Get the comment reports for the user.
     */
    public function commentReports()
    {
        return $this->hasMany(CommentReport::class);
    }

    /**
     * Roles asignados al usuario
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user')
                    ->withPivot(['assigned_at', 'assigned_by'])
                    ->withTimestamps();
    }

    /**
     * Obtener el rol principal del usuario (mayor nivel)
     *
     * ✅ FIXED: Added return type to prevent null pointer exceptions
     */
    public function getPrimaryRole(): ?Role
    {
        return $this->roles()->active()->byLevel()->first();
    }

    /**
     * Verificar si el usuario tiene un rol específico
     * Verifica tanto el campo 'role' como las relaciones en la tabla 'roles'
     */
    public function hasRole(string|array $roleName): bool
    {
        if (is_array($roleName)) {
            return $this->hasAnyRole($roleName);
        }

        // Verificar el campo 'role' directo en la tabla users
        if ($this->role === $roleName) {
            return true;
        }

        // Verificar las relaciones en la tabla roles
        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Verificar si el usuario tiene cualquiera de los roles especificados
     */
    public function hasAnyRole(array $roles): bool
    {
        if ($this->role && in_array($this->role, $roles, true)) {
            return true;
        }

        return $this->roles()->whereIn('name', $roles)->exists();
    }

    /**
     * Verificar si el usuario tiene todos los roles especificados
     */
    public function hasAllRoles(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->count() === count($roles);
    }

    /**
     * Verificar si el usuario tiene un permiso específico
     */
    public function hasPermission(string $permission): bool
    {
        return $this->roles()->whereHas('permissions', function ($query) use ($permission) {
            $query->where('name', $permission);
        })->exists();
    }

    /**
     * Verificar si el usuario puede acceder a un módulo
     */
    public function canAccessModule(string $module): bool
    {
        return $this->roles()->whereHas('permissions', function ($query) use ($module) {
            $query->where('module', $module);
        })->exists();
    }

    /**
     * Verificar si el usuario puede realizar una acción en un módulo
     */
    public function canDo(string $action, string $module = null): bool
    {
        if ($module) {
            $permissionName = $module . '.' . $action;
            return $this->hasPermission($permissionName);
        }
        
        return $this->hasPermission($action);
    }

    /**
     * Asignar rol al usuario
     */
    public function assignRole(string|Role $role, int $assignedBy = null)
    {
        $roleId = $role instanceof Role ? $role->id : Role::where('name', $role)->first()?->id;
        
        if ($roleId && !$this->roles()->where('role_id', $roleId)->exists()) {
            $this->roles()->attach($roleId, [
                'assigned_at' => now(),
                'assigned_by' => $assignedBy
            ]);
        }
    }

    /**
     * Remover rol del usuario
     */
    public function removeRole(string|Role $role)
    {
        $roleId = $role instanceof Role ? $role->id : Role::where('name', $role)->first()?->id;
        
        if ($roleId) {
            $this->roles()->detach($roleId);
        }
    }

    /**
     * Sincronizar roles del usuario
     */
    public function syncRoles(array $roles, int $assignedBy = null)
    {
        $roleIds = collect($roles)->map(function ($role) {
            return $role instanceof Role ? $role->id : Role::where('name', $role)->first()?->id;
        })->filter();
        
        $syncData = $roleIds->mapWithKeys(function ($roleId) use ($assignedBy) {
            return [$roleId => [
                'assigned_at' => now(),
                'assigned_by' => $assignedBy
            ]];
        });
        
        $this->roles()->sync($syncData);
    }
    
    /**
     * Obtener la URL del avatar o generar uno por defecto
     */
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar && filter_var($this->avatar, FILTER_VALIDATE_URL)) {
            return $this->avatar;
        }
        
        if ($this->avatar && file_exists(public_path('storage/avatars/' . $this->avatar))) {
            return asset('storage/avatars/' . $this->avatar);
        }
        
        // Generar avatar con iniciales usando UI Avatars
        $initials = $this->getInitialsAttribute();
        return "https://ui-avatars.com/api/?name={$initials}&size=200&background=2563eb&color=ffffff&bold=true";
    }

    /**
     * Método helper para obtener la URL del avatar
     */
    public function getAvatarUrl()
    {
        return $this->avatar_url;
    }

    /**
     * Obtener las iniciales del usuario
     */
    public function getInitialsAttribute()
    {
        $words = explode(' ', trim($this->name));
        $initials = '';
        
        foreach ($words as $word) {
            $initials .= strtoupper(substr($word, 0, 1));
            if (strlen($initials) >= 2) break;
        }
        
        return $initials ?: 'U';
    }
    
    /**
     * Obtener la biografía formateada
     */
    public function getFormattedBioAttribute()
    {
        if (!$this->bio) {
            return null;
        }
        
        return strip_tags($this->bio);
    }
    
    /**
     * Verificar si el perfil está completo
     */
    public function getIsProfileCompleteAttribute()
    {
        $requiredFields = ['name', 'email', 'bio'];
        
        foreach ($requiredFields as $field) {
            if (empty($this->$field)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Obtener el porcentaje de completitud del perfil
     */
    public function getProfileCompletenessAttribute()
    {
        $fields = ['name', 'email', 'bio', 'avatar', 'location', 'profession', 'website'];
        $completed = 0;
        $total = count($fields);
        
        foreach ($fields as $field) {
            if (!empty($this->$field)) {
                $completed++;
            }
        }
        
        return round(($completed / $total) * 100);
    }
    
    /**
     * Obtener enlaces sociales formateados
     */
    public function getFormattedSocialLinksAttribute()
    {
        if (!$this->social_links) {
            return [];
        }
        
        $formatted = [];
        foreach ($this->social_links as $platform => $url) {
            if (!empty($url)) {
                $formatted[] = [
                    'platform' => $platform,
                    'url' => $url,
                    'icon' => $this->getSocialIcon($platform)
                ];
            }
        }
        
        return $formatted;
    }
    
    /**
     * Obtener icono para plataforma social
     */
    private function getSocialIcon($platform)
    {
        $icons = [
            'twitter' => 'Twitter',
            'linkedin' => 'LinkedIn',
            'facebook' => 'Facebook',
            'instagram' => 'Instagram',
            'github' => 'GitHub',
            'website' => 'Language',
        ];
        
        return $icons[$platform] ?? 'Link';
    }
    
    /**
     * Actualizar timestamp del perfil
     */
    public function touchProfile()
    {
        $this->update(['profile_updated_at' => now()]);
    }

    /**
     * Get the user who verified this user.
     */
    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get users verified by this user.
     */
    public function verifiedUsers()
    {
        return $this->hasMany(User::class, 'verified_by');
    }

    /**
     * Check if the user is verified.
     */
    public function isVerified(): bool
    {
        return $this->is_verified === true;
    }

    /**
     * Verify the user.
     */
    public function verify(User $verifier, string $notes = null): bool
    {
        // Use direct property assignment to bypass mass assignment protection
        $this->is_verified = true;
        $this->verified_at = now();
        $this->verified_by = $verifier->id;
        $this->verification_notes = $notes;
        return $this->save();
    }

    /**
     * Unverify the user.
     */
    public function unverify(User $verifier, string $notes = null): bool
    {
        // Use direct property assignment to bypass mass assignment protection
        $this->is_verified = false;
        $this->verified_at = null;
        $this->verified_by = $verifier->id;
        $this->verification_notes = $notes;
        return $this->save();
    }

    /**
     * Get verification status with details.
     */
    public function getVerificationStatus(): array
    {
        return [
            'is_verified' => $this->is_verified,
            'verified_at' => $this->verified_at,
            'verified_by' => $this->verifiedBy,
            'verification_notes' => $this->verification_notes,
        ];
    }

    /**
     * Send the password reset notification.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * Administrative method to update user role
     */
    public function updateRole(string $role, User $admin): bool
    {
        if (!$admin->hasRole('admin')) {
            throw new \Exception('Only administrators can update user roles.');
        }

        $this->role = $role;
        return $this->save();
    }

    /**
     * Administrative method to verify user
     */
    public function verifyUser(User $admin, string $notes = null): bool
    {
        if (!$admin->hasRole('admin')) {
            throw new \Exception('Only administrators can verify users.');
        }

        $this->is_verified = true;
        $this->verified_at = now();
        $this->verified_by = $admin->id;
        $this->verification_notes = $notes;

        return $this->save();
    }

    /**
     * Administrative method to unverify user
     */
    public function unverifyUser(User $admin, string $notes = null): bool
    {
        if (!$admin->hasRole('admin')) {
            throw new \Exception('Only administrators can unverify users.');
        }

        // Use direct property assignment to bypass mass assignment protection
        $this->is_verified = false;
        $this->verified_at = null;
        $this->verified_by = null;
        $this->verification_notes = $notes;
        return $this->save();
    }

    /**
     * Administrative method to update last login time
     */
    public function updateLastLogin(): bool
    {
        return $this->update(['last_login_at' => now()]);
    }

    /**
     * Block user due to ML anomaly detection
     *
     * ✅ FIXED: Sanitize reason to prevent XSS
     */
    public function blockByML(int $anomalyScore, string $reason = 'Suspicious activity detected'): bool
    {
        $this->ml_blocked = true;
        $this->ml_blocked_at = now();
        // ✅ Sanitize reason before storing
        $this->ml_blocked_reason = strip_tags($reason);
        $this->ml_anomaly_score = $anomalyScore;
        return $this->save();
    }

    /**
     * Unblock user from ML block
     */
    public function unblockByML(): bool
    {
        $this->ml_blocked = false;
        $this->ml_blocked_at = null;
        $this->ml_blocked_reason = null;
        $this->ml_anomaly_score = 0;
        return $this->save();
    }

    /**
     * Check if user is blocked by ML
     */
    public function isMLBlocked(): bool
    {
        return $this->ml_blocked === true;
    }

    /**
     * Get ML block information
     */
    public function getMLBlockInfo(): ?array
    {
        if (!$this->ml_blocked) {
            return null;
        }

        return [
            'blocked' => true,
            'blocked_at' => $this->ml_blocked_at,
            'reason' => $this->ml_blocked_reason,
            'anomaly_score' => $this->ml_anomaly_score,
        ];
    }
}
