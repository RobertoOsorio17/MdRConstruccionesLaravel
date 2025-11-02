<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Impersonation Timeout
    |--------------------------------------------------------------------------
    |
    | This value determines the number of minutes an impersonation session
    | will remain active before automatically expiring. After expiration,
    | the admin will be automatically logged back into their original account.
    |
    */

    'timeout_minutes' => env('IMPERSONATION_TIMEOUT', 30),

    /*
    |--------------------------------------------------------------------------
    | Blocked Roles
    |--------------------------------------------------------------------------
    |
    | Users with these roles cannot be impersonated. This prevents privilege
    | escalation and ensures that only regular users can be impersonated.
    | Add any administrative role slugs used in your application.
    |
    */

    'blocked_roles' => [
        'super-admin',
        'admin',
        'administrator',
        'owner',
        'root',
    ],

    /*
    |--------------------------------------------------------------------------
    | Require Two-Factor Authentication
    |--------------------------------------------------------------------------
    |
    | When enabled, administrators must have 2FA enabled on their account
    | before they can impersonate other users. This adds an extra layer
    | of security to the impersonation feature.
    |
    */

    'require_2fa' => true,

    /*
    |--------------------------------------------------------------------------
    | Notify Target User
    |--------------------------------------------------------------------------
    |
    | When enabled, the target user will receive an email notification
    | when their account is being impersonated. This is disabled by default
    | to avoid confusion, but can be enabled for compliance purposes.
    |
    */

    'notify_target' => false,

    /*
    |--------------------------------------------------------------------------
    | Maximum Concurrent Sessions
    |--------------------------------------------------------------------------
    |
    | This value limits the number of concurrent impersonation sessions
    | that can be active at the same time across all administrators.
    | This helps prevent abuse and resource exhaustion.
    |
    */

    'max_concurrent_sessions' => 5,

    /*
    |--------------------------------------------------------------------------
    | Maximum Sessions Per User
    |--------------------------------------------------------------------------
    |
    | This value limits the number of concurrent impersonation sessions
    | that a single administrator can have active at the same time.
    | This prevents individual users from monopolizing impersonation resources.
    |
    | ✅ SECURITY: Recommended value is 2 or less to prevent abuse
    |
    */

    'max_sessions_per_user' => env('IMPERSONATION_MAX_SESSIONS_PER_USER', 2),

    /*
    |--------------------------------------------------------------------------
    | Session Cleanup Days
    |--------------------------------------------------------------------------
    |
    | Number of days to retain impersonation session records in the database
    | before they are automatically purged by the cleanup command.
    |
    */

    'cleanup_after_days' => 90,

];

