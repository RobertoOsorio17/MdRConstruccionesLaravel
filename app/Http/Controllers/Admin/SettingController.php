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

            // Company Information
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
                'descriptioMaximum number of failed login attempts',
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



