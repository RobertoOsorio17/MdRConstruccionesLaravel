<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CompressResponse
{
    /**
     * Handle an incoming request.
     *
     * ⚡ PERFORMANCE: Compress responses with gzip
     * 
     * Lighthouse recommendation: "Document request latency - compression was applied"
     * Savings: 91 KiB on document request
     * 
     * Strategy:
     * - Compress HTML, JSON, CSS, JS, XML, SVG
     * - Skip already compressed content (images, videos, fonts)
     * - Only compress if client supports gzip (Accept-Encoding header)
     * - Only compress responses > 1KB (small responses not worth compressing)
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only compress successful responses
        if ($response->getStatusCode() !== 200) {
            return $response;
        }

        // Check if client supports gzip
        $acceptEncoding = $request->header('Accept-Encoding', '');
        if (!str_contains($acceptEncoding, 'gzip')) {
            return $response;
        }

        // Check if response is already compressed
        if ($response->headers->has('Content-Encoding')) {
            return $response;
        }

        $contentType = $response->headers->get('Content-Type', '');
        
        // Only compress text-based content types
        $compressibleTypes = [
            'text/html',
            'text/css',
            'text/javascript',
            'text/xml',
            'text/plain',
            'application/json',
            'application/javascript',
            'application/xml',
            'application/xhtml+xml',
            'application/rss+xml',
            'application/atom+xml',
            'image/svg+xml',
        ];

        $shouldCompress = false;
        foreach ($compressibleTypes as $type) {
            if (str_contains($contentType, $type)) {
                $shouldCompress = true;
                break;
            }
        }

        if (!$shouldCompress) {
            return $response;
        }

        // Get response content
        $content = $response->getContent();
        
        // Only compress if content is larger than 1KB
        if (strlen($content) < 1024) {
            return $response;
        }

        // Compress with gzip (level 6 is a good balance between speed and compression)
        $compressed = gzencode($content, 6);

        if ($compressed === false) {
            // Compression failed, return original response
            return $response;
        }

        // Set compressed content
        $response->setContent($compressed);
        
        // Set compression headers
        $response->headers->set('Content-Encoding', 'gzip');
        $response->headers->set('Content-Length', strlen($compressed));
        $response->headers->set('Vary', 'Accept-Encoding');

        return $response;
    }
}

