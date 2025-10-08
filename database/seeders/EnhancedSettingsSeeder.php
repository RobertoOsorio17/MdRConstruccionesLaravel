<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AdminSetting;
use Illuminate\Support\Facades\DB;

/**
 * Seed enhanced admin settings with 42 configuration options.
 * 
 * This seeder creates or updates all admin settings organized in 8 categories:
 * - General (8 options)
 * - Security (8 options)
 * - Email (5 options)
 * - Performance (4 options)
 * - SEO (5 options)
 * - Social Media (5 options)
 * - Backup (4 options)
 * - Maintenance (8 options)
 */
class EnhancedSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = array_merge(
            $this->getGeneralSettings(),
            $this->getSecuritySettings(),
            $this->getEmailSettings(),
            $this->getPerformanceSettings(),
            $this->getSeoSettings(),
            $this->getCompanySettings(),
            $this->getSocialMediaSettings(),
            $this->getBackupSettings(),
            $this->getMaintenanceSettings(),
            $this->getBlogSettings(),
            $this->getUserRegistrationSettings()
        );

        foreach ($settings as $setting) {
            AdminSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('✅ Enhanced admin settings seeded successfully!');
        $this->command->info('📊 Total settings: ' . count($settings));
    }

    /**
     * Get general settings (8 options).
     */
    private function getGeneralSettings(): array
    {
        return [
            [
                'key' => 'site_name',
                'value' => 'MDR Construcciones',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Nombre del Sitio',
                'description' => 'Nombre principal del sitio web que aparece en el header, título del navegador y metadatos',
                'validation_rules' => json_encode(['required', 'string', 'max:255']),
                'options' => null,
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'site_tagline',
                'value' => 'Construcción de Calidad Premium',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Eslogan del Sitio',
                'description' => 'Eslogan o tagline que aparece junto al nombre del sitio',
                'validation_rules' => json_encode(['nullable', 'string', 'max:255']),
                'options' => null,
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'site_description',
                'value' => 'Empresa líder en construcción y reformas en Madrid. Ofrecemos servicios de calidad con más de 20 años de experiencia.',
                'type' => 'text',
                'group' => 'general',
                'label' => 'Descripción del Sitio',
                'description' => 'Descripción general del sitio para SEO y presentación',
                'validation_rules' => json_encode(['required', 'string', 'max:500']),
                'options' => null,
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 3,
            ],
            [
                'key' => 'site_logo',
                'value' => '/images/logo.png',
                'type' => 'file',
                'group' => 'general',
                'label' => 'Logo del Sitio',
                'description' => 'Logo principal del sitio (PNG, JPG, SVG) - máximo 2MB',
                'validation_rules' => json_encode(['nullable', 'image', 'max:2048']),
                'options' => json_encode(['accept' => 'image/png,image/jpeg,image/svg+xml', 'maxSize' => 2048]),
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 4,
            ],
            [
                'key' => 'site_favicon',
                'value' => '/favicon.ico',
                'type' => 'file',
                'group' => 'general',
                'label' => 'Favicon del Sitio',
                'description' => 'Favicon del sitio (ICO, PNG) - máximo 512KB',
                'validation_rules' => json_encode(['nullable', 'image', 'max:512']),
                'options' => json_encode(['accept' => 'image/x-icon,image/png', 'maxSize' => 512]),
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 5,
            ],
            [
                'key' => 'timezone',
                'value' => 'Europe/Madrid',
                'type' => 'select',
                'group' => 'general',
                'label' => 'Zona Horaria',
                'description' => 'Zona horaria predeterminada para el sistema',
                'validation_rules' => json_encode(['required', 'timezone']),
                'options' => [
                    'Europe/Madrid' => 'Madrid (GMT+1)',
                    'Europe/London' => 'Londres (GMT+0)',
                    'America/New_York' => 'Nueva York (GMT-5)',
                    'America/Los_Angeles' => 'Los Ángeles (GMT-8)',
                    'America/Mexico_City' => 'Ciudad de México (GMT-6)',
                    'America/Buenos_Aires' => 'Buenos Aires (GMT-3)',
                ],
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 6,
            ],
            [
                'key' => 'date_format',
                'value' => 'd/m/Y',
                'type' => 'select',
                'group' => 'general',
                'label' => 'Formato de Fecha',
                'description' => 'Formato de fecha para mostrar en la aplicación',
                'validation_rules' => json_encode(['required', 'in:d/m/Y,m/d/Y,Y-m-d']),
                'options' => [
                    'd/m/Y' => 'DD/MM/YYYY (31/12/2025)',
                    'm/d/Y' => 'MM/DD/YYYY (12/31/2025)',
                    'Y-m-d' => 'YYYY-MM-DD (2025-12-31)',
                ],
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 7,
            ],
            [
                'key' => 'time_format',
                'value' => 'H:i',
                'type' => 'select',
                'group' => 'general',
                'label' => 'Formato de Hora',
                'description' => 'Formato de hora (24h o 12h con AM/PM)',
                'validation_rules' => json_encode(['required', 'in:H:i,h:i A']),
                'options' => [
                    'H:i' => '24 horas (14:30)',
                    'h:i A' => '12 horas AM/PM (02:30 PM)',
                ],
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 8,
            ],
        ];
    }

    /**
     * Get security settings (8 options).
     */
    private function getSecuritySettings(): array
    {
        return [
            [
                'key' => 'enable_2fa',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Habilitar 2FA',
                'description' => 'Habilitar autenticación de dos factores para usuarios',
                'validation_rules' => json_encode(['boolean']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'session_timeout',
                'value' => '120',
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Timeout de Sesión (minutos)',
                'description' => 'Tiempo de expiración de sesión en minutos (5-1440)',
                'validation_rules' => json_encode(['required', 'integer', 'min:5', 'max:1440']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'max_login_attempts',
                'value' => '5',
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Máximo Intentos de Login',
                'description' => 'Número máximo de intentos de login fallidos antes de bloqueo',
                'validation_rules' => json_encode(['required', 'integer', 'min:3', 'max:10']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 3,
            ],
            [
                'key' => 'lockout_duration',
                'value' => '15',
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Duración de Bloqueo (minutos)',
                'description' => 'Duración del bloqueo tras intentos fallidos (minutos)',
                'validation_rules' => json_encode(['required', 'integer', 'min:5', 'max:60']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 4,
            ],
            [
                'key' => 'enable_captcha',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Habilitar CAPTCHA',
                'description' => 'Habilitar CAPTCHA en formularios de login y registro',
                'validation_rules' => json_encode(['boolean']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 5,
            ],
            [
                'key' => 'password_min_length',
                'value' => '8',
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Longitud Mínima de Contraseña',
                'description' => 'Longitud mínima requerida para contraseñas',
                'validation_rules' => json_encode(['required', 'integer', 'min:6', 'max:32']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 6,
            ],
            [
                'key' => 'password_require_special',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Requerir Caracteres Especiales',
                'description' => 'Requerir caracteres especiales en contraseñas',
                'validation_rules' => json_encode(['boolean']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 7,
            ],
            [
                'key' => 'enable_audit_log',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Habilitar Registro de Auditoría',
                'description' => 'Habilitar registro de auditoría de acciones administrativas',
                'validation_rules' => json_encode(['boolean']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 8,
            ],
        ];
    }

    /**
     * Get email settings (5 options).
     */
    private function getEmailSettings(): array
    {
        return [
            [
                'key' => 'admin_email',
                'value' => 'admin@mdrconstrucciones.com',
                'type' => 'email',
                'group' => 'email',
                'label' => 'Email del Administrador',
                'description' => 'Email principal del administrador para notificaciones críticas',
                'validation_rules' => json_encode(['required', 'email', 'max:255']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'mail_from_name',
                'value' => 'MDR Construcciones',
                'type' => 'string',
                'group' => 'email',
                'label' => 'Nombre del Remitente',
                'description' => 'Nombre que aparece como remitente en emails enviados',
                'validation_rules' => json_encode(['required', 'string', 'max:255']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'mail_from_address',
                'value' => 'noreply@mdrconstrucciones.com',
                'type' => 'email',
                'group' => 'email',
                'label' => 'Email del Remitente',
                'description' => 'Dirección de email que aparece como remitente',
                'validation_rules' => json_encode(['required', 'email', 'max:255']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 3,
            ],
            [
                'key' => 'enable_email_notifications',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'email',
                'label' => 'Habilitar Notificaciones por Email',
                'description' => 'Habilitar envío de notificaciones por email',
                'validation_rules' => json_encode(['boolean']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 4,
            ],
            [
                'key' => 'email_template',
                'value' => 'default',
                'type' => 'select',
                'group' => 'email',
                'label' => 'Plantilla de Email',
                'description' => 'Plantilla de diseño para emails del sistema',
                'validation_rules' => json_encode(['required', 'in:default,modern,classic']),
                'options' => json_encode([
                    'default' => 'Plantilla Por Defecto',
                    'modern' => 'Plantilla Moderna',
                    'classic' => 'Plantilla Clásica',
                ]),
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 5,
            ],
        ];
    }

    /**
     * Get performance settings (4 options).
     */
    private function getPerformanceSettings(): array
    {
        return [
            [
                'key' => 'enable_cache',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'performance',
                'label' => 'Habilitar Caché',
                'description' => 'Habilitar sistema de caché de aplicación',
                'validation_rules' => json_encode(['boolean']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'cache_ttl',
                'value' => '3600',
                'type' => 'integer',
                'group' => 'performance',
                'label' => 'TTL de Caché (segundos)',
                'description' => 'Tiempo de vida del caché en segundos (1 min - 24 horas)',
                'validation_rules' => json_encode(['required', 'integer', 'min:60', 'max:86400']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'enable_asset_compression',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'performance',
                'label' => 'Habilitar Compresión de Assets',
                'description' => 'Habilitar compresión de assets (CSS, JS)',
                'validation_rules' => json_encode(['boolean']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 3,
            ],
            [
                'key' => 'enable_lazy_loading',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'performance',
                'label' => 'Habilitar Lazy Loading',
                'description' => 'Habilitar lazy loading de imágenes en el sitio',
                'validation_rules' => json_encode(['boolean']),
                'options' => null,
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 4,
            ],
        ];
    }

    /**
     * Get SEO settings (5 options).
     */
    private function getSeoSettings(): array
    {
        return [
            [
                'key' => 'meta_description',
                'value' => 'MDR Construcciones - Empresa líder en construcción y reformas en Madrid con más de 20 años de experiencia.',
                'type' => 'text',
                'group' => 'seo',
                'label' => 'Meta Descripción',
                'description' => 'Meta descripción predeterminada para SEO (máximo 160 caracteres)',
                'validation_rules' => json_encode(['required', 'string', 'max:160']),
                'options' => null,
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'meta_keywords',
                'value' => 'construcción, reformas, Madrid, obras, arquitectura, diseño',
                'type' => 'text',
                'group' => 'seo',
                'label' => 'Meta Keywords',
                'description' => 'Meta keywords predeterminadas separadas por comas',
                'validation_rules' => json_encode(['nullable', 'string', 'max:255']),
                'options' => null,
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'google_analytics_id',
                'value' => '',
                'type' => 'string',
                'group' => 'seo',
                'label' => 'Google Analytics ID',
                'description' => 'ID de Google Analytics (formato: G-XXXXXXXXXX o UA-XXXXXXXXX)',
                'validation_rules' => json_encode(['nullable', 'string', 'regex:/^(G|UA)-/']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => true,
                'sort_order' => 3,
            ],
            [
                'key' => 'google_search_console_code',
                'value' => '',
                'type' => 'string',
                'group' => 'seo',
                'label' => 'Código de Google Search Console',
                'description' => 'Código de verificación de Google Search Console',
                'validation_rules' => json_encode(['nullable', 'string', 'max:100']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => true,
                'sort_order' => 4,
            ],
            [
                'key' => 'enable_sitemap',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'seo',
                'label' => 'Habilitar Sitemap',
                'description' => 'Habilitar generación automática de sitemap.xml',
                'validation_rules' => json_encode(['boolean']),
                'options' => null,
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 5,
            ],
        ];
    }

    /**
     * Get company information settings (4 options).
     */
    private function getCompanySettings(): array
    {
        return [
            [
                'key' => 'company_name',
                'value' => 'MDR Construcciones',
                'type' => 'string',
                'group' => 'company',
                'label' => 'Nombre de la Empresa',
                'description' => 'Nombre oficial de la empresa',
                'validation_rules' => ['required', 'string', 'max:255'],
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'company_phone',
                'value' => '+34 123 456 789',
                'type' => 'string',
                'group' => 'company',
                'label' => 'Teléfono de la Empresa',
                'description' => 'Número de teléfono principal de contacto',
                'validation_rules' => ['nullable', 'string', 'max:50'],
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'company_email',
                'value' => 'info@mdrconstrucciones.com',
                'type' => 'email',
                'group' => 'company',
                'label' => 'Email de la Empresa',
                'description' => 'Dirección de email principal de contacto',
                'validation_rules' => ['required', 'email', 'max:255'],
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 3,
            ],
            [
                'key' => 'company_address',
                'value' => 'Calle Principal 123, 28001 Madrid',
                'type' => 'text',
                'group' => 'company',
                'label' => 'Dirección de la Empresa',
                'description' => 'Dirección física de la empresa',
                'validation_rules' => ['nullable', 'string', 'max:500'],
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 4,
            ],
        ];
    }

    /**
     * Get social media settings (5 options).
     */
    private function getSocialMediaSettings(): array
    {
        return [
            [
                'key' => 'facebook_url',
                'value' => '',
                'type' => 'url',
                'group' => 'social',
                'label' => 'URL de Facebook',
                'description' => 'URL completa del perfil de Facebook de la empresa',
                'validation_rules' => json_encode(['nullable', 'url', 'max:255']),
                'options' => null,
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'instagram_url',
                'value' => '',
                'type' => 'url',
                'group' => 'social',
                'label' => 'URL de Instagram',
                'description' => 'URL completa del perfil de Instagram de la empresa',
                'validation_rules' => json_encode(['nullable', 'url', 'max:255']),
                'options' => null,
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'linkedin_url',
                'value' => '',
                'type' => 'url',
                'group' => 'social',
                'label' => 'URL de LinkedIn',
                'description' => 'URL completa del perfil de LinkedIn de la empresa',
                'validation_rules' => json_encode(['nullable', 'url', 'max:255']),
                'options' => null,
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 3,
            ],
            [
                'key' => 'twitter_url',
                'value' => '',
                'type' => 'url',
                'group' => 'social',
                'label' => 'URL de Twitter/X',
                'description' => 'URL completa del perfil de Twitter/X de la empresa',
                'validation_rules' => json_encode(['nullable', 'url', 'max:255']),
                'options' => null,
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 4,
            ],
            [
                'key' => 'og_image',
                'value' => '',
                'type' => 'file',
                'group' => 'social',
                'label' => 'Imagen Open Graph',
                'description' => 'Imagen predeterminada para Open Graph (compartir en redes) - 1200x630px recomendado',
                'validation_rules' => json_encode(['nullable', 'image', 'max:2048']),
                'options' => json_encode(['accept' => 'image/png,image/jpeg', 'maxSize' => 2048, 'dimensions' => '1200x630']),
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 5,
            ],
        ];
    }

    /**
     * Get backup settings (4 options).
     */
    private function getBackupSettings(): array
    {
        return [
            [
                'key' => 'backup_frequency',
                'value' => 'daily',
                'type' => 'select',
                'group' => 'backup',
                'label' => 'Frecuencia de Backup',
                'description' => 'Frecuencia de ejecución de backups automáticos',
                'validation_rules' => json_encode(['required', 'in:hourly,daily,weekly']),
                'options' => json_encode([
                    'hourly' => 'Cada Hora',
                    'daily' => 'Diario',
                    'weekly' => 'Semanal',
                ]),
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'backup_retention_days',
                'value' => '30',
                'type' => 'integer',
                'group' => 'backup',
                'label' => 'Días de Retención',
                'description' => 'Días de retención de backups antes de eliminación automática',
                'validation_rules' => json_encode(['required', 'integer', 'min:7', 'max:365']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'backup_notification_email',
                'value' => '',
                'type' => 'email',
                'group' => 'backup',
                'label' => 'Email de Notificación',
                'description' => 'Email para recibir notificaciones de backups (éxito/fallo)',
                'validation_rules' => json_encode(['nullable', 'email', 'max:255']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => true,
                'sort_order' => 3,
            ],
            [
                'key' => 'enable_auto_backup',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'backup',
                'label' => 'Habilitar Backups Automáticos',
                'description' => 'Habilitar ejecución automática de backups programados',
                'validation_rules' => json_encode(['boolean']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 4,
            ],
        ];
    }

    /**
     * Get maintenance mode settings (8 options).
     */
    private function getMaintenanceSettings(): array
    {
        return [
            [
                'key' => 'maintenance_mode',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'maintenance',
                'label' => 'Modo Mantenimiento',
                'description' => 'Activar/desactivar modo mantenimiento del sitio',
                'validation_rules' => json_encode(['boolean']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'maintenance_message',
                'value' => 'Estamos realizando mejoras en nuestro sitio. Volveremos pronto.',
                'type' => 'text',
                'group' => 'maintenance',
                'label' => 'Mensaje de Mantenimiento',
                'description' => 'Mensaje personalizado que verán los usuarios durante mantenimiento',
                'validation_rules' => json_encode(['required_if:maintenance_mode,true', 'string', 'max:1000']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'maintenance_allowed_ips',
                'value' => json_encode([]),
                'type' => 'json',
                'group' => 'maintenance',
                'label' => 'IPs Permitidas',
                'description' => 'Lista de IPs permitidas para acceder durante mantenimiento (whitelist)',
                'validation_rules' => json_encode(['nullable', 'array']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 3,
            ],
            [
                'key' => 'maintenance_start_at',
                'value' => null,
                'type' => 'datetime',
                'group' => 'maintenance',
                'label' => 'Inicio Programado',
                'description' => 'Fecha y hora de inicio programado del mantenimiento',
                'validation_rules' => json_encode(['nullable', 'date', 'after:now']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 4,
            ],
            [
                'key' => 'maintenance_end_at',
                'value' => null,
                'type' => 'datetime',
                'group' => 'maintenance',
                'label' => 'Fin Programado',
                'description' => 'Fecha y hora de fin programado del mantenimiento',
                'validation_rules' => json_encode(['nullable', 'date', 'after:maintenance_start_at']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 5,
            ],
            [
                'key' => 'maintenance_show_countdown',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'maintenance',
                'label' => 'Mostrar Cuenta Regresiva',
                'description' => 'Mostrar cuenta regresiva hasta el fin del mantenimiento',
                'validation_rules' => json_encode(['boolean']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 6,
            ],
            [
                'key' => 'maintenance_allow_admin',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'maintenance',
                'label' => 'Permitir Acceso Admin',
                'description' => 'Permitir acceso a administradores durante mantenimiento',
                'validation_rules' => json_encode(['boolean']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 7,
            ],
            [
                'key' => 'maintenance_retry_after',
                'value' => '3600',
                'type' => 'integer',
                'group' => 'maintenance',
                'label' => 'Retry-After (segundos)',
                'description' => 'Tiempo en segundos para header Retry-After (SEO)',
                'validation_rules' => json_encode(['nullable', 'integer', 'min:60', 'max:86400']),
                'options' => null,
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 8,
            ],
        ];
    }

    /**
     * Get blog settings.
     *
     * @return array
     */
    private function getBlogSettings(): array
    {
        return [
            [
                'key' => 'blog_enabled',
                'value' => true,
                'type' => 'boolean',
                'group' => 'blog',
                'label' => 'Habilitar Blog',
                'description' => 'Activar o desactivar el módulo de blog en el sitio',
                'validation_rules' => ['boolean'],
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'blog_posts_per_page',
                'value' => 12,
                'type' => 'integer',
                'group' => 'blog',
                'label' => 'Posts por Página',
                'description' => 'Número de posts a mostrar por página',
                'validation_rules' => ['integer', 'min:1', 'max:50'],
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'blog_allow_comments',
                'value' => true,
                'type' => 'boolean',
                'group' => 'blog',
                'label' => 'Permitir Comentarios',
                'description' => 'Permitir que los usuarios comenten en los posts',
                'validation_rules' => ['boolean'],
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 3,
            ],
            [
                'key' => 'blog_moderate_comments',
                'value' => true,
                'type' => 'boolean',
                'group' => 'blog',
                'label' => 'Moderar Comentarios',
                'description' => 'Requerir aprobación antes de publicar comentarios',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 4,
            ],
            [
                'key' => 'blog_show_author',
                'value' => true,
                'type' => 'boolean',
                'group' => 'blog',
                'label' => 'Mostrar Autor',
                'description' => 'Mostrar el nombre del autor en los posts',
                'validation_rules' => ['boolean'],
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 5,
            ],
            [
                'key' => 'blog_show_reading_time',
                'value' => true,
                'type' => 'boolean',
                'group' => 'blog',
                'label' => 'Mostrar Tiempo de Lectura',
                'description' => 'Mostrar el tiempo estimado de lectura en los posts',
                'validation_rules' => ['boolean'],
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 6,
            ],
            [
                'key' => 'blog_enable_categories',
                'value' => true,
                'type' => 'boolean',
                'group' => 'blog',
                'label' => 'Habilitar Categorías',
                'description' => 'Permitir categorizar los posts del blog',
                'validation_rules' => ['boolean'],
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 7,
            ],
            [
                'key' => 'blog_enable_tags',
                'value' => true,
                'type' => 'boolean',
                'group' => 'blog',
                'label' => 'Habilitar Etiquetas',
                'description' => 'Permitir etiquetar los posts del blog',
                'validation_rules' => ['boolean'],
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 8,
            ],
        ];
    }

    /**
     * Get user registration settings.
     *
     * @return array
     */
    private function getUserRegistrationSettings(): array
    {
        return [
            [
                'key' => 'registration_enabled',
                'value' => true,
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Habilitar Registro de Usuarios',
                'description' => 'Permitir que nuevos usuarios se registren en el sitio',
                'validation_rules' => ['boolean'],
                'is_public' => true,
                'is_encrypted' => false,
                'sort_order' => 9,
            ],
            [
                'key' => 'registration_require_email_verification',
                'value' => true,
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Requerir Verificación de Email',
                'description' => 'Los usuarios deben verificar su email antes de acceder',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 10,
            ],
            [
                'key' => 'registration_auto_approve',
                'value' => true,
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Aprobación Automática',
                'description' => 'Aprobar automáticamente nuevos registros sin revisión manual',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'is_encrypted' => false,
                'sort_order' => 11,
            ],
        ];
    }
}

