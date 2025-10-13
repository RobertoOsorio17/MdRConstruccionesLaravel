<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * Curates customer testimonials in the admin area, facilitating moderation, media handling, and publication workflows.
 * Helps marketing teams surface authentic social proof while maintaining brand consistency and approval trails.
 */
class TestimonialController extends Controller
{
    /**
     * Display testimonials management
     */
    public function index(Request $request)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('reviews.view')) {
            abort(403, 'Unauthorized action.');
        }

        // ✅ Validate filters
        $validated = $request->validate([
            'status' => 'nullable|in:pending,approved,rejected',
            'search' => 'nullable|string|max:255',
            'sort' => 'nullable|in:recent,rating,name',
        ]);

        $query = Testimonial::with(['user', 'approvedBy']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $validated['status']);
        }

        if ($request->filled('search')) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('client_name', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('project_type', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sort = $validated['sort'] ?? 'recent';
        switch ($sort) {
            case 'rating':
                $query->orderByDesc('rating');
                break;
            case 'name':
                $query->orderBy('client_name');
                break;
            case 'recent':
            default:
                $query->orderByDesc('created_at');
                break;
        }

        $testimonials = $query->paginate(20);

        // Get stats
        $stats = [
            'total' => Testimonial::count(),
            'pending' => Testimonial::pending()->count(),
            'approved' => Testimonial::approved()->count(),
            'rejected' => Testimonial::where('status', 'rejected')->count(),
            'featured' => Testimonial::featured()->count(),
        ];

        return Inertia::render('Admin/Testimonials/Index', [
            'testimonials' => $testimonials,
            'stats' => $stats,
            'filters' => $validated,
        ]);
    }

    /**
     * Show create form
     */
    public function create()
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('reviews.create')) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('Admin/Testimonials/Create');
    }

    /**
     * Store new testimonial
     */
    public function store(Request $request)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('reviews.create')) {
            abort(403, 'Unauthorized action.');
        }

        // ✅ Validate
        $validated = $request->validate([
            'client_name' => 'required|string|max:255|regex:/^[a-zA-Z\s\-\.áéíóúñÁÉÍÓÚÑ]+$/',
            'client_position' => 'nullable|string|max:255|regex:/^[^<>]*$/',
            'client_company' => 'nullable|string|max:255|regex:/^[^<>]*$/',
            'client_photo' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048',
            'content' => 'required|string|min:50|max:1000|regex:/^[^<>]*$/',
            'rating' => 'required|integer|min:1|max:5',
            'project_type' => 'nullable|string|max:100|regex:/^[^<>]*$/',
            'location' => 'nullable|string|max:255|regex:/^[^<>]*$/',
            'project_budget' => 'nullable|numeric|min:0|max:999999.99',
            'project_duration' => 'nullable|integer|min:1|max:104',
            'images.*' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
            'featured' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'status' => 'required|in:pending,approved,rejected',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        // Handle uploads
        if ($request->hasFile('client_photo')) {
            $validated['client_photo'] = $request->file('client_photo')
                ->store('testimonials/photos', 'public');
        }

        if ($request->hasFile('images')) {
            $images = [];
            foreach ($request->file('images') as $image) {
                $images[] = $image->store('testimonials/projects', 'public');
            }
            $validated['images'] = $images;
        }

        // Auto-approve if admin creates it
        if ($validated['status'] === 'approved') {
            $validated['approved_at'] = now();
            $validated['approved_by'] = auth()->id();
        }

        $testimonial = Testimonial::create($validated);

        // ✅ Log action
        \Log::info('Testimonial created by admin', [
            'testimonial_id' => $testimonial->id,
            'admin_id' => auth()->id(),
        ]);

        session()->flash('success', 'Testimonial created successfully.');
        return redirect()->route('admin.testimonials.index');
    }

    /**
     * Show edit form
     */
    public function edit(Testimonial $testimonial)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('reviews.edit')) {
            abort(403, 'Unauthorized action.');
        }

        $testimonial->load(['user', 'approvedBy']);

        return Inertia::render('Admin/Testimonials/Edit', [
            'testimonial' => $testimonial,
        ]);
    }

    /**
     * Update testimonial
     */
    public function update(Request $request, Testimonial $testimonial)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('reviews.edit')) {
            abort(403, 'Unauthorized action.');
        }

        // ✅ Validate
        $validated = $request->validate([
            'client_name' => 'required|string|max:255|regex:/^[a-zA-Z\s\-\.áéíóúñÁÉÍÓÚÑ]+$/',
            'client_position' => 'nullable|string|max:255|regex:/^[^<>]*$/',
            'client_company' => 'nullable|string|max:255|regex:/^[^<>]*$/',
            'client_photo' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048',
            'content' => 'required|string|min:50|max:1000|regex:/^[^<>]*$/',
            'rating' => 'required|integer|min:1|max:5',
            'project_type' => 'nullable|string|max:100|regex:/^[^<>]*$/',
            'location' => 'nullable|string|max:255|regex:/^[^<>]*$/',
            'project_budget' => 'nullable|numeric|min:0|max:999999.99',
            'project_duration' => 'nullable|integer|min:1|max:104',
            'images.*' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
            'featured' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'status' => 'required|in:pending,approved,rejected',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        // Handle photo upload
        if ($request->hasFile('client_photo')) {
            // Delete old photo
            if ($testimonial->client_photo) {
                Storage::disk('public')->delete($testimonial->client_photo);
            }
            $validated['client_photo'] = $request->file('client_photo')
                ->store('testimonials/photos', 'public');
        }

        // Handle project images
        if ($request->hasFile('images')) {
            // Delete old images
            if ($testimonial->images) {
                foreach ($testimonial->images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }
            $images = [];
            foreach ($request->file('images') as $image) {
                $images[] = $image->store('testimonials/projects', 'public');
            }
            $validated['images'] = $images;
        }

        // Update approval info if status changed to approved
        if ($validated['status'] === 'approved' && $testimonial->status !== 'approved') {
            $validated['approved_at'] = now();
            $validated['approved_by'] = auth()->id();
        }

        $testimonial->update($validated);

        // ✅ Log action
        \Log::info('Testimonial updated', [
            'testimonial_id' => $testimonial->id,
            'admin_id' => auth()->id(),
        ]);

        return redirect()->route('admin.testimonials.index')
            ->with('success', 'Testimonial updated successfully.');
    }

    /**
     * Delete testimonial
     */
    public function destroy(Testimonial $testimonial)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('reviews.delete')) {
            abort(403, 'Unauthorized action.');
        }

        // Delete associated files
        if ($testimonial->client_photo) {
            Storage::disk('public')->delete($testimonial->client_photo);
        }

        if ($testimonial->images) {
            foreach ($testimonial->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $testimonial->delete();

        // ✅ Log action
        \Log::info('Testimonial deleted', [
            'testimonial_id' => $testimonial->id,
            'admin_id' => auth()->id(),
        ]);

        return redirect()->route('admin.testimonials.index')
            ->with('success', 'Testimonial deleted successfully.');
    }

    /**
     * Approve testimonial
     */
    public function approve(Testimonial $testimonial)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('reviews.moderate')) {
            abort(403, 'Unauthorized action.');
        }

        $testimonial->approve(auth()->user());

        // ✅ Log action
        \Log::info('Testimonial approved', [
            'testimonial_id' => $testimonial->id,
            'admin_id' => auth()->id(),
        ]);

        return back()->with('success', 'Testimonial approved successfully.');
    }

    /**
     * Reject testimonial
     */
    public function reject(Testimonial $testimonial)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('reviews.moderate')) {
            abort(403, 'Unauthorized action.');
        }

        $testimonial->reject();

        // ✅ Log action
        \Log::info('Testimonial rejected', [
            'testimonial_id' => $testimonial->id,
            'admin_id' => auth()->id(),
        ]);

        return back()->with('success', 'Testimonial rejected.');
    }
}

