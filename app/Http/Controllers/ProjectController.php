<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Presents the public portfolio of construction projects with filtering, search, and related recommendations.
 *
 * Features:
 * - Index with location/featured/search filters and curated columns.
 * - Show view with related projects fallback.
 * - SEO metadata for portfolio views.
 */
class ProjectController extends Controller
{
    /**
     * Display a listing of projects.
     *
     * @param Request $request The current HTTP request instance with optional filters.
     * @return \Inertia\Response Inertia response with projects and locations.
     */
    public function index(Request $request)
    {
        $query = Project::query();

        // Filter by location (used as categories in frontend)
        if ($request->has('location') && !empty($request->location)) {
            $query->where('location', $request->location);
        }

        // Filter by featured if provided
        if ($request->has('featured') && $request->featured === 'true') {
            $query->where('featured', true);
        }

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('summary', 'like', '%' . $request->search . '%')
                  ->orWhere('location', 'like', '%' . $request->search . '%');
            });
        }

        $projects = $query->orderBy('featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->get([
                'id', 'title', 'slug', 'summary', 'gallery',
                'location', 'budget_estimate', 'start_date', 'end_date',
                'featured', 'status'
            ]);

        // Get unique locations (displayed as categories in frontend)
        $locations = Project::distinct()->whereNotNull('location')->pluck('location');

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'locations' => $locations, // Locations displayed as categories
            'filters' => [
                'search' => $request->search,
                'location' => $request->location,
                'featured' => $request->featured,
            ],
        ]);
    }

    /**
     * Display the specified project.
     *
     * @param string $slug The project slug.
     * @return \Inertia\Response Inertia response with project and related items.
     */
    public function show($slug)
    {
        $project = Project::where('slug', $slug)->firstOrFail();

        // Get related projects from the same location (max 3)
        $relatedProjects = Project::where('location', $project->location)
            ->where('id', '!=', $project->id)
            ->where('featured', true)
            ->limit(3)
            ->get(['id', 'title', 'slug', 'summary', 'gallery', 'location']);

        // If not enough featured projects from same location, fill with other featured projects
        if ($relatedProjects->count() < 3) {
            $additionalProjects = Project::where('id', '!=', $project->id)
                ->where('featured', true)
                ->whereNotIn('id', $relatedProjects->pluck('id'))
                ->limit(3 - $relatedProjects->count())
                ->get(['id', 'title', 'slug', 'summary', 'gallery', 'location']);
            $relatedProjects = $relatedProjects->merge($additionalProjects);
        }

        return Inertia::render('Projects/Show', [
            'project' => $project,
            'relatedProjects' => $relatedProjects,
            'seo' => [
                'title' => $project->title . ' - Proyectos - MDR Construcciones',
                'description' => $project->summary,
                'image' => $project->gallery ? json_decode($project->gallery)[0] : null,
            ],
        ]);
    }
}
