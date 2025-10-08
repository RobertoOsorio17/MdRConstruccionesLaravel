<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Records every administrative setting change to provide a detailed audit trail for governance.
 * Captures before-and-after values alongside actor metadata, enabling compliance reporting and rollbacks.
 */
class AdminSettingHistory extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'admin_setting_history';

    /**
     * Indicates if the model should be timestamped.
     * Only created_at is used, no updated_at.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'setting_id',
        'user_id',
        'old_value',
        'new_value',
        'ip_address',
        'user_agent',
        'change_reason',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Boot the model and set up event listeners.
     */
    protected static function boot()
    {
        parent::boot();

        // Automatically set created_at when creating a new history record
        static::creating(function ($history) {
            if (!$history->created_at) {
                $history->created_at = now();
            }
        });
    }

    /**
     * Get the setting that this history entry belongs to.
     */
    public function setting(): BelongsTo
    {
        return $this->belongsTo(AdminSetting::class, 'setting_id');
    }

    /**
     * Get the user who made this change.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the old value cast to the appropriate type based on the setting type.
     *
     * @return mixed
     */
    public function getOldValueAttribute($value)
    {
        if (is_null($value)) {
            return null;
        }

        $setting = $this->setting;
        if (!$setting) {
            return $value;
        }

        return $this->castValue($value, $setting->type);
    }

    /**
     * Get the new value cast to the appropriate type based on the setting type.
     *
     * @return mixed
     */
    public function getNewValueAttribute($value)
    {
        if (is_null($value)) {
            return null;
        }

        $setting = $this->setting;
        if (!$setting) {
            return $value;
        }

        return $this->castValue($value, $setting->type);
    }

    /**
     * Cast a value to the appropriate type.
     *
     * @param mixed $value
     * @param string $type
     * @return mixed
     */
    private function castValue($value, string $type)
    {
        return match($type) {
            'boolean' => (bool) $value,
            'integer' => (int) $value,
            'float' => (float) $value,
            'json', 'array' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Scope a query to only include recent history entries.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRecent($query, int $limit = 10)
    {
        return $query->latest('created_at')->limit($limit);
    }

    /**
     * Scope a query to only include history for a specific user.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to only include history for a specific setting.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $settingId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeBySetting($query, int $settingId)
    {
        return $query->where('setting_id', $settingId);
    }

    /**
     * Scope a query to include history within a date range.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $from
     * @param string $to
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDateRange($query, string $from, string $to)
    {
        return $query->whereBetween('created_at', [$from, $to]);
    }

    /**
     * Get a human-readable description of the change.
     *
     * @return string
     */
    public function getChangeDescription(): string
    {
        $setting = $this->setting;
        if (!$setting) {
            return 'Setting changed';
        }

        $userName = $this->user ? $this->user->name : 'System';
        $settingLabel = $setting->label;

        return "{$userName} changed {$settingLabel} from '{$this->old_value}' to '{$this->new_value}'";
    }

    /**
     * Get the change summary for display.
     *
     * @return array
     */
    public function getChangeSummary(): array
    {
        return [
            'setting_key' => $this->setting->key ?? null,
            'setting_label' => $this->setting->label ?? null,
            'old_value' => $this->old_value,
            'new_value' => $this->new_value,
            'changed_by' => $this->user->name ?? 'System',
            'changed_at' => $this->created_at->format('Y-m-d H:i:s'),
            'ip_address' => $this->ip_address,
            'reason' => $this->change_reason,
        ];
    }
}
