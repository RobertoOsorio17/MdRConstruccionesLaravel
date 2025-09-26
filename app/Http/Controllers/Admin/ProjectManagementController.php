<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ProjectManagementController extends Controller
{
    /**
     * Display a listing of projects.
     */
    public function index(Request $request)
    {
        // Build query with filters
        $query = Project::query();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Featured filter
        if ($request->filled('featured')) {
            $featured = $request->featured === 'true';
            $query->where('featured', $featured);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('start_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('end_date', '<=', $request->date_to);
        }

        // Budget range filter
        if ($request->filled('budget_min')) {
            $query->where('budget_estimate', '>=', $request->budget_min);
        }
        if ($request->filled('budget_max')) {
            $query->where('budget_estimate', '<=', $request->budget_max);
        }

        // Sort
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginate
        $projects = $query->paginate($request->get('per_page', 15))->withQueryString();

        // Transform projects for frontend
        $projects->getCollection()->transform(function ($project) {
            return [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'summary' => $project->summary,
                'location' => $project->location,
                'budget_estimate' => $project->budget_estimate,
                'start_date' => $project->start_date ? $project->start_date->format('Y-m-d') : null,
                'end_date' => $project->end_date ? $project->end_date->format('Y-m-d') : null,
                'status' => $project->status,
                'featured' => $project->featured,
                'views_count' => $project->views_count,
                'gallery_count' => is_array($project->gallery) ? count($project->gallery) : 0,
                'created_at' => $project->created_at->format('Y-m-d H:i'),
                'updated_at' => $project->updated_at->format('Y-m-d H:i'),
                'duration_days' => $project->start_date && $project->end_date
                    ? $project->start_date->diffInDays($project->end_date)
                    : null,
                'status_label' => $this->getStatusLabel($project->status),
                'budget_formatted' => $project->budget_estimate
                    ? '€' . number_format($project->budget_estimate, 2, ',', '.')
                    : 'No especificado',
            ];
        });

        // Get statistics
        $stats = [
            'total_projects' => Project::count(),
            'draft_projects' => Project::where('status', 'draft')->count(),
            'published_projects' => Project::where('status', 'published')->count(),
            'completed_projects' => Project::where('status', 'completed')->count(),
            'featured_projects' => Project::where('featured', true)->count(),
            'total_budget' => Project::sum('budget_estimate') ?? 0,
            'total_views' => Project::sum('views_count') ?? 0,
        ];

        return Inertia::render('Admin/ProjectManagement', [
            'projects' => $projects,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'featured', 'date_from', 'date_to', 'budget_min', 'budget_max']),
            'sort' => ['field' => $sortField, 'direction' => $sortDirection],
        ]);
    }

    /**
     * Store a newly created project.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'required|string',
            'body' => 'required|string',
            'location' => 'nullable|string|max:255',
            'budget_estimate' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:draft,published,completed',
            'featured' => 'boolean',
            'gallery' => 'nullable|array',
            'gallery.*' => 'string', // URLs or file paths
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        $validated['featured'] = $request->boolean('featured');

        $project = Project::create($validated);

        return redirect()->back()->with('success', 'Proyecto creado exitosamente.');
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'required|string',
            'body' => 'required|string',
            'location' => 'nullable|string|max:255',
            'budget_estimate' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:draft,published,completed',
            'featured' => 'boolean',
            'gallery' => 'nullable|array',
            'gallery.*' => 'string',
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        $validated['featured'] = $request->boolean('featured');

        $project->update($validated);

        return redirect()->back()->with('success', 'Proyecto actualizado exitosamente.');
    }

    /**
     * Remove the specified project.
     */
    public function destroy(Project $project)
    {
        // Delete gallery images if they exist
        if ($project->gallery && is_array($project->gallery)) {
            foreach ($project->gallery as $imagePath) {
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
        }

        $project->delete();

        return redirect()->back()->with('success', 'Proyecto eliminado exitosamente.');
    }

    /**
     * Handle bulk actions on projects.
     */
    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:publish,draft,complete,feature,unfeature,delete',
            'project_ids' => 'required|array',
            'project_ids.*' => 'exists:projects,id',
        ]);

        $projects = Project::whereIn('id', $validated['project_ids']);

        switch ($validated['action']) {
            case 'publish':
                $projects->update(['status' => 'published']);
                $message = 'Proyectos publicados exitosamente.';
                break;
            case 'draft':
                $projects->update(['status' => 'draft']);
                $message = 'Proyectos marcados como borrador exitosamente.';
                break;
            case 'complete':
                $projects->update(['status' => 'completed']);
                $message = 'Proyectos marcados como completados exitosamente.';
                break;
            case 'feature':
                $projects->update(['featured' => true]);
                $message = 'Proyectos marcados como destacados exitosamente.';
                break;
            case 'unfeature':
                $projects->update(['featured' => false]);
                $message = 'Proyectos desmarcados como destacados exitosamente.';
                break;
            case 'delete':
                // Delete gallery images for each project
                $projectsToDelete = $projects->get();
                foreach ($projectsToDelete as $project) {
                    if ($project->gallery && is_array($project->gallery)) {
                        foreach ($project->gallery as $imagePath) {
                            if (Storage::disk('public')->exists($imagePath)) {
                                Storage::disk('public')->delete($imagePath);
                            }
                        }
                    }
                }
                $projects->delete();
                $message = 'Proyectos eliminados exitosamente.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Export projects to CSV.
     */
    public function export(Request $request)
    {
        $query = Project::query();

        // Apply same filters as index
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('featured')) {
            $featured = $request->featured === 'true';
            $query->where('featured', $featured);
        }

        $projects = $query->orderBy('created_at', 'desc')->get();

        $csvData = [];
        $csvData[] = [
            'ID', 'Título', 'Resumen', 'Ubicación', 'Presupuesto',
            'Fecha Inicio', 'Fecha Fin', 'Estado', 'Destacado',
            'Vistas', 'Creado', 'Actualizado'
        ];

        foreach ($projects as $project) {
            $csvData[] = [
                $project->id,
                $project->title,
                $project->summary,
                $project->location ?? 'N/A',
                $project->budget_estimate ? '€' . number_format($project->budget_estimate, 2) : 'N/A',
                $project->start_date ? $project->start_date->format('Y-m-d') : 'N/A',
                $project->end_date ? $project->end_date->format('Y-m-d') : 'N/A',
                $this->getStatusLabel($project->status),
                $project->featured ? 'Sí' : 'No',
                $project->views_count,
                $project->created_at->format('Y-m-d H:i:s'),
                $project->updated_at->format('Y-m-d H:i:s'),
            ];
        }

        $filename = 'proyectos_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get status label for display.
     */
    private function getStatusLabel($status)
    {
        return match($status) {
            'draft' => 'Borrador',
            'published' => 'Publicado',
            'completed' => 'Completado',
            default => 'Desconocido',
        };
    }
}
