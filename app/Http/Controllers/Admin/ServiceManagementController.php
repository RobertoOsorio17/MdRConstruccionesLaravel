<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceFavorite;
use App\Models\Category;
use App\Traits\GeneratesUniqueSlug;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Provides a comprehensive administration surface for service offerings, spanning metadata, media assets, and audience targeting.
 * Empowers staff to curate catalog visibility, maintain categorization, and analyze engagement signals in real time.
 */
class ServiceManagementController extends Controller
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
        $query = Service::with(['category']);

        /**
         * Apply keyword filtering across title and descriptions.
         */
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        /**
         * Filter by the selected category.
         */
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        /**
         * Filter by active/inactive status.
         */
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        /**
         * Filter by featured flag (correct column name is 'featured', not 'is_featured').
         */
        if ($request->filled('featured')) {
            if ($request->featured === 'yes') {
                $query->where('featured', true);
            } elseif ($request->featured === 'no') {
                $query->where('featured', false);
            }
        }

        /**
         * Sorting preferences with whitelist validation.
         */
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        /**
         * Security: Whitelist allowed sort fields and directions.
         */
        $allowedSorts = ['title', 'status', 'featured', 'is_active', 'sort_order', 'created_at', 'views_count', 'price'];
        $allowedDirections = ['asc', 'desc'];

        if (in_array($sortBy, $allowedSorts) && in_array(strtolower($sortOrder), $allowedDirections)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        /**
         * Paginate the results.
         */
        $perPage = $request->get('per_page', 15);
        $services = $query->paginate($perPage);

        /**
         * Transform services data for the frontend.
         */
        $services->getCollection()->transform(function ($service) {
            return [
                'id' => $service->id,
                'title' => $service->title,
                'slug' => $service->slug,
                'excerpt' => $service->excerpt, // Correct column name.
                'body' => $service->body, // Correct column name.
                'price' => $service->price,
                'is_active' => $service->is_active,
                'featured' => $service->featured, // Correct column name.
                'image_url' => $service->image ? Storage::url($service->image) : null,
                'category' => $service->category ? [
                    'id' => $service->category->id,
                    'name' => $service->category->name,
                    'slug' => $service->category->slug,
                ] : null,
                'views_count' => $service->views_count ?? 0,
                'created_at' => $service->created_at,
                'updated_at' => $service->updated_at,
            ];
        });

        /**
         * Aggregate simple dashboard statistics.
         */
        $stats = [
            'total_services' => Service::count(),
            'active_services' => Service::where('is_active', true)->count(),
            'inactive_services' => Service::where('is_active', false)->count(),
            'featured_services' => Service::where('featured', true)->count(),
            'total_views' => Service::sum('views_count') ?? 0,
        ];

        /**
         * Retrieve categories for filtering.
         */
        $categories = Category::select('id', 'name', 'slug')->get();

        return Inertia::render('Admin/ServiceManagement', [
            'services' => $services,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['search', 'category', 'status', 'featured', 'sort_by', 'sort_order']),
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Show the form for creating a new resource.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function create()
    {
        $categories = Category::select('id', 'name', 'slug')->get();

        return Inertia::render('Admin/ServiceForm', [
            'service' => null,
            'categories' => $categories,
            'mode' => 'create',
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
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string|max:500', // Correct column name.
            'body' => 'required|string', // Correct column name.
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean',
            'featured' => 'boolean', // âœ… Correct column name
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();

        /**
         * Security: Ensure slug uniqueness using trait.
         */
        $data['slug'] = $this->generateUniqueSlug($data['title'], Service::class);

        /**
         * Handle image upload.
         */
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('services', 'public');
        }

        $service = Service::create($data);

        session()->flash('success', 'Service created successfully.');
        return redirect()->route('admin.services.index'); // Fixed route name.
    }

    
    
    
    
    /**

    
    
    
     * Display the specified resource.

    
    
    
     *

    
    
    
     * @param Service $service The service.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function show(Service $service)
    {
        $service->load(['category']);

        /**
         * Collect simple service analytics (last 30 days).
         */
        $analytics = [
            'monthly_views' => $service->views_count ?? 0, // In a real app, this would be calculated from analytics data
            'monthly_favorites' => $service->favorites()->where('created_at', '>=', now()->subDays(30))->count(),
        ];

        /**
         * Load favorites count.
         */
        $service->loadCount('favorites');

        return Inertia::render('Admin/Services/Show', [
            'service' => [
                'id' => $service->id,
                'title' => $service->title,
                'slug' => $service->slug,
                'excerpt' => $service->excerpt,
                'body' => $service->body,
                'price' => $service->price,
                'is_active' => $service->is_active,
                'featured' => $service->featured,
                'image' => $service->image ? Storage::url($service->image) : null,
                'category' => $service->category ? [
                    'id' => $service->category->id,
                    'name' => $service->category->name,
                    'slug' => $service->category->slug,
                ] : null,
                'views_count' => $service->views_count ?? 0,
                'favorites_count' => $service->favorites_count ?? 0,
                'created_at' => $service->created_at,
                'updated_at' => $service->updated_at,
            ],
            'analytics' => $analytics,
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Show the form for editing the specified resource.

    
    
    
     *

    
    
    
     * @param Service $service The service.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function edit(Service $service)
    {
        $service->load(['category']);
        $categories = Category::select('id', 'name', 'slug')->get();

        return Inertia::render('Admin/ServiceForm', [
            'service' => [
                'id' => $service->id,
                'title' => $service->title,
                'slug' => $service->slug,
                'short_description' => $service->short_description,
                'description' => $service->description,
                'category_id' => $service->category_id,
                'price' => $service->price,
                'is_active' => $service->is_active,
                'featured' => $service->featured,
                'image_url' => $service->image ? Storage::url($service->image) : null,
            ],
            'categories' => $categories,
            'mode' => 'edit',
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Update the specified resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param Service $service The service.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function update(Request $request, Service $service)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string|max:500',
            'body' => 'required|string',
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean',
            'featured' => 'boolean',
            'icon' => 'nullable|string|max:255',
            'video_url' => 'nullable|url',
            'featured_image' => 'nullable|string',
            'faq' => 'nullable|array',
            'metrics' => 'nullable|array',
            'benefits' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();

        /**
         * Update the slug when the title changes with uniqueness check using trait.
         */
        if ($data['title'] !== $service->title) {
            $data['slug'] = $this->generateUniqueSlug($data['title'], Service::class, $service->id);
        }

        /**
         * Handle image upload.
         */
        if ($request->hasFile('image')) {
            /**
             * Delete old image.
             */
            if ($service->image) {
                Storage::disk('public')->delete($service->image);
            }
            $data['image'] = $request->file('image')->store('services', 'public');
        }

        $service->update($data);

        return redirect()->route('admin.services.index') // Fixed route name.
            ->with('success', 'Service updated successfully.');
    }

    
    
    
    
    /**

    
    
    
     * Remove the specified resource.

    
    
    
     *

    
    
    
     * @param Service $service The service.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function destroy(Service $service)
    {
        /**
         * Delete associated image.
         */
        if ($service->image) {
            Storage::disk('public')->delete($service->image);
        }

        $service->delete();

        return redirect()->route('admin.services.index') // Fixed route name.
            ->with('success', 'Service deleted successfully.');
    }

    
    
    
    
    /**

    
    
    
     * Handle bulk action.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function bulkAction(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|string|in:activate,deactivate,feature,unfeature,delete',
            'service_ids' => 'required|array|min:1',
            'service_ids.*' => 'exists:services,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $action = $request->action;
        $serviceIds = $request->service_ids;
        $services = Service::whereIn('id', $serviceIds);

        switch ($action) {
            case 'activate':
                $services->update(['is_active' => true]);
                $message = 'Services activated successfully.';
                break;
            case 'deactivate':
                $services->update(['is_active' => false]);
                $message = 'Services deactivated successfully.';
                break;
            case 'feature':
                $services->update(['featured' => true]); // Correct column name.
                $message = 'Services marked as featured successfully.';
                break;
            case 'unfeature':
                $services->update(['featured' => false]); // Correct column name.
                $message = 'Services unmarked as featured successfully.';
                break;
            case 'delete':
                /**
                 * Delete associated images.
                 */
                $servicesToDelete = $services->get();
                foreach ($servicesToDelete as $service) {
                    if ($service->image) {
                        Storage::disk('public')->delete($service->image);
                    }
                }
                $services->delete();
                $message = 'Services deleted successfully.';
                break;
        }

        return redirect()->route('admin.services.index') // Fixed route name.
            ->with('success', $message);
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

        $format = $request->get('format', 'xlsx'); // xlsx, csv
        $filename = 'servicios_' . now()->format('Y-m-d_H-i-s');

        try {
            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\ServicesExport($filters),
                $filename . '.' . $format
            );
        } catch (\Exception $e) {
            \Log::error('Service export failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Error al exportar servicios: ' . $e->getMessage());
        }
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
            'performance' => [
                'total_views' => Service::sum('views_count'),
                'avg_views' => Service::avg('views_count'),
                'max_views' => Service::max('views_count'),
                'total_services' => Service::count(),
            ],
            'favorites' => ServiceFavorite::join('services', 'service_favorites.service_id', '=', 'services.id')
                ->where('service_favorites.created_at', '>=', $startDate)
                ->selectRaw('services.title, COUNT(*) as favorite_count')
                ->groupBy('services.id', 'services.title')
                ->orderBy('favorite_count', 'desc')
                ->limit(10)
                ->get(),
            'views' => Service::where('updated_at', '>=', $startDate)
                ->selectRaw('title, views_count as total_views, featured')
                ->orderBy('views_count', 'desc')
                ->limit(10)
                ->get(),
            'conversion' => [
                'total_views' => Service::sum('views_count'),
                'total_favorites' => ServiceFavorite::where('created_at', '>=', $startDate)->count(),
                'conversion_rate' => Service::sum('views_count') > 0
                    ? (ServiceFavorite::where('created_at', '>=', $startDate)->count() / Service::sum('views_count')) * 100
                    : 0,
            ],
        ];

        return Inertia::render('Admin/Services/Analytics', [
            'initialData' => $analyticsData,
        ]);
    }
}
