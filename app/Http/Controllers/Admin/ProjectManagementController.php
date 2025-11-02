<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Traits\GeneratesUniqueSlug;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * Administers company project records from the control panel, covering portfolio curation, timelines, and featured selections.
 * Supports rich metadata editing, media management, and filtering capabilities tailored to construction case studies.
 */
class ProjectManagementController extends Controller
{
    use GeneratesUniqueSlug;
    
    
    
    
    /**

    
    
    
     * Display a listing of the resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function index(Request $request)
    {
        /**
         * Build query with filters.
         */
        $query = Project::query();

        /**
         * Search filter.
         */
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        /**
         * Status filter.
         */
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        /**
         * Featured filter.
         */
        if ($request->filled('featured')) {
            $featured = $request->featured === 'true';
            $query->where('featured', $featured);
        }

        /**
         * Date range filter.
         */
        if ($request->filled('date_from')) {
            $query->whereDate('start_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('end_date', '<=', $request->date_to);
        }

        /**
         * Budget range filter.
         */
        if ($request->filled('budget_min')) {
            $query->where('budget_estimate', '>=', $request->budget_min);
        }
        if ($request->filled('budget_max')) {
            $query->where('budget_estimate', '<=', $request->budget_max);
        }

        /**
         * Sorting with whitelist validation to prevent SQL injection.
         */
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        /**
         * SECURITY: Whitelist allowed sort fields and directions.
         */
        $allowedSorts = ['title', 'status', 'featured', 'start_date', 'end_date', 'budget_estimate', 'created_at', 'views_count'];
        $allowedDirections = ['asc', 'desc'];

        if (in_array($sortField, $allowedSorts) && in_array(strtolower($sortDirection), $allowedDirections)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        /**
         * Paginate results.
         */
        $projects = $query->paginate($request->get('per_page', 15))->withQueryString();

        /**
         * Transform projects for the frontend payload.
         */
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
                /**
                 * Format the project budget using European number formatting.
                 */
                'budget_formatted' => $project->budget_estimate
                    ? 'â‚¬' . number_format($project->budget_estimate, 2, ',', '.')
                    : 'No especificado',
            ];
        });

        /**
         * Build high-level statistics.
         */
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

    
    
    
     * Show the form for creating a new resource.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function create()
    {
        return Inertia::render('Admin/Projects/Create', [
            'statuses' => ['draft', 'published', 'completed'],
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Store a newly created resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
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
            /**
             * Accept gallery entries as URL or file path strings.
             */
            'gallery.*' => 'string',
        ]);

        /**
         * SECURITY: Ensure slug uniqueness using trait.
         */
        $validated['slug'] = $this->generateUniqueSlug($validated['title'], Project::class);
        $validated['featured'] = $request->boolean('featured');

        $project = Project::create($validated);

        return redirect()->back()->with('success', 'Project created successfully.');
    }

    
    
    
    
    /**

    
    
    
     * Show the form for editing the specified resource.

    
    
    
     *

    
    
    
     * @param Project $project The project.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function edit(Project $project)
    {
        return Inertia::render('Admin/Projects/Edit', [
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'summary' => $project->summary,
                'body' => $project->body,
                'location' => $project->location,
                'budget_estimate' => $project->budget_estimate,
                'start_date' => $project->start_date,
                'end_date' => $project->end_date,
                'status' => $project->status,
                'featured' => $project->featured,
                'gallery' => $project->gallery ?? [],
            ],
            'statuses' => ['draft', 'published', 'completed'],
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Update the specified resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param Project $project The project.

    
    
    
     * @return void

    
    
    
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

        /**
         * SECURITY: Ensure slug uniqueness (exclude current project) using trait.
         */
        $validated['slug'] = $this->generateUniqueSlug($validated['title'], Project::class, $project->id);
        $validated['featured'] = $request->boolean('featured');

        $project->update($validated);

        return redirect()->back()->with('success', 'Project updated successfully.');
    }

    
    
    
    
    /**

    
    
    
     * Remove the specified resource.

    
    
    
     *

    
    
    
     * @param Project $project The project.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function destroy(Project $project)
    {
        /**
         * Delete gallery images if they exist.
         */
        if ($project->gallery && is_array($project->gallery)) {
            foreach ($project->gallery as $imagePath) {
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
        }

        $project->delete();

        return redirect()->back()->with('success', 'Project deleted successfully.');
    }

    
    
    
    
    /**

    
    
    
     * Handle bulk action.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
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
                $message = 'Projects published successfully.';
                break;
            case 'draft':
                $projects->update(['status' => 'draft']);
                $message = 'Projects marked as draft successfully.';
                break;
            case 'complete':
                $projects->update(['status' => 'completed']);
                $message = 'Projects marked as completed successfully.';
                break;
            case 'feature':
                $projects->update(['featured' => true]);
                $message = 'Projects marked as featured successfully.';
                break;
            case 'unfeature':
                $projects->update(['featured' => false]);
                $message = 'Projects unmarked as featured successfully.';
                break;
            case 'delete':
                /**
                 * Delete gallery images for each project.
                 */
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
                $message = 'Projects deleted successfully.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }

    
    
    
    
    /**

    
    
    
     * Handle export.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function export(Request $request)
    {
        $filters = [
            'search' => $request->get('search'),
            'status' => $request->get('status'),
            'featured' => $request->get('featured'),
        ];

        /**
         * Determine the requested export format (xlsx or csv).
         */
        $format = $request->get('format', 'xlsx');
        $filename = 'proyectos_' . now()->format('Y-m-d_H-i-s');

        try {
            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\ProjectsExport($filters),
                $filename . '.' . $format
            );
        } catch (\Exception $e) {
            \Log::error('Project export failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Error al exportar proyectos: ' . $e->getMessage());
        }
    }

    
    
    
    
    /**

    
    
    
     * Display the specified resource.

    
    
    
     *

    
    
    
     * @param Project $project The project.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function show(Project $project)
    {
        /**
         * Get project timeline/milestones (mock data for now).
         */
        $timeline = [
            [
                'title' => 'Project Started',
                'description' => 'The project has been created and planned.',
                'date' => $project->created_at,
                'type' => 'milestone'
            ],
        ];

        if ($project->start_date) {
            $timeline[] = [
                'title' => 'Development Started',
                'description' => 'The development phase of the project began.',
                'date' => $project->start_date,
                'type' => 'milestone'
            ];
        }

        if ($project->status === 'completed' && $project->end_date) {
            $timeline[] = [
                'title' => 'Project Completed',
                'description' => 'The project has been successfully completed.',
                'date' => $project->end_date,
                'type' => 'milestone'
            ];
        }

        return Inertia::render('Admin/Projects/Show', [
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'summary' => $project->summary,
                /**
                 * Expose the full project body content for the detail view.
                 */
                'body' => $project->body,
                'location' => $project->location,
                /**
                 * Provide the stored budget estimate using the correct column.
                 */
                'budget_estimate' => $project->budget_estimate,
                'status' => $project->status,
                'featured' => $project->featured,
                'start_date' => $project->start_date,
                'end_date' => $project->end_date,
                'expected_end_date' => $project->expected_end_date,
                'images' => $project->images ? json_decode($project->images, true) : [],
                'technologies' => $project->technologies ? json_decode($project->technologies, true) : [],
                'created_at' => $project->created_at,
                'updated_at' => $project->updated_at,
            ],
            'timeline' => $timeline,
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle analytics.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function analytics(Request $request)
    {
        $period = $request->get('period', 30);
        $startDate = now()->subDays($period);

        /**
         * Get analytics data.
         */
        $analyticsData = [
            'timeline_analysis' => [
                'total_projects' => Project::where('created_at', '>=', $startDate)->count(),
                'avg_duration_days' => Project::where('created_at', '>=', $startDate)
                    ->whereNotNull('start_date')
                    ->whereNotNull('end_date')
                    ->selectRaw('AVG(DATEDIFF(COALESCE(end_date, NOW()), start_date)) as avg_duration')
                    ->value('avg_duration') ?? 0,
            ],
            'status_distribution' => Project::where('created_at', '>=', $startDate)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get()
                ->mapWithKeys(function ($item) {
                    return [$item->status => $item->count];
                }),
            'performance_metrics' => [
                'total_completed' => Project::where('status', 'completed')
                    ->where('end_date', '>=', $startDate)
                    ->count(),
                /**
                 * Note: There is no expected_end_date column, only end_date.
                 * This metric would need a separate expected_end_date column to work properly.
                 */
                /**
                 * Placeholder until an expected_end_date column is introduced.
                 */
                'completed_on_time' => 0,
                /**
                 * Placeholder for calculated completion rates once data supports it.
                 */
                'on_time_completion_rate' => 0,
            ],
            'completion_trends' => Project::where('status', 'completed')
                ->where('end_date', '>=', now()->subMonths(6))
                ->selectRaw('YEAR(end_date) as year, MONTH(end_date) as month, COUNT(*) as completions')
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    return [
                        'month' => \Carbon\Carbon::createFromDate($item->year, $item->month, 1)->format('M Y'),
                        'completions' => $item->completions,
                    ];
                }),
            'budget_total' => Project::where('created_at', '>=', $startDate)
                ->whereNotNull('budget')
                ->sum('budget'),
        ];

        /**
         * Calculate on-time completion rate.
         */
        if ($analyticsData['performance_metrics']['total_completed'] > 0) {
            $analyticsData['performance_metrics']['on_time_completion_rate'] =
                ($analyticsData['performance_metrics']['completed_on_time'] /
                 $analyticsData['performance_metrics']['total_completed']) * 100;
        }

        return Inertia::render('Admin/Projects/Analytics', [
            'initialData' => $analyticsData,
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Get status label.

    
    
    
     *

    
    
    
     * @param mixed $status The status.

    
    
    
     * @return void

    
    
    
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
