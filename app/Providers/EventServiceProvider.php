<?php

namespace App\Providers;

use App\Events\CommentReported;
use App\Events\MaintenanceModeToggled;
use App\Events\PostCreated;
use App\Events\SettingChanged;
use App\Listeners\ClearRelatedCache;
use App\Listeners\HandleImpersonationOnLogout;
use App\Listeners\InvalidateMLCacheOnPostCreated;
use App\Listeners\LogSettingChange;
use App\Listeners\NotifyAdminsOfChange;
use App\Listeners\NotifyModeratorsOfReport;
use Illuminate\Auth\Events\Logout;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

/**
 * Maps domain events to their listeners, centralizing the application's event-driven wiring.
 * Extends Laravel's EventServiceProvider to keep listener registration tidy.
 */
class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        SettingChanged::class => [
            LogSettingChange::class,
            ClearRelatedCache::class,
            NotifyAdminsOfChange::class,
        ],
        MaintenanceModeToggled::class => [
            ClearRelatedCache::class,
            NotifyAdminsOfChange::class,
        ],
        // ✅ FIXED: Register ML cache invalidation on new posts
        PostCreated::class => [
            InvalidateMLCacheOnPostCreated::class,
        ],
        // ✅ NEW: Notify moderators when comments are reported
        CommentReported::class => [
            NotifyModeratorsOfReport::class,
        ],
        // ✅ NEW: Handle impersonation on logout
        Logout::class => [
            HandleImpersonationOnLogout::class,
        ],
    ];
}
