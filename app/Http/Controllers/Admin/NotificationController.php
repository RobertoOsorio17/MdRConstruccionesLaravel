<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

/**
 * Manages delivery and lifecycle tracking for administrator-facing notifications within the control panel.
 * Supplies real-time endpoints for unread counts, polling updates, and preference management to keep staff informed.
 */
class NotificationController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Handle unread count.

    
    
    
     *

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function unreadCount(): JsonResponse
    {
        $count = AdminNotification::forUser(auth()->id())
            ->active()
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    
    
    
    
    /**

    
    
    
     * Handle recent.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function recent(Request $request): JsonResponse
    {
        /**
         * Limit to max 100 to prevent abuse.
         */
        $limit = min((int) $request->get('limit', 10), 100);

        $items = AdminNotification::forUser(auth()->id())
            ->active()
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        $notifications = $items->map(fn ($n) => $this->transform($n));

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => AdminNotification::forUser(auth()->id())->active()->unread()->count(),
            'last_id' => (int) ($items->first()->id ?? 0),
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle wait updates.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    /**
     * ⚡ PERFORMANCE: Optimized from long-polling to short-polling
     *
     * Changed from 25-second blocking requests to instant responses.
     * This prevents page load delays and improves overall performance.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function waitUpdates(Request $request): JsonResponse
    {
        $userId = auth()->id();
        $lastId = (int) $request->get('last_id', 0);
        $timeoutSeconds = min((int) $request->get('timeout', 0), 60); // ⚡ Default to 0 (instant)
        $started = time();

        /**
         * Capture initial unread count to detect changes.
         */
        $initialUnread = AdminNotification::forUser($userId)->active()->unread()->count();

        /**
         * ⚡ PERFORMANCE: If timeout is 0, return immediately (short-polling mode)
         */
        if ($timeoutSeconds === 0) {
            $newItems = AdminNotification::forUser($userId)
                ->active()
                ->where('id', '>', $lastId)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            $currentUnread = AdminNotification::forUser($userId)->active()->unread()->count();

            if ($newItems->isNotEmpty() || $currentUnread !== $initialUnread) {
                $transformed = $newItems->map(fn ($n) => $this->transform($n));
                return response()->json([
                    'changed' => true,
                    'new_notifications' => $transformed,
                    'unread_count' => $currentUnread,
                    'last_id' => (int) ($newItems->first()->id ?? $lastId),
                ]);
            }

            return response()->json([
                'changed' => false,
                'new_notifications' => [],
                'unread_count' => $currentUnread,
                'last_id' => $lastId,
            ]);
        }

        /**
         * Long-poll loop (only if timeout > 0)
         */
        while (true) {
            /**
             * Check if client disconnected.
             */
            if (connection_aborted()) {
                break;
            }

            /**
             * New notifications since last id.
             */
            $newItems = AdminNotification::forUser($userId)
                ->active()
                ->where('id', '>', $lastId)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            $currentUnread = AdminNotification::forUser($userId)->active()->unread()->count();

            if ($newItems->isNotEmpty() || $currentUnread !== $initialUnread) {
                $transformed = $newItems->map(fn ($n) => $this->transform($n));
                return response()->json([
                    'changed' => true,
                    'new_notifications' => $transformed,
                    'unread_count' => $currentUnread,
                    'last_id' => (int) ($newItems->first()->id ?? $lastId),
                ]);
            }

            if ((time() - $started) >= $timeoutSeconds) {
                return response()->json([
                    'changed' => false,
                    'new_notifications' => [],
                    'unread_count' => $currentUnread,
                    'last_id' => $lastId,
                ]);
            }

            /**
             * Pause for half a second to limit polling pressure on the server.
             */
            usleep(500000);
        }

        /**
         * If connection was aborted, return empty response.
         */
        return response()->json([
            'changed' => false,
            'new_notifications' => [],
            'unread_count' => $initialUnread,
            'last_id' => $lastId,
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Display a listing of the resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function index(Request $request): JsonResponse
    {
        /**
         * If limit parameter is provided, return simple list (for dropdown).
         */
        if ($request->has('limit')) {
            /**
             * Limit to max 100 to prevent abuse.
             */
            $limit = min((int) $request->get('limit', 10), 100);

            $notifications = AdminNotification::forUser(auth()->id())
                ->active()
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            $unreadCount = AdminNotification::forUser(auth()->id())
                ->active()
                ->unread()
                ->count();

            return response()->json([
                'success' => true,
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
            ]);
        }

        /**
         * Otherwise, return paginated list.
         */
        $query = AdminNotification::forUser(auth()->id())
            ->active()
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc');

        /**
         * Filter by read status.
         */
        if ($request->has('unread_only') && $request->boolean('unread_only')) {
            $query->unread();
        }

        /**
         * Filter by notification type.
         */
        if ($request->filled('type')) {
            $query->byType($request->type);
        }

        /**
         * Filter by priority level.
         */
        if ($request->filled('priority')) {
            $query->byPriority($request->priority);
        }

        $notifications = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'notifications' => $notifications->items(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle mark as read.

    
    
    
     *

    
    
    
     * @param AdminNotification $notification The notification.

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function markAsRead(AdminNotification $notification): JsonResponse
    {
        /**
         * Ensure the acting administrator owns the notification unless it is a system notice.
         */
        if ($notification->user_id !== auth()->id() && !$notification->is_system) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read.',
            'notification' => $notification->fresh(),
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle mark as unread.

    
    
    
     *

    
    
    
     * @param AdminNotification $notification The notification.

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function markAsUnread(AdminNotification $notification): JsonResponse
    {
        /**
         * Ensure the acting administrator owns the notification unless it is a system notice.
         */
        if ($notification->user_id !== auth()->id() && !$notification->is_system) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $notification->markAsUnread();

        return response()->json([
            'message' => 'Notification marked as unread.',
            'notification' => $notification->fresh(),
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle mark all as read.

    
    
    
     *

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function markAllAsRead(): JsonResponse
    {
        $count = AdminNotification::forUser(auth()->id())
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => "{$count} notification(s) marked as read.",
            'count' => $count,
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Remove the specified resource.

    
    
    
     *

    
    
    
     * @param AdminNotification $notification The notification.

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function destroy(AdminNotification $notification): JsonResponse
    {
        /**
         * Ensure the acting administrator owns the notification unless it is a system notice.
         */
        if ($notification->user_id !== auth()->id() && !$notification->is_system) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        /**
         * Check if the notification is dismissible.
         */
        if (!$notification->is_dismissible) {
            return response()->json(['message' => 'This notification cannot be deleted.'], 400);
        }

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully.',
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Store a newly created resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type' => ['required', Rule::in(['info', 'warning', 'error', 'success', 'system'])],
            'title' => 'required|string|max:200',
            'message' => 'required|string',
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'user_id' => 'nullable|exists:users,id',
            'is_system' => 'boolean',
            'action_url' => 'nullable|url|max:500',
            'action_text' => 'nullable|string|max:100',
            'expires_at' => 'nullable|date|after:now',
            'is_dismissible' => 'boolean',
        ]);

        $notification = AdminNotification::create($request->all());

        return response()->json([
            'message' => 'Notification created successfully.',
            'notification' => $this->transform($notification),
        ], 201);
    }

    
    
    
    
    /**

    
    
    
     * Handle stats.

    
    
    
     *

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function stats(): JsonResponse
    {
        $userId = auth()->id();

        $stats = [
            'total' => AdminNotification::forUser($userId)->count(),
            'unread' => AdminNotification::forUser($userId)->unread()->count(),
            'by_type' => AdminNotification::forUser($userId)
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
            'by_priority' => AdminNotification::forUser($userId)
                ->selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority'),
            'recent_count' => AdminNotification::forUser($userId)
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
        ];

        return response()->json($stats);
    }

    
    
    
    
    /**

    
    
    
     * Handle cleanup.

    
    
    
     *

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function cleanup(): JsonResponse
    {
        $count = AdminNotification::cleanupExpired();

        return response()->json([
            'message' => "{$count} expired notification(s) removed.",
            'count' => $count,
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle delete all read.

    
    
    
     *

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function deleteAllRead(): JsonResponse
    {
        $count = AdminNotification::forUser(auth()->id())
            ->read()
            ->delete();

        return response()->json([
            'message' => "{$count} read notification(s) deleted successfully.",
            'count' => $count,
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle transform.

    
    
    
     *

    
    
    
     * @param AdminNotification $n The n.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    protected function transform(AdminNotification $n): array
    {
        return [
            'id' => (int) $n->id,
            'type' => $n->type,
            'title' => $n->title,
            'message' => $n->message,
            'timestamp' => optional($n->created_at)->toIso8601String(),
            'read' => (bool) $n->read_at,
            'is_dismissible' => (bool) $n->is_dismissible,
            'action_url' => $n->action_url,
            'action_text' => $n->action_text,
            'priority' => $n->priority,
            'is_system' => (bool) $n->is_system,
        ];
    }
}
