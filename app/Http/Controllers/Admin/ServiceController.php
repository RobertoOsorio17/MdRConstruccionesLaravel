<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

/**
 * Controls the administrative management of public services, ensuring offerings remain accurate and market-ready.
 * Wraps validation, ordering, and presentation concerns so service content stays aligned with business priorities.
 */
class ServiceController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Display a listing of the resource.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function index()
    {
        $services = Service::orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get([
                'id', 'title', 'slug', 'excerpt', 'icon', 'sort_order', 
                'is_active', 'featured', 'created_at'
            ]);

        return Inertia::render('Admin/Services/Index', [
            'services' => $services
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Show the form for creating a new resource.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function create()
    {
        return Inertia::render('Admin/Services/Create');
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
            'excerpt' => 'required|string|max:500',
            'body' => 'required|string',
            'icon' => 'nullable|string|max:100',
            'faq' => 'nullable|array',
            'faq.*.question' => 'required|string',
            'faq.*.answer' => 'required|string',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean',
            'featured' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        /**
         * Ensure unique slug.
         */
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Service::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        /**
         * Convert FAQ array to JSON if present.
         */
        if (isset($validated['faq'])) {
            $validated['faq'] = json_encode($validated['faq']);
        }

        Service::create($validated);

        return redirect()->route('admin.services.index')
            ->with('success', 'Service created successfully.');
    }

    
    
    
    
    /**

    
    
    
     * Display the specified resource.

    
    
    
     *

    
    
    
     * @param Service $service The service.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function show(Service $service)
    {
        return Inertia::render('Admin/Services/Show', [
            'service' => $service
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
        /**
         * Parse FAQ JSON back to array for editing.
         */
        $service->faq = $service->faq ? json_decode($service->faq, true) : [];
        
        return Inertia::render('Admin/Services/Edit', [
            'service' => $service
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
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string|max:500',
            'body' => 'required|string',
            'icon' => 'nullable|string|max:100',
            'faq' => 'nullable|array',
            'faq.*.question' => 'required|string',
            'faq.*.answer' => 'required|string',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean',
            'featured' => 'boolean',
        ]);

        /**
         * Update slug only when the title changes.
         */
        if ($validated['title'] !== $service->title) {
            $validated['slug'] = Str::slug($validated['title']);

            /**
             * Ensure unique slug.
             */
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Service::where('slug', $validated['slug'])->where('id', '!=', $service->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        /**
         * Convert FAQ array to JSON if present.
         */
        if (isset($validated['faq'])) {
            $validated['faq'] = json_encode($validated['faq']);
        }

        $service->update($validated);

        return redirect()->route('admin.services.index')
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
        $service->delete();

        return redirect()->route('admin.services.index')
            ->with('success', 'Service deleted successfully.');
    }

    
    
    
    
    /**

    
    
    
     * Handle update order.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'services' => 'required|array',
            'services.*.id' => 'required|exists:services,id',
            'services.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['services'] as $serviceData) {
            Service::where('id', $serviceData['id'])
                ->update(['sort_order' => $serviceData['sort_order']]);
        }

        return response()->json(['message' => 'Sort order updated successfully.']);
    }

    
    
    
    
    /**

    
    
    
     * Handle toggle status.

    
    
    
     *

    
    
    
     * @param Service $service The service.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function toggleStatus(Service $service)
    {
        $service->update(['is_active' => !$service->is_active]);

        return response()->json([
            'message' => $service->is_active ? 'Service activated.' : 'Service deactivated.',
            'is_active' => $service->is_active
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle toggle featured.

    
    
    
     *

    
    
    
     * @param Service $service The service.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function toggleFeatured(Service $service)
    {
        $service->update(['featured' => !$service->featured]);

        return response()->json([
            'message' => $service->featured ? 'Service marked as featured.' : 'Service unmarked as featured.',
            'featured' => $service->featured
        ]);
    }
}
