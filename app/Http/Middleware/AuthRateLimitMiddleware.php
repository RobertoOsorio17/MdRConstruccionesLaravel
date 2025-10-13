<?php

namespace App\Http\Middleware;

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
        
        // Check IP-based rate limiting
        if ($this->isIpBlocked($ip)) {
            $attempts = Cache::get("auth_attempts_ip:{$ip}", 0);
            $blockDuration = $this->getIpBlockDuration($attempts);

            Log::warning('Authentication blocked - IP rate limit exceeded', [
                'ip' => $ip,
                'email' => $email,
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
        
        Log::info('Failed authentication attempt recorded', [
            'ip' => $ip,
            'email' => $email ? hash('sha256', strtolower($email)) : null,
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
     */
    private function isAuthenticationFailure(Response $response): bool
    {
        // Check for redirect to login with errors
        if ($response->isRedirect()) {
            $location = $response->headers->get('Location');
            return str_contains($location, '/login') || str_contains($location, 'login');
        }
        
        // Check for JSON error responses
        if ($response->headers->get('Content-Type') === 'application/json') {
            $content = $response->getContent();
            $data = json_decode($content, true);
            return isset($data['errors']) || $response->getStatusCode() === 422;
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
}
