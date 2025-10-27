<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

/**
 * Delivers notification feeds for authenticated users, handling filtering, presentation, and read state toggles.
 *
 * Features:
 * - Filterable index (all/unread/read) with optional type filter and stats.
 * - Lightweight dropdown feed for quick previews.
 * - Read/mark-all and deletion endpoints with per-user authorization.
 * - Helper to create notifications for event handlers.
 */
class NotificationController extends Controller
{
    /**
     * Display a listing of notifications.
     *
     * @param Request $request The current HTTP request instance with optional filters.
     * @return \Inertia\Response Inertia response with paginated notifications and stats.
     */
    public function index(Request $request)
    {
        // 1) Validate optional filters.
        $validated = $request->validate([
            'filter' => 'nullable|in:all,unread,read',
            'type' => 'nullable|string|max:50',
        ]);

        if (!$this->notificationsTableExists()) {
            $empty = new LengthAwarePaginator([], 0, 20, 1, [
                'path' => $request->url(),
                'query' => $request->query(),
            ]);

            return Inertia::render('Notifications/Index', [
                'notifications' => $empty,
                'stats' => [
                    'total' => 0,
                    'unread' => 0,
                    'read' => 0,
                ],
                'filter' => $request->filter ?? 'all',
            ]);
        }

        // 2) Compose base query for current user with polymorphic relation eager loaded.
        $query = Notification::where('user_id', Auth::id())
            ->with('notifiable')
            ->latest();

        // 3) Filter by read status when requested.
        if ($request->filter === 'unread') {
            $query->unread();
        } elseif ($request->filter === 'read') {
            $query->read();
        }

        // 4) Filter by logical notification type.
        if ($request->filled('type')) {
            $query->ofType($request->type);
        }

        // 5) Shape items for the view layer.
        $notifications = $query->paginate(20)->through(function ($notification) {
            return [
                'id' => $notification->id,
                'type' => $notification->type,
                'data' => $notification->data,
                'read_at' => $notification->read_at?->format('d/m/Y H:i'),
                'created_at' => $notification->created_at->format('d/m/Y H:i'),
                'created_at_human' => $notification->created_at->diffForHumans(),
                'icon' => $notification->icon,
                'color' => $notification->color,
                'is_read' => $notification->isRead(),
            ];
        });

        // 6) Aggregate quick stats for the sidebar/header widgets.
        $stats = [
            'total' => Notification::where('user_id', Auth::id())->count(),
            'unread' => Notification::where('user_id', Auth::id())->unread()->count(),
            'read' => Notification::where('user_id', Auth::id())->read()->count(),
        ];

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'stats' => $stats,
            'filter' => $request->filter ?? 'all',
        ]);
    }

    /**
     * Get unread notifications count.
     *
     * @return \Illuminate\Http\JsonResponse JSON response containing the unread count.
     */
    public function getUnreadCount()
    {
        if (!$this->notificationsTableExists()) {
            return response()->json(['count' => 0]);
        }

        $count = Notification::where('user_id', Auth::id())
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Get recent notifications for dropdown.
     *
     * @return \Illuminate\Http\JsonResponse JSON response with recent notifications for dropdown display.
     */
    public function getRecent()
    {
        if (!$this->notificationsTableExists()) {
            return response()->json(['notifications' => []]);
        }

        $notifications = Notification::where('user_id', Auth::id())
            ->latest()
            ->limit(15) // Show last 15 notifications in dropdown
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at,
                    'created_at_human' => $notification->created_at->diffForHumans(),
                    'icon' => $notification->icon,
                    'color' => $notification->color,
                    'is_read' => $notification->isRead(),
                ];
            });

        return response()->json(['notifications' => $notifications]);
    }

    /**
     * Mark notification as read.
     *
     * @param Notification $notification The notification to mark as read.
     * @return \Illuminate\Http\JsonResponse JSON response indicating success.
     */
    public function markAsRead(Notification $notification)
    {
        if (!$this->notificationsTableExists()) {
            abort(404);
        }

        // Authorize: user can only mark their own notifications.
        if ($notification->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
        ]);
    }

    /**
     * Mark all notifications as read.
     *
     * @return \Illuminate\Http\JsonResponse JSON response indicating success.
     */
    public function markAllAsRead()
    {
        if (!$this->notificationsTableExists()) {
            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read.',
            ]);
        }

        Notification::where('user_id', Auth::id())
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read.',
        ]);
    }

    /**
     * Delete notification.
     *
     * @param Notification $notification The notification to delete.
     * @return \Illuminate\Http\JsonResponse JSON response indicating success.
     */
    public function destroy(Notification $notification)
    {
        if (!$this->notificationsTableExists()) {
            abort(404);
        }

        // Authorize: user can only delete their own notifications.
        if ($notification->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted successfully.',
        ]);
    }

    /**
     * Delete all read notifications.
     *
     * @return \Illuminate\Http\JsonResponse JSON response including the number of deleted notifications.
     */
    public function deleteAllRead()
    {
        if (!$this->notificationsTableExists()) {
            return response()->json([
                'success' => true,
                'message' => '0 notification(s) deleted successfully.',
            ]);
        }

        $count = Notification::where('user_id', Auth::id())
            ->read()
            ->delete();

        return response()->json([
            'success' => true,
            'message' => "{$count} notification(s) deleted successfully.",
        ]);
    }

    /**
     * Create a notification (helper for events).
     *
     * @param int $userId Recipient user ID.
     * @param string $type Notification type identifier.
     * @param mixed $notifiable The related model instance.
     * @param array $data Arbitrary payload to display.
     * @return void
     */
    public static function create(int $userId, string $type, $notifiable, array $data): void
    {
        try {
            Notification::create([
                'user_id' => $userId,
                'type' => $type,
                'notifiable_type' => get_class($notifiable),
                'notifiable_id' => $notifiable->id,
                'data' => $data,
            ]);

            // TODO: Broadcast notification via Laravel Echo/Pusher.
            // broadcast(new NotificationSent($notification))->toOthers();
        } catch (\Exception $e) {
            \Log::error('Failed to create notification', [
                'user_id' => $userId,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function notificationsTableExists(): bool
    {
        static $cached;

        if ($cached === null) {
            $cached = Schema::hasTable((new Notification())->getTable());
        }

        return $cached;
    }
}
