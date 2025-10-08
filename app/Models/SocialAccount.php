<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Links a local user account to an external OAuth provider, storing tokens and provider metadata.
 * Supports multi-provider logins by exposing helper accessors for provider display names and token state.
 */
class SocialAccount extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'provider',
        'provider_id',
        'provider_token',
        'provider_refresh_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'provider_token',
        'provider_refresh_token',
    ];

    /**
     * Get the user that owns the social account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the provider name in a human-readable format.
     *
     * @return string
     */
    public function getProviderNameAttribute(): string
    {
        return match($this->provider) {
            'google' => 'Google',
            'facebook' => 'Facebook',
            'github' => 'GitHub',
            default => ucfirst($this->provider),
        };
    }

    /**
     * Check if the token is expired (if refresh token exists).
     *
     * @return bool
     */
    public function isTokenExpired(): bool
    {
        // This is a simplified check - in production you'd want to check actual expiry
        return empty($this->provider_token);
    }
}

