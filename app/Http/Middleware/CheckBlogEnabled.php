<?php

namespace App\Http\Middleware;

use App\Models\AdminSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Check if the blog module is enabled.
 * 
 * This middleware blocks access to blog routes when blog_enabled setting is false.
 */
class CheckBlogEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $blogEnabled = AdminSetting::getCachedValue('blog_enabled', true, 300);
        
        if (!$blogEnabled) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'El módulo de blog está deshabilitado temporalmente.',
                ], 403);
            }
            abort(403, 'El módulo de blog está deshabilitado temporalmente.');
        }
        
        return $next($request);
    }
}

