<?php

namespace App\Listeners;

use App\Events\SettingChanged;
use App\Events\MaintenanceModeToggled;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

/**
 * Clear related caches when settings change.
 * 
 * This listener ensures that cached data is invalidated when configuration
 * changes, preventing stale data from being served.
 */
class ClearRelatedCache implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle SettingChanged event.
     *
     * @param \App\Events\SettingChanged $event
     * @return void
     */
    public function handle(SettingChanged|MaintenanceModeToggled $event): void
    {
        try {
            if ($event instanceof SettingChanged) {
                $this->handleSettingChanged($event);
            } elseif ($event instanceof MaintenanceModeToggled) {
                $this->handleMaintenanceModeToggled($event);
            }
        } catch (\Exception $e) {
            Log::error('Failed to clear cache after setting change', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle setting changed event.
     *
     * @param \App\Events\SettingChanged $event
     * @return void
     */
    private function handleSettingChanged(SettingChanged $event): void
    {
        $settingKey = $event->setting->key;

        // Clear the specific setting cache
        Cache::forget("setting.{$settingKey}");

        // Clear related caches based on setting type
        match($settingKey) {
            // Logo/favicon changes - clear view cache
            'site_logo', 'site_favicon', 'og_image' => $this->clearViewCache(),
            
            // SEO settings - clear sitemap and meta cache
            'meta_description', 'meta_keywords', 'enable_sitemap' => $this->clearSeoCache(),
            
            // Performance settings - clear application cache
            'enable_cache', 'cache_ttl', 'enable_asset_compression' => $this->clearPerformanceCache(),
            
            // Social media - clear social cache
            'facebook_url', 'instagram_url', 'linkedin_url', 'twitter_url' => $this->clearSocialCache(),
            
            // General settings - clear config cache
            'site_name', 'site_tagline', 'site_description' => $this->clearConfigCache(),
            
            default => null,
        };

        Log::info('Cache cleared for setting', [
            'setting' => $settingKey,
        ]);
    }

    /**
     * Handle maintenance mode toggled event.
     *
     * @param \App\Events\MaintenanceModeToggled $event
     * @return void
     */
    private function handleMaintenanceModeToggled(MaintenanceModeToggled $event): void
    {
        // Clear all caches when maintenance mode changes
        Cache::flush();
        
        // Clear compiled views
        Artisan::call('view:clear');
        
        // Clear route cache
        Artisan::call('route:clear');

        Log::warning('All caches cleared due to maintenance mode toggle', [
            'enabled' => $event->enabled,
        ]);
    }

    /**
     * Clear view cache.
     *
     * @return void
     */
    private function clearViewCache(): void
    {
        Artisan::call('view:clear');
        Cache::tags(['views'])->flush();
    }

    /**
     * Clear SEO-related cache.
     *
     * @return void
     */
    private function clearSeoCache(): void
    {
        Cache::tags(['seo', 'sitemap', 'meta'])->flush();
        Cache::forget('sitemap');
    }

    /**
     * Clear performance-related cache.
     *
     * @return void
     */
    private function clearPerformanceCache(): void
    {
        if (config('cache.default') === 'file') {
            Artisan::call('cache:clear');
        }
    }

    /**
     * Clear social media cache.
     *
     * @return void
     */
    private function clearSocialCache(): void
    {
        Cache::tags(['social'])->flush();
    }

    /**
     * Clear config cache.
     *
     * @return void
     */
    private function clearConfigCache(): void
    {
        Artisan::call('config:clear');
        Cache::tags(['config'])->flush();
    }
}

