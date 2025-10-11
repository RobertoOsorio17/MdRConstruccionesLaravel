<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Service;
use App\Models\Project;
use App\Models\Category;
use App\Models\SearchHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Provides a unified search experience across posts, services, and projects with caching and personalization support.
 * Couples query analytics, result aggregation, and suggestion utilities to guide users toward relevant content quickly.
 */
class SearchController extends Controller
{
    /**
     * Display global search results.
     */
    public function index(Request $request)
    {
        // ✅ Validate input
        $validated = $request->validate([
            'q' => 'nullable|string|max:255|regex:/^[a-zA-Z0-9\s\-\_\.\,\á\é\í\ó\ú\ñ]*$/',
            'type' => 'nullable|in:all,posts,services,projects',
            'category' => 'nullable|exists:categories,id',
            'sort' => 'nullable|in:relevance,date,views',
            'page' => 'nullable|integer|min:1',
        ]);

        $query = $validated['q'] ?? '';
        $type = $validated['type'] ?? 'all';
        $categoryId = $validated['category'] ?? null;
        $sort = $validated['sort'] ?? 'relevance';

        // Return empty results if query is too short
        if (strlen($query) < 2) {
            return Inertia::render('Search/Index', [
                'results' => [
                    'posts' => [],
                    'services' => [],
                    'projects' => [],
                ],
                'query' => $query,
                'type' => $type,
                'total' => 0,
                'suggestions' => $this->getSuggestions($query),
                'categories' => Category::where('is_active', true)->get(),
            ]);
        }

        // ✅ Save search history for authenticated users
        if (Auth::check()) {
            $this->saveSearchHistory($query);
        }

        // ✅ Cache search results for 5 minutes
        $cacheKey = "search:{$query}:{$type}:{$categoryId}:{$sort}";
        $results = Cache::remember($cacheKey, 300, function () use ($query, $type, $categoryId, $sort) {
            return $this->performSearch($query, $type, $categoryId, $sort);
        });

        return Inertia::render('Search/Index', [
            'results' => $results,
            'query' => $query,
            'type' => $type,
            'category' => $categoryId,
            'sort' => $sort,
            'total' => $results['total'],
            'suggestions' => $this->getSuggestions($query),
            'categories' => Category::where('is_active', true)->get(),
            'recentSearches' => $this->getRecentSearches(),
        ]);
    }

    /**
     * Perform the actual search across models.
     */
    protected function performSearch(string $query, string $type, ?int $categoryId, string $sort): array
    {
        $results = [
            'posts' => [],
            'services' => [],
            'projects' => [],
            'total' => 0,
        ];

        // Search in Posts
        if ($type === 'all' || $type === 'posts') {
            $results['posts'] = $this->searchPosts($query, $categoryId, $sort);
        }

        // Search in Services
        if ($type === 'all' || $type === 'services') {
            $results['services'] = $this->searchServices($query, $categoryId, $sort);
        }

        // Search in Projects
        if ($type === 'all' || $type === 'projects') {
            $results['projects'] = $this->searchProjects($query, $sort);
        }

        $results['total'] = count($results['posts']) + count($results['services']) + count($results['projects']);

        return $results;
    }

