<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply security headers middleware logic.
 */
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
     *
     * ✅ IMPROVED: Added nonce support, stricter policies, and better organization
     */
    private function buildContentSecurityPolicy(): string
    {
        $isDevelopment = app()->environment(['local', 'development']);

        // Generate nonce for inline scripts (stored in request for use in views)
        $nonce = base64_encode(random_bytes(16));
        request()->attributes->set('csp_nonce', $nonce);

        if ($isDevelopment) {
            // More permissive CSP for development
            $policies = [
                "default-src 'self'",
                "script-src 'self' 'nonce-{$nonce}' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://[::1]:* http://127.0.0.1:* https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://cdn.tiny.cloud",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net https://cdn.tiny.cloud",
                "font-src 'self' data: https://fonts.gstatic.com https://fonts.bunny.net",
                "img-src 'self' data: https: http: blob: https://www.google.com/recaptcha/ https://ui-avatars.com",
                "connect-src 'self' ws://localhost:* ws://[::1]:* ws://127.0.0.1:* http://localhost:* http://[::1]:* http://127.0.0.1:* https://www.google-analytics.com https://www.google.com/recaptcha/",
                "frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                "media-src 'self' https:",
                "worker-src 'self' blob:",
                "manifest-src 'self'"
            ];
        } else {
            // Strict CSP for production
            $policies = [
                "default-src 'self'",
                "script-src 'self' 'nonce-{$nonce}' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://cdn.tiny.cloud",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net https://cdn.tiny.cloud",
                "font-src 'self' data: https://fonts.gstatic.com https://fonts.bunny.net",
                "img-src 'self' data: https: blob: https://www.google.com/recaptcha/ https://ui-avatars.com",
                "connect-src 'self' https://www.google-analytics.com https://www.google.com/recaptcha/",
                "frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                "upgrade-insecure-requests",
                "media-src 'self' https:",
                "worker-src 'self' blob:",
                "manifest-src 'self'",
                // ✅ Report violations to monitor CSP issues
                "report-uri /api/csp-report"
            ];
        }

        return implode('; ', $policies);
    }
}
