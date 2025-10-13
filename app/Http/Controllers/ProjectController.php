<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Presents the public portfolio of construction projects with filtering, search, and related recommendations.
 * Translates domain models into Inertia responses that highlight featured work and contextual metadata.
 */
class ProjectController extends Controller
{
    /**
     * Display a listing of projects.
     */
    public function index(Request $request)
    {
        $query = Project::query();

        // Filter by category if provided
        if ($request->has('category') && !empty($request->category)) {
            $query->where('category', $request->category);
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

        // Get unique categories
        $categories = Project::distinct()->pluck('location');

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'featured' => $request->featured,
            ],
        ]);
    }

    /**
     * Display the specified project.
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
