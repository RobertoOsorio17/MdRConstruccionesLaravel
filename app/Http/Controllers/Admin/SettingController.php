<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Display the settings page
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
     * Update settings
     */
    public function update(Request $request)
    {
        $settings = $request->input('settings', []);
        $errors = [];
        $updated = [];

        foreach ($settings as $key => $value) {
            $setting = AdminSetting::where('key', $key)->first();
            
            if (!$setting) {
                $errors[$key] = 'Setting not found';
                continue;
            }

            // Validate the value
            if ($setting->validation_rules) {
                $validator = Validator::make(
                    [$key => $value],
                    [$key => $setting->validation_rules]
                );

                if ($validator->fails()) {
                    $errors[$key] = $validator->errors()->first($key);
                    continue;
                }
            }

            // Update the setting
            $setting->value = $value;
            $setting->save();
            $updated[] = $key;

            // Clear cache
            Cache::forget("setting.{$key}");
        }

        // Clear all settings cache
        Cache::forget('settings.all');

        if (!empty($errors)) {
            return back()->withErrors($errors)->with('success', 
                count($updated) > 0 ? 'Some settings were updated successfully.' : null
            );
        }

        return back()->with('success', 'Settings updated successfully.');
    }

    /**
     * Get setting groups configuration
     */
    private function getSettingGroups()
    {
        return [
            'general' => [
                'label' => 'Configuración General',
                'description' => 'Configuraciones básicas del sitio web',
                'icon' => 'settings',
            ],
            'company' => [
                'label' => 'Información de la Empresa',
                'description' => 'Datos de contacto y información corporativa',
                'icon' => 'business',
            ],
            'email' => [
                'label' => 'Configuración de Email',
                'description' => 'Configuraciones de correo electrónico y notificaciones',
                'icon' => 'email',
            ],
            'security' => [
                'label' => 'Seguridad',
                'description' => 'Configuraciones de seguridad y autenticación',
                'icon' => 'security',
            ],
            'api' => [
                'label' => 'APIs y Integraciones',
                'description' => 'Claves de API y configuraciones de servicios externos',
                'icon' => 'api',
            ],
            'social' => [
                'label' => 'Redes Sociales',
                'description' => 'Enlaces y configuraciones de redes sociales',
                'icon' => 'share',
            ],
            'seo' => [
                'label' => 'SEO y Meta Tags',
                'description' => 'Configuraciones de optimización para motores de búsqueda',
                'icon' => 'search',
            ],
            'maintenance' => [
                'label' => 'Mantenimiento',
                'description' => 'Configuraciones de mantenimiento y modo de desarrollo',
                'icon' => 'build',
            ],
        ];
    }

    /**
     * Initialize default settings
     */
    public function initializeDefaults()
    {
        $defaultSettings = [
            // General Settings
            [
                'key' => 'site_name',
                'value' => 'MDR Construcciones',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Nombre del Sitio',
                'description' => 'Nombre principal del sitio web',
                'validation_rules' => ['required', 'string', 'max:255'],
                'is_public' => true,
                'sort_order' => 1,
            ],
            [
                'key' => 'site_description',
                'value' => 'Empresa líder en construcción y reformas',
                'type' => 'text',
                'group' => 'general',
                'label' => 'Descripción del Sitio',
                'description' => 'Descripción breve del sitio web',
                'validation_rules' => ['required', 'string', 'max:500'],
                'is_public' => true,
                'sort_order' => 2,
            ],
            [
                'key' => 'site_logo',
                'value' => '/images/logo.png',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Logo del Sitio',
                'description' => 'URL del logo principal',
                'validation_rules' => ['nullable', 'string', 'max:255'],
                'is_public' => true,
                'sort_order' => 3,
            ],
            [
                'key' => 'maintenance_mode',
                'value' => false,
                'type' => 'boolean',
                'group' => 'maintenance',
                'label' => 'Modo Mantenimiento',
                'description' => 'Activar modo de mantenimiento del sitio',
                'validation_rules' => ['boolean'],
                'is_public' => false,
                'sort_order' => 1,
            ],

            // Company Information
            [
                'key' => 'company_name',
                'value' => 'MDR Construcciones',
                'type' => 'string',
                'group' => 'company',
                'label' => 'Nombre de la Empresa',
                'description' => 'Nombre oficial de la empresa',
                'validation_rules' => ['required', 'string', 'max:255'],
                'is_public' => true,
                'sort_order' => 1,
            ],
            [
                'key' => 'company_phone',
                'value' => '+34 123 456 789',
                'type' => 'string',
                'group' => 'company',
                'label' => 'Teléfono',
                'description' => 'Número de teléfono principal',
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
                'label' => 'Dirección',
                'description' => 'Dirección física de la empresa',
                'validation_rules' => ['required', 'string', 'max:500'],
                'is_public' => true,
                'sort_order' => 4,
            ],

            // Email Settings
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

            // Security Settings
            [
                'key' => 'session_timeout',
                'value' => 120,
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Tiempo de Sesión (minutos)',
                'description' => 'Tiempo antes de que expire la sesión',
                'validation_rules' => ['required', 'integer', 'min:5', 'max:1440'],
                'is_public' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'max_login_attempts',
                'value' => 5,
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Intentos de Login Máximos',
                'description' => 'Número máximo de intentos de login fallidos',
                'validation_rules' => ['required', 'integer', 'min:3', 'max:10'],
                'is_public' => false,
                'sort_order' => 2,
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
}
