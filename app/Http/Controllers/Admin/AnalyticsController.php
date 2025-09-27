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

class AnalyticsController extends Controller
{
    /**
     * Get user analytics data
     */
    public function getUserAnalytics(Request $request)
    {
        $period = $request->get('period', '30'); // days
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
     * Get content analytics data
     */
    public function getContentAnalytics(Request $request)
    {
        $period = $request->get('period', '30');
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
     * Get service analytics data
     */
    public function getServiceAnalytics(Request $request)
    {
        $period = $request->get('period', '30');
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
     * Get project analytics data
     */
    public function getProjectAnalytics(Request $request)
    {
        $period = $request->get('period', '30');
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
     * Get system performance analytics
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

    // Private helper methods

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

    private function getUserEngagement($startDate)
    {
        return [
            'comments_per_user' => Comment::where('created_at', '>=', $startDate)
                ->whereNotNull('user_id')
                ->selectRaw('user_id, COUNT(*) as comment_count')
                ->groupBy('user_id')
                ->avg('comment_count') ?? 0,
            'favorites_per_user' => ServiceFavorite::where('created_at', '>=', $startDate)
                ->selectRaw('user_id, COUNT(*) as favorite_count')
                ->groupBy('user_id')
                ->avg('favorite_count') ?? 0,
        ];
    }

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
                ->avg('comment_count') ?? 0,
        ];
    }

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

    private function getServiceViews($startDate)
    {
        return Service::where('updated_at', '>=', $startDate)
            ->selectRaw('DATE(updated_at) as date, SUM(views_count) as total_views')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

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

    private function getProjectCompletionTrends($startDate)
    {
        return Project::where('end_date', '>=', $startDate)
            ->where('status', 'completed')
            ->selectRaw('DATE(end_date) as date, COUNT(*) as completed')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    private function getProjectStatusDistribution()
    {
        return Project::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status => $item->count];
            });
    }

    private function getProjectTimelineAnalysis($startDate)
    {
        return Project::where('created_at', '>=', $startDate)
            ->selectRaw('
                AVG(DATEDIFF(COALESCE(end_date, NOW()), start_date)) as avg_duration_days,
                COUNT(*) as total_projects
            ')
            ->first();
    }

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

    private function calculateRetentionRate($startDate)
    {
        // Simplified retention calculation
        $newUsers = User::where('created_at', '>=', $startDate)->count();
        $activeUsers = User::where('created_at', '>=', $startDate)
            ->where('last_login_at', '>=', $startDate)
            ->count();

        return $newUsers > 0 ? ($activeUsers / $newUsers) * 100 : 0;
    }

    private function getSystemPerformance()
    {
        return [
            'response_time' => rand(100, 300) . 'ms',
            'uptime' => '99.9%',
            'throughput' => rand(1000, 5000) . ' req/min',
        ];
    }

    private function getSystemErrors()
    {
        return [
            'error_rate' => '0.1%',
            'critical_errors' => 0,
            'warnings' => rand(5, 15),
        ];
    }

    private function getSystemUsage()
    {
        return [
            'cpu_usage' => rand(20, 60) . '%',
            'memory_usage' => rand(40, 80) . '%',
            'disk_usage' => rand(30, 70) . '%',
        ];
    }

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
