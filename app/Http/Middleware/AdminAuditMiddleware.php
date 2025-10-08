<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AdminAuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Apply admin audit middleware logic.
 */
class AdminAuditMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log for authenticated admin users
        if (!Auth::check() || !$this->isAdminUser()) {
            return $response;
        }

        // Skip logging for certain routes to avoid noise
        if ($this->shouldSkipLogging($request)) {
            return $response;
        }

        try {
            $this->logRequest($request, $response);
        } catch (\Exception $e) {
            // Don't break the request if logging fails
            Log::error('Admin audit logging failed', [
                'error' => $e->getMessage(),
                'request' => $request->fullUrl(),
                'user_id' => Auth::id(),
            ]);
        }

        return $response;
    }

    /**
     * Check if current user is admin
     */
    private function isAdminUser(): bool
    {
        $user = Auth::user();
        return $user && ($user->role === 'admin' || $user->hasPermission('dashboard.access'));
    }

    /**
     * Determine if we should skip logging for this request
     */
    private function shouldSkipLogging(Request $request): bool
    {
        $skipRoutes = [
            'admin.dashboard', // Skip dashboard views to reduce noise
            'admin.api.analytics.users',
            'admin.api.analytics.content',
            'admin.api.analytics.services',
            'admin.api.analytics.projects',
            'admin.api.analytics.system',
        ];

        $routeName = $request->route()?->getName();

        // Skip analytics API calls to reduce noise
        if (in_array($routeName, $skipRoutes)) {
            return true;
        }

        // Skip AJAX requests for real-time data (but log important actions)
        if ($request->ajax() && $request->method() === 'GET' && !str_contains($routeName, 'export')) {
            return true;
        }

        // Skip asset requests
        if ($request->is('admin/assets/*') || $request->is('admin/images/*')) {
            return true;
        }

        return false;
    }

    /**
     * Log the admin request
     */
    private function logRequest(Request $request, Response $response): void
    {
        $action = $this->determineAction($request);
        $severity = $this->determineSeverity($request, $action);
        
        $logData = [
            'action' => $action,
            'severity' => $severity,
            'description' => $this->generateDescription($request, $action),
        ];

        // Add model information if available
        if ($modelInfo = $this->extractModelInfo($request)) {
            $logData = array_merge($logData, $modelInfo);
        }

        // Add request data for non-GET requests
        if (!in_array($request->method(), ['GET', 'HEAD'])) {
            $logData['request_data'] = $this->sanitizeRequestData($request->all());
        }

        AdminAuditLog::logAction($logData);
    }

    /**
     * Determine the action being performed
     */
    private function determineAction(Request $request): string
    {
        $method = $request->method();
        $routeName = $request->route()?->getName() ?? '';

        // Map HTTP methods to actions
        return match($method) {
            'POST' => str_contains($routeName, 'store') ? 'create' : 'action',
            'PUT', 'PATCH' => 'update',
            'DELETE' => 'delete',
            'GET' => 'view',
            default => 'unknown',
        };
    }

    /**
     * Determine severity based on action
     */
    private function determineSeverity(Request $request, string $action): string
    {
        $routeName = $request->route()?->getName() ?? '';

        // Critical actions
        if (str_contains($routeName, 'user') && in_array($action, ['delete', 'update'])) {
            return 'critical';
        }

        // High severity actions
        if (in_array($action, ['delete'])) {
            return 'high';
        }

        // Medium severity actions
        if (in_array($action, ['create', 'update'])) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Generate description for the action
     */
    private function generateDescription(Request $request, string $action): string
    {
        $routeName = $request->route()?->getName() ?? '';
        $user = Auth::user();
        
        if (str_contains($routeName, 'posts')) {
            return "{$user->name} performed {$action} on blog post";
        }

        if (str_contains($routeName, 'users')) {
            return "{$user->name} performed {$action} on user account";
        }

        if (str_contains($routeName, 'services')) {
            return "{$user->name} performed {$action} on service";
        }

        if (str_contains($routeName, 'contact-requests')) {
            $actionMap = [
                'mark-read' => 'marked as read',
                'mark-responded' => 'marked as responded',
                'archive' => 'archived',
                'add-notes' => 'added notes to',
                'download-attachment' => 'downloaded attachment from',
                'bulk-action' => 'performed bulk action on',
            ];

            foreach ($actionMap as $key => $description) {
                if (str_contains($routeName, $key)) {
                    return "{$user->name} {$description} contact request";
                }
            }

            return "{$user->name} performed {$action} on contact request";
        }

        return "{$user->name} performed {$action} in admin panel";
    }

    /**
     * Extract model information from request
     */
    private function extractModelInfo(Request $request): ?array
    {
        $routeName = $request->route()?->getName() ?? '';
        $parameters = $request->route()?->parameters() ?? [];

        // Try to extract model info from route parameters
        foreach ($parameters as $key => $value) {
            if (is_numeric($value)) {
                $modelType = $this->guessModelType($key, $routeName);
                if ($modelType) {
                    return [
                        'model_type' => $modelType,
                        'model_id' => $value,
                    ];
                }
            }
        }

        return null;
    }

    /**
     * Guess model type from parameter name and route
     */
    private function guessModelType(string $paramName, string $routeName): ?string
    {
        $modelMap = [
            'post' => 'App\\Models\\Post',
            'user' => 'App\\Models\\User',
            'service' => 'App\\Models\\Service',
            'category' => 'App\\Models\\Category',
            'tag' => 'App\\Models\\Tag',
            'comment' => 'App\\Models\\Comment',
            'project' => 'App\\Models\\Project',
            'contactRequest' => 'App\\Models\\ContactRequest',
        ];

        return $modelMap[$paramName] ?? null;
    }

    /**
     * Sanitize request data to remove sensitive information
     */
    private function sanitizeRequestData(array $data): array
    {
        $sensitiveFields = ['password', 'password_confirmation', '_token', 'current_password'];
        
        foreach ($sensitiveFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = '[REDACTED]';
            }
        }

        return $data;
    }
}
