<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * Records devices that have passed additional trust checks for multi-factor authentication bypass.
 * Tracks expiry, usage, and associated user so security flows can validate device trustworthiness.
 */
class TrustedDevice extends Model
{
    protected $fillable = [
        'user_id',
        'token_hash',
        'device_name',
        'ip_address',
        'fingerprint',
        'last_used_at',
        'expires_at',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the user that owns the trusted device.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the device is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if the device is valid (not expired).
     */
    public function isValid(): bool
    {
        return !$this->isExpired();
    }

    /**
     * Generate a secure random token.
     */
    public static function generateToken(): string
    {
        return Str::random(64);
    }

    /**
     * Hash a token for storage.
     */
    public static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    /**
     * Build a fingerprint hash for the incoming request.
     */
    public static function fingerprintFor(
        ?string $userAgent,
        ?string $ipAddress
    ): string {
        $payload = ($userAgent ?? 'unknown') . '|' . ($ipAddress ?? '0.0.0.0');

        return hash('sha256', $payload);
    }

    /**
     * Update the last used timestamp.
     */
    public function updateLastUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Scope to get only valid (non-expired) devices.
     */
    public function scopeValid($query)
    {
        return $query->where('expires_at', '>', now());
    }

    /**
     * Scope to get expired devices.
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }
}
