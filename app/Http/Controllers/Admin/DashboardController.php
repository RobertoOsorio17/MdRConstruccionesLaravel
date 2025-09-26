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

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(Request $request)
    {
        // Basic stats
        $stats = [
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

        // Recent posts
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

        // Recent comments
        $recentComments = Comment::with(['post:id,title,slug', 'user:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => \Illuminate\Support\Str::limit($comment->content, 100),
                    'author_name' => $comment->author_name,
                    'status' => $comment->status,
                    'post' => $comment->post,
                    'user' => $comment->user,
                    'created_at' => $comment->created_at->format('d/m/Y H:i'),
                ];
            });

        // Popular posts (most viewed in last 30 days)
        $popularPosts = Post::published()
            ->where('created_at', '>=', Carbon::now()->subDays(30))
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

        // Monthly post stats (last 6 months)
        $monthlyStats = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthlyStats[] = [
                'month' => $date->format('M Y'),
                'posts' => Post::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
                'published' => Post::where('status', 'published')
                    ->whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
                'comments' => Comment::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
            ];
        }

        // Category distribution
        $categoryStats = Category::withCount('posts')
            ->orderBy('posts_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->name,
                    'posts_count' => $category->posts_count,
                    'color' => $category->color,
                ];
            });

        // Recent activity (posts, comments, etc.)
        $recentActivity = collect();

        // Temporarily disabled recent activity section until routes are properly configured
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
                    'user' => $post->author->name ?? 'Sistema',
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
                    'title' => 'Comentario en: ' . ($comment->post->title ?? 'Post eliminado'),
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

        // Quick actions based on user role
        $quickActions = [];
        /** @var \App\Models\User $user */
        $user = \Illuminate\Support\Facades\Auth::user();

        if ($user->canDo('posts.create')) {
            $quickActions[] = [
                'title' => 'Nuevo Post',
                'description' => 'Crear un nuevo artículo',
                'icon' => 'article',
                'url' => route('admin.admin.posts.create'),
                'color' => 'primary',
            ];
        }

        if ($user->canDo('categories.create')) {
            $quickActions[] = [
                'title' => 'Nueva Categoría',
                'description' => 'Agregar categoría',
                'icon' => 'category',
                'url' => route('admin.admin.categories.create'),
                'color' => 'secondary',
            ];
        }

        if ($user->canDo('comments.moderate')) {
            $quickActions[] = [
                'title' => 'Moderar Comentarios',
                'description' => 'Revisar comentarios pendientes',
                'icon' => 'comment',
                'url' => route('admin.admin.comment-management.index') . '?status=pending',
                'color' => 'warning',
                'badge' => $stats['comments']['pending'],
            ];
        }

        // Temporarily disabled until project management is implemented
        /*
        if ($user->canDo('projects.create')) {
            $quickActions[] = [
                'title' => 'Nuevo Proyecto',
                'description' => 'Agregar proyecto',
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
                    'user' => $log->user?->name ?? 'Sistema',
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
            'categoryStats' => $categoryStats,
            'recentActivity' => $recentActivity,
            'quickActions' => $quickActions,
            'notifications' => $notifications,
            'auditLogs' => $auditLogs,
            'widgets' => $widgets,
        ]);
    }
}