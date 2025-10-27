<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Post;
use App\Models\Category;

/**
 * Delivers polished fallback views when visitors encounter application errors or missing content.
 *
 * Features:
 * - 404 page with popular/recent posts and category navigation.
 * - 500 page with contextual logging and an error identifier.
 * - 403/503 pages with tailored content for forbidden/maintenance scenarios.
 * - Analytics logging for 404s (and silent failover when tables are missing).
 */
class ErrorController extends Controller
{
    /**
     * Show the 404 error page.
     *
     * @param Request $request The current HTTP request instance.
     * @return \Symfony\Component\HttpFoundation\Response The rendered 404 response.
     */
    public function notFound(Request $request)
    {
        // Get popular posts for suggestions with error handling
        try {
            $popularPosts = Post::where('status', 'published')
                ->withCount('interactions')
                ->orderBy('interactions_count', 'desc')
                ->limit(4)
                ->get(['id', 'title', 'slug', 'excerpt', 'cover_image'])
                ->map(function ($post) {
                    return [
                        'id' => $post->id,
                        'title' => $post->title,
                        'slug' => $post->slug,
                        'excerpt' => $post->excerpt ?? 'No description available',
                        'featured_image' => $post->cover_image,
                        'url' => route('blog.show', $post->slug)
                    ];
                });
        } catch (\Exception $e) {
            // Fallback if posts table has issues
            $popularPosts = collect([]);
            \Log::warning('Error fetching popular posts for 404 page: ' . $e->getMessage());
        }

        // Get recent posts with error handling
        try {
            $recentPosts = Post::where('status', 'published')
                ->latest()
                ->limit(4)
                ->get(['id', 'title', 'slug', 'excerpt', 'cover_image'])
                ->map(function ($post) {
                    return [
                        'id' => $post->id,
                        'title' => $post->title,
                        'slug' => $post->slug,
                        'excerpt' => $post->excerpt ?? 'No description available',
                        'featured_image' => $post->cover_image,
                        'url' => route('blog.show', $post->slug)
                    ];
                });
        } catch (\Exception $e) {
            // Fix: Use Log::error() for critical database errors instead of warnings.
            // Fallback if posts table has issues.
            $recentPosts = collect([]);
            \Log::error('Critical error fetching recent posts for 404 page', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'url' => $request->fullUrl(),
                'user_id' => auth()->id(),
            ]);

            // Fix: Notify admins of critical database errors.
            if (app()->environment('production')) {
                try {
                    \Illuminate\Support\Facades\Notification::route('mail', config('mail.admin_email'))
                        ->notify(new \App\Notifications\CriticalErrorNotification($e, 'Error fetching posts for 404 page'));
                } catch (\Exception $notifyError) {
                    \Log::error('Failed to send critical error notification', ['error' => $notifyError->getMessage()]);
                }
            }
        }

        // Get categories for navigation with error handling
        try {
            $categories = Category::withCount('posts')
                ->orderBy('posts_count', 'desc')
                ->limit(6)
                ->get(['id', 'name', 'slug', 'description'])
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'description' => $category->description ?? '',
                        'posts_count' => $category->posts_count ?? 0,
                        'url' => route('blog.index') . '?category=' . $category->slug
                    ];
                });
        } catch (\Exception $e) {
            // Fix: Use Log::error() for critical database errors.
            // Fallback if categories table has issues.
            $categories = collect([]);
            \Log::error('Critical error fetching categories for 404 page', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'url' => $request->fullUrl(),
            ]);
        }

        // Log 404 error for analytics
        $this->log404Error($request);

        return Inertia::render('Errors/NotFound', [
            'popularPosts' => $popularPosts,
            'recentPosts' => $recentPosts,
            'categories' => $categories,
            'requestedUrl' => $request->fullUrl(),
            'referrer' => $request->header('referer'),
        ])->toResponse($request)->setStatusCode(404);
    }

    /**
     * Show the 500 error page.
     *
     * @param Request $request The current HTTP request instance.
     * @param \Throwable|null $exception Optional exception that triggered the page.
     * @return \Symfony\Component\HttpFoundation\Response The rendered 500 response.
     */
    public function serverError(Request $request, $exception = null)
    {
        // Log the error
        if ($exception) {
            \Log::error('500 Error: ' . $exception->getMessage(), [
                'url' => $request->fullUrl(),
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip(),
                'user_id' => auth()->id(),
                'trace' => $exception->getTraceAsString()
            ]);
        }

        return Inertia::render('Errors/ServerError', [
            'requestedUrl' => $request->fullUrl(),
            'errorId' => uniqid('err_'),
        ])->toResponse($request)->setStatusCode(500);
    }

    /**
     * Show the 403 error page.
     *
     * @param Request $request The current HTTP request instance.
     * @return \Symfony\Component\HttpFoundation\Response The rendered 403 response.
     */
    public function forbidden(Request $request)
    {
        return Inertia::render('Errors/Forbidden', [
            'requestedUrl' => $request->fullUrl(),
            'user' => auth()->user(),
        ])->toResponse($request)->setStatusCode(403);
    }

    /**
     * Show the 503 error page (maintenance mode).
     *
     * @param Request $request The current HTTP request instance.
     * @return \Symfony\Component\HttpFoundation\Response The rendered 503 response.
     */
    public function maintenance(Request $request)
    {
        return Inertia::render('Errors/Maintenance', [
            'estimatedTime' => config('app.maintenance_estimated_time', '30 minutes'),
        ])->toResponse($request)->setStatusCode(503);
    }

    /**
     * Log 404 errors for analytics.
     *
     * @param Request $request The current HTTP request instance.
     * @return void
     */
    private function log404Error(Request $request)
    {
        try {
            \DB::table('error_logs')->insert([
                'type' => '404',
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'user_agent' => $request->userAgent(),
                'ip_address' => $request->ip(),
                'referrer' => $request->header('referer'),
                'user_id' => auth()->id(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Silently fail if error_logs table doesn't exist
            \Log::info('404 Error: ' . $request->fullUrl(), [
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip(),
                'referrer' => $request->header('referer'),
            ]);
        }
    }
}

