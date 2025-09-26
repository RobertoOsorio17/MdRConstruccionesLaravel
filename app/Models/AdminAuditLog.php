<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class AdminAuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'session_id',
        'request_data',
        'route_name',
        'url',
        'severity',
        'description',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'request_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that performed the action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the model that was affected
     */
    public function model()
    {
        if ($this->model_type && $this->model_id) {
            return $this->model_type::find($this->model_id);
        }
        return null;
    }

    /**
     * Scope for filtering by action
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope for filtering by user
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for filtering by model type
     */
    public function scopeByModelType($query, string $modelType)
    {
        return $query->where('model_type', $modelType);
    }

    /**
     * Scope for filtering by severity
     */
    public function scopeBySeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope for recent logs
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', Carbon::now()->subDays($days));
    }

    /**
     * Scope for high priority logs
     */
    public function scopeHighPriority($query)
    {
        return $query->whereIn('severity', ['high', 'critical']);
    }

    /**
     * Get formatted description
     */
    public function getFormattedDescriptionAttribute(): string
    {
        if ($this->description) {
            return $this->description;
        }

        $user = $this->user ? $this->user->name : 'Unknown User';
        $model = $this->model_type ? class_basename($this->model_type) : 'System';
        
        return match($this->action) {
            'create' => "{$user} created a new {$model}",
            'update' => "{$user} updated {$model} #{$this->model_id}",
            'delete' => "{$user} deleted {$model} #{$this->model_id}",
            'view' => "{$user} viewed {$model} #{$this->model_id}",
            'login' => "{$user} logged into admin panel",
            'logout' => "{$user} logged out of admin panel",
            default => "{$user} performed {$this->action} on {$model}",
        };
    }

    /**
     * Get severity color for UI
     */
    public function getSeverityColorAttribute(): string
    {
        return match($this->severity) {
            'low' => '#10B981',      // green
            'medium' => '#F59E0B',   // yellow
            'high' => '#EF4444',     // red
            'critical' => '#7C2D12', // dark red
            default => '#6B7280',    // gray
        };
    }

    /**
     * Log an admin action
     */
    public static function logAction(array $data): self
    {
        return self::create(array_merge([
            'user_id' => auth()->id(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'session_id' => session()->getId(),
            'route_name' => request()->route()?->getName(),
            'url' => request()->fullUrl(),
            'severity' => 'low',
        ], $data));
    }
}
