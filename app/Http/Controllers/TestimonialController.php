<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * Showcases client testimonials on the public site, layering filters and storytelling content for social proof.
 * Ensures only approved, high-quality feedback is surfaced with the necessary media and attribution metadata.
 */
class TestimonialController extends Controller
{
    /**
     * Display the testimonials page.
     *
     * @param Request $request The current HTTP request instance.
     * @return \Inertia\Response Inertia response with testimonials and filters.
     */
    public function index(Request $request)
    {
        // Validate filters.
        $validated = $request->validate([
            'project_type' => 'nullable|string|max:100',
            'rating' => 'nullable|integer|min:1|max:5',
            'sort' => 'nullable|in:recent,rating,featured',
        ]);

        $query = Testimonial::with(['user'])
            ->active()
            ->approved();

        // Apply filters
        if ($request->filled('project_type')) {
            $query->where('project_type', $validated['project_type']);
        }

        if ($request->filled('rating')) {
            $query->where('rating', '>=', $validated['rating']);
        }

        // Apply sorting
        $sort = $validated['sort'] ?? 'featured';
        switch ($sort) {
            case 'featured':
                $query->featured()->ordered();
                break;
            case 'rating':
                $query->orderByDesc('rating')->orderByDesc('created_at');
                break;
            case 'recent':
            default:
                $query->orderByDesc('created_at');
                break;
        }

        $testimonials = $query->paginate(12);

        // Get project types for filter
        $projectTypes = Testimonial::active()
            ->approved()
            ->distinct()
            ->pluck('project_type')
            ->filter()
            ->values();

        return Inertia::render('Testimonials/Index', [
            'testimonials' => $testimonials,
            'projectTypes' => $projectTypes,
            'filters' => $validated,
        ]);
    }

    /**
     * Show the testimonial submission form.
     *
     * @return \Inertia\Response Inertia response for the create view.
     */
    public function create()
    {
        return Inertia::render('Testimonials/Create');
    }

    /**
     * Store a new testimonial.
     *
     * @param Request $request The current HTTP request instance.
     * @return \Illuminate\Http\RedirectResponse Redirect to index with status.
     */
    public function store(Request $request)
    {
        // Validate input with strict rules.
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
        ]);

        // Handle photo upload
        if ($request->hasFile('client_photo')) {
            $validated['client_photo'] = $request->file('client_photo')
                ->store('testimonials/photos', 'public');
        }

        // Handle project images
        if ($request->hasFile('images')) {
            $images = [];
            foreach ($request->file('images') as $image) {
                $images[] = $image->store('testimonials/projects', 'public');
            }
            $validated['images'] = $images;
        }

        // Set user_id if authenticated
        if (auth()->check()) {
            $validated['user_id'] = auth()->id();
        }

        // Create testimonial (pending approval)
        $testimonial = Testimonial::create($validated);

        // Log creation.
        \Log::info('Testimonial submitted', [
            'testimonial_id' => $testimonial->id,
            'client_name' => $testimonial->client_name,
            'user_id' => auth()->id(),
            'ip' => $request->ip(),
        ]);

        return redirect()->route('testimonials.index')
            ->with('success', 'Thank you! Your testimonial has been submitted and is pending approval.');
    }

    /**
     * Display a single testimonial.
     *
     * @param Testimonial $testimonial The testimonial model.
     * @return \Inertia\Response Inertia response with testimonial details.
     */
    public function show(Testimonial $testimonial)
    {
        // Only show approved and active testimonials
        if ($testimonial->status !== 'approved' || !$testimonial->is_active) {
            abort(404);
        }

        $testimonial->load(['user', 'approvedBy']);

        // Get related testimonials
        $related = Testimonial::active()
            ->approved()
            ->where('id', '!=', $testimonial->id)
            ->where(function ($query) use ($testimonial) {
                $query->where('project_type', $testimonial->project_type)
                    ->orWhere('rating', $testimonial->rating);
            })
            ->limit(3)
            ->get();

        return Inertia::render('Testimonials/Show', [
            'testimonial' => $testimonial,
            'related' => $related,
        ]);
    }
}

