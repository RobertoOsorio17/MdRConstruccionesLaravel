<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Presents the catalogue of public services by transforming domain models into visitor-friendly listings and detail payloads.
 * Handles resilient queries, featured segmentation, and view recording so offerings stay visible and informative.
 */
class ServiceController extends Controller
{
    /**
     * Display a listing of services.
     */
    public function index()
    {
        try {
            $services = Service::active()
                ->ordered()
                ->get()
                ->map(function ($service) {
                    return [
                        'id' => $service->id,
                        'title' => $service->title ?? 'Untitled',
                        'slug' => $service->slug,
                        'excerpt' => $service->excerpt ?? 'No description available',
                        'icon' => $service->icon ?? 'Construction',
                        'icon_name' => $service->icon ?? 'Construction',
                        'featured' => $service->featured ?? false,
                        'faq_count' => $service->faq_count ?? 0,
                        'views_count' => $service->views_count ?? 0,
                        'price_range' => $service->price_range ?? null,
                        'duration' => $service->duration ?? null,
                        'features' => $service->features ?? []
                    ];
                });
        } catch (\Exception $e) {
            \Log::error('Error fetching services: ' . $e->getMessage());
            $services = collect([]);
        }

        return Inertia::render('Services/Index', [
            'services' => $services,
            'featuredServices' => $services->where('featured', true)->values(),
        ]);
    }

    /**
     * Display the specified service.
     */
    public function show(Service $service)
    {
        // Check if service is active
        if (!$service->is_active) {
            abort(404);
        }

        // Get related services (other featured services)
        $relatedServices = Service::active()
            ->featured()
            ->where('id', '!=', $service->id)
            ->ordered()
            ->limit(3)
            ->get(['id', 'title', 'slug', 'excerpt', 'icon']);

        return Inertia::render('Services/Show', [
            'service' => [
                'id' => $service->id,
                'title' => $service->title,
                'slug' => $service->slug,
                'excerpt' => $service->excerpt,
                'body' => $service->body,
                'icon' => $service->icon,
                'featured_image' => $service->featured_image,
                'video_url' => $service->video_url,
                'faq' => $service->faq ?? [],
                'metrics' => $service->metrics ?? [],
                'benefits' => $service->benefits ?? [],
                'process_steps' => $service->process_steps ?? [],
                'guarantees' => $service->guarantees ?? [],
                'certifications' => $service->certifications ?? [],
                'gallery' => $service->gallery ?? [],
                'cta_primary_text' => $service->cta_primary_text ?? 'Solicitar Asesoría Gratuita',
                'cta_secondary_text' => $service->cta_secondary_text ?? 'Descargar Catálogo',
                'featured' => $service->featured,
                'average_rating' => $service->average_rating ?? 0,
                'reviews_count' => $service->reviews_count ?? 0,
            ],
            'relatedServices' => $relatedServices,
            'testimonials' => $service->approvedReviews()->limit(6)->get()->map(function($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'author_name' => $review->user->name ?? 'Cliente Anónimo',
                    'author_role' => $review->metadata['role'] ?? 'Cliente',
                    'author_avatar' => $review->user->avatar ?? null,
                    'created_at' => $review->created_at->format('Y-m-d'),
                ];
            }),
            'seo' => [
                'title' => $service->title . ' - MDR Construcciones',
                'description' => $service->excerpt,
            ],
            'auth' => [
                'user' => auth()->user() ? auth()->user()->only(['id', 'name', 'email']) : null
            ]
        ]);
    }

    /**
     * Display the specified service with ServicesV2 components.
     */
    public function showV2(Service $service)
    {
        // Check if service is active
        if (!$service->is_active) {
            abort(404);
        }

        // Get related services (other featured services)
        $relatedServices = Service::active()
            ->featured()
            ->where('id', '!=', $service->id)
            ->ordered()
            ->limit(3)
            ->get(['id', 'title', 'slug', 'excerpt', 'icon']);

        return Inertia::render('Services/Show.v2', [
            'service' => [
                'id' => $service->id,
                'title' => $service->title,
                'slug' => $service->slug,
                'excerpt' => $service->excerpt,
                'body' => $service->body,
                'icon' => $service->icon,
                'featured_image' => $service->featured_image,
                'video_url' => $service->video_url,
                'faq' => $service->faq ?? [],
                'metrics' => $service->metrics ?? [],
                'benefits' => $service->benefits ?? [],
                'process_steps' => $service->process_steps ?? [],
                'guarantees' => $service->guarantees ?? [],
                'certifications' => $service->certifications ?? [],
                'gallery' => $service->gallery ?? [],
                'cta_primary_text' => $service->cta_primary_text ?? 'Solicitar Asesoría Gratuita',
                'cta_secondary_text' => $service->cta_secondary_text ?? 'Descargar Catálogo',
                'featured' => $service->featured,
                'average_rating' => $service->average_rating ?? 0,
                'reviews_count' => $service->reviews_count ?? 0,
            ],
            'relatedServices' => $relatedServices,
            'testimonials' => $service->approvedReviews()->limit(6)->get()->map(function($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'author_name' => $review->user->name ?? 'Cliente Anónimo',
                    'author_role' => $review->metadata['role'] ?? 'Cliente',
                    'author_avatar' => $review->user->avatar ?? null,
                    'created_at' => $review->created_at->format('Y-m-d'),
                ];
            }),
            'seo' => [
                'title' => $service->title . ' - MDR Construcciones',
                'description' => $service->excerpt,
            ],
            'auth' => [
                'user' => auth()->user() ? auth()->user()->only(['id', 'name', 'email']) : null
            ]
        ]);
    }
}

