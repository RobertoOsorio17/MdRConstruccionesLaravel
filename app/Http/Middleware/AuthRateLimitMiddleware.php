<?php

namespace App\Http\Middleware;

use App\Models\IpBan;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply auth rate limit middleware logic.
 */
class AuthRateLimitMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();
        $email = $request->input('email');

        // ✅ SECURITY: Check if IP is already banned (integration with CheckIpBan)
        if (IpBan::isIpBanned($ip)) {
            Log::warning('Authentication attempt from banned IP', [
                'ip' => $ip,
                'email_hash' => $email ? hash('sha256', strtolower($email)) : null,
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'timestamp' => now()->toISOString()
            ]);

            return $this->rateLimitResponse(
                "Tu dirección IP ha sido bloqueada. Contacta con el administrador si crees que esto es un error.",
                3600 // 1 hour
            );
        }

        // Check IP-based rate limiting
        if ($this->isIpBlocked($ip)) {
            $attempts = Cache::get("auth_attempts_ip:{$ip}", 0);
            $blockDuration = $this->getIpBlockDuration($attempts);

            Log::warning('Authentication blocked - IP rate limit exceeded', [
                'ip' => $ip,
                'email_hash' => $email ? hash('sha256', strtolower($email)) : null,
                'attempts' => $attempts,
                'block_duration_minutes' => $blockDuration,
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'timestamp' => now()->toISOString()
            ]);

            return $this->rateLimitResponse(
                "Demasiados intentos desde esta IP. Intenta de nuevo en {$blockDuration} minutos.",
                $blockDuration * 60
            );
        }

        // Check email-based rate limiting if email is provided
        if ($email && $this->isEmailBlocked($email)) {
            $attempts = Cache::get("auth_attempts_email:" . hash('sha256', strtolower($email)), 0);
            $blockDuration = $this->getEmailBlockDuration($attempts);

            Log::warning('Authentication blocked - Email rate limit exceeded', [
                'ip' => $ip,
                'email_hash' => hash('sha256', strtolower($email)),
                'attempts' => $attempts,
                'block_duration_minutes' => $blockDuration,
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'timestamp' => now()->toISOString()
            ]);

            return $this->rateLimitResponse(
                "Demasiados intentos para esta cuenta. Intenta de nuevo en {$blockDuration} minutos.",
                $blockDuration * 60
            );
        }
        
        $response = $next($request);
        
        // If authentication failed, increment counters
        if ($this->isAuthenticationFailure($response)) {
            $this->recordFailedAttempt($ip, $email);
        } else {
            // Clear counters on successful authentication
            $this->clearFailedAttempts($ip, $email);
        }
        
        return $response;
    }
    
    /**
     * Check if IP is blocked due to too many failed attempts
     * Implements progressive blocking with increasing delays
     */
    private function isIpBlocked(string $ip): bool
    {
        $key = "auth_attempts_ip:{$ip}";
        $attempts = Cache::get($key, 0);

        // Progressive blocking: 5 attempts = 5 min, 8 attempts = 15 min, 10+ attempts = 60 min
        if ($attempts >= 10) {
            return true; // 60 minute block
        } elseif ($attempts >= 8) {
            $blockKey = "auth_block_ip:{$ip}";
            if (!Cache::has($blockKey)) {
                Cache::put($blockKey, true, now()->addMinutes(15));
            }
            return Cache::has($blockKey);
        } elseif ($attempts >= 5) {
            $blockKey = "auth_block_ip_short:{$ip}";
            if (!Cache::has($blockKey)) {
                Cache::put($blockKey, true, now()->addMinutes(5));
            }
            return Cache::has($blockKey);
        }

        return false;
    }

    /**
     * Check if email is blocked due to too many failed attempts
     * More restrictive than IP blocking for targeted attacks
     */
    private function isEmailBlocked(string $email): bool
    {
        $key = "auth_attempts_email:" . hash('sha256', strtolower($email));
        $attempts = Cache::get($key, 0);

        // Progressive blocking for email: 3 attempts = 10 min, 5+ attempts = 30 min
        if ($attempts >= 5) {
            return true; // 30 minute block
        } elseif ($attempts >= 3) {
            $blockKey = "auth_block_email:" . hash('sha256', strtolower($email));
            if (!Cache::has($blockKey)) {
                Cache::put($blockKey, true, now()->addMinutes(10));
            }
            return Cache::has($blockKey);
        }

        return false;
    }
    
    /**
     * Record a failed authentication attempt
     */
    private function recordFailedAttempt(string $ip, ?string $email): void
    {
        // Record IP-based attempt
        $ipKey = "auth_attempts_ip:{$ip}";
        $ipAttempts = Cache::get($ipKey, 0) + 1;
        Cache::put($ipKey, $ipAttempts, now()->addMinutes(15));

        // Record email-based attempt if email provided
        if ($email) {
            $emailKey = "auth_attempts_email:" . hash('sha256', strtolower($email));
            $emailAttempts = Cache::get($emailKey, 0) + 1;
            Cache::put($emailKey, $emailAttempts, now()->addMinutes(30));
        }

        // ✅ SECURITY: Record aggregated metrics for distributed attack detection
        $this->recordAggregatedMetrics($ip, $email);

        // ✅ SECURITY: Mark IP as suspicious if it exceeds severe abuse threshold
        $this->checkAndMarkSuspiciousIp($ip, $ipAttempts);

        Log::info('Failed authentication attempt recorded', [
            'ip' => $ip,
            'email_hash' => $email ? hash('sha256', strtolower($email)) : null,
            'ip_attempts' => $ipAttempts,
            'email_attempts' => $email ? $emailAttempts : null
        ]);
    }
    
    /**
     * Clear failed attempt counters on successful authentication
     */
    private function clearFailedAttempts(string $ip, ?string $email): void
    {
        Cache::forget("auth_attempts_ip:{$ip}");
        
        if ($email) {
            Cache::forget("auth_attempts_email:" . hash('sha256', strtolower($email)));
        }
    }
    
    /**
     * Check if the response indicates authentication failure
     *
     * SECURITY FIX: Properly detect JSON responses with charset suffix
     * and check status codes to prevent rate limit bypass
     */
    private function isAuthenticationFailure(Response $response): bool
    {
        $statusCode = $response->getStatusCode();

        // Check for redirect to login with errors
        if ($response->isRedirect()) {
            $location = $response->headers->get('Location');
            return str_contains($location, '/login') || str_contains($location, 'login');
        }

        // Check for JSON error responses
        // FIX: Laravel includes charset in Content-Type (e.g., "application/json; charset=UTF-8")
        $contentType = $response->headers->get('Content-Type', '');
        $isJson = str_starts_with($contentType, 'application/json');

        if ($isJson) {
            // Check status codes that indicate authentication failure
            // 401 = Unauthorized, 422 = Validation Error (credentials invalid)
            if (in_array($statusCode, [401, 422])) {
                return true;
            }

            // Also check response body for error indicators
            $content = $response->getContent();
            if ($content) {
                $data = json_decode($content, true);
                if (isset($data['errors']) || isset($data['message'])) {
                    return true;
                }
            }
        }

        return false;
    }
    
    /**
     * Get IP block duration based on attempt count
     */
    private function getIpBlockDuration(int $attempts): int
    {
        if ($attempts >= 10) return 60; // 60 minutes
        if ($attempts >= 8) return 15;  // 15 minutes
        if ($attempts >= 5) return 5;   // 5 minutes
        return 1; // Default 1 minute
    }

    /**
     * Get email block duration based on attempt count
     */
    private function getEmailBlockDuration(int $attempts): int
    {
        if ($attempts >= 5) return 30; // 30 minutes
        if ($attempts >= 3) return 10; // 10 minutes
        return 5; // Default 5 minutes
    }

    /**
     * Return rate limit exceeded response
     */
    private function rateLimitResponse(string $message, int $retryAfterSeconds = 900): Response
    {
        if (request()->expectsJson()) {
            return response()->json([
                'message' => $message,
                'error' => 'rate_limit_exceeded',
                'retry_after' => $retryAfterSeconds,
                'retry_after_minutes' => ceil($retryAfterSeconds / 60)
            ], 429);
        }

        return redirect()->back()
            ->withErrors(['email' => $message])
            ->withInput(request()->except('password'));
    }

    /**
     * Record aggregated metrics for distributed attack detection
     *
     * ✅ SECURITY: Track global metrics to detect distributed brute-force attacks
     * where attackers use multiple IPs to avoid per-IP rate limits
     */
    private function recordAggregatedMetrics(string $ip, ?string $email): void
    {
        $now = now();
        $hourKey = $now->format('Y-m-d-H');

        // Track total failed attempts per hour globally
        $globalKey = "auth_metrics_global:{$hourKey}";
        $globalAttempts = Cache::get($globalKey, 0) + 1;
        Cache::put($globalKey, $globalAttempts, now()->addHours(2));

        // Track unique IPs attempting authentication per hour
        $uniqueIpsKey = "auth_metrics_unique_ips:{$hourKey}";
        $uniqueIps = Cache::get($uniqueIpsKey, []);
        if (!in_array($ip, $uniqueIps)) {
            $uniqueIps[] = $ip;
            Cache::put($uniqueIpsKey, $uniqueIps, now()->addHours(2));
        }

        // Track unique emails being targeted per hour
        if ($email) {
            $emailHash = hash('sha256', strtolower($email));
            $uniqueEmailsKey = "auth_metrics_unique_emails:{$hourKey}";
            $uniqueEmails = Cache::get($uniqueEmailsKey, []);
            if (!in_array($emailHash, $uniqueEmails)) {
                $uniqueEmails[] = $emailHash;
                Cache::put($uniqueEmailsKey, $uniqueEmails, now()->addHours(2));
            }
        }

        // Log aggregated metrics every 100 attempts to detect patterns
        if ($globalAttempts % 100 === 0) {
            Log::channel('security')->warning('High volume of authentication failures detected', [
                'hour' => $hourKey,
                'total_attempts' => $globalAttempts,
                'unique_ips' => count($uniqueIps),
                'unique_emails_targeted' => $email ? count(Cache::get($uniqueEmailsKey, [])) : 0,
                'avg_attempts_per_ip' => count($uniqueIps) > 0 ? round($globalAttempts / count($uniqueIps), 2) : 0,
                'timestamp' => $now->toISOString()
            ]);
        }

        // Alert on potential distributed attack (many IPs, low attempts per IP)
        $uniqueIpCount = count($uniqueIps);
        if ($uniqueIpCount >= 50 && $globalAttempts >= 200) {
            $avgAttemptsPerIp = $globalAttempts / $uniqueIpCount;

            // If average attempts per IP is low (< 5), it's likely a distributed attack
            if ($avgAttemptsPerIp < 5) {
                Log::channel('security')->critical('Potential distributed brute-force attack detected', [
                    'hour' => $hourKey,
                    'total_attempts' => $globalAttempts,
                    'unique_ips' => $uniqueIpCount,
                    'avg_attempts_per_ip' => round($avgAttemptsPerIp, 2),
                    'attack_pattern' => 'distributed',
                    'timestamp' => $now->toISOString()
                ]);
            }
        }
    }

    /**
     * Check if IP should be marked as suspicious and flag it
     *
     * ✅ SECURITY: Integration with CheckIpBan middleware
     * Automatically flags IPs that show severe abuse patterns
     */
    private function checkAndMarkSuspiciousIp(string $ip, int $attempts): void
    {
        // Mark IP as suspicious if it exceeds 20 failed attempts
        // This creates a "suspicious IP" cache entry that can be used by other middlewares
        if ($attempts >= 20) {
            $suspiciousKey = "suspicious_ip:{$ip}";

            // Check if already marked
            if (!Cache::has($suspiciousKey)) {
                Cache::put($suspiciousKey, [
                    'attempts' => $attempts,
                    'first_seen' => now()->toISOString(),
                    'last_seen' => now()->toISOString(),
                    'source' => 'auth_rate_limit'
                ], now()->addHours(24));

                Log::channel('security')->warning('IP marked as suspicious due to excessive auth failures', [
                    'ip' => $ip,
                    'attempts' => $attempts,
                    'threshold' => 20,
                    'timestamp' => now()->toISOString()
                ]);
            } else {
                // Update last seen
                $data = Cache::get($suspiciousKey);
                $data['attempts'] = $attempts;
                $data['last_seen'] = now()->toISOString();
                Cache::put($suspiciousKey, $data, now()->addHours(24));
            }
        }

        // Escalate to automatic IP ban if attempts exceed 50
        if ($attempts >= 50) {
            // Check if IP is already banned
            if (!IpBan::isIpBanned($ip)) {
                try {
                    IpBan::banIp(
                        $ip,
                        "Automatic ban: {$attempts} failed authentication attempts detected",
                        'spam',
                        7, // 7 days ban
                        null // System ban (no admin)
                    );

                    Log::channel('security')->critical('IP automatically banned due to severe abuse', [
                        'ip' => $ip,
                        'attempts' => $attempts,
                        'ban_duration_days' => 7,
                        'timestamp' => now()->toISOString()
                    ]);
                } catch (\Exception $e) {
                    Log::channel('security')->error('Failed to automatically ban IP', [
                        'ip' => $ip,
                        'attempts' => $attempts,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }
    }
}
