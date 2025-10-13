<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'company_name',
                'value' => 'MDR Construcciones',
                'type' => 'string',
                'description' => 'Nombre de la empresa',
            ],
            [
                'key' => 'company_phone',
                'value' => '+34 123 456 789',
                'type' => 'string',
                'description' => 'Teléfono principal de contacto',
            ],
            [
                'key' => 'company_email',
                'value' => 'info@mdrconstrucciones.com',
                'type' => 'string',
                'description' => 'Email de contacto',
            ],
            [
                'key' => 'company_address',
                'value' => 'Calle Principal 123, 28001 Madrid',
                'type' => 'string',
                'description' => 'Dirección de la empresa',
            ],
            [
                'key' => 'whatsapp_number',
                'value' => '34123456789',
                'type' => 'string',
                'description' => 'Número de WhatsApp (sin signos)',
            ],
            [
                'key' => 'social_media',
                'value' => json_encode([
                    'facebook' => 'https://facebook.com/mdrconstrucciones',
                    'instagram' => 'https://instagram.com/mdrconstrucciones',
                    'linkedin' => 'https://linkedin.com/company/mdrconstrucciones'
                ]),
                'type' => 'json',
                'description' => 'Redes sociales de la empresa',
            ],
            [
                'key' => 'business_hours',
                'value' => json_encode([
                    'monday' => '09:00-18:00',
                    'tuesday' => '09:00-18:00',
                    'wednesday' => '09:00-18:00',
                    'thursday' => '09:00-18:00',
                    'friday' => '09:00-18:00',
                    'saturday' => '09:00-14:00',
                    'sunday' => 'Cerrado'
                ]),
                'type' => 'json',
                'description' => 'Horarios de atención',
            ],
            [
                'key' => 'seo_description',
                'value' => 'MDR Construcciones - Empresa líder en reformas integrales, baños, cocinas y rehabilitaciones en Madrid. Presupuesto gratuito y garantía de calidad.',
                'type' => 'string',
                'description' => 'Descripción SEO por defecto',
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->insert(array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
