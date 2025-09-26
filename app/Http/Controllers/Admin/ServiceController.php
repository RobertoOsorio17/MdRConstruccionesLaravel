<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    /**
     * Display a listing of services.
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
     * Show the form for creating a new service.
     */
    public function create()
    {
        return Inertia::render('Admin/Services/Create');
    }

    /**
     * Store a newly created service.
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
        
        // Ensure unique slug
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Service::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        // Convert FAQ array to JSON if present
        if (isset($validated['faq'])) {
            $validated['faq'] = json_encode($validated['faq']);
        }

        Service::create($validated);

        return redirect()->route('admin.services.index')
            ->with('success', 'Servicio creado exitosamente.');
    }

    /**
     * Display the specified service.
     */
    public function show(Service $service)
    {
        return Inertia::render('Admin/Services/Show', [
            'service' => $service
        ]);
    }

    /**
     * Show the form for editing the specified service.
     */
    public function edit(Service $service)
    {
        // Parse FAQ JSON back to array for editing
        $service->faq = $service->faq ? json_decode($service->faq, true) : [];
        
        return Inertia::render('Admin/Services/Edit', [
            'service' => $service
        ]);
    }

    /**
     * Update the specified service.
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

        // Update slug only if title changed
        if ($validated['title'] !== $service->title) {
            $validated['slug'] = Str::slug($validated['title']);
            
            // Ensure unique slug
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Service::where('slug', $validated['slug'])->where('id', '!=', $service->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        // Convert FAQ array to JSON if present
        if (isset($validated['faq'])) {
            $validated['faq'] = json_encode($validated['faq']);
        }

        $service->update($validated);

        return redirect()->route('admin.services.index')
            ->with('success', 'Servicio actualizado exitosamente.');
    }

    /**
     * Remove the specified service.
     */
    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()->route('admin.services.index')
            ->with('success', 'Servicio eliminado exitosamente.');
    }

    /**
     * Update the sort order of services.
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

        return response()->json(['message' => 'Orden actualizado exitosamente.']);
    }

    /**
     * Toggle service status (active/inactive).
     */
    public function toggleStatus(Service $service)
    {
        $service->update(['is_active' => !$service->is_active]);

        return response()->json([
            'message' => $service->is_active ? 'Servicio activado.' : 'Servicio desactivado.',
            'is_active' => $service->is_active
        ]);
    }

    /**
     * Toggle featured status.
     */
    public function toggleFeatured(Service $service)
    {
        $service->update(['featured' => !$service->featured]);

        return response()->json([
            'message' => $service->featured ? 'Servicio marcado como destacado.' : 'Servicio desmarcado como destacado.',
            'featured' => $service->featured
        ]);
    }
}