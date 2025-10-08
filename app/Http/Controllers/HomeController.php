<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Project;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Composes the public home page by aggregating highlighted services, projects, content, and marketing metrics.
 * Ensures visitors receive an up-to-date snapshot of offerings and achievements immediately upon arrival.
 */
class HomeController extends Controller
{
    /**
     * Display the home page with featured services, projects, and statistics.
     */
    public function index()
    {
        // Retrieve featured services to highlight on the landing page.
        $services = Service::active()
            ->featured()
            ->ordered()
            ->get();

        // Retrieve featured projects for the hero carousel.
        $featuredProjects = Project::where('featured', true)
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get(['id', 'title', 'slug', 'summary', 'gallery', 'location']);

        // Pull latest featured blog posts for the home page.
        $latestPosts = Post::where('status', 'published')
            ->where('featured', true)
            ->with(['author:id,name,avatar', 'categories:id,name,slug,color'])
            ->latest('published_at')
            ->limit(3)
            ->get(['id', 'title', 'slug', 'excerpt', 'cover_image', 'published_at', 'user_id', 'views_count']);

        // Company statistics displayed on the home page.
        $stats = [
            'completed_projects' => Project::where('status', 'completed')->count() ?: 150,
            'years_experience' => now()->year - 2015,
            'happy_clients' => (Project::where('status', 'completed')->count() ?: 150) + 50,
            'warranty_years' => 2,
        ];

        return Inertia::render('Home', [
            'services' => $services,
            'featuredProjects' => $featuredProjects,
            'latestPosts' => $latestPosts,
            'stats' => $stats,
            'seo' => [
                'title' => 'MDR Construcciones - Complete Renovations in Madrid',
                'description' => 'Leading company in full renovations, bathrooms, kitchens, and refurbishments in Madrid. Free estimates, two-year warranty, and guaranteed on-time delivery.',
            ],
        ]);
    }
}
