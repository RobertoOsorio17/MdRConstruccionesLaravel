<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\Project;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageController extends Controller
{
    /**
     * Display the about page.
     */
    public function about()
    {
        // Get some stats for the about page
        $stats = [
            'completed_projects' => Project::completed()->count(),
            'years_experience' => now()->year - 2015, // Assuming company started in 2015
            'happy_clients' => Project::completed()->count() + 50, // Adding some buffer
            'team_members' => 15,
        ];

        // Get recent projects
        $recentProjects = Project::published()
            ->featured()
            ->limit(6)
            ->get(['id', 'title', 'slug', 'summary', 'gallery', 'location']);

        // Get company settings
        $companyInfo = [
            'name' => Setting::get('company_name', 'MDR Construcciones'),
            'phone' => Setting::get('company_phone'),
            'email' => Setting::get('company_email'),
            'address' => Setting::get('company_address'),
            'business_hours' => Setting::get('business_hours', []),
        ];

        return Inertia::render('Pages/About', [
            'stats' => $stats,
            'recentProjects' => $recentProjects,
            'companyInfo' => $companyInfo,
            'seo' => [
                'title' => 'Sobre Nosotros - MDR Construcciones',
                'description' => 'Conoce más sobre MDR Construcciones, empresa líder en reformas integrales con más de 8 años de experiencia en Madrid.',
            ],
        ]);
    }

    /**
     * Display the contact page.
     */
    public function contact()
    {
        // Get company contact information
        $contactInfo = [
            'name' => Setting::get('company_name', 'MDR Construcciones'),
            'phone' => Setting::get('company_phone'),
            'email' => Setting::get('company_email'),
            'address' => Setting::get('company_address'),
            'whatsapp' => Setting::get('whatsapp_number'),
            'business_hours' => Setting::get('business_hours', []),
            'social_media' => Setting::get('social_media', []),
        ];

        // Get featured services for contact page
        $services = \App\Models\Service::active()
            ->featured()
            ->ordered()
            ->get(['id', 'title', 'slug', 'excerpt', 'icon']);

        return Inertia::render('Pages/Contact', [
            'contactInfo' => $contactInfo,
            'services' => $services,
            'seo' => [
                'title' => 'Contacto - MDR Construcciones',
                'description' => 'Ponte en contacto con MDR Construcciones para tu reforma. Presupuesto gratuito y asesoramiento personalizado.',
            ],
        ]);
    }

    /**
     * Display privacy policy page.
     */
    public function privacy()
    {
        return Inertia::render('Pages/Privacy', [
            'seo' => [
                'title' => 'Política de Privacidad - MDR Construcciones',
                'description' => 'Política de privacidad y protección de datos de MDR Construcciones.',
            ],
        ]);
    }

    /**
     * Display legal notice page.
     */
    public function legal()
    {
        $companyInfo = [
            'name' => Setting::get('company_name', 'MDR Construcciones'),
            'email' => Setting::get('company_email'),
            'address' => Setting::get('company_address'),
        ];

        return Inertia::render('Pages/Legal', [
            'companyInfo' => $companyInfo,
            'seo' => [
                'title' => 'Aviso Legal - MDR Construcciones',
                'description' => 'Aviso legal y términos de uso del sitio web de MDR Construcciones.',
            ],
        ]);
    }

    /**
     * Display cookies policy page.
     */
    public function cookies()
    {
        return Inertia::render('Pages/Cookies', [
            'seo' => [
                'title' => 'Política de Cookies - MDR Construcciones',
                'description' => 'Información sobre el uso de cookies en el sitio web de MDR Construcciones.',
            ],
        ]);
    }
}
