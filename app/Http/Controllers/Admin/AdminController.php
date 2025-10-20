<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Service;
use App\Models\Project;
use App\Models\Category;
use App\Models\Tag;
use App\Models\AdminAuditLog;
use App\Models\AdminNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Inertia\Inertia;

/**
 * Provides the central administration hub responsible for summarizing platform activity and infrastructure metrics.
 * Exposes high-level insights, maintenance utilities, and health diagnostics used across the admin dashboard.
 */
class AdminController extends Controller
{
    /**
     * Retrieve high-level system statistics for administrator dashboards.
     *
     * @return array Aggregated counts and metrics for administrative widgets.
     */
    public function getSystemStats()
    {
        return Cache::remember('admin.system.stats', 300, function () {
            return [
                'users' => [
                    'total' => User::count(),
                    'active' => User::whereNotNull('email_verified_at')->count(),
                    'banned' => User::whereHas('bans', function ($query) {
                        $query->where('is_active', true)
                              ->where(function ($q) {
                                  $q->whereNull('expires_at')
                                    ->orWhere('expires_at', '>', now());
                              });
                    })->count(),
                    'new_today' => User::whereDate('created_at', today())->count(),
                ],
                'content' => [
                    'posts' => Post::count(),
                    'published_posts' => Post::where('status', 'published')->count(),
                    'draft_posts' => Post::where('status', 'draft')->count(),
                    'comments' => Comment::count(),
                    'pending_comments' => Comment::where('status', 'pending')->count(),
                    'categories' => Category::count(),
                    'tags' => Tag::count(),
                ],
                'services' => [
                    'total' => Service::count(),
                    'active' => Service::where('is_active', true)->count(),
                    'featured' => Service::where('featured', true)->count(),
                ],
                'projects' => [
                    'total' => Project::count(),
                    'completed' => Project::where('status', 'completed')->count(),
                    'published' => Project::where('status', 'published')->count(),
                ],
                'system' => [
                    'audit_logs' => AdminAuditLog::count(),
                    'unread_notifications' => AdminNotification::unread()->count(),
                    'disk_usage' => $this->getDiskUsage(),
                    'cache_size' => $this->getCacheSize(),
                ],
            ];
        });
    }

