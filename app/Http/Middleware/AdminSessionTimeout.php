<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Carbon\Carbon;

/**
 * Apply admin session middleware logic.
 */
class AdminSessionTimeout
{
    /**
     * Admin session timeout in minutes
     * ✅ SECURITY FIX: Reduced from 60 to 15 minutes for admin panel
     */
    private const ADMIN_TIMEOUT = 15; // 15 minutes (industry standard for admin panels)

    /**
     * Warning threshold in minutes before timeout
     * ✅ SECURITY FIX: Reduced from 10 to 3 minutes
     */
    private const WARNING_THRESHOLD = 3; // 3 minutes warning before timeout

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only apply to admin routes and authenticated users
        if (!$request->is('admin/*') || !Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();
        
        // Only apply to admin users
        if (!$this->isAdminUser($user)) {
            return $next($request);
        }

        $lastActivity = Session::get('admin_last_activity');
        $now = Carbon::now();

        // If no last activity recorded, set it now
        if (!$lastActivity) {
            Session::put('admin_last_activity', $now->timestamp);
            return $next($request);
        }

        $lastActivityTime = Carbon::createFromTimestamp($lastActivity);
        $minutesSinceLastActivity = $now->diffInMinutes($lastActivityTime);

        // Check if session has timed out
        if ($minutesSinceLastActivity >= self::ADMIN_TIMEOUT) {
            $this->logTimeout($user, $request);
            
            Auth::logout();
            Session::flush();
            
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'SesiÃƒÆ’Ã‚Â³n expirada por inactividad',
                    'timeout' => true
                ], 401);
            }
            
            return redirect()->route('login')
                ->with('error', 'Tu sesiÃƒÆ’Ã‚Â³n ha expirado por inactividad. Por favor, inicia sesiÃƒÆ’Ã‚Â³n nuevamente.');
        }

        // Update last activity
        Session::put('admin_last_activity', $now->timestamp);

        // Add timeout warning to response if close to timeout
        $response = $next($request);
        
        if ($minutesSinceLastActivity >= (self::ADMIN_TIMEOUT - self::WARNING_THRESHOLD)) {
            $remainingMinutes = self::ADMIN_TIMEOUT - $minutesSinceLastActivity;
            
            if ($request->expectsJson()) {
                $response->headers->set('X-Session-Warning', $remainingMinutes);
            } else {
                // Add warning to session for display in UI
                Session::flash('session_warning', [
                    'remaining_minutes' => $remainingMinutes,
                    'message' => "Tu sesiÃƒÆ’Ã‚Â³n expirarÃƒÆ’Ã‚Â¡ en {$remainingMinutes} minutos por inactividad."
                ]);
            }
        }

        return $response;
    }

    /**
     * Check if user is admin
     */
    private function isAdminUser($user): bool
    {
        return $user && ($user->role === 'admin' || $user->hasPermission('dashboard.access'));
    }

    /**
     * Log session timeout
     */
    private function logTimeout($user, Request $request): void
    {
        try {
            \App\Models\AdminAuditLog::create([
                'user_id' => $user->id,
                'action' => 'session_timeout',
                'severity' => 'medium',
                'description' => "Admin session timed out due to inactivity",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'session_id' => session()->getId(),
                'route_name' => $request->route()?->getName(),
                'url' => $request->fullUrl(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to log admin session timeout', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
