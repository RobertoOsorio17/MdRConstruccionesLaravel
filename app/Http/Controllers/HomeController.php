<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Project;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        // Obtener servicios destacados para mostrar en home
        $services = Service::active()
            ->featured()
            ->ordered()
            ->get();

        // Obtener proyectos destacados para el carrusel
        $featuredProjects = Project::where('featured', true)
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get(['id', 'title', 'slug', 'summary', 'gallery', 'location']);

        // Obtener últimos posts del blog (cuando esté implementado)
        $latestPosts = collect(); // Placeholder hasta implementar blog

        // Estadísticas de la empresa
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
                'title' => 'MDR Construcciones - Reformas Integrales en Madrid',
                'description' => 'Empresa líder en reformas integrales, baños, cocinas y rehabilitaciones en Madrid. Presupuesto gratuito, garantía 2 años y entrega en plazo garantizada.',
            ],
        ]);
    }
}