    /**
     * Search in posts.
     */
    protected function searchPosts(string $query, ?int $categoryId, string $sort)
    {
        $postsQuery = Post::where('status', 'published')
            ->where(function ($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                  ->orWhere('excerpt', 'LIKE', "%{$query}%")
                  ->orWhere('content', 'LIKE', "%{$query}%")
                  ->orWhere('seo_title', 'LIKE', "%{$query}%")
                  ->orWhere('seo_description', 'LIKE', "%{$query}%");
            })
            ->with(['author:id,name', 'categories:id,name,slug']);

        // Filter by category
        if ($categoryId) {
            $postsQuery->where('category_id', $categoryId);
        }

        // Apply sorting
        switch ($sort) {
            case 'date':
                $postsQuery->orderBy('published_at', 'desc');
                break;
            case 'views':
                $postsQuery->orderBy('views_count', 'desc');
                break;
            default: // relevance
                // Simple relevance: prioritize title matches
                $postsQuery->orderByRaw("CASE 
                    WHEN title LIKE ? THEN 1 
                    WHEN excerpt LIKE ? THEN 2 
                    ELSE 3 
                END", ["%{$query}%", "%{$query}%"]);
                break;
        }

        return $postsQuery->limit(20)->get()->map(function ($post) use ($query) {
            return [
                'id' => $post->id,
                'type' => 'post',
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'cover_image' => $post->cover_image,
                'category' => $post->category,
                'author' => $post->user->name ?? 'Unknown',
                'published_at' => $post->published_at?->format('d/m/Y'),
                'views_count' => $post->views_count,
                'highlight' => $this->highlightText($post->excerpt ?? $post->title, $query),
            ];
        });
    }

    /**
     * Search in services.
     */
    protected function searchServices(string $query, ?int $categoryId, string $sort)
    {
        $servicesQuery = Service::where(function ($q) use ($query) {
            $q->where('title', 'LIKE', "%{$query}%")
              ->orWhere('excerpt', 'LIKE', "%{$query}%")
              ->orWhere('description', 'LIKE', "%{$query}%");
        })->with('category:id,name,slug');

        // Filter by category
        if ($categoryId) {
            $servicesQuery->where('category_id', $categoryId);
        }

        // Apply sorting
        switch ($sort) {
            case 'date':
                $servicesQuery->orderBy('created_at', 'desc');
                break;
            default:
                $servicesQuery->orderByRaw("CASE 
                    WHEN title LIKE ? THEN 1 
                    ELSE 2 
                END", ["%{$query}%"]);
                break;
        }

        return $servicesQuery->limit(20)->get()->map(function ($service) use ($query) {
            return [
                'id' => $service->id,
                'type' => 'service',
                'title' => $service->title,
                'slug' => $service->slug,
                'excerpt' => $service->excerpt,
                'image' => $service->image,
                'category' => $service->category,
                'price' => $service->price,
                'highlight' => $this->highlightText($service->excerpt ?? $service->title, $query),
            ];
        });
    }

    /**
     * Search in projects.
     */
    protected function searchProjects(string $query, string $sort)
    {
        $projectsQuery = Project::where(function ($q) use ($query) {
            $q->where('title', 'LIKE', "%{$query}%")
              ->orWhere('summary', 'LIKE', "%{$query}%")
              ->orWhere('body', 'LIKE', "%{$query}%")
              ->orWhere('location', 'LIKE', "%{$query}%");
        });

        // Apply sorting
        switch ($sort) {
            case 'date':
                $projectsQuery->orderBy('completion_date', 'desc');
                break;
            default:
                $projectsQuery->orderByRaw("CASE 
                    WHEN title LIKE ? THEN 1 
                    ELSE 2 
                END", ["%{$query}%"]);
                break;
        }

        return $projectsQuery->limit(20)->get()->map(function ($project) use ($query) {
            return [
                'id' => $project->id,
                'type' => 'project',
                'title' => $project->title,
                'slug' => $project->slug,
                'description' => $project->summary,
                'image' => $project->cover_image ?? null,
                'location' => $project->location,
                'completion_date' => $project->end_date?->format('d/m/Y'),
                'highlight' => $this->highlightText($project->summary ?? $project->title, $query),
            ];
        });
    }

    /**
     * Get search suggestions based on query.
     */
    protected function getSuggestions(string $query): array
    {
        if (strlen($query) < 2) {
            return [];
        }

        return Cache::remember("suggestions:{$query}", 3600, function () use ($query) {
            $suggestions = [];

            // Get title suggestions from posts
            $postTitles = Post::where('status', 'published')
                ->where('title', 'LIKE', "%{$query}%")
                ->limit(5)
                ->pluck('title')
                ->toArray();

            // Get title suggestions from services
            $serviceTitles = Service::where('title', 'LIKE', "%{$query}%")
                ->limit(5)
                ->pluck('title')
                ->toArray();

            $suggestions = array_merge($postTitles, $serviceTitles);
            
            return array_unique(array_slice($suggestions, 0, 10));
        });
    }

    /**
     * Save search history for authenticated users.
     */
    protected function saveSearchHistory(string $query): void
    {
        try {
            SearchHistory::create([
                'user_id' => Auth::id(),
                'query' => $query,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to save search history', [
                'user_id' => Auth::id(),
                'query' => $query,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get recent searches for authenticated user.
     */
    protected function getRecentSearches(): array
    {
        if (!Auth::check()) {
            return [];
        }

        return SearchHistory::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->pluck('query')
            ->unique()
            ->values()
            ->toArray();
    }

    /**
     * Highlight search query in text.
     */
    protected function highlightText(string $text, string $query): string
    {
        if (empty($query)) {
            return substr($text, 0, 200);
        }

        // Find position of query in text
        $pos = stripos($text, $query);
        
        if ($pos === false) {
            return substr($text, 0, 200);
        }

        // Extract context around the match
        $start = max(0, $pos - 50);
        $length = min(200, strlen($text) - $start);
        $excerpt = substr($text, $start, $length);

        // Add ellipsis if needed
        if ($start > 0) {
            $excerpt = '...' . $excerpt;
        }
        if ($start + $length < strlen($text)) {
            $excerpt .= '...';
        }

        return $excerpt;
    }
}

