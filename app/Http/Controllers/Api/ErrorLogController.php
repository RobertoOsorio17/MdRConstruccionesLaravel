<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Captures client-side errors reported via the API and persists them with contextual metadata for diagnostics.
 * Normalizes incoming payloads, applies severity heuristics, and routes logs to the appropriate monitoring channels.
 */
class ErrorLogController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Handle log error.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function logError(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'message' => 'required|string|max:1000',
                'stack' => 'nullable|string|max:5000',
                'componentStack' => 'nullable|string|max:5000',
                'context' => 'nullable|array',
                'context.url' => 'nullable|string|max:500',
                'context.userAgent' => 'nullable|string|max:500',
                'context.timestamp' => 'nullable|string',
            ]);

            // ✅ SECURITY: Prepare log context with minimal sensitive data
            $logContext = [
                'message' => $validated['message'],
                // Truncate stack traces to prevent log bloat
                'stack' => isset($validated['stack']) ? substr($validated['stack'], 0, 1000) : null,
                'component_stack' => isset($validated['componentStack']) ? substr($validated['componentStack'], 0, 500) : null,
                'url' => $validated['context']['url'] ?? null,
                'user_agent' => $validated['context']['userAgent'] ?? null,
                'timestamp' => $validated['context']['timestamp'] ?? now()->toISOString(),
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
                // ✅ SECURITY: Removed session_id to prevent session hijacking via logs
                // Only include essential context, not full payload
                'browser' => $this->extractBrowserInfo($validated['context']['userAgent'] ?? ''),
            ];

            // Determine log level based on error severity
            $level = $this->determineLogLevel($validated['message']);

            // Log to appropriate channel
            Log::channel('frontend')->log($level, 'Frontend Error: ' . $validated['message'], $logContext);

            // In production, you might want to send critical errors to external services
            if (app()->environment('production') && $level === 'critical') {
                // Example: Send to Sentry, Bugsnag, etc.
                // $this->sendToExternalService($logContext);
            }

            return response()->json([
                'success' => true,
                'message' => 'Error logged successfully',
            ], 200);

        } catch (\Exception $e) {
            // Don't let error logging fail the application
            Log::error('Failed to log frontend error', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to log error',
            ], 500);
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle determine log level.

    
    
    
     *

    
    
    
     * @param string $message The message.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    private function determineLogLevel(string $message): string
    {
        $message = strtolower($message);

        // Critical errors
        if (str_contains($message, 'network') || 
            str_contains($message, 'timeout') ||
            str_contains($message, 'failed to fetch')) {
            return 'critical';
        }

        // Warnings
        if (str_contains($message, 'warning') || 
            str_contains($message, 'deprecated')) {
            return 'warning';
        }

        // Default to error
        return 'error';
    }

    
    
    
    
    /**

    
    
    
     * Get error stats.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function getErrorStats(Request $request): JsonResponse
    {
        // This would require a database table to store errors
        // For now, return a placeholder response

        return response()->json([
            'success' => true,
            'stats' => [
                'total_errors' => 0,
                'errors_today' => 0,
                'critical_errors' => 0,
            ],
            'message' => 'Error statistics feature coming soon',
        ]);
    }

    /**
     * Extract minimal browser information from user agent
     *
     * ✅ SECURITY: Only extract essential browser info, not full user agent
     */
    private function extractBrowserInfo(string $userAgent): array
    {
        $browser = 'Unknown';
        $version = 'Unknown';

        // Detect common browsers
        if (preg_match('/Chrome\/([0-9.]+)/', $userAgent, $matches)) {
            $browser = 'Chrome';
            $version = $matches[1];
        } elseif (preg_match('/Firefox\/([0-9.]+)/', $userAgent, $matches)) {
            $browser = 'Firefox';
            $version = $matches[1];
        } elseif (preg_match('/Safari\/([0-9.]+)/', $userAgent, $matches)) {
            $browser = 'Safari';
            $version = $matches[1];
        } elseif (preg_match('/Edge\/([0-9.]+)/', $userAgent, $matches)) {
            $browser = 'Edge';
            $version = $matches[1];
        }

        return [
            'name' => $browser,
            'version' => $version,
        ];
    }
}

