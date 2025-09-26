<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class AuditLogController extends Controller
{
    /**
     * Display audit logs page
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/AuditLogs', [
            'filters' => $request->only(['search', 'action', 'user_id', 'severity', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Get audit logs data for API
     */
    public function data(Request $request): JsonResponse
    {
        $query = AdminAuditLog::with('user:id,name')
            ->orderBy('created_at', 'desc');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('url', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Action filter
        if ($request->filled('action')) {
            $query->byAction($request->action);
        }

        // User filter
        if ($request->filled('user_id')) {
            $query->byUser($request->user_id);
        }

        // Severity filter
        if ($request->filled('severity')) {
            $query->bySeverity($request->severity);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($request->date_from)->startOfDay());
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($request->date_to)->endOfDay());
        }

        $logs = $query->paginate($request->get('per_page', 25));

        return response()->json([
            'logs' => $logs->items()->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                    ] : null,
                    'action' => $log->action,
                    'description' => $log->formatted_description,
                    'model_type' => $log->model_type ? class_basename($log->model_type) : null,
                    'model_id' => $log->model_id,
                    'severity' => $log->severity,
                    'severity_color' => $log->severity_color,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'route_name' => $log->route_name,
                    'url' => $log->url,
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
                    'request_data' => $log->request_data,
                    'created_at' => $log->created_at->format('d/m/Y H:i:s'),
                ];
            }),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    /**
     * Get audit log statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $dateFrom = $request->filled('date_from') 
            ? Carbon::parse($request->date_from) 
            : Carbon::now()->subDays(30);
        
        $dateTo = $request->filled('date_to') 
            ? Carbon::parse($request->date_to) 
            : Carbon::now();

        $query = AdminAuditLog::whereBetween('created_at', [$dateFrom, $dateTo]);

        $stats = [
            'total_logs' => $query->count(),
            'by_action' => $query->selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->orderBy('count', 'desc')
                ->pluck('count', 'action'),
            'by_severity' => $query->selectRaw('severity, COUNT(*) as count')
                ->groupBy('severity')
                ->pluck('count', 'severity'),
            'by_user' => $query->with('user:id,name')
                ->selectRaw('user_id, COUNT(*) as count')
                ->groupBy('user_id')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'user' => $item->user?->name ?? 'Sistema',
                        'count' => $item->count,
                    ];
                }),
            'daily_activity' => $this->getDailyActivity($dateFrom, $dateTo),
            'top_ips' => $query->selectRaw('ip_address, COUNT(*) as count')
                ->groupBy('ip_address')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->pluck('count', 'ip_address'),
        ];

        return response()->json($stats);
    }

    /**
     * Get daily activity for chart
     */
    private function getDailyActivity(Carbon $dateFrom, Carbon $dateTo): array
    {
        $days = [];
        $current = $dateFrom->copy();

        while ($current->lte($dateTo)) {
            $count = AdminAuditLog::whereDate('created_at', $current)
                ->count();
            
            $days[] = [
                'date' => $current->format('Y-m-d'),
                'count' => $count,
            ];
            
            $current->addDay();
        }

        return $days;
    }

    /**
     * Export audit logs
     */
    public function export(Request $request): JsonResponse
    {
        // This would typically generate a CSV or Excel file
        // For now, return a JSON response indicating the feature is available
        
        return response()->json([
            'message' => 'Función de exportación disponible',
            'note' => 'Esta función se implementará para generar archivos CSV/Excel',
        ]);
    }

    /**
     * Get available filter options
     */
    public function filterOptions(): JsonResponse
    {
        $actions = AdminAuditLog::distinct('action')
            ->pluck('action')
            ->sort()
            ->values();

        $users = User::where('role', 'admin')
            ->orWhereHas('roles', function ($q) {
                $q->whereIn('name', ['admin', 'editor']);
            })
            ->get(['id', 'name'])
            ->sortBy('name')
            ->values();

        $severities = ['low', 'medium', 'high', 'critical'];

        return response()->json([
            'actions' => $actions,
            'users' => $users,
            'severities' => $severities,
        ]);
    }

    /**
     * Get audit log details
     */
    public function show(AdminAuditLog $auditLog): JsonResponse
    {
        $auditLog->load('user:id,name');

        return response()->json([
            'log' => [
                'id' => $auditLog->id,
                'user' => $auditLog->user ? [
                    'id' => $auditLog->user->id,
                    'name' => $auditLog->user->name,
                ] : null,
                'action' => $auditLog->action,
                'description' => $auditLog->formatted_description,
                'model_type' => $auditLog->model_type,
                'model_id' => $auditLog->model_id,
                'severity' => $auditLog->severity,
                'severity_color' => $auditLog->severity_color,
                'ip_address' => $auditLog->ip_address,
                'user_agent' => $auditLog->user_agent,
                'session_id' => $auditLog->session_id,
                'route_name' => $auditLog->route_name,
                'url' => $auditLog->url,
                'old_values' => $auditLog->old_values,
                'new_values' => $auditLog->new_values,
                'request_data' => $auditLog->request_data,
                'created_at' => $auditLog->created_at->format('d/m/Y H:i:s'),
            ],
        ]);
    }
}
