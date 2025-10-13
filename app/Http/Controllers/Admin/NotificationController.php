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
     * Return a lightweight unread count for the authenticated admin.
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
     * Return the most recent notifications for the authenticated admin.
     */
    public function recent(Request $request): JsonResponse
    {
        // Limit to max 100 to prevent abuse
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
     * Long-poll endpoint that waits for new notifications or unread changes.
     * The client supplies the last seen notification id.
     */
    public function waitUpdates(Request $request): JsonResponse
    {
        $userId = auth()->id();
        $lastId = (int) $request->get('last_id', 0);
        $timeoutSeconds = min((int) $request->get('timeout', 25), 60);
        $started = time();

        // Capture initial unread count to detect changes
        $initialUnread = AdminNotification::forUser($userId)->active()->unread()->count();

        // Basic long-poll loop
        while (true) {
            // Check if client disconnected
            if (connection_aborted()) {
                break;
            }

            // New notifications since last id
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

            // Sleep briefly to reduce load
            usleep(500000); // 500ms
        }

        // If connection was aborted, return empty response
        return response()->json([
            'changed' => false,
            'new_notifications' => [],
            'unread_count' => $initialUnread,
            'last_id' => $lastId,
        ]);
    }

    /**
     * Retrieve paginated notifications for the authenticated administrator.
     *
     * @param Request $request The request containing filter parameters.
     * @return JsonResponse JSON response with notification data and pagination metadata.
     */
    public function index(Request $request): JsonResponse
    {
        // If limit parameter is provided, return simple list (for dropdown)
        if ($request->has('limit')) {
            // Limit to max 100 to prevent abuse
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

        // Otherwise, return paginated list
        $query = AdminNotification::forUser(auth()->id())
            ->active()
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc');

        // Filter by read status.
        if ($request->has('unread_only') && $request->boolean('unread_only')) {
            $query->unread();
        }

        // Filter by notification type.
        if ($request->filled('type')) {
            $query->byType($request->type);
        }

        // Filter by priority level.
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
     * Mark a notification as read.
     *
     * @param AdminNotification $notification The notification instance to update.
     * @return JsonResponse JSON response describing the updated notification state.
     */
    public function markAsRead(AdminNotification $notification): JsonResponse
    {
        // Ensure the acting administrator owns the notification unless it is a system notice.
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
     * Mark a notification as unread.
     *
     * @param AdminNotification $notification The notification instance to update.
     * @return JsonResponse JSON response describing the updated notification state.
     */
    public function markAsUnread(AdminNotification $notification): JsonResponse
    {
        // Ensure the acting administrator owns the notification unless it is a system notice.
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
     * Mark all unread notifications as read for the authenticated user.
     *
     * @return JsonResponse JSON response summarizing how many notifications were updated.
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
     * Delete a notification.
     *
     * @param AdminNotification $notification The notification instance to delete.
     * @return JsonResponse JSON response confirming the deletion.
     */
    public function destroy(AdminNotification $notification): JsonResponse
    {
        // Ensure the acting administrator owns the notification unless it is a system notice.
        if ($notification->user_id !== auth()->id() && !$notification->is_system) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Check if the notification is dismissible.
        if (!$notification->is_dismissible) {
            return response()->json(['message' => 'This notification cannot be deleted.'], 400);
        }

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully.',
        ]);
    }

    /**
     * Create a new notification (admin only).
     *
     * @param Request $request The request payload describing the notification.
     * @return JsonResponse JSON response containing the newly created notification.
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
     * Get notification statistics for the current administrator.
     *
     * @return JsonResponse JSON response containing aggregated notification counts.
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
     * Clean up expired notifications.
     *
     * @return JsonResponse JSON response summarizing how many notifications were removed.
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
     * Normalize notification structure for the admin UI.
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
