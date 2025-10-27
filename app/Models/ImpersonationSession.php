<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImpersonationSession extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'impersonator_id',
        'target_id',
        'session_token_hash',
        'started_at',
        'ended_at',
        'end_reason',
        'ip_address',
        'user_agent',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    /**
     * Get the impersonator (admin) user.
     */
    public function impersonator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'impersonator_id');
    }

    /**
     * Get the target (impersonated) user.
     */
    public function target(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_id');
    }

    /**
     * Scope to get only active sessions (not ended).
     */
    public function scopeActive($query)
    {
        return $query->whereNull('ended_at');
    }

    /**
     * Scope to get sessions by impersonator.
     */
    public function scopeByImpersonator($query, int $impersonatorId)
    {
        return $query->where('impersonator_id', $impersonatorId);
    }

    /**
     * Scope to get sessions by target.
     */
    public function scopeByTarget($query, int $targetId)
    {
        return $query->where('target_id', $targetId);
    }

    /**
     * Check if this session is still active.
     */
    public function isActive(): bool
    {
        return is_null($this->ended_at);
    }

    /**
     * Mark this session as ended.
     */
    public function end(string $reason = 'manual'): void
    {
        $this->update([
            'ended_at' => now(),
            'end_reason' => $reason,
        ]);
    }
}

