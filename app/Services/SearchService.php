<?php

namespace App\Services;

use App\Models\Post;
use App\Models\Category;
use App\Models\SearchAnalytics;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Orchestrates full-text search across posts and categories, including caching, analytics, and highlighting.
 * Offers suggestion endpoints and aggregates metrics to inform search optimization.
 */
class SearchService
{
    private const CACHE_TTL = 300; // 5 minutes
    private const MIN_QUERY_LENGTH = 2;
    private const MAX_QUERY_LENGTH = 500;
    private const MAX_PER_PAGE = 100; // ✅ FIXED: Maximum results per page

    /**
     * Perform comprehensive search across posts, categories, and tags
     */
    public function search(
        string $query,
        array $filters = [],
        int $perPage = 12,
        int $page = 1
    ): array {
        // ✅ FIXED: Enforce maximum per page limit
        $perPage = min($perPage, self::MAX_PER_PAGE);
        $startTime = microtime(true);
        
        // Validate and sanitize query
        $query = $this->sanitizeQuery($query);
        
        if (strlen($query) < self::MIN_QUERY_LENGTH) {
            return $this->emptyResults();
        }

        // Build search results
        $results = $this->performSearch($query, $filters, $perPage, $page);
        
        // Record analytics
        $responseTime = microtime(true) - $startTime;
        $this->recordSearchAnalytics($query, $results['total'], $filters, $responseTime);
        
        return $results;
    }

