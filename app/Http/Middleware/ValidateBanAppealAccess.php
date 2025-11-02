<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

/**
 * ValidateBanAppealAccess Middleware
 *
 * Provides enhanced security validation for ban appeal operations including:
 * - IP-based rate limiting
 * - Suspicious activity detection
 * - Request validation
 * - Audit logging
 */
class ValidateBanAppealAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $ip = $request->ip();

        // ✅ SECURITY: Validate IP address
        if (!filter_var($ip, FILTER_VALIDATE_IP)) {
            Log::warning('Invalid IP address detected in ban appeal request', [
                'ip' => $ip,
                'user_id' => $user?->id,
                'url' => $request->fullUrl()
            ]);

            return response()->json([
                'message' => 'Solicitud inválida.',
                'error' => 'INVALID_REQUEST'
            ], 400);
        }

        // ✅ SECURITY: Check for suspicious user agents
        $userAgent = $request->userAgent();
        if ($this->isSuspiciousUserAgent($userAgent)) {
            Log::warning('Suspicious user agent detected in ban appeal request', [
                'user_agent' => $userAgent,
                'ip' => $ip,
                'user_id' => $user?->id
            ]);

            return response()->json([
                'message' => 'Solicitud sospechosa detectada.',
                'error' => 'SUSPICIOUS_REQUEST'
            ], 403);
        }

        // ✅ SECURITY: Additional rate limiting per IP (beyond route-level throttling)
        $ipKey = 'ban_appeal_ip:' . $ip;
        if (RateLimiter::tooManyAttempts($ipKey, 5)) {
            $seconds = RateLimiter::availableIn($ipKey);

            Log::warning('IP rate limit exceeded for ban appeals', [
                'ip' => $ip,
                'user_id' => $user?->id,
                'available_in' => $seconds
            ]);

            return response()->json([
                'message' => "Demasiadas solicitudes desde tu ubicación. Intenta de nuevo en {$seconds} segundos.",
                'error' => 'RATE_LIMIT_EXCEEDED',
                'retry_after' => $seconds
            ], 429);
        }

        RateLimiter::hit($ipKey, 300); // 5 minutes decay

        // ✅ AUDIT: Log all ban appeal access attempts
        Log::info('Ban appeal access', [
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'ip' => $ip,
            'user_agent' => $userAgent,
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'route' => $request->route()?->getName()
        ]);

        return $next($request);
    }

    /**
     * Check if user agent appears suspicious.
     *
     * @param string|null $userAgent The user agent string.
     * @return bool True if suspicious.
     */
    protected function isSuspiciousUserAgent(?string $userAgent): bool
    {
        if (empty($userAgent)) {
            return true; // No user agent is suspicious
        }

        // Check for common bot patterns
        $botPatterns = [
            'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
            'python', 'java', 'perl', 'ruby', 'go-http-client'
        ];

        $lowerAgent = strtolower($userAgent);
        foreach ($botPatterns as $pattern) {
            if (stripos($lowerAgent, $pattern) !== false) {
                return true;
            }
        }

        // Check for extremely short user agents (likely fake)
        if (strlen($userAgent) < 20) {
            return true;
        }

        return false;
    }
}
