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

        // ✅ SECURITY FIX: Add comprehensive security headers (always applied)
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // ✅ SECURITY FIX: Remove X-Powered-By header to prevent information disclosure
        $response->headers->remove('X-Powered-By');

        // ✅ SECURITY FIX: X-Permitted-Cross-Domain-Policies
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');

        // Apply stricter headers only in production
        if (!$isDevelopment) {
            $response->headers->set('X-Frame-Options', 'SAMEORIGIN'); // ✅ Changed from DENY to SAMEORIGIN for better compatibility

            // ✅ SECURITY FIX: Enhanced Permissions-Policy
            $response->headers->set('Permissions-Policy', $this->buildPermissionsPolicy());

            // Content Security Policy - only in production
            $csp = $this->buildContentSecurityPolicy();
            $response->headers->set('Content-Security-Policy', $csp);

            // HSTS (HTTP Strict Transport Security) - only in production with HTTPS
            if ($request->isSecure()) {
                $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
            }
        } else {
            // ✅ In development, still set X-Frame-Options but more permissive
            $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
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

    /**
     * Build Permissions Policy header
     *
     * ✅ SECURITY FIX: Comprehensive permissions policy to control browser features
     */
    private function buildPermissionsPolicy(): string
    {
        $policies = [
            'geolocation=(self)',           // Allow geolocation only for same origin
            'microphone=()',                // Block microphone access
            'camera=()',                    // Block camera access
            'payment=(self)',               // Allow payment APIs only for same origin
            'usb=()',                       // Block USB access
            'magnetometer=()',              // Block magnetometer
            'gyroscope=()',                 // Block gyroscope
            'accelerometer=()',             // Block accelerometer
            'ambient-light-sensor=()',      // Block ambient light sensor
            'autoplay=(self)',              // Allow autoplay only for same origin
            'encrypted-media=(self)',       // Allow encrypted media only for same origin
            'fullscreen=(self)',            // Allow fullscreen only for same origin
            'picture-in-picture=(self)',    // Allow PiP only for same origin
            'display-capture=()',           // Block screen capture
            'document-domain=()',           // Block document.domain modification
        ];

        return implode(', ', $policies);
    }
}
