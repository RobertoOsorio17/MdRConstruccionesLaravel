<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Captures abuse reports filed against comments, including reporter metadata and moderation notes.
 * Enables moderators to triage flags from both guests and authenticated users.
 */
class CommentReport extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'comment_id',
        'reason',
        'category',
        'description',
        'status',
        'priority',
        'notes',
        'ip_address',
        'user_agent',
        'is_guest_report'
    ];

    /**
     * Attribute cast definitions.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'is_guest_report' => 'boolean'
    ];

    /**
     * Scope reports submitted by guests.
     */
    public function scopeFromGuests($query)
    {
        return $query->where('is_guest_report', true);
    }

    /**
     * Scope reports submitted by authenticated users.
     */
    public function scopeFromUsers($query)
    {
        return $query->where('is_guest_report', false);
    }

    /**
     * Scope reports matching a specific IP address.
     */
    public function scopeByIp($query, $ip)
    {
        return $query->where('ip_address', $ip);
    }

    /**
     * Describe the reporter type (guest or registered user).
     */
    public function getReporterTypeAttribute()
    {
        return $this->is_guest_report ? 'Guest' : 'User';
    }

    /**
     * Provide a display-friendly representation of the reporter identity.
     */
    public function getReporterDisplayNameAttribute()
    {
        if ($this->is_guest_report) {
            return 'Guest (' . substr($this->ip_address, 0, -4) . 'xxx)';
        }
        
        return $this->user ? $this->user->name : 'Deleted user';
    }

    /**
     * Report is optionally linked to a user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Report references the comment being flagged.
     */
    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class);
    }
}
