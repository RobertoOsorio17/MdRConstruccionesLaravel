<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

/**
 * Tracks IP-based bans applied to the platform, including duration, reason, and administrator context.
 * Supplies scopes and helpers used to enforce access restrictions across middleware and services.
 */
class IpBan extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'ip_address',
        'ban_type', 
        'reason',
        'banned_at',
        'expires_at',
        'banned_by',
        'is_active'
    ];

    /**
     * Attribute casting definitions.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'banned_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean'
    ];

    /**
     * Administrator who applied the ban.
     */
    public function bannedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'banned_by');
    }

    /**
     * Scope active bans, respecting expiration dates.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where(function($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    /**
     * Scope bans targeting a particular IP address.
     */
    public function scopeForIp($query, $ip)
    {
        return $query->where('ip_address', $ip);
    }

    /**
     * Determine whether the ban has expired.
     */
    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Determine whether the ban is currently active.
     */
    public function isActive()
    {
        return $this->is_active && !$this->isExpired();
    }

    /**
     * Determine if the given IP is actively banned.
     */
    public static function isIpBanned($ip)
    {
        return self::forIp($ip)->active()->exists();
    }

    /**
     * Create a new IP ban entry.
     */
    public static function banIp($ip, $reason = null, $banType = 'report_abuse', $duration = null, $bannedBy = null)
    {
        $expiresAt = $duration ? now()->addDays($duration) : null;
        
        return self::create([
            'ip_address' => $ip,
            'ban_type' => $banType,
            'reason' => $reason,
            'banned_at' => now(),
            'expires_at' => $expiresAt,
            'banned_by' => $bannedBy
        ]);
    }
}
