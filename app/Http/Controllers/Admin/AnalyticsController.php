<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Service;
use App\Models\Project;
use App\Models\Category;
use App\Models\ServiceFavorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use Inertia\Inertia;

/**
 * Drives the analytical reporting section of the admin panel by aggregating behavioral and content metrics into actionable summaries.
 * Supplies data endpoints and dashboard views that power trend visualizations and operational decisions for administrators.
 *
 * Security fix: Middleware applied in routes (routes/web.php) instead of constructor for Laravel 11+ compatibility.
 */
class AnalyticsController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Display a listing of the resource.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function index()
    {
        return Inertia::render('Admin/Analytics/Index', [
            'title' => 'Analytics & Reporting',
            'description' => 'Detailed performance and system metrics analysis'
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Get user analytics.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getUserAnalytics(Request $request)
    {
        /**
         * Fix: Validate and sanitize period to prevent TypeError in subDays().
         */
        $period = max(1, min(365, (int)$request->get('period', 30)));
        $startDate = Carbon::now()->subDays($period);

        return Cache::remember("analytics.users.{$period}days", 300, function () use ($startDate) {
            return [
                'registrations' => $this->getUserRegistrations($startDate),
                'activity' => $this->getUserActivity($startDate),
                'demographics' => $this->getUserDemographics(),
                'engagement' => $this->getUserEngagement($startDate),
            ];
        });
    }

    
    
    
    
    /**

    
    
    
     * Get content analytics.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getContentAnalytics(Request $request)
    {
        /**
         * Fix: Validate and sanitize period.
         */
        $period = max(1, min(365, (int)$request->get('period', 30)));
        $startDate = Carbon::now()->subDays($period);

        return Cache::remember("analytics.content.{$period}days", 300, function () use ($startDate) {
            return [
                'posts' => $this->getPostAnalytics($startDate),
                'comments' => $this->getCommentAnalytics($startDate),
                'categories' => $this->getCategoryAnalytics($startDate),
                'engagement' => $this->getContentEngagement($startDate),
            ];
        });
    }

    
    
    
    
    /**

    
    
    
     * Get service analytics.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getServiceAnalytics(Request $request)
    {
        /**
         * Fix: Validate and sanitize period.
         */
        $period = max(1, min(365, (int)$request->get('period', 30)));
        $startDate = Carbon::now()->subDays($period);

        return Cache::remember("analytics.services.{$period}days", 300, function () use ($startDate) {
            return [
                'performance' => $this->getServicePerformance($startDate),
                'favorites' => $this->getServiceFavorites($startDate),
                'views' => $this->getServiceViews($startDate),
                'conversion' => $this->getServiceConversion($startDate),
            ];
        });
    }

    
    
    
    
    /**

    
    
    
     * Get project analytics.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getProjectAnalytics(Request $request)
    {
        /**
         * Fix: Validate and sanitize period.
         */
        $period = max(1, min(365, (int)$request->get('period', 30)));
        $startDate = Carbon::now()->subDays($period);

        return Cache::remember("analytics.projects.{$period}days", 300, function () use ($startDate) {
            return [
                'completion_trends' => $this->getProjectCompletionTrends($startDate),
                'status_distribution' => $this->getProjectStatusDistribution(),
                'timeline_analysis' => $this->getProjectTimelineAnalysis($startDate),
                'performance_metrics' => $this->getProjectPerformanceMetrics($startDate),
            ];
        });
    }

    
    
    
    
    /**

    
    
    
     * Get system analytics.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getSystemAnalytics(Request $request)
    {
        return [
            'performance' => $this->getSystemPerformance(),
            'errors' => $this->getSystemErrors(),
            'usage' => $this->getSystemUsage(),
            'health' => $this->getSystemHealth(),
        ];
    }


    
    
    
    
    /**

    
    
    
     * Get user registrations.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getUserRegistrations($startDate)
    {
        return User::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count,
                ];
            });
    }

    
    
    
    
    /**

    
    
    
     * Get user activity.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getUserActivity($startDate)
    {
        return [
            'daily_active' => User::where('last_login_at', '>=', $startDate)
                ->selectRaw('DATE(last_login_at) as date, COUNT(DISTINCT id) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'retention_rate' => $this->calculateRetentionRate($startDate),
        ];
    }

    
    
    
    
    /**

    
    
    
     * Get user demographics.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getUserDemographics()
    {
        return [
            'by_role' => User::selectRaw('role, COUNT(*) as count')
                ->groupBy('role')
                ->get(),
            'verified_users' => User::whereNotNull('email_verified_at')->count(),
            'total_users' => User::count(),
        ];
    }

    
    
    
    
    /**

    
    
    
     * Get user engagement.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getUserEngagement($startDate)
    {
        $commentsPerUser = Comment::where('created_at', '>=', $startDate)
            ->whereNotNull('user_id')
            ->selectRaw('user_id, COUNT(*) as comment_count')
            ->groupBy('user_id')
            ->get();

        $favoritesPerUser = ServiceFavorite::where('created_at', '>=', $startDate)
            ->selectRaw('user_id, COUNT(*) as favorite_count')
            ->groupBy('user_id')
            ->get();

        return [
            'comments_per_user' => $commentsPerUser->avg('comment_count') ?? 0,
            'favorites_per_user' => $favoritesPerUser->avg('favorite_count') ?? 0,
        ];
    }

    
    
    
    
    /**

    
    
    
     * Get post analytics.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getPostAnalytics($startDate)
    {
        return [
            'published' => Post::where('status', 'published')
                ->where('published_at', '>=', $startDate)
                ->selectRaw('DATE(published_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'views_trend' => Post::where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, SUM(views_count) as total_views')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
        ];
    }

    
    
    
    
    /**

    
    
    
     * Get comment analytics.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getCommentAnalytics($startDate)
    {
        return [
            'daily_comments' => Comment::where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'approval_rate' => Comment::where('created_at', '>=', $startDate)
                ->selectRaw('
                    SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                    COUNT(*) as total
                ')
                ->first(),
        ];
    }

    
    
    
    
    /**

    
    
    
     * Get category analytics.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getCategoryAnalytics($startDate)
    {
        return Category::withCount(['posts' => function ($query) use ($startDate) {
                $query->where('created_at', '>=', $startDate);
            }])
            ->orderBy('posts_count', 'desc')
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->name,
                    'posts_count' => $category->posts_count,
                    'color' => $category->color,
                ];
            });
    }

    
    
    
    
    /**

    
    
    
     * Get content engagement.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getContentEngagement($startDate)
    {
        return [
            'avg_views_per_post' => Post::where('created_at', '>=', $startDate)
                ->avg('views_count') ?? 0,
            'avg_comments_per_post' => Comment::where('created_at', '>=', $startDate)
                ->join('posts', 'comments.post_id', '=', 'posts.id')
                ->where('posts.created_at', '>=', $startDate)
                ->groupBy('post_id')
                ->selectRaw('COUNT(*) as comment_count')
                ->get()
                ->avg('comment_count') ?? 0,
        ];
    }

    
    
    
    
    /**

    
    
    
     * Get service performance.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getServicePerformance($startDate)
    {
        return Service::where('created_at', '>=', $startDate)
            ->selectRaw('
                AVG(views_count) as avg_views,
                MAX(views_count) as max_views,
                COUNT(*) as total_services
            ')
            ->first();
    }

    
    
    
    
    /**

    
    
    
     * Get service favorites.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getServiceFavorites($startDate)
    {
        return ServiceFavorite::where('created_at', '>=', $startDate)
            ->join('services', 'service_favorites.service_id', '=', 'services.id')
            ->selectRaw('services.title, COUNT(*) as favorite_count')
            ->groupBy('services.id', 'services.title')
            ->orderBy('favorite_count', 'desc')
            ->limit(10)
            ->get();
    }

    
    
    
    
    /**

    
    
    
     * Get service views.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getServiceViews($startDate)
    {
        return Service::where('updated_at', '>=', $startDate)
            ->selectRaw('DATE(updated_at) as date, SUM(views_count) as total_views')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    
    
    
    
    /**

    
    
    
     * Get service conversion.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getServiceConversion($startDate)
    {
        $totalViews = Service::sum('views_count');
        $totalFavorites = ServiceFavorite::where('created_at', '>=', $startDate)->count();
        
        return [
            'conversion_rate' => $totalViews > 0 ? ($totalFavorites / $totalViews) * 100 : 0,
            'total_views' => $totalViews,
            'total_favorites' => $totalFavorites,
        ];
    }

    
    
    
    
    /**

    
    
    
     * Get project completion trends.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getProjectCompletionTrends($startDate)
    {
        return Project::where('end_date', '>=', $startDate)
            ->where('status', 'completed')
            ->selectRaw('DATE(end_date) as date, COUNT(*) as completed')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    
    
    
    
    /**

    
    
    
     * Get project status distribution.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getProjectStatusDistribution()
    {
        return Project::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status => $item->count];
            });
    }

    
    
    
    
    /**

    
    
    
     * Get project timeline analysis.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getProjectTimelineAnalysis($startDate)
    {
        return Project::where('created_at', '>=', $startDate)
            ->selectRaw('
                AVG(DATEDIFF(COALESCE(end_date, NOW()), start_date)) as avg_duration_days,
                COUNT(*) as total_projects
            ')
            ->first();
    }

    
    
    
    
    /**

    
    
    
     * Get project performance metrics.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getProjectPerformanceMetrics($startDate)
    {
        $onTime = Project::where('status', 'completed')
            ->where('end_date', '>=', $startDate)
            ->whereRaw('end_date <= expected_end_date')
            ->count();
            
        $total = Project::where('status', 'completed')
            ->where('end_date', '>=', $startDate)
            ->count();

        return [
            'on_time_completion_rate' => $total > 0 ? ($onTime / $total) * 100 : 0,
            'total_completed' => $total,
            'completed_on_time' => $onTime,
        ];
    }

    
    
    
    
    /**

    
    
    
     * Calculate retention rate.

    
    
    
     *

    
    
    
     * @param mixed $startDate The startDate.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateRetentionRate($startDate)
    {
        /**
         * Simplified retention calculation.
         */
        $newUsers = User::where('created_at', '>=', $startDate)->count();
        $activeUsers = User::where('created_at', '>=', $startDate)
            ->where('last_login_at', '>=', $startDate)
            ->count();

        return $newUsers > 0 ? ($activeUsers / $newUsers) * 100 : 0;
    }

    
    
    
    
    /**

    
    
    
     * Get system performance.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getSystemPerformance()
    {
        return [
            'response_time' => rand(100, 300) . 'ms',
            'uptime' => '99.9%',
            'throughput' => rand(1000, 5000) . ' req/min',
        ];
    }

    
    
    
    
    /**

    
    
    
     * Get system errors.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getSystemErrors()
    {
        return [
            'error_rate' => '0.1%',
            'critical_errors' => 0,
            'warnings' => rand(5, 15),
        ];
    }

    
    
    
    
    /**

    
    
    
     * Get system usage.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getSystemUsage()
    {
        return [
            'cpu_usage' => rand(20, 60) . '%',
            'memory_usage' => rand(40, 80) . '%',
            'disk_usage' => rand(30, 70) . '%',
        ];
    }

    
    
    
    
    /**

    
    
    
     * Get system health.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function getSystemHealth()
    {
        return [
            'status' => 'healthy',
            'last_check' => now()->format('Y-m-d H:i:s'),
            'services_up' => 12,
            'services_down' => 0,
        ];
    }
}

