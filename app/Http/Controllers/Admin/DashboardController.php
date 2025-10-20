<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Comment;
use App\Models\User;
use App\Models\Project;
use App\Models\Service;
use App\Models\AdminAuditLog;
use App\Models\AdminNotification;
use App\Models\AdminDashboardWidget;
use App\Models\ServiceFavorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use Inertia\Inertia;

/**
 * Curates the administrative dashboard experience by assembling metrics, alerts, and quick actions for staff.
 * Acts as the orchestration point that feeds configurable widgets and surface-level performance snapshots.
 */
class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(Request $request)
    {
        // Cache dashboard statistics for 5 minutes to reduce database load
        $stats = Cache::remember('admin_dashboard_stats', 300, function () {
            return [
                'posts' => [
                    'total' => Post::count(),
                    'published' => Post::where('status', 'published')->count(),
                    'draft' => Post::where('status', 'draft')->count(),
                    'scheduled' => Post::where('status', 'scheduled')->count(),
                ],
                'comments' => [
                    'total' => Comment::count(),
                    'pending' => Comment::where('status', 'pending')->count(),
                    'approved' => Comment::where('status', 'approved')->count(),
                    'spam' => Comment::where('status', 'spam')->count(),
                ],
                'categories' => [
                    'total' => Category::count(),
                    'active' => Category::where('is_active', true)->count(),
                ],
                'tags' => [
                    'total' => Tag::count(),
                    'used' => Tag::has('posts')->count(),
                ],
                'users' => [
                    'total' => User::count(),
                    'active' => User::whereNotNull('email_verified_at')->count(),
                ],
                'projects' => [
                    'total' => Project::count(),
                    'completed' => Project::where('status', 'completed')->count(),
                ],
                'services' => [
                    'total' => Service::count(),
                    'active' => Service::where('is_active', true)->count(),
                    'favorites' => ServiceFavorite::count(),
                ],
                'admin' => [
                    'audit_logs' => AdminAuditLog::count(),
                    'notifications' => AdminNotification::unread()->count(),
                    'active_sessions' => User::whereNotNull('last_activity_at')
                        ->where('last_activity_at', '>=', Carbon::now()->subMinutes(30))
                        ->where('role', 'admin')
                        ->count(),
                ],
            ];
        });

        // Recent posts displayed in activity cards.
        $recentPosts = Post::with(['author:id,name', 'categories:id,name,color'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'status' => $post->status,
                    'featured' => $post->featured,
                    'author' => $post->author,
                    'categories' => $post->categories,
                    'views_count' => $post->views_count,
                    'created_at' => $post->created_at->format('d/m/Y H:i'),
                ];
            });

        // Most recent comments requiring attention.
        $recentComments = Comment::with(['post:id,title,slug', 'user:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => \Illuminate\Support\Str::limit($comment->body, 100), // ✅ Correct column name
                    'author_name' => $comment->author_name,
                    'status' => $comment->status,
                    'post' => $comment->post,
                    'user' => $comment->user,
                    'created_at' => $comment->created_at->format('d/m/Y H:i'),
                ];
            });

        // ✅ FIX: Popular posts - Filter by published_at instead of created_at
        $popularPosts = Post::published()
            ->whereNotNull('published_at')
            ->where('published_at', '>=', Carbon::now()->subDays(30))
            ->orderBy('views_count', 'desc')
            ->limit(5)
            ->get(['id', 'title', 'slug', 'views_count', 'published_at'])
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'views_count' => $post->views_count,
                    'published_at' => $post->published_at->format('d/m/Y'),
                ];
            });

        // Enhanced monthly statistics (covering the last six months) - optimized with single queries
        $monthlyStats = Cache::remember('admin_dashboard_monthly_stats', 300, function () {
            $sixMonthsAgo = Carbon::now()->subMonths(5)->startOfMonth();

            // Get all posts grouped by month
            $postsByMonth = Post::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as total')
                ->where('created_at', '>=', $sixMonthsAgo)
                ->groupBy('month')
                ->pluck('total', 'month');

            $publishedByMonth = Post::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as total')
                ->where('created_at', '>=', $sixMonthsAgo)
                ->where('status', 'published')
                ->groupBy('month')
                ->pluck('total', 'month');

            $commentsByMonth = Comment::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as total')
                ->where('created_at', '>=', $sixMonthsAgo)
                ->groupBy('month')
                ->pluck('total', 'month');

            $usersByMonth = User::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as total')
                ->where('created_at', '>=', $sixMonthsAgo)
                ->groupBy('month')
                ->pluck('total', 'month');

            $projectsByMonth = Project::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as total')
                ->where('created_at', '>=', $sixMonthsAgo)
                ->groupBy('month')
                ->pluck('total', 'month');

            $servicesByMonth = Service::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as total')
                ->where('created_at', '>=', $sixMonthsAgo)
                ->groupBy('month')
                ->pluck('total', 'month');

            // Build the monthly stats array
            $stats = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $monthKey = $date->format('Y-m');

                $stats[] = [
                    'month' => $date->format('M Y'),
                    'posts' => $postsByMonth[$monthKey] ?? 0,
                    'published' => $publishedByMonth[$monthKey] ?? 0,
                    'comments' => $commentsByMonth[$monthKey] ?? 0,
                    'users' => $usersByMonth[$monthKey] ?? 0,
                    'projects' => $projectsByMonth[$monthKey] ?? 0,
                    'services' => $servicesByMonth[$monthKey] ?? 0,
                ];
            }

            return $stats;
        });

        // ✅ FIX: User growth trends - Use single query with groupBy instead of 60 queries
        $startDate = Carbon::now()->subDays(29)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        // Get new users grouped by date
        $newUsersByDate = User::whereBetween('created_at', [$startDate, $endDate])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->pluck('count', 'date')
            ->toArray();

        // Get active users grouped by date
        $activeUsersByDate = User::whereBetween('last_login_at', [$startDate, $endDate])
            ->select(DB::raw('DATE(last_login_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->pluck('count', 'date')
            ->toArray();

        // Build the stats array with all 30 days
        $userGrowthStats = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dateStr = $date->format('Y-m-d');

            $userGrowthStats[] = [
                'date' => $dateStr,
                'new_users' => $newUsersByDate[$dateStr] ?? 0,
                'active_users' => $activeUsersByDate[$dateStr] ?? 0,
            ];
        }

        // Service performance metrics.
        $serviceStats = Service::select('id', 'title', 'views_count', 'featured', 'created_at')
            ->withCount('favorites')
            ->orderBy('views_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($service) {
                return [
                    'id' => $service->id,
                    'title' => $service->title,
                    'views' => $service->views_count,
                    'favorites' => $service->favorites_count,
                    'featured' => $service->featured,
                    'created_at' => $service->created_at->format('d/m/Y'),
                ];
            });

        // Project completion rates.
        $projectStats = [
            'completion_rate' => Project::where('status', 'completed')->count() / max(Project::count(), 1) * 100,
            'by_status' => Project::select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get()
                ->mapWithKeys(function ($item) {
                    return [$item->status => $item->count];
                }),
            'monthly_completions' => Project::where('status', 'completed')
                ->where('end_date', '>=', Carbon::now()->subMonths(6))
                ->selectRaw('YEAR(end_date) as year, MONTH(end_date) as month, COUNT(*) as count')
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    return [
                        'month' => Carbon::createFromDate($item->year, $item->month, 1)->format('M Y'),
                        'completions' => $item->count,
                    ];
                }),
        ];

        // Enhanced category distribution with engagement metrics.
        $categoryStats = Category::withCount(['posts', 'posts as published_posts_count' => function ($query) {
                $query->where('status', 'published');
            }])
            ->with(['posts' => function ($query) {
                $query->select('posts.id', 'views_count');
            }])
            ->orderBy('posts_count', 'desc')
            ->limit(8)
            ->get()
            ->map(function ($category) {
                $totalViews = $category->posts->sum('views_count') ?? 0;
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'posts_count' => $category->posts_count,
                    'published_posts_count' => $category->published_posts_count,
                    'total_views' => $totalViews,
                    'avg_views_per_post' => $category->posts_count > 0 ? round($totalViews / $category->posts_count) : 0,
                    'color' => $category->color,
                ];
            });

        // Content engagement metrics.
        $engagementStats = [
            'top_posts_by_views' => Post::published()
                ->orderBy('views_count', 'desc')
                ->limit(5)
                ->get(['id', 'title', 'slug', 'views_count', 'published_at'])
                ->map(function ($post) {
                    return [
                        'id' => $post->id,
                        'title' => $post->title,
                        'slug' => $post->slug,
                        'views' => $post->views_count,
                        'published_at' => $post->published_at->format('d/m/Y'),
                    ];
                }),
            'most_commented_posts' => Post::published()
                ->withCount('comments')
                ->orderBy('comments_count', 'desc')
                ->limit(5)
                ->get(['id', 'title', 'slug', 'published_at'])
                ->map(function ($post) {
                    return [
                        'id' => $post->id,
                        'title' => $post->title,
                        'slug' => $post->slug,
                        'comments_count' => $post->comments_count,
                        'published_at' => $post->published_at->format('d/m/Y'),
                    ];
                }),
            'comment_approval_rate' => Comment::count() > 0
                ? round((Comment::where('status', 'approved')->count() / Comment::count()) * 100, 1)
                : 0,
        ];

        // System performance statistics.
        $performanceStats = [
            'avg_page_load_time' => $this->getAveragePageLoadTime(),
            'database_queries_per_request' => $this->getAverageQueriesPerRequest(),
            'cache_hit_rate' => $this->getCacheHitRate(),
            'storage_usage' => $this->getStorageUsage(),
            'memory_usage' => $this->getMemoryUsage(),
        ];

        // Recent activity (posts, comments, etc.).
        $recentActivity = collect();

        // Temporarily disabled recent activity section until routes are properly configured.
        /*
        // Add recent posts to activity
        Post::orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->each(function ($post) use ($recentActivity) {
                $recentActivity->push([
                    'type' => 'post',
                    'action' => 'created',
                    'title' => $post->title,
                    'user' => $post->author->name ?? 'System',
                    'created_at' => $post->created_at,
                    'url' => route('admin.posts.edit', $post),
                ]);
            });

        // Add recent comments to activity
        Comment::with(['post:id,title', 'user:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->each(function ($comment) use ($recentActivity) {
                $recentActivity->push([
                    'type' => 'comment',
                    'action' => 'posted',
                    'title' => 'Comment on: ' . ($comment->post->title ?? 'Deleted post'),
                    'user' => $comment->user->name ?? $comment->author_name,
                    'created_at' => $comment->created_at,
                    'url' => route('admin.comment-management.index'),
                ]);
            });
        */

        // Sort recent activity by date and limit
        $recentActivity = $recentActivity->sortByDesc('created_at')
            ->take(15)
            ->map(function ($activity) {
                $activity['created_at'] = $activity['created_at']->format('d/m/Y H:i');
                return $activity;
            })
            ->values();

        // Quick actions tailored to the administrator role.
        $quickActions = [];
        /** @var \App\Models\User $user */
        $user = \Illuminate\Support\Facades\Auth::user();

        if ($user->canDo('posts.create')) {
            $quickActions[] = [
                'title' => 'New Post',
                'description' => 'Create a new article.',
                'icon' => 'article',
                'url' => route('admin.posts.create'),
                'color' => 'primary',
            ];
        }

        if ($user->canDo('categories.create')) {
            $quickActions[] = [
                'title' => 'New Category',
                'description' => 'Add a new category.',
                'icon' => 'category',
                'url' => route('admin.categories.create'),
                'color' => 'secondary',
            ];
        }

        if ($user->canDo('comments.moderate')) {
            $quickActions[] = [
                'title' => 'Moderate Comments',
                'description' => 'Review pending comments.',
                'icon' => 'comment',
                'url' => route('admin.comment-management.index') . '?status=pending',
                'color' => 'warning',
                'badge' => $stats['comments']['pending'],
            ];
        }

        // Temporarily disabled until project management is implemented
        /*
        if ($user->canDo('projects.create')) {
            $quickActions[] = [
                'title' => 'New Project',
                'description' => 'Add a new project.',
                'icon' => 'construction',
                'url' => route('admin.projects.create'),
                'color' => 'info',
            ];
        }
        */

        // Get admin notifications
        $notifications = AdminNotification::forUser(auth()->id())
            ->unread()
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'priority' => $notification->priority,
                    'priority_color' => $notification->priority_color,
                    'type_icon' => $notification->type_icon,
                    'action_url' => $notification->action_url,
                    'action_text' => $notification->action_text,
                    'created_at' => $notification->created_at->format('d/m/Y H:i'),
                ];
            });

        // Get recent audit logs
        $auditLogs = AdminAuditLog::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user?->name ?? 'System',
                    'action' => $log->action,
                    'description' => $log->formatted_description,
                    'severity' => $log->severity,
                    'severity_color' => $log->severity_color,
                    'created_at' => $log->created_at->format('d/m/Y H:i'),
                ];
            });

        // Get user's dashboard widgets
        $widgets = AdminDashboardWidget::forUser(auth()->id())
            ->visible()
            ->orderedByPosition()
            ->get()
            ->map(function ($widget) {
                return [
                    'id' => $widget->id,
                    'type' => $widget->widget_type,
                    'title' => $widget->title,
                    'configuration' => $widget->configuration,
                    'position_x' => $widget->position_x,
                    'position_y' => $widget->position_y,
                    'width' => $widget->width,
                    'height' => $widget->height,
                    'refresh_interval' => $widget->refresh_interval,
                    'data' => $widget->getWidgetData(),
                ];
            });

        return Inertia::render('Admin/DashboardNew', [
            'stats' => $stats,
            'recentPosts' => $recentPosts,
            'recentComments' => $recentComments,
            'popularPosts' => $popularPosts,
            'monthlyStats' => $monthlyStats,
            'userGrowthStats' => $userGrowthStats,
            'serviceStats' => $serviceStats,
            'projectStats' => $projectStats,
            'categoryStats' => $categoryStats,
            'engagementStats' => $engagementStats,
            'performanceStats' => $performanceStats,
            'recentActivity' => $recentActivity,
            'quickActions' => $quickActions,
            'notifications' => $notifications,
            'auditLogs' => $auditLogs,
            'widgets' => $widgets,
        ]);
    }

    /**
     * Get average page load time (mock implementation)
     */
    private function getAveragePageLoadTime()
    {
        // In a real implementation, this would come from application performance monitoring
        return rand(150, 300) . 'ms';
    }

    /**
     * Get average database queries per request (mock implementation)
     */
    private function getAverageQueriesPerRequest()
    {
        // In a real implementation, this would come from query logging
        return rand(8, 15);
    }

    /**
     * Get cache hit rate (mock implementation)
     */
    private function getCacheHitRate()
    {
        // In a real implementation, this would come from cache statistics
        return rand(85, 98) . '%';
    }

    /**
     * Get storage usage information
     */
    private function getStorageUsage()
    {
        try {
            $totalSpace = disk_total_space(storage_path());
            $freeSpace = disk_free_space(storage_path());
            $usedSpace = $totalSpace - $freeSpace;
            $usagePercentage = round(($usedSpace / $totalSpace) * 100, 1);

            return [
                'used' => $this->formatBytes($usedSpace),
                'total' => $this->formatBytes($totalSpace),
                'percentage' => $usagePercentage,
            ];
        } catch (\Exception $e) {
            return [
                'used' => 'Unknown',
                'total' => 'Unknown',
                'percentage' => 0,
            ];
        }
    }

    /**
     * Get memory usage information
     */
    private function getMemoryUsage()
    {
        $memoryUsage = memory_get_usage(true);
        $peakMemoryUsage = memory_get_peak_usage(true);

        return [
            'current' => $this->formatBytes($memoryUsage),
            'peak' => $this->formatBytes($peakMemoryUsage),
            'limit' => ini_get('memory_limit'),
        ];
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
