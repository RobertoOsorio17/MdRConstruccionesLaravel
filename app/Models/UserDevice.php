<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tracks devices associated with a user account, including trust state, location details, and activity.
 * Supports security dashboards by exposing convenience scopes and helpers for trust and recency.
 */
class UserDevice extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'device_id',
        'device_name',
        'device_type',
        'browser',
        'browser_version',
        'platform',
        'platform_version',
        'ip_address',
        'country',
        'city',
        'is_trusted',
        'last_used_at',
        'verified_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_trusted' => 'boolean',
        'last_used_at' => 'datetime',
        'verified_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the device.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark device as trusted.
     */
    public function markAsTrusted(): void
    {
        $this->update([
            'is_trusted' => true,
            'verified_at' => now(),
        ]);
    }

    /**
     * Mark device as untrusted.
     */
    public function markAsUntrusted(): void
    {
        $this->update([
            'is_trusted' => false,
            'verified_at' => null,
        ]);
    }

    /**
     * Update last used timestamp.
     */
    public function updateLastUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Get device display name.
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->device_name) {
            return $this->device_name;
        }

        $parts = array_filter([
            $this->browser,
            $this->platform,
            $this->city,
        ]);

        return implode(' - ', $parts) ?: 'Unknown Device';
    }

    /**
     * Check if device is active (used in last 30 days).
     */
    public function isActive(): bool
    {
        return $this->last_used_at && $this->last_used_at->gt(now()->subDays(30));
    }

    /**
     * Scope to get only trusted devices.
     */
    public function scopeTrusted($query)
    {
        return $query->where('is_trusted', true);
    }

    /**
     * Scope to get only active devices.
     */
    public function scopeActive($query)
    {
        return $query->where('last_used_at', '>=', now()->subDays(30));
    }
}

