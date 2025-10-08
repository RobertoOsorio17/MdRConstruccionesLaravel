<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Cache;

/**
 * Central repository for configurable administrative settings with casting, encryption, and history tracking helpers.
 * Provides convenient accessors, caching, and validation utilities that power the system settings UI.
 */
class AdminSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
        'validation_rules',
        'options',
        'is_public',
        'is_encrypted',
        'sort_order',
    ];

    protected $casts = [
        'validation_rules' => 'array',
        'options' => 'array',
        'is_public' => 'boolean',
        'is_encrypted' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the value attribute with proper type casting and decryption
     */
    public function getValueAttribute($value)
    {
        // Decrypt if encrypted
        if ($this->is_encrypted && $value) {
            try {
                $value = Crypt::decryptString($value);
            } catch (\Exception $e) {
                return null;
            }
        }

        // Cast to proper type
        return match($this->type) {
            'boolean' => $this->castBooleanValue($value),
            'integer' => (int) $value,
            'float' => (float) $value,
            'json', 'array' => $this->castJsonValue($value),
            default => $value,
        };
    }

    /**
     * Set the value attribute with proper type handling and encryption
     */
    public function setValueAttribute($value)
    {
        // Convert to string for storage
        if ($this->type === 'boolean') {
            $value = $this->castBooleanValue($value) ? '1' : '0';
        } elseif (in_array($this->type, ['json', 'array'])) {
            // Return null for empty arrays instead of encoding to "[]"
            if (is_null($value) || (is_array($value) && empty($value))) {
                $this->attributes['value'] = null;
                return;
            }
            $value = json_encode($value);
        } elseif (is_bool($value)) {
            $value = $value ? '1' : '0';
        } else {
            $value = (string) $value;
        }

        // Encrypt if needed
        if ($this->is_encrypted) {
            $value = Crypt::encryptString($value);
        }

        $this->attributes['value'] = $value;
    }

    /**
     * Scope for public settings
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for settings by group
     */
    public function scopeByGroup($query, string $group)
    {
        return $query->where('group', $group);
    }

    /**
     * Get setting value by key
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set setting value by key
     */
    public static function setValue(string $key, $value): bool
    {
        $setting = static::where('key', $key)->first();
        
        if ($setting) {
            $setting->value = $value;
            return $setting->save();
        }

        return false;
    }

    /**
     * Get all settings as key-value pairs
     */
    public static function getAllSettings(bool $publicOnly = false): array
    {
        $query = static::query();
        
        if ($publicOnly) {
            $query->public();
        }

        return $query->pluck('value', 'key')->toArray();
    }

    /**
     * Get settings grouped by group
     */
    public static function getGroupedSettings(bool $publicOnly = false): array
    {
        $query = static::orderBy('group')->orderBy('sort_order');

        if ($publicOnly) {
            $query->public();
        }

        return $query->get()->groupBy('group')->toArray();
    }

    /**
     * Get the history of changes for this setting.
     */
    public function history(): HasMany
    {
        return $this->hasMany(AdminSettingHistory::class, 'setting_id');
    }

    /**
     * Get the history of changes for this setting.
     *
     * @param int $limit Maximum number of history entries to return
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getHistory(int $limit = 50)
    {
        return $this->history()
                    ->with('user:id,name')
                    ->latest('created_at')
                    ->limit($limit)
                    ->get();
    }

    /**
     * Revert this setting to a previous value from history.
     *
     * @param int $historyId The ID of the history entry to revert to
     * @return bool
     */
    public function revertTo(int $historyId): bool
    {
        $historyEntry = $this->history()->find($historyId);

        if (!$historyEntry) {
            return false;
        }

        // Store current value before reverting
        $currentValue = $this->value;

        // Revert to old value
        $this->value = $historyEntry->old_value;
        $saved = $this->save();

        // Log the revert action
        if ($saved) {
            AdminSettingHistory::create([
                'setting_id' => $this->id,
                'user_id' => auth()->id(),
                'old_value' => $currentValue,
                'new_value' => $historyEntry->old_value,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'change_reason' => "Reverted to value from " . $historyEntry->created_at->format('Y-m-d H:i:s'),
            ]);
        }

        return $saved;
    }

    /**
     * Get the options for select-type settings.
     *
     * @return array
     */
    public function getOptions(): array
    {
        if ($this->type !== 'select' || !$this->options) {
            return [];
        }

        return $this->options;
    }

    /**
     * Set setting value with history tracking.
     *
     * @param string $key
     * @param mixed $value
     * @param string|null $reason Optional reason for the change
     * @return bool
     */
    public static function setValueWithHistory(string $key, $value, ?string $reason = null): bool
    {
        $setting = static::where('key', $key)->first();

        if (!$setting) {
            return false;
        }

        // Store old value before changing
        $oldValue = $setting->getRawOriginal('value');

        // Update the value
        $setting->value = $value;
        $saved = $setting->save();

        // Record the change in history
        if ($saved) {
            AdminSettingHistory::create([
                'setting_id' => $setting->id,
                'user_id' => auth()->id(),
                'old_value' => $oldValue,
                'new_value' => $setting->getRawOriginal('value'),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'change_reason' => $reason,
            ]);

            // Clear cache for this setting
            Cache::forget("setting.{$key}");
        }

        return $saved;
    }

    /**
     * Get setting value with caching.
     *
     * @param string $key
     * @param mixed $default
     * @param int $ttl Cache TTL in seconds (default: 3600)
     * @return mixed
     */
    public static function getCachedValue(string $key, $default = null, int $ttl = 3600)
    {
        return Cache::remember("setting.{$key}", $ttl, function () use ($key, $default) {
            return static::getValue($key, $default);
        });
    }

    /**
     * Clear cache for a specific setting or all settings.
     *
     * @param string|null $key If null, clears all setting caches
     * @return void
     */
    public static function clearCache(?string $key = null): void
    {
        if ($key) {
            Cache::forget("setting.{$key}");
        } else {
            // Clear all setting caches
            $keys = static::pluck('key');
            foreach ($keys as $settingKey) {
                Cache::forget("setting.{$settingKey}");
            }
        }
    }

    /**
     * Get validation rules for this setting.
     *
     * @return array
     */
    public function getValidationRules(): array
    {
        return $this->validation_rules ?? [];
    }

    /**
     * Check if this setting has a specific validation rule.
     *
     * @param string $rule
     * @return bool
     */
    public function hasValidationRule(string $rule): bool
    {
        $rules = $this->getValidationRules();

        foreach ($rules as $r) {
            if (is_string($r) && str_starts_with($r, $rule)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if this setting is required.
     *
     * @return bool
     */
    public function isRequired(): bool
    {
        return $this->hasValidationRule('required');
    }

    /**
     * Normalize boolean-like values to real booleans.
     *
     * @param mixed $value
     * @return bool
     */
    private function castBooleanValue(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return (bool) ((int) $value);
        }

        if (is_string($value)) {
            $normalized = strtolower(trim($value));

            if ($normalized === '' || $normalized === 'null') {
                return false;
            }

            $filtered = filter_var(
                $normalized,
                FILTER_VALIDATE_BOOLEAN,
                FILTER_NULL_ON_FAILURE
            );

            return $filtered ?? false;
        }

        return (bool) $value;
    }

    /**
     * Cast stored JSON/array representations back to PHP arrays.
     *
     * @param mixed $value
     * @return array|null
     */
    private function castJsonValue(mixed $value): array
    {
        if (is_null($value) || $value === '') {
            return [];
        }

        if (is_array($value)) {
            return $value;
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }

            return [];
        }

        return [];
    }
}
