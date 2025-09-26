<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class NotificationController extends Controller
{
    /**
     * Get notifications for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $query = AdminNotification::forUser(auth()->id())
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc');

        // Filter by read status
        if ($request->has('unread_only') && $request->boolean('unread_only')) {
            $query->unread();
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->byType($request->type);
        }

        // Filter by priority
        if ($request->filled('priority')) {
            $query->byPriority($request->priority);
        }

        $notifications = $query->paginate($request->get('per_page', 15));

        return response()->json([
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
     * Mark notification as read
     */
    public function markAsRead(AdminNotification $notification): JsonResponse
    {
        // Ensure user can only mark their own notifications as read
        if ($notification->user_id !== auth()->id() && !$notification->is_system) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notificación marcada como leída',
            'notification' => $notification->fresh(),
        ]);
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread(AdminNotification $notification): JsonResponse
    {
        // Ensure user can only mark their own notifications as unread
        if ($notification->user_id !== auth()->id() && !$notification->is_system) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $notification->markAsUnread();

        return response()->json([
            'message' => 'Notificación marcada como no leída',
            'notification' => $notification->fresh(),
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(): JsonResponse
    {
        $count = AdminNotification::forUser(auth()->id())
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => "Se marcaron {$count} notificaciones como leídas",
            'count' => $count,
        ]);
    }

    /**
     * Delete notification
     */
    public function destroy(AdminNotification $notification): JsonResponse
    {
        // Ensure user can only delete their own notifications or system notifications
        if ($notification->user_id !== auth()->id() && !$notification->is_system) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Check if notification is dismissible
        if (!$notification->is_dismissible) {
            return response()->json(['message' => 'Esta notificación no se puede eliminar'], 400);
        }

        $notification->delete();

        return response()->json([
            'message' => 'Notificación eliminada correctamente',
        ]);
    }

    /**
     * Create a new notification (admin only)
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
            'message' => 'Notificación creada correctamente',
            'notification' => $notification,
        ], 201);
    }

    /**
     * Get notification statistics
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
     * Clean up expired notifications
     */
    public function cleanup(): JsonResponse
    {
        $count = AdminNotification::cleanupExpired();

        return response()->json([
            'message' => "Se eliminaron {$count} notificaciones expiradas",
            'count' => $count,
        ]);
    }
}