    /**
     * Retrieve recent content activity across the application.
     *
     * @param Request $request The current HTTP request containing pagination hints.
     * @return \Illuminate\Support\Collection Collection of normalized activity records.
     */
    public function getRecentActivity(Request $request)
    {
        $limit = $request->get('limit', 20);

        $activities = collect();

        // Append recently created posts.
        Post::with('author:id,name')
            ->orderBy('created_at', 'desc')
            ->limit($limit / 2)
            ->get()
            ->each(function ($post) use ($activities) {
                $activities->push([
                    'type' => 'post',
                    'action' => 'created',
                    'title' => $post->title,
                    'user' => $post->author->name ?? 'System',
                    'created_at' => $post->created_at,
                    'url' => route('admin.posts.edit', $post->slug), // ✅ Use slug for route resolution
                    'icon' => 'article',
                    'color' => 'primary',
                ]);
            });

        // Append recently submitted comments.
        Comment::with(['post:id,title', 'user:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit($limit / 2)
            ->get()
            ->each(function ($comment) use ($activities) {
                $activities->push([
                    'type' => 'comment',
                    'action' => 'posted',
                    'title' => 'Comment on: ' . ($comment->post->title ?? 'Deleted post'),
                    'user' => $comment->user->name ?? $comment->author_name,
                    'created_at' => $comment->created_at,
                    'url' => route('admin.comment-management.index'),
                    'icon' => 'comment',
                    'color' => 'secondary',
                ]);
            });

        return $activities->sortByDesc('created_at')
            ->take($limit)
            ->values()
            ->map(function ($activity) {
                $activity['created_at'] = $activity['created_at']->format('d/m/Y H:i');
                return $activity;
            });
    }

    /**
     * Report current system health checks for core services.
     *
     * @return array Structured health indicators for infrastructure components.
     */
    public function getSystemHealth()
    {
        $health = [
            'status' => 'healthy',
            'checks' => [],
        ];

        // Verify database connectivity.
        try {
            DB::connection()->getPdo();
            $health['checks']['database'] = [
                'status' => 'healthy',
                'message' => 'Database connection successful',
            ];
        } catch (\Exception $e) {
            $health['status'] = 'unhealthy';
            $health['checks']['database'] = [
                'status' => 'unhealthy',
                'message' => 'Database connection failed: ' . $e->getMessage(),
            ];
        }

        // Evaluate application storage usage.
        try {
            $diskFree = disk_free_space(storage_path());
            $diskTotal = disk_total_space(storage_path());
            $diskUsage = (($diskTotal - $diskFree) / $diskTotal) * 100;

            $health['checks']['storage'] = [
                'status' => $diskUsage < 90 ? 'healthy' : 'warning',
                'message' => sprintf('Disk usage: %.1f%%', $diskUsage),
                'usage' => $diskUsage,
            ];

            if ($diskUsage >= 90) {
                $health['status'] = 'warning';
            }
        } catch (\Exception $e) {
            $health['checks']['storage'] = [
                'status' => 'unhealthy',
                'message' => 'Storage check failed: ' . $e->getMessage(),
            ];
        }

        // Confirm cache store availability.
        try {
            Cache::put('health_check', 'test', 60);
            $cached = Cache::get('health_check');

            $health['checks']['cache'] = [
                'status' => $cached === 'test' ? 'healthy' : 'unhealthy',
                'message' => $cached === 'test' ? 'Cache working properly' : 'Cache not working',
            ];
        } catch (\Exception $e) {
            $health['checks']['cache'] = [
                'status' => 'unhealthy',
                'message' => 'Cache check failed: ' . $e->getMessage(),
            ];
        }

        return $health;
    }

    /**
     * Clear core application caches and record the audit trail.
     *
     * @param Request $request The current HTTP request supplying audit metadata.
     * @return \Illuminate\Http\JsonResponse JSON response confirming the cache operation.
     */
    public function clearCaches(Request $request)
    {
        try {
            // Clear the application cache store.
            \Artisan::call('cache:clear');

            // Clear the configuration cache.
            \Artisan::call('config:clear');

            // Clear the cached route definitions.
            \Artisan::call('route:clear');

            // Clear compiled Blade views.
            \Artisan::call('view:clear');

            // Log the cache clearing for audit purposes.
            AdminAuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'system.cache.clear',
                'description' => 'System caches cleared',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'severity' => 'info',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'System caches cleared successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to clear caches', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear caches: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate the current disk usage for the storage path.
     *
     * @return string Human-readable disk usage measurement.
     */
    private function getDiskUsage()
    {
        try {
            $bytes = disk_total_space(storage_path()) - disk_free_space(storage_path());
            return $this->formatBytes($bytes);
        } catch (\Exception $e) {
            return 'Unknown';
        }
    }

    /**
     * Estimate the cache directory size in human-readable format.
     *
     * @return string Estimated cache footprint measurement.
     */
    private function getCacheSize()
    {
        try {
            $cacheDir = storage_path('framework/cache');
            if (!is_dir($cacheDir)) {
                return '0 B';
            }
            
            $size = 0;
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($cacheDir)
            );
            
            foreach ($iterator as $file) {
                if ($file->isFile()) {
                    $size += $file->getSize();
                }
            }
            
            return $this->formatBytes($size);
        } catch (\Exception $e) {
            return 'Unknown';
        }
    }

    /**
     * Convert a byte count into a human-readable unit value.
     *
     * @param int|float $bytes The number of bytes to convert.
     * @param int $precision The decimal precision for rounding.
     * @return string Human-readable representation of the byte count.
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
