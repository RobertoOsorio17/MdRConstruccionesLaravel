<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class IpBan extends Model
{
    protected $fillable = [
        'ip_address',
        'ban_type', 
        'reason',
        'banned_at',
        'expires_at',
        'banned_by',
        'is_active'
    ];

    protected $casts = [
        'banned_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean'
    ];

    // Relationships
    public function bannedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'banned_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where(function($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    public function scopeForIp($query, $ip)
    {
        return $query->where('ip_address', $ip);
    }

    // Methods
    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isActive()
    {
        return $this->is_active && !$this->isExpired();
    }

    public static function isIpBanned($ip)
    {
        return self::forIp($ip)->active()->exists();
    }

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
