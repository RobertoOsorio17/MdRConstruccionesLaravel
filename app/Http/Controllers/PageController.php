<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\Project;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Serves static marketing pages while enriching them with dynamic data drawn from projects, settings, and posts.
 * Keeps informational sections like About and Contact synchronized with the latest company metadata.
 */
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
                'title' => 'About Us - MDR Construcciones',
                'description' => 'Learn more about MDR Construcciones, a leading renovation company with more than eight years of experience in Madrid.',
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

        return Inertia::render('Pages/ContactNew', [
            'contactInfo' => $contactInfo,
            'services' => $services,
            'seo' => [
                'title' => 'Contacto - MDR Construcciones',
                'description' => 'Contacta con MDR Construcciones para tu proyecto de reforma o construcción. Presupuesto gratuito en 24-48 horas.',
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
                'title' => 'Privacy Policy - MDR Construcciones',
                'description' => 'Privacy policy and data protection details for MDR Construcciones.',
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
                'title' => 'Legal Notice - MDR Construcciones',
                'description' => 'Legal notice and terms of use for the MDR Construcciones website.',
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
                'title' => 'Cookie Policy - MDR Construcciones',
                'description' => 'Information about how cookies are used on the MDR Construcciones website.',
            ],
        ]);
    }
}


