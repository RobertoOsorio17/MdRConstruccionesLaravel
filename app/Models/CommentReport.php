<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommentReport extends Model
{
    protected $fillable = [
        'user_id',
        'comment_id',
        'reason',
        'category',
        'description',
        'status',
        'notes',
        'ip_address',
        'user_agent',
        'is_guest_report'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'is_guest_report' => 'boolean'
    ];

    // Scopes
    public function scopeFromGuests($query)
    {
        return $query->where('is_guest_report', true);
    }

    public function scopeFromUsers($query)
    {
        return $query->where('is_guest_report', false);
    }

    public function scopeByIp($query, $ip)
    {
        return $query->where('ip_address', $ip);
    }

    // Accessors
    public function getReporterTypeAttribute()
    {
        return $this->is_guest_report ? 'Invitado' : 'Usuario';
    }

    public function getReporterDisplayNameAttribute()
    {
        if ($this->is_guest_report) {
            return 'Invitado (' . substr($this->ip_address, 0, -4) . 'xxx)';
        }
        
        return $this->user ? $this->user->name : 'Usuario eliminado';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class);
    }
}