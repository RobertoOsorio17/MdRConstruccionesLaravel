<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

/**
 * Represent the admin audit log entity.
 */
class AdminAuditLog extends Model
{
    /**
     * Mass-assignable attributes for audit log records.
     *
     * @var array<int, string>
     */
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

    /**
     * Attribute casting definitions for the model.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'request_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the administrator who performed the action.
     *
     * @return BelongsTo Relationship instance linking to the acting user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Resolve the model instance that was affected by the action.
     *
     * @return Model|null The affected model instance when available.
     */
    public function model()
    {
        if ($this->model_type && $this->model_id) {
            return $this->model_type::find($this->model_id);
        }
        return null;
    }

    /**
     * Scope a query to only include logs for the given action name.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query The base audit log query.
     * @param string $action The action name to filter by.
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope a query to only include logs belonging to the given user.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query The base audit log query.
     * @param int $userId The user identifier to filter by.
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to only include logs generated for a model type.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query The base audit log query.
     * @param string $modelType The model class to filter by.
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByModelType($query, string $modelType)
    {
        return $query->where('model_type', $modelType);
    }

    /**
     * Scope a query to only include logs with a given severity.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query The base audit log query.
     * @param string $severity The severity level to include.
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeBySeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope a query to only include logs created within the supplied timeframe.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query The base audit log query.
     * @param int $days Number of days to include in the result window.
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', Carbon::now()->subDays($days));
    }

    /**
     * Scope a query to only include logs marked as high priority.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query The base audit log query.
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeHighPriority($query)
    {
        return $query->whereIn('severity', ['high', 'critical']);
    }

    /**
     * Accessor that produces a human-readable description for the log entry.
     *
     * @return string Rendered description containing contextual information.
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
     * Accessor that returns the severity color used by the admin UI.
     *
     * @return string Hex color value mapped from the severity level.
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
     * Persist a new audit log entry based on the supplied context.
     *
     * @param array<string, mixed> $data Contextual attributes describing the audit event.
     * @return self Newly created audit log instance.
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
