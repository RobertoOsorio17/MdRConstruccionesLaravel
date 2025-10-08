<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

/**
 * Tracks account bans applied to users, including duration, issuer, and status helpers.
 * Powers administrative enforcement and UI messaging around disciplinary actions.
 */
class UserBan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'banned_by',
        'reason',
        'banned_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'banned_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that was banned.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the admin who issued the ban.
     */
    public function bannedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'banned_by');
    }

    /**
     * Check if the ban is currently active and not expired.
     */
    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        // If expires_at is null, it's a permanent ban
        if ($this->expires_at === null) {
            return true;
        }

        // Check if the ban has expired
        return $this->expires_at->isFuture();
    }

    /**
     * Check if the ban is permanent (no expiration date).
     */
    public function isPermanent(): bool
    {
        return $this->expires_at === null;
    }

    /**
     * Get the remaining time until ban expires.
     */
    public function getRemainingTime(): ?string
    {
        if ($this->isPermanent()) {
            return 'Permanent';
        }

        if ($this->expires_at->isPast()) {
            return 'Expired';
        }

        return $this->expires_at->diffForHumans();
    }

    /**
     * Scope to get only active bans.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    /**
     * Scope to get expired bans.
     */
    public function scopeExpired($query)
    {
        return $query->where('is_active', true)
                    ->whereNotNull('expires_at')
                    ->where('expires_at', '<=', now());
    }
}
