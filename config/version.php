<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Application Version
    |--------------------------------------------------------------------------
    |
    | This value represents the current version of the application following
    | Semantic Versioning 2.0.0 (https://semver.org/)
    |
    | Format: MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
    |
    | - MAJOR: Incompatible API changes
    | - MINOR: Backwards-compatible functionality additions
    | - PATCH: Backwards-compatible bug fixes
    | - PRERELEASE: alpha, beta, rc.1, etc.
    | - BUILD: Build metadata
    |
    */

    'version' => env('APP_VERSION', '0.9.2-beta'),

    /*
    |--------------------------------------------------------------------------
    | Version Components
    |--------------------------------------------------------------------------
    */

    'major' => 0,
    'minor' => 9,
    'patch' => 2,
    'prerelease' => 'beta',
    'build' => null,

    /*
    |--------------------------------------------------------------------------
    | Release Information
    |--------------------------------------------------------------------------
    */

    'release_date' => '2025-11-02',
    'release_name' => 'Console Cleanup Release',

    /*
    |--------------------------------------------------------------------------
    | Version History
    |--------------------------------------------------------------------------
    |
    | Major milestones in the application's version history
    |
    */

    'history' => [
        '0.9.2-beta' => [
            'date' => '2025-11-02',
            'name' => 'Console Cleanup Release',
            'highlights' => [
                'Fixed all React DOM property warnings (fetchpriority → fetchPriority)',
                'Fixed MUI Grid deprecation warnings',
                'Fixed MUI Menu Fragment errors',
                'Fixed PWA manifest 404 errors',
                'Created PWA icon assets',
                '100% clean console output',
            ],
        ],
        '0.9.1-beta' => [
            'date' => '2025-11-02',
            'name' => 'Performance Optimization Release',
            'highlights' => [
                'Fixed critical 15-20s page load issue',
                'Reduced SQL queries by 92% (53+ to 4)',
                'Implemented AdminSetting caching',
                'Optimized HandleInertiaRequests middleware',
                'Migrated to Tailwind CSS v4',
            ],
        ],
        '0.9.0-beta' => [
            'date' => '2025-11-02',
            'name' => 'Security Hardening Release',
            'highlights' => [
                'Comprehensive security audit completed',
                'XSS vulnerabilities fixed with DOMPurify',
                'CSP policies hardened with nonce-based implementation',
                '2FA verification middleware for privileged roles',
                'Rate limiting and automatic IP banning',
                'Session security improvements',
                'Audit logging with anonymized session IDs',
                'Laravel 12.36.1 upgrade',
            ],
        ],
        '0.8.0-beta' => [
            'date' => '2025-10-15',
            'name' => 'Feature Expansion',
            'highlights' => [
                'User management system',
                'Role-based access control',
                'Device tracking',
                'OAuth social login',
            ],
        ],
        '0.7.0-beta' => [
            'date' => '2025-09-01',
            'name' => 'Core Features',
            'highlights' => [
                'Blog system with ML recommendations',
                'Comment system with moderation',
                'User profiles and settings',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Changelog URL
    |--------------------------------------------------------------------------
    */

    'changelog_url' => env('APP_CHANGELOG_URL', '/changelog'),

    /*
    |--------------------------------------------------------------------------
    | Display Settings
    |--------------------------------------------------------------------------
    */

    'display' => [
        'show_in_footer' => env('VERSION_SHOW_IN_FOOTER', true),
        'show_in_admin' => env('VERSION_SHOW_IN_ADMIN', true),
        'show_prerelease' => env('VERSION_SHOW_PRERELEASE', true),
    ],
];

