<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Ban Appeal System Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains all the configuration options for the ban appeal
    | system. You can customize various aspects of the appeal process here.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Appeal Limits
    |--------------------------------------------------------------------------
    |
    | Configure the limits for ban appeals.
    |
    */
    'limits' => [
        // Maximum number of appeals per ban (1 = one appeal per ban)
        'max_appeals_per_ban' => 1,

        // Minimum time (in minutes) between duplicate appeal attempts
        'duplicate_prevention_window' => 5,

        // Rate limiting: maximum appeals per hour per user
        'max_appeals_per_hour' => 3,
    ],

    /*
    |--------------------------------------------------------------------------
    | Appeal Reason Validation
    |--------------------------------------------------------------------------
    |
    | Configure validation rules for appeal reasons.
    |
    */
    'reason' => [
        // Minimum length of appeal reason (in characters)
        'min_length' => 50,

        // Maximum length of appeal reason (in characters)
        'max_length' => 2000,

        // Enable spam pattern detection
        'spam_detection_enabled' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Evidence Upload Configuration
    |--------------------------------------------------------------------------
    |
    | Configure file upload settings for evidence.
    |
    */
    'evidence' => [
        // Maximum file size in bytes (5MB default)
        'max_file_size' => 5 * 1024 * 1024,

        // Allowed MIME types for evidence files
        'allowed_mime_types' => [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
        ],

        // Allowed file extensions
        'allowed_extensions' => [
            'jpg',
            'jpeg',
            'png',
            'gif',
            'webp',
        ],

        // Image dimension validation
        'dimensions' => [
            'min_width' => 50,
            'min_height' => 50,
            'max_width' => 8000,
            'max_height' => 8000,
            'max_aspect_ratio' => 10, // Prevent extremely elongated images
        ],

        // Storage disk for evidence files
        'storage_disk' => 'public',

        // Storage path for evidence files
        'storage_path' => 'ban-appeals',
    ],

    /*
    |--------------------------------------------------------------------------
    | Admin Response Validation
    |--------------------------------------------------------------------------
    |
    | Configure validation rules for admin responses.
    |
    */
    'admin_response' => [
        // Minimum length for rejection/info request responses (in characters)
        'min_length' => 20,

        // Maximum length for admin responses (in characters)
        'max_length' => 1000,
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Settings
    |--------------------------------------------------------------------------
    |
    | Configure notification behavior for the appeal system.
    |
    */
    'notifications' => [
        // Enable email notifications to users
        'user_notifications_enabled' => true,

        // Enable email notifications to admins
        'admin_notifications_enabled' => true,

        // Admin email addresses to notify on new appeals
        'admin_emails' => [
            // Add admin emails here, or leave empty to use all admin users
        ],

        // Queue notifications for background processing
        'queue_notifications' => true,

        // Queue name for notifications
        'queue_name' => 'default',
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Settings
    |--------------------------------------------------------------------------
    |
    | Configure security features for the appeal system.
    |
    */
    'security' => [
        // Enable IP address validation
        'validate_ip' => true,

        // Enable user agent validation
        'validate_user_agent' => true,

        // Enable suspicious user agent detection
        'detect_suspicious_agents' => true,

        // IP-based rate limiting (requests per time window)
        'ip_rate_limit' => [
            'max_attempts' => 5,
            'decay_minutes' => 5,
        ],

        // Token expiration (in days) - 0 = never expires
        'token_expiration_days' => 0,

        // Enable file integrity validation
        'validate_file_integrity' => true,

        // Generate file hashes for uploaded evidence
        'generate_file_hashes' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Spam Detection Patterns
    |--------------------------------------------------------------------------
    |
    | Configure patterns for spam detection in appeal reasons.
    |
    */
    'spam_patterns' => [
        // Keywords that indicate spam
        'keywords' => [
            'viagra',
            'cialis',
            'casino',
            'lottery',
            'prize',
            'winner',
            'click here',
            'buy now',
        ],

        // Maximum number of URLs allowed in appeal reason
        'max_urls' => 3,

        // Maximum consecutive character repetition
        'max_char_repetition' => 20,
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging Configuration
    |--------------------------------------------------------------------------
    |
    | Configure logging behavior for the appeal system.
    |
    */
    'logging' => [
        // Enable comprehensive audit logging
        'audit_logging_enabled' => true,

        // Log channel to use
        'log_channel' => 'stack',

        // Log level for appeal events
        'log_level' => 'info',

        // Log all access attempts
        'log_access_attempts' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | UI Configuration
    |--------------------------------------------------------------------------
    |
    | Configure UI-related settings.
    |
    */
    'ui' => [
        // Number of appeals per page in admin panel
        'per_page' => 15,

        // Maximum per_page value allowed
        'max_per_page' => 100,

        // Default status filter in admin panel
        'default_status_filter' => 'pending',

        // Show evidence thumbnails in list view
        'show_thumbnails' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Status Labels
    |--------------------------------------------------------------------------
    |
    | Customize status labels for different appeal states.
    |
    */
    'status_labels' => [
        'pending' => 'Pendiente',
        'approved' => 'Aprobada',
        'rejected' => 'Rechazada',
        'more_info_requested' => 'Información Requerida',
    ],

    /*
    |--------------------------------------------------------------------------
    | Auto-Actions
    |--------------------------------------------------------------------------
    |
    | Configure automatic actions based on certain conditions.
    |
    */
    'auto_actions' => [
        // Automatically mark appeals as stale after X days of inactivity
        'mark_stale_after_days' => 30,

        // Automatically close stale appeals
        'auto_close_stale' => false,

        // Send reminder to admins for pending appeals after X days
        'admin_reminder_after_days' => 7,
    ],

];

