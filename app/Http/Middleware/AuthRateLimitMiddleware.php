<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

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
            Log::warning('Authentication blocked - IP rate limit exceeded', [
                'ip' => $ip,
                'email' => $email,
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl()
            ]);
            
            return $this->rateLimitResponse('Demasiados intentos desde esta IP. Intenta de nuevo en 15 minutos.');
        }
        
        // Check email-based rate limiting if email is provided
        if ($email && $this->isEmailBlocked($email)) {
            Log::warning('Authentication blocked - Email rate limit exceeded', [
                'ip' => $ip,
                'email' => $email,
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl()
            ]);
            
            return $this->rateLimitResponse('Demasiados intentos para esta cuenta. Intenta de nuevo en 30 minutos.');
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
     */
    private function isIpBlocked(string $ip): bool
    {
        $key = "auth_attempts_ip:{$ip}";
        $attempts = Cache::get($key, 0);
        
        // Block after 10 attempts from same IP
        return $attempts >= 10;
    }
    
    /**
     * Check if email is blocked due to too many failed attempts
     */
    private function isEmailBlocked(string $email): bool
    {
        $key = "auth_attempts_email:" . hash('sha256', strtolower($email));
        $attempts = Cache::get($key, 0);
        
        // Block after 5 attempts for same email
        return $attempts >= 5;
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
     * Return rate limit exceeded response
     */
    private function rateLimitResponse(string $message): Response
    {
        if (request()->expectsJson()) {
            return response()->json([
                'message' => $message,
                'error' => 'rate_limit_exceeded',
                'retry_after' => 900 // 15 minutes
            ], 429);
        }
        
        return redirect()->back()
            ->withErrors(['email' => $message])
            ->withInput(request()->except('password'));
    }
}
