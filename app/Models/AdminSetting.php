<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

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
            'boolean' => (bool) $value,
            'integer' => (int) $value,
            'float' => (float) $value,
            'json', 'array' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Set the value attribute with proper type handling and encryption
     */
    public function setValueAttribute($value)
    {
        // Convert to string for storage
        if (in_array($this->type, ['json', 'array'])) {
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
}
