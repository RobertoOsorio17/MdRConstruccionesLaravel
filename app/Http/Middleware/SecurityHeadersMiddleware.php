<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $isDevelopment = app()->environment(['local', 'development']);

        // Add basic security headers (always applied)
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Apply stricter headers only in production
        if (!$isDevelopment) {
            $response->headers->set('X-Frame-Options', 'DENY');
            $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

            // Content Security Policy - only in production
            $csp = $this->buildContentSecurityPolicy();
            $response->headers->set('Content-Security-Policy', $csp);

            // HSTS (HTTP Strict Transport Security) - only in production with HTTPS
            if ($request->isSecure()) {
                $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
            }
        }

        return $response;
    }
    
    /**
     * Build Content Security Policy header
     */
    private function buildContentSecurityPolicy(): string
    {
        $isDevelopment = app()->environment(['local', 'development']);

        if ($isDevelopment) {
            // More permissive CSP for development
            $policies = [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://[::1]:* http://127.0.0.1:* https://www.googletagmanager.com https://www.google-analytics.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net",
                "font-src 'self' https://fonts.gstatic.com https://fonts.bunny.net",
                "img-src 'self' data: https: http: blob:",
                "connect-src 'self' ws://localhost:* ws://[::1]:* ws://127.0.0.1:* http://localhost:* http://[::1]:* http://127.0.0.1:* https://www.google-analytics.com",
                "frame-src 'none'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'"
            ];
        } else {
            // Strict CSP for production
            $policies = [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net",
                "font-src 'self' https://fonts.gstatic.com https://fonts.bunny.net",
                "img-src 'self' data: https: blob:",
                "connect-src 'self' https://www.google-analytics.com",
                "frame-src 'none'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                "upgrade-insecure-requests"
            ];
        }

        return implode('; ', $policies);
    }
}
