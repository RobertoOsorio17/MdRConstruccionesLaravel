<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Manages newsletter subscriptions, including verification status, preferences, and unsubscribe flows.
 * Provides convenience scopes and helpers used by marketing automation and admin tooling.
 */
class Newsletter extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'email',
        'name',
        'token',
        'is_active',
        'verified_at',
        'ip_address',
        'user_agent',
        'preferences',
    ];

    protected $guarded = [
        'id',
        'unsubscribed_at',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'verified_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
        'preferences' => 'array',
    ];

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($newsletter) {
            if (!$newsletter->token) {
                $newsletter->token = Str::random(64);
            }
        });
    }

    /**
     * Scope: Active subscribers
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                     ->whereNull('unsubscribed_at');
    }

    /**
     * Scope: Verified subscribers
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_at');
    }

    /**
     * Scope: Unverified subscribers
     */
    public function scopeUnverified($query)
    {
        return $query->whereNull('verified_at');
    }

    /**
     * Verify subscription
     */
    public function verify(): void
    {
        $this->update([
            'verified_at' => now(),
            'is_active' => true,
        ]);
    }

    /**
     * Unsubscribe
     */
    public function unsubscribe(): void
    {
        $this->update([
            'is_active' => false,
            'unsubscribed_at' => now(),
        ]);
    }

    /**
     * Resubscribe
     */
    public function resubscribe(): void
    {
        $this->update([
            'is_active' => true,
            'unsubscribed_at' => null,
        ]);
    }

    /**
     * Check if verified
     */
    public function isVerified(): bool
    {
        return !is_null($this->verified_at);
    }

    /**
     * Check if unsubscribed
     */
    public function isUnsubscribed(): bool
    {
        return !is_null($this->unsubscribed_at);
    }

    /**
     * Generate new verification token
     */
    public function regenerateToken(): string
    {
        $token = Str::random(64);
        $this->update(['token' => $token]);
        return $token;
    }
}
