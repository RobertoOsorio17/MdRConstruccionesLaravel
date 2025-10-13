<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

/**
 * Stores alert messages targeted at administrative users within the control panel.
 * Tracks delivery state, severity metadata, and contextual payloads used to render actionable notices.
 */
class AdminNotification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'action_url',
        'action_text',
        'priority',
        'read_at',
        'expires_at',
        'is_dismissible',
        'is_system',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_dismissible' => 'boolean',
        'is_system' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the notification
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for unread notifications
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope for read notifications
     */
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Scope for system notifications
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope for user-specific notifications
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('user_id', $userId)->orWhere('is_system', true);
        });
    }

    /**
     * Scope for notifications by type
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for notifications by priority
     */
    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope for active notifications (not expired)
     */
    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        });
    }

    /**
     * Scope for expired notifications
     */
    public function scopeExpired($query)
    {
        return $query->whereNotNull('expires_at')->where('expires_at', '<=', now());
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(): bool
    {
        if ($this->read_at) {
            return true; // Already read
        }

        $this->read_at = now();
        return $this->save();
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread(): bool
    {
        $this->read_at = null;
        return $this->save();
    }

    /**
     * Check if notification is read
     */
    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }

    /**
     * Check if notification is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Get priority color for UI
     */
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'low' => '#10B981',      // green
            'medium' => '#3B82F6',   // blue
            'high' => '#F59E0B',     // yellow
            'urgent' => '#EF4444',   // red
            default => '#6B7280',    // gray
        };
    }

    /**
     * Get type icon for UI
     */
    public function getTypeIconAttribute(): string
    {
        return match($this->type) {
            'info' => 'info',
            'warning' => 'warning',
            'error' => 'error',
            'success' => 'check_circle',
            'system' => 'settings',
            default => 'notifications',
        };
    }

    /**
     * Create system notification
     */
    public static function createSystem(array $attributes): static
    {
        // Set default expires_at if not provided
        if (!isset($attributes['expires_at'])) {
            $attributes['expires_at'] = Carbon::now()->addDays(30);
        }

        return parent::create(array_merge($attributes, [
            'user_id' => null,
            'is_system' => true,
        ]));
    }

    /**
     * Create user notification
     */
    public static function createForUser(int $userId, array $attributes): static
    {
        // Set default expires_at if not provided
        if (!isset($attributes['expires_at'])) {
            $attributes['expires_at'] = Carbon::now()->addDays(30);
        }

        return parent::create(array_merge($attributes, [
            'user_id' => $userId,
            'is_system' => false,
        ]));
    }

    /**
     * Clean up expired notifications
     */
    public static function cleanupExpired(): int
    {
        return static::expired()->delete();
    }
}
