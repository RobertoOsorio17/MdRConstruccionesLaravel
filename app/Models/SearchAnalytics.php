<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Logs search activity to power analytics dashboards, including normalization and success metrics.
 * Offers helpers for recording queries, deriving popular terms, and summarizing performance trends.
 */
class SearchAnalytics extends Model
{
    use HasFactory;

    protected $fillable = [
        'query',
        'query_normalized',
        'results_count',
        'user_ip',
        'user_agent',
        'filters',
        'response_time',
        'has_results',
    ];

    protected $casts = [
        'filters' => 'array',
        'has_results' => 'boolean',
        'response_time' => 'decimal:3',
    ];

    /**
     * Record a search query
     */
    public static function recordSearch(
        string $query,
        int $resultsCount,
        array $filters = [],
        float $responseTime = null,
        string $userIp = null,
        string $userAgent = null
    ): void {
        static::create([
            'query' => $query,
            'query_normalized' => static::normalizeQuery($query),
            'results_count' => $resultsCount,
            'filters' => $filters,
            'response_time' => $responseTime,
            'has_results' => $resultsCount > 0,
            'user_ip' => $userIp,
            'user_agent' => $userAgent,
        ]);
    }

    /**
     * Get popular search terms
     */
    public static function getPopularSearches(int $limit = 10, int $days = 30): array
    {
        return static::select('query_normalized', DB::raw('COUNT(*) as search_count'))
            ->where('created_at', '>=', now()->subDays($days))
            ->where('has_results', true)
            ->groupBy('query_normalized')
            ->orderByDesc('search_count')
            ->limit($limit)
            ->pluck('search_count', 'query_normalized')
            ->toArray();
    }

    /**
     * Get search suggestions based on popular queries
     */
    public static function getSuggestions(string $query, int $limit = 5): array
    {
        $normalizedQuery = static::normalizeQuery($query);
        
        return static::select('query_normalized', DB::raw('COUNT(*) as search_count'))
            ->where('query_normalized', 'LIKE', $normalizedQuery . '%')
            ->where('has_results', true)
            ->where('created_at', '>=', now()->subDays(90))
            ->groupBy('query_normalized')
            ->orderByDesc('search_count')
            ->limit($limit)
            ->pluck('query_normalized')
            ->toArray();
    }

    /**
     * Get search analytics summary
     */
    public static function getAnalyticsSummary(int $days = 30): array
    {
        $totalSearches = static::where('created_at', '>=', now()->subDays($days))->count();
        $successfulSearches = static::where('created_at', '>=', now()->subDays($days))
            ->where('has_results', true)
            ->count();
        
        $avgResponseTime = static::where('created_at', '>=', now()->subDays($days))
            ->whereNotNull('response_time')
            ->avg('response_time');

        return [
            'total_searches' => $totalSearches,
            'successful_searches' => $successfulSearches,
            'success_rate' => $totalSearches > 0 ? round(($successfulSearches / $totalSearches) * 100, 2) : 0,
            'avg_response_time' => round($avgResponseTime ?? 0, 3),
        ];
    }

    /**
     * Normalize query for analytics
     */
    private static function normalizeQuery(string $query): string
    {
        return strtolower(trim($query));
    }
}
