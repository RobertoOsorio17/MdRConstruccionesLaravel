<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceFavorite;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Advanced service management features for administrators.
 */
class ServiceManagementController extends Controller
{
    /**
     * Display a listing of services.
     */
    public function index(Request $request)
    {
        $query = Service::with(['category']);

        // Apply keyword filtering across title and descriptions.
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        // Filter by the selected category.
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        // Filter by active/inactive status.
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Filter by featured flag.
        if ($request->filled('featured')) {
            if ($request->featured === 'yes') {
                $query->where('is_featured', true);
            } elseif ($request->featured === 'no') {
                $query->where('is_featured', false);
            }
        }

        // Sorting preferences.
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate the results.
        $perPage = $request->get('per_page', 15);
        $services = $query->paginate($perPage);

        // Transform services data for the frontend.
        $services->getCollection()->transform(function ($service) {
            return [
                'id' => $service->id,
                'title' => $service->title,
                'slug' => $service->slug,
                'short_description' => $service->short_description,
                'description' => $service->description,
                'price' => $service->price,
                'price_type' => $service->price_type,
                'duration' => $service->duration,
                'is_active' => $service->is_active,
                'is_featured' => $service->is_featured,
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

        // Aggregate simple dashboard statistics.
        $stats = [
            'total_services' => Service::count(),
            'active_services' => Service::where('is_active', true)->count(),
            'inactive_services' => Service::where('is_active', false)->count(),
            'featured_services' => Service::where('featured', true)->count(),
            'total_views' => Service::sum('views_count') ?? 0,
        ];

        // Retrieve categories for filtering.
        $categories = Category::select('id', 'name', 'slug')->get();

        return Inertia::render('Admin/ServiceManagement', [
            'services' => $services,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['search', 'category', 'status', 'featured', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new service.
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
     * Store a newly created service.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'short_description' => 'required|string|max:500',
            'description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'price' => 'nullable|numeric|min:0',
            'price_type' => 'nullable|string|in:fixed,hourly,project,quote',
            'duration' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();
        $data['slug'] = Str::slug($data['title']);

        // Handle image upload.
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('services', 'public');
        }

        $service = Service::create($data);

        return redirect()->route('admin.admin.services.index')
            ->with('success', 'Service created successfully.');
    }

    /**
     * Display the specified service.
     */
    public function show(Service $service)
    {
        $service->load(['category']);

        // Collect simple service analytics (last 30 days).
        $analytics = [
            'monthly_views' => $service->views_count ?? 0, // In a real app, this would be calculated from analytics data
            'monthly_favorites' => $service->favorites()->where('created_at', '>=', now()->subDays(30))->count(),
        ];

        return Inertia::render('Admin/Services/Show', [
            'service' => [
                'id' => $service->id,
                'title' => $service->title,
                'slug' => $service->slug,
                'short_description' => $service->short_description,
                'description' => $service->description,
                'price' => $service->price,
                'price_type' => $service->price_type,
                'duration' => $service->duration,
                'is_active' => $service->is_active,
                'is_featured' => $service->is_featured,
                'image' => $service->image ? Storage::url($service->image) : null,
                'features' => $service->features ? json_decode($service->features, true) : [],
                'category' => $service->category ? [
                    'id' => $service->category->id,
                    'name' => $service->category->name,
                    'slug' => $service->category->slug,
                ] : null,
                'views_count' => $service->views_count ?? 0,
                'favorites_count' => $service->favorites()->count(),
                'created_at' => $service->created_at,
                'updated_at' => $service->updated_at,
            ],
            'analytics' => $analytics,
        ]);
    }

    /**
     * Show the form for editing the specified service.
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
                'price_type' => $service->price_type,
                'duration' => $service->duration,
                'is_active' => $service->is_active,
                'is_featured' => $service->is_featured,
                'image_url' => $service->image ? Storage::url($service->image) : null,
            ],
            'categories' => $categories,
            'mode' => 'edit',
        ]);
    }

    /**
     * Update the specified service.
     */
    public function update(Request $request, Service $service)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'short_description' => 'required|string|max:500',
            'description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'price' => 'nullable|numeric|min:0',
            'price_type' => 'nullable|string|in:fixed,hourly,project,quote',
            'duration' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();

        // Update the slug when the title changes.
        if ($data['title'] !== $service->title) {
            $data['slug'] = Str::slug($data['title']);
        }

        // Handle image upload.
        if ($request->hasFile('image')) {
            // Delete old image
            if ($service->image) {
                Storage::disk('public')->delete($service->image);
            }
            $data['image'] = $request->file('image')->store('services', 'public');
        }

        $service->update($data);

        return redirect()->route('admin.admin.services.index')
            ->with('success', 'Service updated successfully.');
    }

    /**
     * Remove the specified service.
     */
    public function destroy(Service $service)
    {
        // Delete associated image.
        if ($service->image) {
            Storage::disk('public')->delete($service->image);
        }

        $service->delete();

        return redirect()->route('admin.admin.services.index')
            ->with('success', 'Service deleted successfully.');
    }

    /**
     * Handle bulk actions on services.
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
                $services->update(['is_featured' => true]);
                $message = 'Services marked as featured successfully.';
                break;
            case 'unfeature':
                $services->update(['is_featured' => false]);
                $message = 'Services unmarked as featured successfully.';
                break;
            case 'delete':
                // Delete associated images
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

        return redirect()->route('admin.admin.services.index')
            ->with('success', $message);
    }

    /**
     * Export services to CSV.
     */
    public function export(Request $request)
    {
        $query = Service::with(['category']);

        // Apply the same filters used by the index view.
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if ($request->filled('featured')) {
            if ($request->featured === 'yes') {
                $query->where('is_featured', true);
            } elseif ($request->featured === 'no') {
                $query->where('is_featured', false);
            }
        }

        $services = $query->get();

        $csvData = [];
        $csvData[] = [
            'ID', 'Title', 'Slug', 'Short Description', 'Category',
            'Price', 'Price Type', 'Duration', 'Active', 'Featured',
            'Views', 'Created At'
        ];

        foreach ($services as $service) {
            $csvData[] = [
                $service->id,
                $service->title,
                $service->slug,
                $service->short_description,
                $service->category ? $service->category->name : 'No category',
                $service->price ?? 'N/A',
                $service->price_type ?? 'N/A',
                $service->duration ?? 'N/A',
                $service->is_active ? 'Yes' : 'No',
                $service->is_featured ? 'Yes' : 'No',
                $service->views_count ?? 0,
                $service->created_at->format('Y-m-d H:i:s'),
            ];
        }

        $filename = 'services_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
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
     * Show service analytics.
     */
    public function analytics(Request $request)
    {
        $period = $request->get('period', 30);
        $startDate = now()->subDays($period);

        // Get analytics data
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
                ->selectRaw('title, views_count as total_views, is_featured')
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
