<?php

namespace App\Providers;

use App\Models\AdminSetting;
use App\Models\Post;
use App\Models\Category;
use App\Models\Comment;
use App\Models\ContactRequest;
use App\Models\User;
use App\Observers\PostObserver;
use App\Observers\CategoryObserver;
use App\Observers\CommentObserver;
use App\Observers\ContactRequestObserver;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

/**
 * Registers application service bindings and hydrates runtime configuration from persisted settings.
 * Also wires model observers and global framework tweaks needed during boot.
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Fix for MySQL index key length
        Schema::defaultStringLength(191);

        // ✅ Apply General Settings to runtime configuration
        $this->applyGeneralSettings();

        // ✅ Apply Email Settings to runtime configuration
        $this->applyEmailSettings();

        // ✅ Apply Performance Settings to runtime configuration
        $this->applyPerformanceSettings();

        // ✅ Register model observers for automatic cache invalidation and logging
        Post::observe(PostObserver::class);
        Category::observe(CategoryObserver::class);
        Comment::observe(CommentObserver::class);
        ContactRequest::observe(ContactRequestObserver::class);

        // ✅ Register authorization gates
        Gate::define('impersonate-user', [UserPolicy::class, 'impersonate']);
    }

    /**
     * Apply general settings from database to runtime configuration.
     */
    protected function applyGeneralSettings(): void
    {
        try {
            // Timezone
            $timezone = AdminSetting::getCachedValue('timezone', 'UTC', 3600);
            Config::set('app.timezone', $timezone);
            date_default_timezone_set($timezone);

            // Locale
            $locale = AdminSetting::getCachedValue('locale', 'es', 3600);
            Config::set('app.locale', $locale);
            app()->setLocale($locale);

            // Site name (for emails, etc.)
            $siteName = AdminSetting::getCachedValue('site_name', config('app.name'), 3600);
            Config::set('app.name', $siteName);
        } catch (\Exception $e) {
            // Silently fail if settings table doesn't exist yet (during migrations)
            \Log::debug('Could not load general settings: ' . $e->getMessage());
        }
    }

    /**
     * Apply email settings from database to runtime configuration.
     */
    protected function applyEmailSettings(): void
    {
        try {
            // Mail from name
            $mailFromName = AdminSetting::getCachedValue('mail_from_name', config('mail.from.name'), 3600);
            Config::set('mail.from.name', $mailFromName);

            // Mail from address
            $mailFromAddress = AdminSetting::getCachedValue('mail_from_address', config('mail.from.address'), 3600);
            Config::set('mail.from.address', $mailFromAddress);

            // SMTP Host
            $smtpHost = AdminSetting::getCachedValue('smtp_host', config('mail.mailers.smtp.host'), 3600);
            Config::set('mail.mailers.smtp.host', $smtpHost);

            // SMTP Port
            $smtpPort = AdminSetting::getCachedValue('smtp_port', config('mail.mailers.smtp.port'), 3600);
            Config::set('mail.mailers.smtp.port', $smtpPort);

            // SMTP Username
            $smtpUsername = AdminSetting::getCachedValue('smtp_username', config('mail.mailers.smtp.username'), 3600);
            Config::set('mail.mailers.smtp.username', $smtpUsername);

            // SMTP Password
            $smtpPassword = AdminSetting::getCachedValue('smtp_password', config('mail.mailers.smtp.password'), 3600);
            Config::set('mail.mailers.smtp.password', $smtpPassword);

            // SMTP Encryption
            $smtpEncryption = AdminSetting::getCachedValue('smtp_encryption', config('mail.mailers.smtp.encryption'), 3600);
            Config::set('mail.mailers.smtp.encryption', $smtpEncryption);
        } catch (\Exception $e) {
            // Silently fail if settings table doesn't exist yet (during migrations)
            \Log::debug('Could not load email settings: ' . $e->getMessage());
        }
    }

    /**
     * Apply performance settings from database to runtime configuration.
     */
    protected function applyPerformanceSettings(): void
    {
        try {
            // Cache enabled
            $cacheEnabled = AdminSetting::getCachedValue('cache_enabled', true, 3600);
            Config::set('cache.enabled', $cacheEnabled);

            // Cache TTL (in seconds)
            $cacheTtl = AdminSetting::getCachedValue('cache_ttl', 3600, 3600);
            Config::set('cache.default_ttl', $cacheTtl);

            // Minify HTML
            $minifyHtml = AdminSetting::getCachedValue('minify_html', false, 3600);
            Config::set('app.minify_html', $minifyHtml);

            // Minify CSS
            $minifyCss = AdminSetting::getCachedValue('minify_css', false, 3600);
            Config::set('app.minify_css', $minifyCss);
        } catch (\Exception $e) {
            // Silently fail if settings table doesn't exist yet (during migrations)
            \Log::debug('Could not load performance settings: ' . $e->getMessage());
        }
    }
}
