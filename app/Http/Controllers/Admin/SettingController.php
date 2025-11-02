<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\AdminSetting;
use App\Models\AdminSettingHistory;
use App\Events\SettingChanged;
use App\Services\Admin\AdminSettingsService;
use App\Helpers\MLSettingsHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * Coordinates platform configuration workflows within the admin panel by exposing audited setting management endpoints.
 * Couples validation, caching, and event broadcasting so configuration changes propagate safely and predictably.
 */
class SettingController extends Controller
{
    /**
     * @var \App\Services\Admin\AdminSettingsService
     */
    private AdminSettingsService $settingsService;

    
    
    
    
    /**

    
    
    
     * Handle __construct.

    
    
    
     *

    
    
    
     * @param AdminSettingsService $settingsService The settingsService.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function __construct(AdminSettingsService $settingsService)
    {
        $this->settingsService = $settingsService;

        /**
         * Ensure only admins can access settings.
         */
        $this->middleware(function ($request, $next) {
            $user = $request->user();

            /**
             * Check if user is admin (support both role column and roles relationship).
             */
            $isAdmin = $user->role === 'admin' ||
                       $user->roles->contains('name', 'admin');

            if (!$isAdmin) {
                abort(403, 'This action is unauthorized. Only administrators can manage settings.');
            }

            return $next($request);
        });
    }

    
    
    
    
    /**

    
    
    
     * Display a listing of the resource.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function index()
    {
        $settings = AdminSetting::orderBy('group')
            ->orderBy('sort_order')
            ->orderBy('label')
            ->get()
            ->groupBy('group');

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'groups' => $this->getSettingGroups(),
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Update the specified resource.

    
    
    
     *

    
    
    
     * @param UpdateSettingsRequest $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function update(UpdateSettingsRequest $request)
    {
        $payload = $request->validated();
        $settings = $payload['settings'] ?? [];

        $result = $this->settingsService->updateSettings($settings, $request->user());

        /**
         * Clear ML settings cache if any ML setting was updated.
         */
        $mlSettingsUpdated = collect($result['updated'] ?? [])->contains(function ($key) {
            return str_starts_with($key, 'ml_');
        });

        if ($mlSettingsUpdated) {
            MLSettingsHelper::clearCache();
        }

        if (!empty($result['errors'])) {
            return back()
                ->withErrors($result['errors'])
                ->with('success', !empty($result['updated']) ? 'Algunas configuraciones se actualizaron.' : null);
        }

        if (empty($result['updated'])) {
            return back()->with('success', 'No se detectaron cambios para actualizar.');
        }

        return back()->with('success', 'Configuraciones actualizadas correctamente.');
    }

    
    
    
    
    /**

    
    
    
     * Get setting groups.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getSettingGroups()
    {
        return [
            'general' => [
                'label' => 'General Settings',
                'description' => 'Essential website settings',
                'icon' => 'settings',
            ],
            'company' => [
                'label' => 'Company Information',
                'description' => 'Contact details and corporate information',
                'icon' => 'business',
            ],
            'email' => [
                'label' => 'Email Settings',
                'description' => 'Email and notification configuration',
                'icon' => 'email',
            ],
            'security' => [
                'label' => 'Seguridad',
                'description' => 'Security and authentication settings',
                'icon' => 'security',
            ],
            'api' => [
                'label' => 'APIs and Integrations',
                'description' => 'API keys and external service configurations',
                'icon' => 'api',
            ],
            'ml' => [
                'label' => 'Machine Learning',
                'description' => 'AI and recommendation system configuration',
                'icon' => 'psychology',
            ],
            'social' => [
                'label' => 'Social Media',
                'description' => 'Enlaces y configuraciones de Social Media',
                'icon' => 'share',
            ],
            'seo' => [
                'label' => 'SEO and Meta Tags',
                'description' => 'Search engine optimization settings',
                'icon' => 'search',
            ],
            'maintenance' => [
                'label' => 'Maintenance',
                'description' => 'Maintenance and development mode settings',
                'icon' => 'build',
            ],
            'backup' => [
                'label' => 'Backup',
                'description' => 'Backup and restore configuration',
                'icon' => 'storage',
            ],
            'performance' => [
                'label' => 'Performance',
                'description' => 'Cache and optimization settings',
                'icon' => 'performance',
            ],
            'blog' => [
                'label' => 'Blog',
                'description' => 'Blog configuration and display settings',
                'icon' => 'article',
            ],
        ];
    }

    
    
    
    
    /**

    
    
    
     * Handle initialize defaults.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function initializeDefaults()
    {
        $defaultSettings = [
            /**
             * General Settings.
             */
            [
                'key' => 'site_name',
                'value' => 'MDR Construcciones',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Site Name',
                'description' => 'Primary name of the website',
                'validation_rules' => ['required', 'string', 'max:255'],
                'is_public' => true,
                'sort_order' => 1,
            ],
            [
                'key' => 'site_description',
                'value' => 'Leading company in construction and renovations',
                'type' => 'text',
                'group' => 'general',
                'label' => 'Site Description',
                'description' => 'Short description of the website',
                'validation_rules' => ['required', 'string', 'max:500'],
                'is_public' => true,
                'sort_order' => 2,
            ],
            [
                'key' => 'site_logo',
                'value' => '/images/logo.png',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Site Logo',
                'description' => 'Primary logo URL',
                'validation_rules' => ['nullable', 'string', 'max:255'],
                'is_public' => true,
                'sort_order' => 3,
            ],
            [
                'key' => 'site_tagline',
                'value' => 'Construyendo tus sueÃ±os',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Site Tagline',
                'description' => 'Slogan o frase descriptiva del sitio',
                'validation_rules' => ['nullable', 'string', 'max:255'],
                'is_public' => true,
                'sort_order' => 4,
            ],
            [
                'key' => 'timezone',
                'value' => 'Europe/Madrid',
                'type' => 'select',
                'group' => 'general',
                'label' => 'Timezone',
                'description' => 'Zona horaria del sitio',
                'validation_rules' => ['required', 'string', 'timezone'],
                'is_public' => false,
                'sort_order' => 5,
            ],
            [
                'key' => 'date_format',
                'value' => 'd/m/Y',
                'type' => 'select',
                'group' => 'general',
                'label' => 'Date Format',
                'description' => 'Formato de fecha para mostrar',
                'validation_rules' => ['required', 'string'],
                'is_public' => false,
                'sort_order' => 6,
            ],
            [
                'key' => 'time_format',
                'value' => 'H:i',
                'type' => 'select',
                'group' => 'general',
                'label' => 'Time Format',
                'description' => 'Formato de hora para mostrar',
                'validation_rules' => ['required', 'string'],
                'is_public' => false,
                'sort_order' => 7,
            ],
            [
                'key' => 'maintenance_mode',
                'value' => false,
                'type' => 'boolean',
                'group' => 'maintenance',
                'label' => 'Maintenance Mode',
                'description' => 'Enable maintenance mode for the site',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'maintenance_message',
                'value' => 'Estamos realizando mejoras en nuestro sitio. Volveremos pronto.',
                'type' => 'text',
                'group' => 'maintenance',
                'label' => 'Mensaje de Mantenimiento',
                'description' => 'Mensaje personalizado que verÃ¡n los usuarios durante mantenimiento',
                'validation_rules' => ['required_if:maintenance_mode,true', 'string', 'max:1000'],
                'is_public' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'maintenance_allowed_ips',
                'value' => [],
                'type' => 'json',
                'group' => 'maintenance',
                'label' => 'IPs Permitidas',
                'description' => 'Lista de IPs permitidas para acceder durante mantenimiento (whitelist)',
                'validation_rules' => ['nullable', 'array'],
                'is_public' => false,
                'sort_order' => 3,
            ],
            [
                'key' => 'maintenance_start_at',
                'value' => null,
                'type' => 'datetime',
                'group' => 'maintenance',
                'label' => 'Inicio Programado',
                'description' => 'Fecha y hora de inicio programado del mantenimiento',
                'validation_rules' => ['nullable', 'date', 'after:now'],
                'is_public' => false,
                'sort_order' => 4,
            ],
            [
                'key' => 'maintenance_end_at',
                'value' => null,
                'type' => 'datetime',
                'group' => 'maintenance',
                'label' => 'Fin Programado',
                'description' => 'Fecha y hora de fin programado del mantenimiento',
                'validation_rules' => ['nullable', 'date', 'after:maintenance_start_at'],
                'is_public' => false,
                'sort_order' => 5,
            ],
            [
                'key' => 'maintenance_show_countdown',
                'value' => true,
                'type' => 'boolean',
                'group' => 'maintenance',
                'label' => 'Mostrar Cuenta Regresiva',
                'description' => 'Mostrar cuenta regresiva hasta el fin del mantenimiento',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'sort_order' => 6,
            ],
            [
                'key' => 'maintenance_allow_admin',
                'value' => true,
                'type' => 'boolean',
                'group' => 'maintenance',
                'label' => 'Permitir Acceso Admin',
                'description' => 'Permitir acceso a administradores durante mantenimiento',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'sort_order' => 7,
            ],
            [
                'key' => 'maintenance_retry_after',
                'value' => '3600',
                'type' => 'integer',
                'group' => 'maintenance',
                'label' => 'Retry-After (segundos)',
                'description' => 'Tiempo en segundos para header Retry-After (SEO)',
                'validation_rules' => ['nullable', 'integer', 'min:60', 'max:86400'],
                'is_public' => false,
                'sort_order' => 8,
            ],
            [
                'key' => 'maintenance_secret',
                'value' => null,
                'type' => 'password',
                'group' => 'maintenance',
                'label' => 'Secret de Bypass',
                'description' => 'Token secreto para acceder durante mantenimiento (?secret=TOKEN)',
                'validation_rules' => ['nullable', 'string', 'min:8', 'max:255'],
                'is_public' => false,
                'sort_order' => 9,
            ],
            [
                'key' => 'maintenance_template',
                'value' => 'default',
                'type' => 'select',
                'group' => 'maintenance',
                'label' => 'Plantilla de Mantenimiento',
                'description' => 'Plantilla visual para la pÃ¡gina de mantenimiento',
                'validation_rules' => ['required', 'string', 'in:default,minimal,modern'],
                'is_public' => false,
                'sort_order' => 10,
            ],

            /**
             * Company Information.
             */
            [
                'key' => 'company_name',
                'value' => 'MDR Construcciones',
                'type' => 'string',
                'group' => 'company',
                'label' => 'Company Name',
                'description' => 'Official company name',
                'validation_rules' => ['required', 'string', 'max:255'],
                'is_public' => true,
                'sort_order' => 1,
            ],
            [
                'key' => 'company_phone',
                'value' => '+34 123 456 789',
                'type' => 'string',
                'group' => 'company',
                'label' => 'Phone',
                'description' => 'Primary phone number',
                'validation_rules' => ['required', 'string', 'max:20'],
                'is_public' => true,
                'sort_order' => 2,
            ],
            [
                'key' => 'company_email',
                'value' => 'info@mdrconstrucciones.com',
                'type' => 'email',
                'group' => 'company',
                'label' => 'Email de Contacto',
                'description' => 'Email principal de contacto',
                'validation_rules' => ['required', 'email', 'max:255'],
                'is_public' => true,
                'sort_order' => 3,
            ],
            [
                'key' => 'company_address',
                'value' => 'Calle Principal 123, 28001 Madrid',
                'type' => 'text',
                'group' => 'company',
                'label' => 'Address',
                'description' => 'Company physical address',
                'validation_rules' => ['required', 'string', 'max:500'],
                'is_public' => true,
                'sort_order' => 4,
            ],

            /**
             * Email Settings.
             */
            [
                'key' => 'mail_from_name',
                'value' => 'MDR Construcciones',
                'type' => 'string',
                'group' => 'email',
                'label' => 'Nombre del Remitente',
                'description' => 'Nombre que aparece en los emails enviados',
                'validation_rules' => ['required', 'string', 'max:255'],
                'is_public' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'mail_from_address',
                'value' => 'noreply@mdrconstrucciones.com',
                'type' => 'email',
                'group' => 'email',
                'label' => 'Email del Remitente',
                'description' => 'Email que aparece como remitente',
                'validation_rules' => ['required', 'email', 'max:255'],
                'is_public' => false,
                'sort_order' => 2,
            ],

            /**
             * Security Settings.
             */
            [
                'key' => 'session_timeout',
                'value' => 120,
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Session Time (minutes)',
                'description' => 'Time before the session expires',
                'validation_rules' => ['required', 'integer', 'min:5', 'max:1440'],
                'is_public' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'max_login_attempts',
                'value' => 5,
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Maximum Login Attempts',
                'description' => 'Maximum number of failed login attempts',
                'validation_rules' => ['required', 'integer', 'min:3', 'max:10'],
                'is_public' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'lockout_duration',
                'value' => 15,
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Lockout Duration (minutes)',
                'description' => 'Tiempo de bloqueo despuÃ©s de exceder intentos de login',
                'validation_rules' => ['required', 'integer', 'min:1', 'max:1440'],
                'is_public' => false,
                'sort_order' => 3,
            ],
            [
                'key' => 'password_min_length',
                'value' => 8,
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Password Min Length',
                'description' => 'Longitud mÃ­nima de contraseÃ±a',
                'validation_rules' => ['required', 'integer', 'min:6', 'max:32'],
                'is_public' => false,
                'sort_order' => 4,
            ],
            [
                'key' => 'password_require_special',
                'value' => true,
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Require Special Characters',
                'description' => 'Requerir caracteres especiales en contraseÃ±as',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'sort_order' => 5,
            ],
            [
                'key' => 'enable_captcha',
                'value' => false,
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Enable CAPTCHA',
                'description' => 'Habilitar CAPTCHA en formularios de registro y login',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'sort_order' => 6,
            ],
            [
                'key' => 'enable_2fa',
                'value' => false,
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Enable 2FA',
                'description' => 'Habilitar autenticaciÃ³n de dos factores',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'sort_order' => 7,
            ],
            [
                'key' => 'allowed_upload_extensions',
                'value' => 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx',
                'type' => 'text',
                'group' => 'security',
                'label' => 'Allowed Upload Extensions',
                'description' => 'Extensiones de archivo permitidas (separadas por comas)',
                'validation_rules' => ['required', 'string', 'max:500'],
                'is_public' => false,
                'sort_order' => 8,
            ],
            [
                'key' => 'max_upload_size',
                'value' => 10240,
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Max Upload Size (KB)',
                'description' => 'TamaÃ±o mÃ¡ximo de archivo para subir en KB',
                'validation_rules' => ['required', 'integer', 'min:1024', 'max:102400'],
                'is_public' => false,
                'sort_order' => 9,
            ],

            /**
             * Email Settings.
             */
            [
                'key' => 'enable_email_notifications',
                'value' => true,
                'type' => 'boolean',
                'group' => 'email',
                'label' => 'Enable Email Notifications',
                'description' => 'Habilitar notificaciones por email',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'email_template',
                'value' => 'default',
                'type' => 'select',
                'group' => 'email',
                'label' => 'Email Template',
                'description' => 'Plantilla para emails del sistema',
                'validation_rules' => ['required', 'string', 'in:default,modern,minimal'],
                'is_public' => false,
                'sort_order' => 2,
            ],

            /**
             * Performance Settings.
             */
            [
                'key' => 'enable_asset_compression',
                'value' => true,
                'type' => 'boolean',
                'group' => 'performance',
                'label' => 'Enable Asset Compression',
                'description' => 'Comprimir CSS y JS',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'enable_lazy_loading',
                'value' => true,
                'type' => 'boolean',
                'group' => 'performance',
                'label' => 'Enable Lazy Loading',
                'description' => 'Carga diferida de imÃ¡genes',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'cache_ttl',
                'value' => 3600,
                'type' => 'integer',
                'group' => 'performance',
                'label' => 'Cache TTL (seconds)',
                'description' => 'Tiempo de vida del cache en segundos',
                'validation_rules' => ['required', 'integer', 'min:60', 'max:86400'],
                'is_public' => false,
                'sort_order' => 3,
            ],

            /**
             * Backup Settings.
             */
            [
                'key' => 'backup_enabled',
                'value' => true,
                'type' => 'boolean',
                'group' => 'backup',
                'label' => 'Enable Backups',
                'description' => 'Habilitar backups automÃ¡ticos',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'backup_frequency',
                'value' => 'daily',
                'type' => 'select',
                'group' => 'backup',
                'label' => 'Backup Frequency',
                'description' => 'Frecuencia de backups automÃ¡ticos',
                'validation_rules' => ['required', 'string', 'in:hourly,daily,weekly,monthly'],
                'is_public' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'backup_retention',
                'value' => 30,
                'type' => 'integer',
                'group' => 'backup',
                'label' => 'Backup Retention (days)',
                'description' => 'DÃ­as de retenciÃ³n de backups',
                'validation_rules' => ['required', 'integer', 'min:1', 'max:365'],
                'is_public' => false,
                'sort_order' => 3,
            ],
            [
                'key' => 'backup_auto',
                'value' => true,
                'type' => 'boolean',
                'group' => 'backup',
                'label' => 'Auto Backup',
                'description' => 'Ejecutar backups automÃ¡ticamente',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'sort_order' => 4,
            ],
            [
                'key' => 'backup_notification_email',
                'value' => 'admin@mdrconstrucciones.com',
                'type' => 'email',
                'group' => 'backup',
                'label' => 'Backup Notification Email',
                'description' => 'Email para notificaciones de backup',
                'validation_rules' => ['required', 'email', 'max:255'],
                'is_public' => false,
                'sort_order' => 5,
            ],
        ];

        foreach ($defaultSettings as $settingData) {
            AdminSetting::updateOrCreate(
                ['key' => $settingData['key']],
                $settingData
            );
        }

        return back()->with('success', 'Default settings initialized successfully.');
    }

    
    
    
    
    /**

    
    
    
     * Handle upload file.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function uploadFile(Request $request)
    {
        /**
         * Get upload settings.
         */
        /**
         * Retrieve the maximum upload size (in kilobytes) from cached settings.
         */
        $maxUploadSize = AdminSetting::getCachedValue('max_upload_size', 10240, 300);
        $allowedExtensions = AdminSetting::getCachedValue('allowed_upload_extensions', 'jpg,jpeg,png,pdf,doc,docx', 300);

        $validator = Validator::make($request->all(), [
            'key' => 'required|string|exists:admin_settings,key',
            'file' => [
                'required',
                'file',
                'max:' . $maxUploadSize,
                'mimes:' . $allowedExtensions,
            ],
        ], [
            'key.required' => 'La clave de configuraciÃ³n es requerida.',
            'key.exists' => 'La configuraciÃ³n no existe.',
            'file.required' => 'Debe seleccionar un archivo.',
            'file.max' => "El archivo no debe superar " . round($maxUploadSize / 1024, 2) . "MB.",
            'file.mimes' => "El archivo debe ser de tipo: {$allowedExtensions}.",
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $key = $request->input('key');
        $setting = AdminSetting::where('key', $key)->first();

        /**
         * Validate that this is a file-type setting.
         */
        if ($setting->type !== 'file') {
            return back()->withErrors(['file' => 'Esta configuraciÃ³n no acepta archivos.']);
        }

        /**
         * Store the file.
         */
        $file = $request->file('file');
        $path = $file->store('settings', 'public');

        /**
         * Delete old file if exists.
         */
        if ($setting->value && Storage::disk('public')->exists($setting->value)) {
            Storage::disk('public')->delete($setting->value);
        }

        /**
         * Store old value.
         */
        $oldValue = $setting->value;

        /**
         * Update setting.
         */
        $setting->value = $path;
        $setting->save();

        /**
         * Fire event.
         */
        event(new SettingChanged(
            setting: $setting,
            oldValue: $oldValue,
            newValue: $path,
            user: auth()->user(),
            reason: 'File uploaded via admin panel'
        ));

        session()->flash('success', 'Archivo subido correctamente.');
        return back();
    }

    
    
    
    
    /**

    
    
    
     * Get history.

    
    
    
     *

    
    
    
     * @param string $key The key.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getHistory(string $key)
    {
        $setting = AdminSetting::where('key', $key)->first();

        if (!$setting) {
            return response()->json(['error' => 'Setting not found'], 404);
        }

        $history = $setting->getHistory(50);

        return response()->json([
            'setting' => [
                'key' => $setting->key,
                'label' => $setting->label,
            ],
            'history' => $history->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'old_value' => $entry->old_value,
                    'new_value' => $entry->new_value,
                    'changed_by' => $entry->user?->name ?? 'System',
                    'changed_at' => $entry->created_at->format('Y-m-d H:i:s'),
                    'ip_address' => $entry->ip_address,
                    'reason' => $entry->change_reason,
                ];
            }),
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle revert.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param string $key The key.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function revert(Request $request, string $key)
    {
        $validator = Validator::make($request->all(), [
            'history_id' => 'required|integer|exists:admin_setting_history,id',
        ], [
            'history_id.required' => 'El ID del historial es requerido.',
            'history_id.exists' => 'El registro de historial no existe.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $setting = AdminSetting::where('key', $key)->first();

        if (!$setting) {
            return back()->withErrors(['error' => 'ConfiguraciÃ³n no encontrada.']);
        }

        $success = $setting->revertTo($request->input('history_id'));

        if ($success) {
            session()->flash('success', 'ConfiguraciÃ³n revertida correctamente.');
        } else {
            return back()->withErrors(['error' => 'No se pudo revertir la configuraciÃ³n.']);
        }

        return back();
    }

    
    
    
    
    /**

    
    
    
     * Handle export.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function export()
    {
        $settings = AdminSetting::all()->map(function ($setting) {
            return [
                'key' => $setting->key,
                'value' => $setting->value,
                'type' => $setting->type,
                'group' => $setting->group,
                'label' => $setting->label,
                'description' => $setting->description,
            ];
        });

        $filename = 'admin-settings-' . date('Y-m-d-His') . '.json';
        $path = storage_path('app/' . $filename);

        file_put_contents($path, json_encode($settings, JSON_PRETTY_PRINT));

        return response()->download($path)->deleteFileAfterSend(true);
    }

    
    
    
    
    /**

    
    
    
     * Handle import.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:json|max:1024',
        ], [
            'file.required' => 'Debe seleccionar un archivo.',
            'file.mimes' => 'El archivo debe ser JSON.',
            'file.max' => 'El archivo no debe superar 1MB.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $file = $request->file('file');
        $content = file_get_contents($file->getRealPath());
        $settings = json_decode($content, true);

        if (!is_array($settings)) {
            return back()->withErrors(['file' => 'El archivo JSON no es vÃ¡lido.']);
        }

        $imported = 0;
        foreach ($settings as $settingData) {
            if (!isset($settingData['key'])) {
                continue;
            }

            $setting = AdminSetting::where('key', $settingData['key'])->first();
            if ($setting && isset($settingData['value'])) {
                $oldValue = $setting->value;
                $setting->value = $settingData['value'];
                $setting->save();

                /**
                 * Fire event.
                 */
                event(new SettingChanged(
                    setting: $setting,
                    oldValue: $oldValue,
                    newValue: $settingData['value'],
                    user: auth()->user(),
                    reason: 'Imported from JSON file'
                ));

                $imported++;
            }
        }

        session()->flash('success', "{$imported} configuraciones importadas correctamente.");
        return back();
    }

    
    
    
    
    /**

    
    
    
     * Handle reset all.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function resetAll(Request $request)
    {
        /**
         * Get all settings with their default values.
         */
        $defaultSettings = $this->getDefaultSettings();

        $reset = 0;
        foreach ($defaultSettings as $defaultSetting) {
            $setting = AdminSetting::where('key', $defaultSetting['key'])->first();

            if ($setting) {
                $oldValue = $setting->value;
                $newValue = $defaultSetting['value'];

                /**
                 * Only update if value is different.
                 */
                if ($oldValue != $newValue) {
                    $setting->value = $newValue;
                    $setting->save();

                    /**
                     * Fire event.
                     */
                    event(new SettingChanged(
                        setting: $setting,
                        oldValue: $oldValue,
                        newValue: $newValue,
                        user: $request->user(),
                        reason: 'Reset to default value'
                    ));

                    $reset++;
                }
            }
        }

        if ($reset > 0) {
            session()->flash('success', "{$reset} configuraciones restablecidas a sus valores por defecto.");
        } else {
            session()->flash('info', 'Todas las configuraciones ya tienen sus valores por defecto.');
        }

        return back();
    }

    
    
    
    
    /**

    
    
    
     * Get default settings.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getDefaultSettings()
    {
        return [
            /**
             * General Settings.
             */
            ['key' => 'site_name', 'value' => 'MDR Construcciones'],
            ['key' => 'site_tagline', 'value' => 'ConstrucciÃ³n de Calidad Premium'],
            ['key' => 'site_description', 'value' => 'Empresa lÃ­der en construcciÃ³n y reformas en Madrid. Ofrecemos servicios de calidad con mÃ¡s de 20 aÃ±os de experiencia.'],
            ['key' => 'site_logo', 'value' => '/images/logo.png'],
            ['key' => 'site_favicon', 'value' => '/favicon.ico'],
            ['key' => 'timezone', 'value' => 'Europe/Madrid'],
            ['key' => 'date_format', 'value' => 'd/m/Y'],
            ['key' => 'time_format', 'value' => 'H:i'],

            /**
             * Company Information.
             */
            ['key' => 'company_name', 'value' => 'MDR Construcciones'],
            ['key' => 'company_phone', 'value' => '+34 123 456 789'],
            ['key' => 'company_email', 'value' => 'info@mdrconstrucciones.com'],
            ['key' => 'company_address', 'value' => 'Calle Principal 123, 28001 Madrid'],

            /**
             * Email Settings.
             */
            ['key' => 'mail_from_name', 'value' => 'MDR Construcciones'],
            ['key' => 'mail_from_address', 'value' => 'noreply@mdrconstrucciones.com'],
            ['key' => 'mail_driver', 'value' => 'smtp'],
            ['key' => 'mail_host', 'value' => 'smtp.mailtrap.io'],
            ['key' => 'mail_port', 'value' => '2525'],

            /**
             * Security Settings.
             */
            ['key' => 'session_timeout', 'value' => '120'],
            ['key' => 'max_login_attempts', 'value' => '5'],
            ['key' => 'password_min_length', 'value' => '8'],
            ['key' => 'require_email_verification', 'value' => true],
            ['key' => 'enable_2fa', 'value' => false],
            ['key' => 'allowed_upload_extensions', 'value' => 'jpg,jpeg,png,pdf,doc,docx'],
            ['key' => 'max_upload_size', 'value' => '10240'],
            ['key' => 'enable_captcha', 'value' => false],

            /**
             * Maintenance.
             */
            ['key' => 'maintenance_mode', 'value' => false],
            ['key' => 'maintenance_message', 'value' => 'Estamos realizando mejoras en nuestro sitio. Volveremos pronto.'],
            ['key' => 'maintenance_allowed_ips', 'value' => []],
            ['key' => 'maintenance_start_at', 'value' => null],
            ['key' => 'maintenance_end_at', 'value' => null],
            ['key' => 'maintenance_show_countdown', 'value' => true],
            ['key' => 'maintenance_allow_admin', 'value' => true],
            ['key' => 'maintenance_retry_after', 'value' => '3600'],
            ['key' => 'maintenance_secret', 'value' => ''],
            ['key' => 'maintenance_template', 'value' => 'default'],

            /**
             * Social Media.
             */
            ['key' => 'facebook_url', 'value' => ''],
            ['key' => 'twitter_url', 'value' => ''],
            ['key' => 'instagram_url', 'value' => ''],
            ['key' => 'linkedin_url', 'value' => ''],
            ['key' => 'youtube_url', 'value' => ''],

            /**
             * SEO.
             */
            ['key' => 'seo_title', 'value' => 'MDR Construcciones - ConstrucciÃ³n de Calidad Premium'],
            ['key' => 'seo_description', 'value' => 'Empresa lÃ­der en construcciÃ³n y reformas en Madrid'],
            ['key' => 'seo_keywords', 'value' => 'construcciÃ³n, reformas, Madrid, calidad'],
            ['key' => 'og_image', 'value' => '/images/og-image.jpg'],
            ['key' => 'google_analytics_id', 'value' => ''],
            ['key' => 'google_search_console_id', 'value' => ''],
            ['key' => 'enable_sitemap', 'value' => true],
            ['key' => 'sitemap_frequency', 'value' => 'daily'],

            /**
             * Backup.
             */
            ['key' => 'backup_enabled', 'value' => true],
            ['key' => 'backup_frequency', 'value' => 'daily'],
            ['key' => 'backup_retention_days', 'value' => '30'],
            ['key' => 'backup_notification_email', 'value' => 'admin@mdrconstrucciones.com'],

            /**
             * Performance.
             */
            ['key' => 'cache_enabled', 'value' => true],
            ['key' => 'cache_ttl', 'value' => '3600'],
            ['key' => 'minify_html', 'value' => false],
            ['key' => 'minify_css', 'value' => false],

            /**
             * Blog.
             */
            ['key' => 'blog_enabled', 'value' => true],
            ['key' => 'blog_posts_per_page', 'value' => 12],
            ['key' => 'blog_allow_comments', 'value' => true],
            ['key' => 'blog_moderate_comments', 'value' => true],
            ['key' => 'blog_show_author', 'value' => true],
            ['key' => 'blog_show_reading_time', 'value' => true],
            ['key' => 'blog_enable_categories', 'value' => true],
            ['key' => 'blog_enable_tags', 'value' => true],

            /**
             * User Registration.
             */
            ['key' => 'registration_enabled', 'value' => true],
            ['key' => 'registration_require_email_verification', 'value' => true],
            ['key' => 'registration_auto_approve', 'value' => true],
        ];
    }
}

