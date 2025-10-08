<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * Lightweight key-value settings store used for legacy configuration needs.
 * Provides cached getters and setters to minimize database lookups.
 */
class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
    ];

    /**
     * Get a setting value by key.
     */
    public static function get($key, $default = null)
    {
        return Cache::remember("setting.{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            
            if (!$setting) {
                return $default;
            }
            
            return static::castValue($setting->value, $setting->type);
        });
    }

    /**
     * Set a setting value.
     */
    public static function set($key, $value, $type = 'string')
    {
        $setting = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => is_array($value) ? json_encode($value) : $value,
                'type' => $type,
            ]
        );
        
        Cache::forget("setting.{$key}");
        
        return $setting;
    }

    /**
     * Cast value to appropriate type.
     */
    protected static function castValue($value, $type)
    {
        switch ($type) {
            case 'boolean':
                return (bool) $value;
            case 'integer':
            case 'number':
                return (int) $value;
            case 'float':
                return (float) $value;
            case 'json':
            case 'array':
                return json_decode($value, true);
            default:
                return $value;
        }
    }

    /**
     * Get all settings as key-value pairs.
     */
    public static function getAllSettings()
    {
        return Cache::remember('settings.all', 3600, function () {
            return static::query()->get()->pluck('value', 'key')->map(function ($value, $key) {
                $setting = static::where('key', $key)->first();
                return static::castValue($value, $setting->type ?? 'string');
            });
        });
    }

    /**
     * Clear the settings cache.
     */
    public static function clearCache()
    {
        Cache::forget('settings.all');
        
        // Clear individual setting caches
        static::getAllSettings()->keys()->each(function ($key) {
            Cache::forget("setting.{$key}");
        });
    }
}
