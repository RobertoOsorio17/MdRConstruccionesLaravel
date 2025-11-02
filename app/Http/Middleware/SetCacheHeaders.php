<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetCacheHeaders
{
    /**
     * Handle an incoming request.
     *
     * ⚡ PERFORMANCE: Set cache headers for static assets
     * 
     * Lighthouse recommendation: "Use efficient cache lifetimes"
     * Savings: 1,134 KiB on repeat visits
     * 
     * Strategy:
     * - Vite assets (with hash): 1 year cache (immutable)
     * - Images: 1 month cache
     * - HTML: No cache (always fresh)
     * - API responses: No cache (dynamic)
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only set cache headers for successful responses
        if ($response->getStatusCode() !== 200) {
            return $response;
        }

        $path = $request->path();
        $contentType = $response->headers->get('Content-Type', '');

        // ⚡ VITE ASSETS: 1 year cache (immutable)
        // Files have content hash in filename (e.g., app-B08pedkc.js)
        // Safe to cache forever because hash changes when content changes
        if (str_starts_with($path, 'build/assets/')) {
            $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');
            $response->headers->set('Expires', gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
            return $response;
        }

        // ⚡ IMAGES: 1 month cache
        // Static images that rarely change
        if (preg_match('/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i', $path)) {
            $response->headers->set('Cache-Control', 'public, max-age=2592000'); // 30 days
            $response->headers->set('Expires', gmdate('D, d M Y H:i:s', time() + 2592000) . ' GMT');
            return $response;
        }

        // ⚡ FONTS: 1 year cache
        // Fonts rarely change
        if (preg_match('/\.(woff|woff2|ttf|eot|otf)$/i', $path)) {
            $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');
            $response->headers->set('Expires', gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
            return $response;
        }

        // ⚡ HTML: No cache (always fresh)
        // Ensures users always get the latest version
        if (str_contains($contentType, 'text/html')) {
            $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', '0');
            return $response;
        }

        // ⚡ API/JSON: No cache (dynamic data)
        if (str_contains($contentType, 'application/json') || str_starts_with($path, 'api/')) {
            $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', '0');
            return $response;
        }

        // Default: Short cache for other resources
        $response->headers->set('Cache-Control', 'public, max-age=3600'); // 1 hour

        return $response;
    }
}

