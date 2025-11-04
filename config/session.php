<?php

use Illuminate\Support\Str;

// ✅ SECURITY FIX: Default session lifetime reduced to 15 minutes
// This is the base session lifetime - role-based middleware will apply stricter limits
$configuredLifetime = (int) env('SESSION_LIFETIME', 15);
$maxLifetime = (int) env('SESSION_MAX_LIFETIME', 60); // Max 60 minutes for regular users
$minLifetime = 5; // Minimum 5 minutes
$safeLifetime = max($minLifetime, min($configuredLifetime, $maxLifetime));

$environment = env('APP_ENV', 'production');
$forcedSecureEnvironments = ['production', 'staging'];
$configuredSecureCookie = env('SESSION_SECURE_COOKIE');

if (in_array($environment, $forcedSecureEnvironments, true)) {
    $secureCookies = true;
} elseif ($configuredSecureCookie === null) {
    $secureCookies = $environment !== 'local';
} else {
    $normalized = strtolower((string) $configuredSecureCookie);
    $secureCookies = in_array($normalized, ['1', 'true', 'on', 'yes'], true);
}

return [

    /*
    |--------------------------------------------------------------------------
    | Default Session Driver
    |--------------------------------------------------------------------------
    |
    | This option determines the default session driver that is utilized for
    | incoming requests. Laravel supports a variety of storage options to
    | persist session data. Database storage is a great default choice.
    |
    | Supported: "file", "cookie", "database", "memcached",
    |            "redis", "dynamodb", "array"
    |
    */

    'driver' => env('SESSION_DRIVER', 'database'),

    'serialization' => env('SESSION_SERIALIZATION', 'json'),

    /*
    |--------------------------------------------------------------------------
    | Session Lifetime
    |--------------------------------------------------------------------------
    |
    | Here you may specify the number of minutes that you wish the session
    | to be allowed to remain idle before it expires. If you want them
    | to expire immediately when the browser is closed then you may
    | indicate that via the expire_on_close configuration option.
    |
    */

    'lifetime' => $safeLifetime,

    'expire_on_close' => env('SESSION_EXPIRE_ON_CLOSE', false),

    /*
    |--------------------------------------------------------------------------
    | Session Encryption
    |--------------------------------------------------------------------------
    |
    | This option allows you to easily specify that all of your session data
    | should be encrypted before it's stored. All encryption is performed
    | automatically by Laravel and you may use the session like normal.
    |
    */

    'encrypt' => env('SESSION_ENCRYPT', true),

    /*
    |--------------------------------------------------------------------------
    | Session File Location
    |--------------------------------------------------------------------------
    |
    | When utilizing the "file" session driver, the session files are placed
    | on disk. The default storage location is defined here; however, you
    | are free to provide another location where they should be stored.
    |
    */

    'files' => storage_path('framework/sessions'),

    /*
    |--------------------------------------------------------------------------
    | Session Database Connection
    |--------------------------------------------------------------------------
    |
    | When using the "database" or "redis" session drivers, you may specify a
    | connection that should be used to manage these sessions. This should
    | correspond to a connection in your database configuration options.
    |
    */

    'connection' => env('SESSION_CONNECTION'),

    /*
    |--------------------------------------------------------------------------
    | Session Database Table
    |--------------------------------------------------------------------------
    |
    | When using the "database" session driver, you may specify the table to
    | be used to store sessions. Of course, a sensible default is defined
    | for you; however, you're welcome to change this to another table.
    |
    */

    'table' => env('SESSION_TABLE', 'sessions'),

    /*
    |--------------------------------------------------------------------------
    | Session Cache Store
    |--------------------------------------------------------------------------
    |
    | When using one of the framework's cache driven session backends, you may
    | define the cache store which should be used to store the session data
    | between requests. This must match one of your defined cache stores.
    |
    | Affects: "dynamodb", "memcached", "redis"
    |
    */

    'store' => env('SESSION_STORE'),

    /*
    |--------------------------------------------------------------------------
    | Session Sweeping Lottery
    |--------------------------------------------------------------------------
    |
    | Some session drivers must manually sweep their storage location to get
    | rid of old sessions from storage. Here are the chances that it will
    | happen on a given request. By default, the odds are 2 out of 100.
    |
    */

    'lottery' => [2, 100],

    /*
    |--------------------------------------------------------------------------
    | Session Cookie Name
    |--------------------------------------------------------------------------
    |
    | Here you may change the name of the session cookie that is created by
    | the framework. Typically, you should not need to change this value
    | since doing so does not grant a meaningful security improvement.
    |
    */

    'cookie' => env(
        'SESSION_COOKIE',
        Str::slug(env('APP_NAME', 'laravel')).'-session'
    ),

    /*
    |--------------------------------------------------------------------------
    | Session Cookie Path
    |--------------------------------------------------------------------------
    |
    | The session cookie path determines the path for which the cookie will
    | be regarded as available. Typically, this will be the root path of
    | your application, but you're free to change this when necessary.
    |
    */

    'path' => env('SESSION_PATH', '/'),

    /*
    |--------------------------------------------------------------------------
    | Session Cookie Domain
    |--------------------------------------------------------------------------
    |
    | This value determines the domain and subdomains the session cookie is
    | available to. By default, the cookie will be available to the root
    | domain and all subdomains. Typically, this shouldn't be changed.
    |
    */

    'domain' => env('SESSION_DOMAIN'),

    /*
    |--------------------------------------------------------------------------
    | HTTPS Only Cookies
    |--------------------------------------------------------------------------
    |
    | By setting this option to true, session cookies will only be sent back
    | to the server if the browser has a HTTPS connection. This will keep
    | the cookie from being sent to you when it can't be done securely.
    |
    */

    'secure' => $secureCookies,

    /*
    |--------------------------------------------------------------------------
    | HTTP Access Only
    |--------------------------------------------------------------------------
    |
    | Setting this value to true will prevent JavaScript from accessing the
    | value of the cookie and the cookie will only be accessible through
    | the HTTP protocol. It's unlikely you should disable this option.
    |
    */

    'http_only' => env('SESSION_HTTP_ONLY', true),

    /*
    |--------------------------------------------------------------------------
    | Same-Site Cookies
    |--------------------------------------------------------------------------
    |
    | This option determines how your cookies behave when cross-site requests
    | take place, and can be used to mitigate CSRF attacks. By default, we
    | will set this value to "lax" to permit secure cross-site requests.
    |
    | See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value
    |
    | Supported: "lax", "strict", "none", null
    |
    */

    'same_site' => env('SESSION_SAME_SITE', 'strict'),

    /*
    |--------------------------------------------------------------------------
    | Partitioned Cookies
    |--------------------------------------------------------------------------
    |
    | Setting this value to true will tie the cookie to the top-level site for
    | a cross-site context. Partitioned cookies are accepted by the browser
    | when flagged "secure" and the Same-Site attribute is set to "none".
    |
    */

    'partitioned' => env('SESSION_PARTITIONED_COOKIE', false),

    /*
    |--------------------------------------------------------------------------
    | Session Integrity Validation
    |--------------------------------------------------------------------------
    |
    | This option controls whether session integrity validation is enabled.
    | When enabled, the ValidateSessionIntegrity middleware will check that
    | critical session data (user_id, roles) hasn't been tampered with.
    |
    | This provides protection against session hijacking and tampering attacks.
    | It's recommended to keep this enabled in production environments.
    |
    | Default: true (enabled)
    |
    */

    'validate_integrity' => env('SESSION_VALIDATE_INTEGRITY', true),

    /*
    |--------------------------------------------------------------------------
    | Concurrent Sessions Limits
    |--------------------------------------------------------------------------
    |
    | Define the maximum number of concurrent sessions allowed per user role.
    | When a user exceeds this limit, the oldest sessions will be terminated.
    |
    | - admin: 1 session (highest security)
    | - editor/moderator: 2 sessions
    | - user: 3 sessions (default)
    |
    */

    'concurrent_sessions' => [
        'admin' => env('SESSION_LIMIT_ADMIN', 1),
        'editor' => env('SESSION_LIMIT_EDITOR', 2),
        'moderator' => env('SESSION_LIMIT_MODERATOR', 2),
        'user' => env('SESSION_LIMIT_USER', 3),
    ],

    /*
    |--------------------------------------------------------------------------
    | Session Timeouts by Role
    |--------------------------------------------------------------------------
    |
    | Define session timeout (in minutes) for different user roles.
    | After this period of inactivity, the session will be terminated.
    |
    */

    'role_timeouts' => [
        'admin' => env('SESSION_TIMEOUT_ADMIN', 15),
        'editor' => env('SESSION_TIMEOUT_EDITOR', 30),
        'moderator' => env('SESSION_TIMEOUT_MODERATOR', 30),
        'user' => env('SESSION_TIMEOUT_USER', 60),
    ],

    /*
    |--------------------------------------------------------------------------
    | Session Structure Version
    |--------------------------------------------------------------------------
    |
    | This version number is used to track the structure of session data.
    | If the structure changes (e.g., during an update), sessions with
    | mismatched versions will be invalidated for security.
    |
    */

    'structure_version' => env('SESSION_STRUCTURE_VERSION', '1.0.0'),

];
