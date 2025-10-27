<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Admin Panel Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración general del panel de administración
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Inactivity Detection Settings
    |--------------------------------------------------------------------------
    |
    | Configuración del sistema de detección de inactividad (AFK)
    | Todos los tiempos están en milisegundos
    |
    */

    // Habilitar/deshabilitar detección de inactividad
    'inactivity_detection_enabled' => env('ADMIN_INACTIVITY_DETECTION_ENABLED', true),

    // Tiempo de inactividad antes de cerrar sesión (en milisegundos)
    // Por defecto: 15 minutos (900,000 ms)
    'inactivity_timeout' => env('ADMIN_INACTIVITY_TIMEOUT', 15 * 60 * 1000),

    // Tiempo de advertencia antes del cierre (en milisegundos)
    // Por defecto: 3 minutos (180,000 ms)
    'inactivity_warning_time' => env('ADMIN_INACTIVITY_WARNING_TIME', 3 * 60 * 1000),

    // Intervalo de heartbeat al servidor (en milisegundos)
    // Por defecto: 2 minutos (120,000 ms)
    'heartbeat_interval' => env('ADMIN_HEARTBEAT_INTERVAL', 2 * 60 * 1000),

    // Roles que tienen detección de inactividad habilitada
    'inactivity_roles' => ['admin', 'moderator'],

    /*
    |--------------------------------------------------------------------------
    | Session Settings
    |--------------------------------------------------------------------------
    */

    // Tiempo máximo de sesión (en minutos)
    // Después de este tiempo, la sesión expira sin importar la actividad
    'max_session_lifetime' => env('ADMIN_MAX_SESSION_LIFETIME', 480), // 8 horas

    // Permitir múltiples sesiones simultáneas
    'allow_concurrent_sessions' => env('ADMIN_ALLOW_CONCURRENT_SESSIONS', false),

    /*
    |--------------------------------------------------------------------------
    | Security Settings
    |--------------------------------------------------------------------------
    */

    // Registrar todos los eventos de inactividad en audit logs
    'log_inactivity_events' => env('ADMIN_LOG_INACTIVITY_EVENTS', true),

    // Enviar notificación al usuario cuando su sesión expire por inactividad
    'notify_on_inactivity_logout' => env('ADMIN_NOTIFY_ON_INACTIVITY_LOGOUT', false),

    // Cerrar sesión automáticamente si cambia la IP durante la sesión
    'logout_on_ip_change' => env('ADMIN_LOGOUT_ON_IP_CHANGE', false),

    // Cerrar sesión automáticamente si cambia el User Agent durante la sesión
    'logout_on_user_agent_change' => env('ADMIN_LOGOUT_ON_USER_AGENT_CHANGE', false),

    /*
    |--------------------------------------------------------------------------
    | UI Settings
    |--------------------------------------------------------------------------
    */

    // Reproducir sonido de alerta cuando aparezca el modal de advertencia
    'play_warning_sound' => env('ADMIN_PLAY_WARNING_SOUND', false),

    // Mostrar logs de debug en consola del navegador
    'debug_inactivity_detector' => env('ADMIN_DEBUG_INACTIVITY_DETECTOR', false),
];

