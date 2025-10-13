<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AdminSetting;
use Carbon\Carbon;

/**
 * Check if the application is in maintenance mode.
 * 
 * This middleware checks the database-driven maintenance mode setting
 * and blocks access to non-whitelisted users while allowing admins
 * and whitelisted IPs to access the application.
 */
class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip check for admin routes (admins should always have access)
        if ($request->is('admin/*') || $request->is('login') || $request->is('logout')) {
            return $next($request);
        }

        // Get maintenance mode settings from database
        $maintenanceMode = AdminSetting::getCachedValue('maintenance_mode', false, 60);
        
        // If maintenance mode is not enabled, continue normally
        if (!$maintenanceMode) {
            return $next($request);
        }

        // Check if maintenance is scheduled
        $startAt = AdminSetting::getCachedValue('maintenance_start_at', null, 60);
        $endAt = AdminSetting::getCachedValue('maintenance_end_at', null, 60);

        // If scheduled and not yet started, continue normally
        if ($startAt && Carbon::parse($startAt)->isFuture()) {
            return $next($request);
        }

        // If scheduled and already ended, continue normally
        if ($endAt && Carbon::parse($endAt)->isPast()) {
            return $next($request);
        }

        // Check if admin access is allowed
        $allowAdmin = AdminSetting::getCachedValue('maintenance_allow_admin', true, 60);
        if ($allowAdmin && auth()->check() && $this->isAdmin($request->user())) {
            return $next($request);
        }

        // Check if current IP is whitelisted
        $allowedIps = AdminSetting::getCachedValue('maintenance_allowed_ips', [], 60);
        if (is_string($allowedIps)) {
            $allowedIps = json_decode($allowedIps, true) ?? [];
        }

        $clientIp = $request->ip();
        if (in_array($clientIp, $allowedIps)) {
            return $next($request);
        }

        // User is not allowed, show maintenance page
        return $this->showMaintenancePage($request);
    }

    /**
     * Check if the user is an administrator.
     *
     * @param \App\Models\User|null $user
     * @return bool
     */
    private function isAdmin($user): bool
    {
        if (!$user) {
            return false;
        }

        // Check if user has admin role
        if ($user->roles()->where('name', 'admin')->exists()) {
            return true;
        }

        // Check legacy role field
        if (isset($user->role) && $user->role === 'admin') {
            return true;
        }

        return false;
    }

    /**
     * Show the maintenance page.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    private function showMaintenancePage(Request $request): Response
    {
        // Get maintenance settings
        $message = AdminSetting::getCachedValue(
            'maintenance_message',
            'Estamos realizando mejoras en nuestro sitio. Volveremos pronto.',
            60
        );
        
        $showCountdown = AdminSetting::getCachedValue('maintenance_show_countdown', true, 60);
        $endAt = AdminSetting::getCachedValue('maintenance_end_at', null, 60);
        $retryAfter = AdminSetting::getCachedValue('maintenance_retry_after', 3600, 60);

        // Prepare data for the view
        $data = [
            'message' => $message,
            'show_countdown' => $showCountdown,
            'end_at' => $endAt,
            'site_name' => AdminSetting::getCachedValue('site_name', 'MDR Construcciones', 3600),
        ];

        // Set Retry-After header for SEO
        $response = response()->view('maintenance', $data, 503);
        $response->header('Retry-After', $retryAfter);

        return $response;
    }
}

