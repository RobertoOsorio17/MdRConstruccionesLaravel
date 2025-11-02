<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
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
        'admin_notes',
        'ip_ban',
        'is_irrevocable',
        'banned_at',
        'expires_at',
        'is_active',
        'appeal_url_token',
        'appeal_url_expires_at',
        'appeal_url_token_rotated_at',
    ];

    protected $casts = [
        'banned_at' => 'datetime',
        'expires_at' => 'datetime',
        'appeal_url_expires_at' => 'datetime',
        'appeal_url_token_rotated_at' => 'datetime',
        'is_active' => 'boolean',
        'ip_ban' => 'boolean',
        'is_irrevocable' => 'boolean',
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
     * Get the appeal for this ban (if any).
     */
    public function appeal(): HasOne
    {
        return $this->hasOne(BanAppeal::class, 'user_ban_id');
    }

    /**
     * Check if this ban has an appeal.
     */
    public function hasAppeal(): bool
    {
        return $this->appeal()->exists();
    }

    /**
     * Check if this ban has a pending appeal.
     */
    public function hasPendingAppeal(): bool
    {
        return $this->appeal()->where('status', 'pending')->exists();
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
     * Check if the ban is irrevocable (cannot be appealed).
     */
    public function isIrrevocable(): bool
    {
        return $this->is_irrevocable === true;
    }

    /**
     * Check if this ban can be appealed.
     * A ban can be appealed if it's not irrevocable and doesn't have an existing appeal.
     */
    public function canBeAppealed(): bool
    {
        return !$this->isIrrevocable() && !$this->hasAppeal();
    }

    /**
     * Generate a new appeal URL token and set expiration.
     * Invalidates any previous token.
     *
     * ✅ SECURITY FIX: Token is now hashed before storage to prevent exposure
     * in database dumps, logs, or XSS attacks in admin panel.
     *
     * @param int $expirationMinutes Minutes until token expires (default: 60)
     * @return string The generated plain token (only returned once)
     */
    public function generateAppealUrlToken(int $expirationMinutes = 60): string
    {
        $plainToken = \Illuminate\Support\Str::random(64);

        // Store hashed version in database
        $this->appeal_url_token = hash('sha256', $plainToken);
        $this->appeal_url_expires_at = now()->addMinutes($expirationMinutes);
        $this->appeal_url_token_rotated_at = now();
        $this->save();

        // Return plain token only once (for email/notification)
        return $plainToken;
    }

    /**
     * Check if the appeal URL token is valid.
     *
     * ✅ SECURITY FIX: Now compares hashed tokens using timing-safe comparison.
     *
     * @param string $plainToken The plain token to validate
     * @return bool True if token is valid and not expired
     */
    public function isAppealUrlTokenValid(string $plainToken): bool
    {
        // Token must exist
        if (!$this->appeal_url_token) {
            return false;
        }

        // Token must match (timing-safe comparison of hashes)
        $hashedToken = hash('sha256', $plainToken);
        if (!hash_equals($this->appeal_url_token, $hashedToken)) {
            return false;
        }

        // Token must not be expired
        if (!$this->appeal_url_expires_at || $this->appeal_url_expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Invalidate the current appeal URL token.
     */
    public function invalidateAppealUrlToken(): void
    {
        $this->appeal_url_token = null;
        $this->appeal_url_expires_at = null;
        $this->save();
    }

    /**
     * Check if there's a valid appeal URL token.
     *
     * @return bool True if there's a valid token
     */
    public function hasValidAppealUrlToken(): bool
    {
        return $this->appeal_url_token
            && $this->appeal_url_expires_at
            && $this->appeal_url_expires_at->isFuture();
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
