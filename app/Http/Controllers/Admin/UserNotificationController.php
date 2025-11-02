<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use App\Models\AdminAuditLog;
use App\Jobs\SendBulkUserNotifications;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Manage administrator user notification workflows.
 *
 * Provides endpoints to deliver notifications individually, by role, or globally, and to review historical activity metrics.
 */
class UserNotificationController extends Controller
{
    
    
    
    
    /**
     * Create a new controller instance.
     *
     * Applies administrator-only middleware to all routes.
     */
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = $request->user();

            /** Determine whether the authenticated user holds the administrator role. */
            $isAdmin = $user->role === 'admin' ||
                       $user->roles->contains('name', 'admin');

            if (!$isAdmin) {
                abort(403, 'This action is unauthorized. Only administrators can manage user notifications.');
            }

            return $next($request);
        });
    }

    
    
    
    
    /**
     * Show the administrator notification composer.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        /** Retrieve all users for manual targeting. */
        $users = User::select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ];
            });

        /** Gather user counts per role for statistics. */
        $userCounts = [
            'total' => User::count(),
            'admin' => User::where('role', 'admin')->count(),
            'editor' => User::where('role', 'editor')->count(),
            'user' => User::where('role', 'user')->count(),
        ];

        return Inertia::render('Admin/Notifications/Send', [
            'users' => $users,
            'userCounts' => $userCounts,
        ]);
    }

    
    
    
    
    /**
     * Dispatch notifications to the requested audience.
     *
     * Validates input and either sends immediately or schedules delivery based on the given parameters.
     *
     * @param \Illuminate\Http\Request $request The incoming request payload.
     * @return \Illuminate\Http\RedirectResponse Redirect to history with a success message.
     */
    public function store(Request $request)
    {
        /** Validate the notification submission payload. */
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:200',
            'message' => 'required|string|max:1000',
            'type' => ['required', Rule::in(['info', 'warning', 'error', 'success', 'system'])],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'action_url' => 'nullable|url|max:500',
            'action_text' => 'nullable|string|max:100',
            'recipient_type' => ['required', Rule::in(['all', 'role', 'individual'])],
            'role' => ['required_if:recipient_type,role', Rule::in(['admin', 'editor', 'user'])],
            'user_ids' => 'required_if:recipient_type,individual|array',
            'user_ids.*' => 'exists:users,id',
            'send_type' => ['required', Rule::in(['immediate', 'scheduled'])],
            'scheduled_at' => 'required_if:send_type,scheduled|nullable|date|after:now',
            'is_recurring' => 'nullable|boolean',
            'recurrence_pattern' => ['required_if:is_recurring,true', 'nullable', Rule::in(['daily', 'weekly', 'monthly'])],
        ], [
            'title.required' => 'El título es requerido.',
            'title.max' => 'El título no debe superar 200 caracteres.',
            'message.required' => 'El mensaje es requerido.',
            'message.max' => 'El mensaje no debe superar 1000 caracteres.',
            'type.required' => 'El tipo es requerido.',
            'type.in' => 'El tipo debe ser: info, warning, error, success o system.',
            'priority.required' => 'La prioridad es requerida.',
            'priority.in' => 'La prioridad debe ser: low, medium, high o urgent.',
            'action_url.url' => 'La URL de acción debe ser válida.',
            'action_url.max' => 'La URL de acción no debe superar 500 caracteres.',
            'action_text.max' => 'El texto de acción no debe superar 100 caracteres.',
            'recipient_type.required' => 'El tipo de destinatario es requerido.',
            'recipient_type.in' => 'El tipo de destinatario debe ser: all, role o individual.',
            'role.required_if' => 'El rol es requerido cuando el tipo de destinatario es "role".',
            'role.in' => 'El rol debe ser: admin, editor o user.',
            'user_ids.required_if' => 'Debe seleccionar al menos un usuario.',
            'user_ids.*.exists' => 'Uno o más usuarios seleccionados no existen.',
            'send_type.required' => 'El tipo de envío es requerido.',
            'send_type.in' => 'El tipo de envío debe ser: immediate o scheduled.',
            'scheduled_at.required_if' => 'La fecha de programación es requerida cuando el tipo de envío es "scheduled".',
            'scheduled_at.date' => 'La fecha de programación debe ser una fecha válida.',
            'scheduled_at.after' => 'La fecha de programación debe ser posterior a la fecha actual.',
            'recurrence_pattern.required_if' => 'El patrón de recurrencia es requerido cuando la notificación es recurrente.',
            'recurrence_pattern.in' => 'El patrón de recurrencia debe ser: daily, weekly o monthly.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        /** Resolve recipient user identifiers according to the selected recipient type. */
        $userIds = [];

        switch ($validated['recipient_type']) {
            case 'all':
                $userIds = User::pluck('id')->toArray();
                break;

            case 'role':
                $userIds = User::where('role', $validated['role'])->pluck('id')->toArray();
                break;

            case 'individual':
                $userIds = $validated['user_ids'];
                break;
        }

        /** Ensure that at least one recipient is available for notification delivery. */
        if (empty($userIds)) {
            return back()->withErrors(['recipient_type' => 'No se encontraron destinatarios para enviar la notificación.'])->withInput();
        }

        /** Assemble the base notification payload. */
        $notificationData = [
            'title' => $validated['title'],
            'message' => $validated['message'],
            'type' => $validated['type'],
            'priority' => $validated['priority'],
            'action_url' => $validated['action_url'] ?? null,
            'action_text' => $validated['action_text'] ?? null,
            'scheduled_at' => $validated['send_type'] === 'scheduled' ? $validated['scheduled_at'] : null,
            'status' => $validated['send_type'] === 'scheduled' ? 'scheduled' : 'sent',
            'is_recurring' => $validated['is_recurring'] ?? false,
            'recurrence_pattern' => $validated['recurrence_pattern'] ?? null,
        ];

        /** Dispatch notifications immediately or schedule them for later delivery. */
        if ($validated['send_type'] === 'immediate') {
            /** Send notifications synchronously without queueing when immediate delivery is requested. */
            $this->sendImmediateNotifications($notificationData, $userIds, auth()->id());
        } else {
            /** Persist scheduled notifications so the scheduler can deliver them. */
            $this->createScheduledNotifications($notificationData, $userIds, auth()->id());
        }

        /** Record the action in the administrator audit log. */
        $action = $validated['send_type'] === 'scheduled' ? 'notification_scheduled' : 'notification_send_initiated';
        $description = $validated['send_type'] === 'scheduled'
            ? sprintf(
                'Scheduled notification "%s" for %d users (%s) at %s',
                $validated['title'],
                count($userIds),
                $validated['recipient_type'],
                $validated['scheduled_at']
            )
            : sprintf(
                'Initiated sending notification "%s" to %d users (%s)',
                $validated['title'],
                count($userIds),
                $validated['recipient_type']
            );

        AdminAuditLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'description' => $description,
            'severity' => 'low',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'session_id' => session()->getId(),
            'route_name' => request()->route()?->getName(),
            'url' => request()->fullUrl(),
            'metadata' => [
                'recipient_type' => $validated['recipient_type'],
                'recipient_count' => count($userIds),
                'notification_type' => $validated['type'],
                'priority' => $validated['priority'],
                'send_type' => $validated['send_type'],
                'scheduled_at' => $validated['scheduled_at'] ?? null,
                'is_recurring' => $validated['is_recurring'] ?? false,
            ],
        ]);

        $successMessage = $validated['send_type'] === 'scheduled'
            ? sprintf(
                'Notificación programada exitosamente para %d usuario(s) el %s.',
                count($userIds),
                \Carbon\Carbon::parse($validated['scheduled_at'])->format('d/m/Y H:i')
            )
            : sprintf(
                'Notificación enviada exitosamente a %d usuario(s).',
                count($userIds)
            );

        return redirect()->route('admin.user-notifications.history')
            ->with('success', $successMessage);
    }

    
    
    
    
    /**

    
    
    
     * Send immediate notifications.

    
    
    
     *

    
    
    
     * @param array $notificationData The notificationData.

    
    
    
     * @param array $userIds The userIds.

    
    
    
     * @param int $sentBy The sentBy.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function sendImmediateNotifications(array $notificationData, array $userIds, int $sentBy): void
    {
        $now = now();

        /** Retrieve all relevant users to separate administrator and standard accounts. */
        $users = User::whereIn('id', $userIds)->get();

        /** Extract administrator identifiers from the recipient pool. */
        $adminUserIds = $users->filter(function ($user) {
            return $user->role === 'admin' || $user->roles->contains('name', 'admin');
        })->pluck('id')->toArray();

        $regularUserIds = $users->filter(function ($user) {
            return $user->role !== 'admin' && !$user->roles->contains('name', 'admin');
        })->pluck('id')->toArray();

        /** Prepare notification payloads for non-administrator recipients. */
        $regularNotifications = [];
        foreach ($regularUserIds as $userId) {
            $regularNotifications[] = [
                'user_id' => $userId,
                'sent_by' => $sentBy,
                'type' => $notificationData['type'],
                'title' => $notificationData['title'],
                'priority' => $notificationData['priority'],
                'data' => json_encode([
                    'message' => $notificationData['message'],
                ]),
                'action_url' => $notificationData['action_url'],
                'action_text' => $notificationData['action_text'],
                'scheduled_at' => null,
                'status' => 'sent',
                'is_recurring' => false,
                'recurrence_pattern' => null,
                'next_occurrence' => null,
                'notifiable_type' => null,
                'notifiable_id' => null,
                'read_at' => null,
                'sent_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        /** Persist notifications in manageable chunks to avoid memory issues. */
        DB::transaction(function () use ($regularNotifications, $adminUserIds, $notificationData, $userIds, $sentBy, $now) {
            /** Insert notifications destined for regular users. */
            if (!empty($regularNotifications)) {
                $chunks = array_chunk($regularNotifications, 500);
                foreach ($chunks as $chunk) {
                    Notification::insert($chunk);
                }
            }

            /** Create administrator notifications for administrator recipients. */
            foreach ($adminUserIds as $adminUserId) {
                \App\Models\AdminNotification::create([
                    'user_id' => $adminUserId,
                    'type' => $notificationData['type'],
                    'title' => $notificationData['title'],
                    'message' => $notificationData['message'],
                    'data' => json_encode([
                        'sent_by' => $sentBy,
                        'sent_at' => $now->toDateTimeString(),
                    ]),
                    'action_url' => $notificationData['action_url'],
                    'action_text' => $notificationData['action_text'],
                    'priority' => $notificationData['priority'],
                    'is_dismissible' => true,
                    'is_system' => false,
                ]);
            }

            /** Send a confirmation notification to the initiating administrator. */
            \App\Models\AdminNotification::create([
                'user_id' => $sentBy,
                'type' => 'success',
                'title' => 'Notificación enviada exitosamente',
                'message' => sprintf(
                    'Has enviado "%s" a %d usuario(s).',
                    $notificationData['title'],
                    count($userIds)
                ),
                'data' => json_encode([
                    'notification_title' => $notificationData['title'],
                    'notification_type' => $notificationData['type'],
                    'notification_priority' => $notificationData['priority'],
                    'recipient_count' => count($userIds),
                    'admin_recipients' => count($adminUserIds),
                    'regular_recipients' => count($regularNotifications),
                    'sent_at' => $now->toDateTimeString(),
                ]),
                'action_url' => route('admin.user-notifications.history'),
                'action_text' => 'Ver historial',
                'priority' => 'medium',
                'is_dismissible' => true,
                'is_system' => false,
            ]);
        });

        /** Log the successful synchronous delivery for observability. */
        Log::info('Immediate notifications sent successfully', [
            'sent_by' => $sentBy,
            'recipient_count' => count($userIds),
            'admin_recipients' => count($adminUserIds),
            'regular_recipients' => count($regularNotifications),
            'title' => $notificationData['title'],
        ]);
    }

    
    
    
    
    /**
     * Schedule notifications for delivery at a future time.
     *
     * @param array $notificationData Structured notification attributes.
     * @param array<int, int> $userIds Target user identifiers.
     * @param int $sentBy Administrator user ID initiating the schedule.
     * @return void
     */
    private function createScheduledNotifications(array $notificationData, array $userIds, int $sentBy): void
    {
        $now = now();

        /** Retrieve all relevant users to separate administrator and standard accounts. */
        $users = User::whereIn('id', $userIds)->get();

        /** Extract administrator identifiers from the recipient pool. */
        $adminUserIds = $users->filter(function ($user) {
            return $user->role === 'admin' || $user->roles->contains('name', 'admin');
        })->pluck('id')->toArray();

        $regularUserIds = $users->filter(function ($user) {
            return $user->role !== 'admin' && !$user->roles->contains('name', 'admin');
        })->pluck('id')->toArray();

        /** Prepare scheduled notification payloads for non-administrator recipients. */
        $regularNotifications = [];
        foreach ($regularUserIds as $userId) {
            $regularNotifications[] = [
                'user_id' => $userId,
                'sent_by' => $sentBy,
                'type' => $notificationData['type'],
                'title' => $notificationData['title'],
                'priority' => $notificationData['priority'],
                'data' => json_encode([
                    'message' => $notificationData['message'],
                ]),
                'action_url' => $notificationData['action_url'],
                'action_text' => $notificationData['action_text'],
                'scheduled_at' => $notificationData['scheduled_at'],
                'status' => 'scheduled',
                'is_recurring' => $notificationData['is_recurring'],
                'recurrence_pattern' => $notificationData['recurrence_pattern'],
                'next_occurrence' => $notificationData['scheduled_at'],
                'notifiable_type' => null,
                'notifiable_id' => null,
                'read_at' => null,
                'sent_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::transaction(function () use ($regularNotifications, $adminUserIds, $notificationData, $userIds, $sentBy, $now) {
            /** Insert scheduled notifications for regular users in manageable chunks. */
            if (!empty($regularNotifications)) {
                $chunks = array_chunk($regularNotifications, 500);
                foreach ($chunks as $chunk) {
                    Notification::insert($chunk);
                }
            }

            /**
             * Create administrator notifications immediately while annotating the intended schedule because administrator notices do not support deferred delivery.
             */
            $scheduledAt = \Carbon\Carbon::parse($notificationData['scheduled_at']);
            $recurrenceText = $notificationData['is_recurring']
                ? sprintf(' (Recurrente: %s)', $notificationData['recurrence_pattern'])
                : '';

            foreach ($adminUserIds as $adminUserId) {
                \App\Models\AdminNotification::create([
                    'user_id' => $adminUserId,
                    'type' => 'info',
                    'title' => sprintf('[Programada] %s', $notificationData['title']),
                    'message' => sprintf(
                        '%s (Programada para: %s%s)',
                        $notificationData['message'],
                        $scheduledAt->format('d/m/Y H:i'),
                        $recurrenceText
                    ),
                    'data' => json_encode([
                        'sent_by' => $sentBy,
                        'scheduled_at' => $scheduledAt->toDateTimeString(),
                        'is_recurring' => $notificationData['is_recurring'],
                        'recurrence_pattern' => $notificationData['recurrence_pattern'],
                        'created_at' => $now->toDateTimeString(),
                    ]),
                    'action_url' => $notificationData['action_url'],
                    'action_text' => $notificationData['action_text'],
                    'priority' => $notificationData['priority'],
                    'is_dismissible' => true,
                    'is_system' => false,
                ]);
            }

            /** Send a scheduling confirmation notification to the initiating administrator. */
            \App\Models\AdminNotification::create([
                'user_id' => $sentBy,
                'type' => 'info',
                'title' => 'Notificación programada creada',
                'message' => sprintf(
                    'Has programado "%s" para %d usuario(s) el %s%s',
                    $notificationData['title'],
                    count($userIds),
                    $scheduledAt->format('d/m/Y H:i'),
                    $recurrenceText
                ),
                'data' => json_encode([
                    'notification_title' => $notificationData['title'],
                    'notification_type' => $notificationData['type'],
                    'notification_priority' => $notificationData['priority'],
                    'recipient_count' => count($userIds),
                    'admin_recipients' => count($adminUserIds),
                    'regular_recipients' => count($regularNotifications),
                    'scheduled_at' => $scheduledAt->toDateTimeString(),
                    'is_recurring' => $notificationData['is_recurring'],
                    'recurrence_pattern' => $notificationData['recurrence_pattern'],
                ]),
                'action_url' => route('admin.user-notifications.history'),
                'action_text' => 'Ver historial',
                'priority' => 'medium',
                'is_dismissible' => true,
                'is_system' => false,
            ]);
        });
    }

    
    
    
    
    /**
     * Display the administrator notification history feed.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Inertia\Response
     */
    public function history(Request $request)
    {
        /** Validate the filter criteria for the history request. */
        $validated = $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'type' => ['nullable', Rule::in(['info', 'warning', 'error', 'success', 'system'])],
            'priority' => ['nullable', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'status' => ['nullable', Rule::in(['draft', 'scheduled', 'sent', 'failed', 'cancelled'])],
            'sent_by' => 'nullable|exists:users,id',
        ]);

        /** Build the base query for administrator notification history. */
        $query = Notification::with(['sentBy:id,name,email'])
            /** Restrict results to notifications initiated by administrators. */
            ->whereNotNull('sent_by')
            ->select('id', 'user_id', 'sent_by', 'type', 'title', 'priority', 'status', 'scheduled_at', 'sent_at', 'read_at', 'is_recurring', 'recurrence_pattern', 'created_at')
            ->latest();

        /** Apply optional filters provided by the administrator. */
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }

        if ($request->filled('type')) {
            $query->where('type', $validated['type']);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $validated['priority']);
        }

        if ($request->filled('status')) {
            $query->where('status', $validated['status']);
        }

        if ($request->filled('sent_by')) {
            $query->where('sent_by', $validated['sent_by']);
        }

        /** Paginate and transform the resulting notifications for the dashboard. */
        $notifications = $query->paginate(20)->through(function ($notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->title,
                'type' => $notification->type,
                'priority' => $notification->priority,
                'status' => $notification->status,
                'scheduled_at' => $notification->scheduled_at ? $notification->scheduled_at->format('d/m/Y H:i') : null,
                'sent_at' => $notification->sent_at ? $notification->sent_at->format('d/m/Y H:i') : null,
                'is_recurring' => $notification->is_recurring,
                'recurrence_pattern' => $notification->recurrence_pattern,
                'sent_by' => $notification->sentBy ? [
                    'id' => $notification->sentBy->id,
                    'name' => $notification->sentBy->name,
                    'email' => $notification->sentBy->email,
                ] : null,
                'is_read' => !is_null($notification->read_at),
                'created_at' => $notification->created_at->format('d/m/Y H:i'),
            ];
        });

        /** Compile delivery metrics for administrator notifications. */
        $stats = [
            'total' => Notification::whereNotNull('sent_by')->count(),
            'sent' => Notification::whereNotNull('sent_by')->where('status', 'sent')->count(),
            'scheduled' => Notification::whereNotNull('sent_by')->where('status', 'scheduled')->count(),
            'failed' => Notification::whereNotNull('sent_by')->where('status', 'failed')->count(),
            'sent_today' => Notification::whereNotNull('sent_by')->where('status', 'sent')->whereDate('sent_at', today())->count(),
            'read' => Notification::whereNotNull('sent_by')->where('status', 'sent')->whereNotNull('read_at')->count(),
            'unread' => Notification::whereNotNull('sent_by')->where('status', 'sent')->whereNull('read_at')->count(),
        ];

        /** Retrieve administrators available for sender filtering. */
        $senders = User::whereIn('id', function ($query) {
                $query->select('sent_by')
                    ->from('notifications')
                    ->whereNotNull('sent_by')
                    ->distinct();
            })
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Notifications/History', [
            'notifications' => $notifications,
            'stats' => $stats,
            'senders' => $senders,
            'filters' => $validated,
        ]);
    }
}
