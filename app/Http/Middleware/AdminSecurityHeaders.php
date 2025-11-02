<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply admin security middleware logic.
 */
class AdminSecurityHeaders
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only apply to admin routes
        if (!$request->is('admin/*')) {
            return $response;
        }

        // Security headers for admin panel
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // Generate nonce for inline scripts (stored in request for use in views)
        $nonce = base64_encode(random_bytes(16));
        $request->attributes->set('csp_nonce', $nonce);

        $isDevelopment = app()->environment(['local', 'development']);

        // Content Security Policy for admin panel
        // ✅ SECURITY: Removed 'unsafe-inline' and 'unsafe-eval' in favor of nonces
        $scriptSrc = $isDevelopment
            ? "'self' 'nonce-{$nonce}' https://cdn.jsdelivr.net http://localhost:* http://127.0.0.1:* http://[::1]:*"
            : "'self' 'nonce-{$nonce}' https://cdn.jsdelivr.net";

        $styleSrc = $isDevelopment
            ? "'self' 'nonce-{$nonce}' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net"
            : "'self' 'nonce-{$nonce}' https://fonts.googleapis.com https://fonts.bunny.net";

        $connectSrc = $isDevelopment
            ? "'self' ws://localhost:* ws://127.0.0.1:* ws://[::1]:* http://localhost:* http://127.0.0.1:* http://[::1]:*"
            : "'self'";

        $csp = implode('; ', [
            "default-src 'self'",
            "script-src {$scriptSrc}",
            "style-src {$styleSrc}",
            "font-src 'self' https://fonts.gstatic.com https://fonts.bunny.net",
            "img-src 'self' data: https:",
            "connect-src {$connectSrc}",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
            "upgrade-insecure-requests",
            "report-uri /api/csp-report"
        ]);

        $response->headers->set('Content-Security-Policy', $csp);

        // Prevent caching of admin pages
        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');

        return $response;
    }
}