    /**
     * Get search suggestions for autocomplete
     */
    public function getSuggestions(string $query, int $limit = 8): array
    {
        $query = $this->sanitizeQuery($query);
        
        if (strlen($query) < self::MIN_QUERY_LENGTH) {
            return [];
        }

        $cacheKey = "search_suggestions:" . md5($query . $limit);
        
        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($query, $limit) {
            $suggestions = collect();
            
            // Get suggestions from search analytics
            $analyticsSuggestions = SearchAnalytics::getSuggestions($query, $limit);
            $suggestions = $suggestions->merge($analyticsSuggestions);
            
            // Get suggestions from post titles
            $postSuggestions = Post::select('title')
                ->where('title', 'LIKE', '%' . $query . '%')
                ->where('status', 'published')
                ->limit($limit)
                ->pluck('title')
                ->map(fn($title) => strtolower($title))
                ->unique();
            
            $suggestions = $suggestions->merge($postSuggestions);
            
            // Get suggestions from categories
            $categorySuggestions = Category::select('name')
                ->where('name', 'LIKE', '%' . $query . '%')
                ->limit($limit)
                ->pluck('name')
                ->map(fn($name) => strtolower($name));
            
            $suggestions = $suggestions->merge($categorySuggestions);
            
            return $suggestions->unique()->take($limit)->values()->toArray();
        });
    }

    /**
     * Get popular search terms
     */
    public function getPopularSearches(int $limit = 10): array
    {
        return Cache::remember('popular_searches:' . $limit, self::CACHE_TTL * 4, function () use ($limit) {
            return SearchAnalytics::getPopularSearches($limit);
        });
    }

    /**
     * Get search analytics summary
     */
    public function getAnalyticsSummary(int $days = 30): array
    {
        return Cache::remember('search_analytics:' . $days, self::CACHE_TTL * 2, function () use ($days) {
            return SearchAnalytics::getAnalyticsSummary($days);
        });
    }

    /**
     * Perform the actual search
     */
    private function performSearch(string $query, array $filters, int $perPage, int $page): array
    {
        $postsQuery = $this->buildPostsQuery($query, $filters);
        
        // Get total count for pagination
        $total = $postsQuery->count();
        
        // Get paginated results
        $posts = $postsQuery
            ->with(['categories', 'author'])
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        // Transform results
        $transformedPosts = $posts->map(function ($post) use ($query) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'content' => $this->getHighlightedContent($post->content, $query),
                'cover_image' => $post->cover_image,
                'published_at' => $post->published_at?->format('Y-m-d H:i:s'),
                'reading_time' => $post->reading_time,
                'categories' => $post->categories->map(fn($cat) => [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                ]),
                'author' => $post->author ? [
                    'id' => $post->author->id,
                    'name' => $post->author->name,
                    'avatar' => $post->author->avatar,
                ] : null,
                'highlighted_title' => $this->highlightText($post->title, $query),
                'highlighted_excerpt' => $this->highlightText($post->excerpt, $query),
            ];
        });

        return [
            'data' => $transformedPosts,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
            'from' => ($page - 1) * $perPage + 1,
            'to' => min($page * $perPage, $total),
        ];
    }

    /**
     * Build the posts query with search and filters
     */
    private function buildPostsQuery(string $query, array $filters): Builder
    {
        $postsQuery = Post::query()
            ->where('status', 'published')
            ->where(function ($q) use ($query) {
                $q->where('title', 'LIKE', '%' . $query . '%')
                  ->orWhere('excerpt', 'LIKE', '%' . $query . '%')
                  ->orWhere('content', 'LIKE', '%' . $query . '%')
                  ->orWhereHas('categories', function ($categoryQuery) use ($query) {
                      $categoryQuery->where('name', 'LIKE', '%' . $query . '%');
                  });
            });

        // Apply filters
        if (!empty($filters['category'])) {
            $postsQuery->whereHas('categories', function ($q) use ($filters) {
                $q->where('slug', $filters['category']);
            });
        }

        if (!empty($filters['author'])) {
            $postsQuery->where('author_id', $filters['author']);
        }

        if (!empty($filters['date_from'])) {
            $postsQuery->where('published_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $postsQuery->where('published_at', '<=', $filters['date_to']);
        }

        // Apply sorting
        $this->applySorting($postsQuery, $query, $filters['sort'] ?? 'relevance');

        return $postsQuery;
    }

    /**
     * Apply sorting to the query
     */
    private function applySorting(Builder $query, string $searchQuery, string $sort): void
    {
        switch ($sort) {
            case 'date_desc':
                $query->orderBy('published_at', 'desc');
                break;
            case 'date_asc':
                $query->orderBy('published_at', 'asc');
                break;
            case 'title_asc':
                $query->orderBy('title', 'asc');
                break;
            case 'title_desc':
                $query->orderBy('title', 'desc');
                break;
            case 'relevance':
            default:
                // Order by relevance (title matches first, then by date)
                $query->orderByRaw("
                    CASE
                        WHEN title LIKE ? THEN 1
                        WHEN excerpt LIKE ? THEN 2
                        ELSE 3
                    END, published_at DESC
                ", ['%' . $searchQuery . '%', '%' . $searchQuery . '%']);
                break;
        }
    }

    /**
     * Highlight search terms in text
     */
    private function highlightText(string $text, string $query): string
    {
        if (empty($query) || empty($text)) {
            return $text;
        }

        $words = explode(' ', $query);
        
        foreach ($words as $word) {
            if (strlen($word) >= 2) {
                $text = preg_replace(
                    '/(' . preg_quote($word, '/') . ')/i',
                    '<mark class="search-highlight">$1</mark>',
                    $text
                );
            }
        }

        return $text;
    }

    /**
     * Get highlighted content snippet
     */
    private function getHighlightedContent(string $content, string $query, int $snippetLength = 200): string
    {
        $content = strip_tags($content);
        
        // Find the position of the first occurrence of the query
        $position = stripos($content, $query);
        
        if ($position !== false) {
            $start = max(0, $position - 50);
            $snippet = substr($content, $start, $snippetLength);
            
            // Ensure we don't cut words
            if ($start > 0) {
                $spacePos = strpos($snippet, ' ');
                // ✅ FIXED: Check if strpos returned false (no space found)
                if ($spacePos !== false) {
                    $snippet = '...' . substr($snippet, $spacePos + 1);
                }
            }

            if (strlen($content) > $start + $snippetLength) {
                $lastSpace = strrpos($snippet, ' ');
                // ✅ FIXED: Check if strrpos returned false (no space found)
                if ($lastSpace !== false) {
                    $snippet = substr($snippet, 0, $lastSpace) . '...';
                } else {
                    $snippet .= '...';
                }
            }

            return $this->highlightText($snippet, $query);
        }

        // If query not found, return beginning of content
        $snippet = substr($content, 0, $snippetLength);
        if (strlen($content) > $snippetLength) {
            $lastSpace = strrpos($snippet, ' ');
            // ✅ FIXED: Check if strrpos returned false (no space found)
            if ($lastSpace !== false) {
                $snippet = substr($snippet, 0, $lastSpace) . '...';
            } else {
                $snippet .= '...';
            }
        }

        return $snippet;
    }

    /**
     * Sanitize search query
     */
    private function sanitizeQuery(string $query): string
    {
        $query = trim($query);
        $query = substr($query, 0, self::MAX_QUERY_LENGTH);
        $query = preg_replace('/[^\p{L}\p{N}\s\-_]/u', '', $query);
        
        return $query;
    }

    /**
     * Record search analytics
     */
    private function recordSearchAnalytics(string $query, int $total, array $filters, float $responseTime): void
    {
        try {
            SearchAnalytics::recordSearch(
                $query,
                $total,
                $filters,
                $responseTime,
                request()->ip(),
                request()->userAgent()
            );
        } catch (\Exception $e) {
            // Log error but don't fail the search
            logger()->error('Failed to record search analytics', [
                'query' => $query,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Return empty results structure
     */
    private function emptyResults(): array
    {
        return [
            'data' => [],
            'total' => 0,
            'per_page' => 12,
            'current_page' => 1,
            'last_page' => 1,
            'from' => 0,
            'to' => 0,
        ];
    }
}
