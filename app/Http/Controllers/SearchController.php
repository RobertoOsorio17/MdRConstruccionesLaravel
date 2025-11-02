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
use Inertia\Inertia;
use Illuminate\Support\Str;

/**
 * Provides a unified search experience across posts, services, and projects with caching and personalization support.
 * Couples query analytics, result aggregation, and suggestion utilities to guide users toward relevant content quickly.
 */
class SearchController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Display a listing of the resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function index(Request $request)
    {
        // 1) Validate input.
        $validated = $request->validate([
            'q' => 'nullable|string|max:255|regex:/^[a-zA-Z0-9\s\-\_\.\,\á\é\í\ó\ú\ñ]*$/',
            'type' => 'nullable|in:all,posts,services,projects',
            'category' => 'nullable|exists:categories,id',
            'sort' => 'nullable|in:relevance,date,views',
            'page' => 'nullable|integer|min:1',
        ]);

        $rawQuery = $validated['q'] ?? '';
        $query = $this->sanitizeSearchTerm($rawQuery);
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
                'query' => $rawQuery,
                'type' => $type,
                'total' => 0,
                'suggestions' => $this->getSuggestions($query),
                'categories' => Category::where('is_active', true)->get(),
            ]);
        }

        // 2) Save search history for authenticated users.
        if (Auth::check()) {
            $this->saveSearchHistory($query);
        }

        // 3) Cache search results for 5 minutes to reduce DB pressure.
        $cacheKey = $this->buildCacheKey($query, $type, $categoryId, $sort);
        $results = Cache::remember($cacheKey, 300, function () use ($query, $type, $categoryId, $sort) {
            return $this->performSearch($query, $type, $categoryId, $sort);
        });

        return Inertia::render('Search/Index', [
            'results' => $results,
            'query' => $rawQuery,
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

    
    
    
     * Handle perform search.

    
    
    
     *

    
    
    
     * @param string $query The query.

    
    
    
     * @param string $type The type.

    
    
    
     * @param ?int $categoryId The categoryId.

    
    
    
     * @param string $sort The sort.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    protected function performSearch(string $query, string $type, ?int $categoryId, string $sort): array
    {
        $results = [
            'posts' => [],
            'services' => [],
            'projects' => [],
            'total' => 0,
        ];

        // Search in Posts.
        if ($type === 'all' || $type === 'posts') {
            $results['posts'] = $this->searchPosts($query, $categoryId, $sort);
        }

        // Search in Services.
        if ($type === 'all' || $type === 'services') {
            $results['services'] = $this->searchServices($query, $categoryId, $sort);
        }

        // Search in Projects.
        if ($type === 'all' || $type === 'projects') {
            $results['projects'] = $this->searchProjects($query, $sort);
        }

        $results['total'] = count($results['posts']) + count($results['services']) + count($results['projects']);

        return $results;
    }

    
    
    
    
    /**

    
    
    
     * Handle search posts.

    
    
    
     *

    
    
    
     * @param string $query The query.

    
    
    
     * @param ?int $categoryId The categoryId.

    
    
    
     * @param string $sort The sort.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    protected function searchPosts(string $query, ?int $categoryId, string $sort)
    {
        $likePattern = $this->buildLikePattern($query);

        $postsQuery = Post::where('status', 'published')
            ->where(function ($q) use ($likePattern) {
                $q->where('title', 'LIKE', $likePattern)
                  ->orWhere('excerpt', 'LIKE', $likePattern)
                  ->orWhere('content', 'LIKE', $likePattern)
                  ->orWhere('seo_title', 'LIKE', $likePattern)
                  ->orWhere('seo_description', 'LIKE', $likePattern);
            })
            ->with(['user:id,name', 'categories:id,name,slug']);

        // Filter by category
        if ($categoryId) {
            $postsQuery->whereHas('categories', function ($q) use ($categoryId) {
                $q->where('categories.id', $categoryId);
            });
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
                $postsQuery->orderByRaw('CASE WHEN title LIKE ? THEN 1 WHEN excerpt LIKE ? THEN 2 ELSE 3 END', [$likePattern, $likePattern]);
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
                'categories' => $post->categories,
                'author' => $post->user->name ?? 'Unknown',
                'published_at' => $post->published_at?->format('d/m/Y'),
                'views_count' => $post->views_count,
                'highlight' => $this->highlightText($post->excerpt ?? $post->title, $query),
            ];
        });
    }

    
    
    
    
    /**

    
    
    
     * Handle search services.

    
    
    
     *

    
    
    
     * @param string $query The query.

    
    
    
     * @param ?int $categoryId The categoryId.

    
    
    
     * @param string $sort The sort.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    protected function searchServices(string $query, ?int $categoryId, string $sort)
    {
        $likePattern = $this->buildLikePattern($query);

        $servicesQuery = Service::where(function ($q) use ($likePattern) {
            $q->where('title', 'LIKE', $likePattern)
              ->orWhere('excerpt', 'LIKE', $likePattern)
              ->orWhere('description', 'LIKE', $likePattern);
        })->with('category:id,name,slug');

        if ($categoryId) {
            $servicesQuery->where('category_id', $categoryId);
        }

        switch ($sort) {
            case 'date':
                $servicesQuery->orderBy('created_at', 'desc');
                break;
            default:
                $servicesQuery->orderByRaw('CASE WHEN title LIKE ? THEN 1 ELSE 2 END', [$likePattern]);
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

    
    
    
     * Handle search projects.

    
    
    
     *

    
    
    
     * @param string $query The query.

    
    
    
     * @param string $sort The sort.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    protected function searchProjects(string $query, string $sort)
    {
        $likePattern = $this->buildLikePattern($query);

        $projectsQuery = Project::where(function ($q) use ($likePattern) {
            $q->where('title', 'LIKE', $likePattern)
              ->orWhere('summary', 'LIKE', $likePattern)
              ->orWhere('body', 'LIKE', $likePattern)
              ->orWhere('location', 'LIKE', $likePattern);
        });

        switch ($sort) {
            case 'date':
                $projectsQuery->orderBy('completion_date', 'desc');
                break;
            default:
                $projectsQuery->orderByRaw('CASE WHEN title LIKE ? THEN 1 ELSE 2 END', [$likePattern]);
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

    
    
    
     * Get suggestions.

    
    
    
     *

    
    
    
     * @param string $query The query.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    protected function getSuggestions(string $query): array
    {
        if (strlen($query) < 2) {
            return [];
        }

        $cacheKey = sprintf('suggestions:%s', hash('sha256', $query));
        $likePattern = $this->buildLikePattern($query);

        return Cache::remember($cacheKey, 3600, function () use ($likePattern) {
            $suggestions = [];

            $postTitles = Post::where('status', 'published')
                ->where('title', 'LIKE', $likePattern)
                ->limit(5)
                ->pluck('title')
                ->toArray();

            $serviceTitles = Service::where('title', 'LIKE', $likePattern)
                ->limit(5)
                ->pluck('title')
                ->toArray();

            $suggestions = array_merge($postTitles, $serviceTitles);

            return array_unique(array_slice($suggestions, 0, 10));
        });
    }

    
    
    
    
    /**

    
    
    
     * Handle save search history.

    
    
    
     *

    
    
    
     * @param string $query The query.

    
    
    
     * @return void

    
    
    
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

    
    
    
     * Get recent searches.

    
    
    
     *

    
    
    
     * @return array

    
    
    
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


    

    

    

     * Build cache key.


    

    

    

     *


    

    

    

     * @param string $query The query.


    

    

    

     * @param string $type The type.


    

    

    

     * @param ?int $categoryId The categoryId.


    

    

    

     * @param string $sort The sort.


    

    

    

     * @return string


    

    

    

     */

    

    

    

    

    

    

    

    protected function buildCacheKey(string $query, string $type, ?int $categoryId, string $sort): string
    {
        return sprintf('search:%s:%s:%s:%s', hash('sha256', $query), $type, $categoryId ?? 'none', $sort);
    }


    


    

    

    

    /**


    

    

    

     * Handle sanitize search term.


    

    

    

     *


    

    

    

     * @param ?string $term The term.


    

    

    

     * @return string


    

    

    

     */

    

    

    

    

    

    

    

    protected function sanitizeSearchTerm(?string $term): string
    {
        if ($term === null) {
            return '';
        }

        $normalized = Str::of($term)->squish()->limit(200, '');
        $sanitized = preg_replace('/[^\p{L}\p{N}\s\-_.\,áéíóúñÁÉÍÓÚÑ]/u', '', (string) $normalized);

        return $sanitized ? trim($sanitized) : '';
    }


    


    

    

    

    /**


    

    

    

     * Build like pattern.


    

    

    

     *


    

    

    

     * @param string $term The term.


    

    

    

     * @return string


    

    

    

     */

    

    

    

    

    

    

    

    protected function buildLikePattern(string $term): string
    {
        $escaped = addcslashes($term, '\%_\\');

        return '%' . $escaped . '%';
    }


    
    
    
    
    /**

    
    
    
     * Handle highlight text.

    
    
    
     *

    
    
    
     * @param string $text The text.

    
    
    
     * @param string $query The query.

    
    
    
     * @return string

    
    
    
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

