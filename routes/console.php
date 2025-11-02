<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\ProcessScheduledNotifications;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule impersonation session cleanup
Schedule::command('impersonation:cleanup --force')
    ->daily()
    ->at('03:00')
    ->description('Clean up old impersonation session records (older than 90 days)');

// Schedule expired bans cleanup
Schedule::command('bans:cleanup --force')
    ->hourly()
    ->description('Mark expired user and IP bans as inactive');

// Schedule trusted device pruning
Schedule::command('trusted-devices:prune --days=45')
    ->dailyAt('02:30')
    ->description('Remove expired or stale trusted device entries');

// Schedule processing of scheduled notifications
Schedule::job(new ProcessScheduledNotifications())
    ->everyMinute()
    ->description('Process scheduled user notifications that are due to be sent');
