<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

/**
 * ValidateBanAppealPublicAccess Middleware
 *
 * Provides enhanced security validation for public ban appeal operations including:
 * - IP-based rate limiting
 * - Suspicious activity detection
 * - Request validation
 * - Audit logging
 * - HTML-friendly responses (redirects instead of JSON)
 */
class ValidateBanAppealPublicAccess
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

            return redirect()->route('login')
                ->with('error', 'Solicitud inválida. Por favor, intenta de nuevo.');
        }

        // ✅ SECURITY: Check for suspicious user agents
        $userAgent = $request->userAgent();
        if ($this->isSuspiciousUserAgent($userAgent)) {
            Log::warning('Suspicious user agent detected in ban appeal request', [
                'user_agent' => $userAgent,
                'ip' => $ip,
                'user_id' => $user?->id
            ]);

            return redirect()->route('login')
                ->with('error', 'Solicitud sospechosa detectada. Por favor, usa un navegador web estándar.');
        }

        // ✅ SECURITY: Additional rate limiting per IP (beyond route-level throttling)
        $ipKey = 'ban_appeal_public_ip:' . $ip;
        if (RateLimiter::tooManyAttempts($ipKey, 10)) {
            $seconds = RateLimiter::availableIn($ipKey);

            Log::warning('IP rate limit exceeded for public ban appeals', [
                'ip' => $ip,
                'user_id' => $user?->id,
                'available_in' => $seconds
            ]);

            return redirect()->route('login')
                ->with('error', "Demasiadas solicitudes desde tu ubicación. Intenta de nuevo en " . ceil($seconds / 60) . " minutos.");
        }

        RateLimiter::hit($ipKey, 600); // 10 minutes decay

        // ✅ AUDIT: Log all ban appeal access attempts
        Log::info('Public ban appeal access', [
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'ip' => $ip,
            'user_agent' => substr($userAgent ?? '', 0, 200),
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

