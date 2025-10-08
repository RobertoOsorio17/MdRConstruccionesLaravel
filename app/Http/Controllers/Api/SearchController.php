<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SearchRequest;
use App\Services\SearchService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

/**
 * Serves API consumers with search capabilities backed by the dedicated SearchService.
 * Accepts query, filter, and pagination inputs to return structured results consumable by client applications.
 */
class SearchController extends Controller
{
    /**
     * Instantiate the controller with the search service dependency.
     *
     * @param SearchService $searchService The service that executes search queries.
     */
    public function __construct(
        private SearchService $searchService
    ) {}

    /**
     * Perform a full search request with pagination and optional filters.
     *
     * @param SearchRequest $request The validated search request instance.
     * @return JsonResponse JSON response containing search results and metadata.
     */
    public function search(SearchRequest $request): JsonResponse
    {
        try {
            $query = $request->getQuery();
            $filters = $request->getFilters();
            $pagination = $request->getPaginationParams();

            $results = $this->searchService->search(
                $query,
                $filters,
                $pagination['per_page'],
                $pagination['page']
            );

            return response()->json([
                'success' => true,
                'data' => $results,
                'query' => $query,
                'filters' => $filters,
                'meta' => [
                    'search_time' => round(microtime(true) - LARAVEL_START, 3),
                    'cached' => false, // Can be enhanced with cache detection in a future iteration.
                ],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            logger()->error('Search API error', [
                'query' => $request->getQuery(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Search temporarily unavailable. Please try again.',
            ], 500);
        }
    }

    /**
     * Provide search suggestions suitable for autocomplete inputs.
     *
     * @param Request $request The current HTTP request.
     * @return JsonResponse JSON response containing suggestion strings.
     */
    public function suggestions(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'q' => 'required|string|min:2|max:100',
                'limit' => 'nullable|integer|min:1|max:20',
            ]);

            $query = $validated['q'];
            $limit = $validated['limit'] ?? 8;

            $suggestions = $this->searchService->getSuggestions($query, $limit);

            return response()->json([
                'success' => true,
                'data' => $suggestions,
                'query' => $query,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            logger()->error('Search suggestions API error', [
                'query' => $request->get('q'),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Suggestions temporarily unavailable.',
                'data' => [],
            ], 500);
        }
    }

    /**
     * Return the most popular search terms within a recent window.
     *
     * @param Request $request The current HTTP request.
     * @return JsonResponse JSON response containing popular terms data.
     */
    public function popular(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'limit' => 'nullable|integer|min:1|max:50',
            ]);

            $limit = $validated['limit'] ?? 10;
            $popularSearches = $this->searchService->getPopularSearches($limit);

            return response()->json([
                'success' => true,
                'data' => $popularSearches,
            ]);

        } catch (\Exception $e) {
            logger()->error('Popular searches API error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Popular searches temporarily unavailable.',
                'data' => [],
            ], 500);
        }
    }

    /**
     * Return aggregate search analytics data for administrators.
     *
     * @param Request $request The current HTTP request.
     * @return JsonResponse JSON response with analytics aggregates.
     */
    public function analytics(Request $request): JsonResponse
    {
        // Add authorization check here if needed.
        // $this->authorize('viewSearchAnalytics');

        try {
            $validated = $request->validate([
                'days' => 'nullable|integer|min:1|max:365',
            ]);

            $days = $validated['days'] ?? 30;
            $analytics = $this->searchService->getAnalyticsSummary($days);

            return response()->json([
                'success' => true,
                'data' => $analytics,
                'period_days' => $days,
            ]);

        } catch (\Exception $e) {
            logger()->error('Search analytics API error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Analytics temporarily unavailable.',
            ], 500);
        }
    }

    /**
     * Run a lightweight search for instant-results contexts.
     *
     * @param Request $request The current HTTP request containing query parameters.
     * @return JsonResponse JSON response optimized for quick search UIs.
     */
    public function quick(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'q' => 'required|string|min:2|max:100',
                'limit' => 'nullable|integer|min:1|max:10',
            ]);

            $query = $validated['q'];
            $limit = $validated['limit'] ?? 5;

            // Use the search service with a compressed pagination strategy.
            $results = $this->searchService->search($query, [], $limit, 1);

            // Return simplified results tailored for quick search UIs.
            $quickResults = collect($results['data'])->map(function ($post) {
                return [
                    'id' => $post['id'],
                    'title' => $post['title'],
                    'slug' => $post['slug'],
                    'excerpt' => substr(strip_tags($post['excerpt']), 0, 100) . '...',
                    'highlighted_title' => $post['highlighted_title'],
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $quickResults,
                'total' => $results['total'],
                'query' => $query,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            logger()->error('Quick search API error', [
                'query' => $request->get('q'),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Quick search temporarily unavailable.',
                'data' => [],
            ], 500);
        }
    }
}
