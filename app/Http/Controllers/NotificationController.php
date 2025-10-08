<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * Delivers notification feeds for authenticated users, handling filtering, presentation, and read state toggles.
 * Bridges database notifications with Inertia views so users stay aware of activity that affects them.
 */
class NotificationController extends Controller
{
    /**
     * Display a listing of notifications.
     */
    public function index(Request $request)
    {
        // ✅ Validate input
        $validated = $request->validate([
            'filter' => 'nullable|in:all,unread,read',
            'type' => 'nullable|string|max:50',
        ]);

        $query = Notification::where('user_id', Auth::id())
            ->with('notifiable')
            ->latest();

        // Filter by read status
        if ($request->filter === 'unread') {
            $query->unread();
        } elseif ($request->filter === 'read') {
            $query->read();
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->ofType($request->type);
        }

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

        // Get statistics
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
     */
    public function getUnreadCount()
    {
        $count = Notification::where('user_id', Auth::id())
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Get recent notifications for dropdown.
     */
    public function getRecent()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->latest()
            ->limit(10)
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
     */
    public function markAsRead(Notification $notification)
    {
        // ✅ Authorize: user can only mark their own notifications
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
     */
    public function markAllAsRead()
    {
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
     */
    public function destroy(Notification $notification)
    {
        // ✅ Authorize: user can only delete their own notifications
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
     */
    public function deleteAllRead()
    {
        $count = Notification::where('user_id', Auth::id())
            ->read()
            ->delete();

        return response()->json([
            'success' => true,
            'message' => "{$count} notification(s) deleted successfully.",
        ]);
    }

    /**
     * Create notification (helper method for events).
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

            // ✅ TODO: Broadcast notification via Laravel Echo/Pusher
            // broadcast(new NotificationSent($notification))->toOthers();
        } catch (\Exception $e) {
            \Log::error('Failed to create notification', [
                'user_id' => $userId,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

