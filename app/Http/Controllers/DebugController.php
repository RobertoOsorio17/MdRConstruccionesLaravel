<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use Inertia\Inertia;

/**
 * Aggregates diagnostic tooling that surfaces environment, cache, and authentication insights for maintainers.
 * Provides safe administrative endpoints to inspect, clear, or analyze system state during troubleshooting.
 */
class DebugController extends Controller
{
    /**
     * ✅ SECURITY FIX: Protect all debug endpoints with authentication and authorization
     */
    public function __construct()
    {
        $this->middleware(['auth', 'can:access-debug']);
    }

    /**
     * Display the system debugging dashboard.
     */
    public function index()
    {
        Log::info('Debug dashboard accessed', [
            'user_id' => Auth::id(),
            'ip' => request()->ip(),
            'timestamp' => now()->toISOString()
        ]);

        $debugInfo = $this->gatherSystemInfo();
        
        return Inertia::render('Debug/Dashboard', [
            'debugInfo' => $debugInfo
        ]);
    }

    /**
     * Provide system information for debugging purposes.
     */
    public function systemInfo()
    {
        Log::info('System info requested', [
            'user_id' => Auth::id(),
            'ip' => request()->ip()
        ]);

        $info = $this->gatherSystemInfo();
        
        return response()->json($info);
    }

    /**
     * Clear the application log files.
     */
    public function clearLogs(Request $request)
    {
        Log::warning('Log cleanup initiated', [
            'user_id' => Auth::id(),
            'ip' => request()->ip(),
            'reason' => $request->get('reason', 'Manual cleanup')
        ]);

        try {
            // Clear Laravel log files.
            $logPath = storage_path('logs');
            $files = glob($logPath . '/laravel*.log');
            
            foreach ($files as $file) {
                if (file_exists($file)) {
                    file_put_contents($file, '');
                }
            }

            Log::info('Logs cleared successfully', [
                'user_id' => Auth::id(),
                'files_cleared' => count($files)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Logs cleared successfully.',
                'files_cleared' => count($files)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to clear logs', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear logs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Debug authentication-specific issues.
     */
    public function debugAuth()
    {
        $authDebug = [
            'is_authenticated' => Auth::check(),
            'user_id' => Auth::id(),
            'user_object' => Auth::user(),
            'session_id' => session()->getId(),
            'session_data' => session()->all(),
            'guard' => Auth::getDefaultDriver(),
            'guards_available' => array_keys(config('auth.guards')),
            'providers_available' => array_keys(config('auth.providers')),
            'session_lifetime' => config('session.lifetime'),
            'session_driver' => config('session.driver'),
        ];

        Log::info('Auth debug info gathered', [
            'user_id' => Auth::id(),
            'auth_debug' => $authDebug
        ]);

        return response()->json($authDebug);
    }

    /**
     * Debug blog post issues.
     */
    public function debugBlog()
    {
        try {
            $blogDebug = [
                'total_posts' => Post::count(),
                'published_posts' => Post::where('status', 'published')->count(),
                'draft_posts' => Post::where('status', 'draft')->count(),
                'recent_posts' => Post::latest()->take(5)->get(['id', 'title', 'status', 'created_at']),
                'categories_count' => DB::table('categories')->count(),
                'comments_count' => Comment::count(),
            ];

            // Check whether posts include images.
            $postsWithImages = Post::whereNotNull('featured_image')->count();
            $blogDebug['posts_with_images'] = $postsWithImages;

            // Verify database structure.
            $blogDebug['posts_table_exists'] = DB::getSchemaBuilder()->hasTable('posts');
            $blogDebug['categories_table_exists'] = DB::getSchemaBuilder()->hasTable('categories');

            if ($blogDebug['posts_table_exists']) {
                $blogDebug['posts_columns'] = DB::getSchemaBuilder()->getColumnListing('posts');
            }

            Log::info('Blog debug info gathered', [
                'user_id' => Auth::id(),
                'blog_debug' => $blogDebug
            ]);

            return response()->json($blogDebug);

        } catch (\Exception $e) {
            Log::error('Blog debug failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Collect general system information.
     */
    private function gatherSystemInfo()
    {
        return [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'environment' => app()->environment(),
            'debug_mode' => config('app.debug'),
            'database' => [
                'default_connection' => config('database.default'),
                'connections_available' => array_keys(config('database.connections')),
            ],
            'cache' => [
                'default_store' => config('cache.default'),
                'stores_available' => array_keys(config('cache.stores')),
            ],
            'session' => [
                'driver' => config('session.driver'),
                'lifetime' => config('session.lifetime'),
                'current_session_id' => session()->getId(),
            ],
            'queue' => [
                'default_connection' => config('queue.default'),
                'connections_available' => array_keys(config('queue.connections')),
            ],
            'auth' => [
                'current_user_id' => Auth::id(),
                'is_authenticated' => Auth::check(),
                'default_guard' => config('auth.defaults.guard'),
                'guards_available' => array_keys(config('auth.guards')),
            ],
            'storage' => [
                'default_disk' => config('filesystems.default'),
                'disks_available' => array_keys(config('filesystems.disks')),
            ],
            'memory_usage' => [
                'current' => memory_get_usage(true),
                'peak' => memory_get_peak_usage(true),
                'limit' => ini_get('memory_limit'),
            ],
            'timestamp' => now()->toISOString(),
        ];
    }
}


