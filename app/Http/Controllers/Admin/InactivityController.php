<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

/**
 * Controller that handles inactivity detection for the admin panel.
 *
 * Features:
 * - Heartbeat to keep the session alive.
 * - Inactivity logout logging.
 * - Inactivity event auditing.
 */
class InactivityController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Handle heartbeat.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function heartbeat(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        if (!$user->hasRole(['admin', 'moderator', 'editor'])) {
            $resolvedRoles = method_exists($user, 'roles')
                ? $user->roles()->pluck('name')->toArray()
                : array_filter([$user->role]);

            Log::warning('Heartbeat attempt from non-admin user', [
                'user_id' => $user->id,
                'roles' => $resolvedRoles,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado'
            ], 403);
        }

        // ✅ REMOVED: Redundant status/banned check - now handled by global middlewares
        // - CheckMLBlocked middleware handles ml_blocked
        // - EnhancedAuthMiddleware handles isBanned()
        // - CheckUserStatus middleware handles 'suspended' status
        // Banned/suspended users will never reach this point

        $currentIp = $request->ip();
        $sessionIp = Session::get('login_ip');

        if ($sessionIp && $sessionIp !== $currentIp) {
            Log::warning('IP address changed during session', [
                'user_id' => $user->id,
                'session_ip' => $sessionIp,
                'current_ip' => $currentIp,
                'user_agent' => $request->userAgent()
            ]);

            AdminAuditLog::logAction([
                'action' => 'suspicious_ip_change',
                'model_type' => 'User',
                'model_id' => $user->id,
                'severity' => 'high',
                'description' => "Cambio de IP detectado durante sesiÃ³n activa de {$user->name}",
                'metadata' => [
                    'user_id' => $user->id,
                    'original_ip' => $sessionIp,
                    'new_ip' => $currentIp,
                    'user_agent' => $request->userAgent()
                ]
            ]);
            if (config('admin.logout_on_ip_change', false)) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return response()->json([
                    'success' => false,
                    'message' => 'SesiÃ³n cerrada por cambio de IP. Por favor, inicia sesiÃ³n nuevamente.',
                    'force_logout' => true
                ], 401);
            }
        }

        $currentUserAgent = $request->userAgent();
        $sessionUserAgent = Session::get('login_user_agent');

        if ($sessionUserAgent && $sessionUserAgent !== $currentUserAgent) {
            Log::warning('User agent changed during session', [
                'user_id' => $user->id,
                'session_ua' => $sessionUserAgent,
                'current_ua' => $currentUserAgent,
                'ip' => $currentIp
            ]);

            AdminAuditLog::logAction([
                'action' => 'suspicious_user_agent_change',
                'model_type' => 'User',
                'model_id' => $user->id,
                'severity' => 'medium',
                'description' => "Cambio de User Agent detectado durante sesiÃ³n de {$user->name}",
                'metadata' => [
                    'user_id' => $user->id,
                    'original_ua' => $sessionUserAgent,
                    'new_ua' => $currentUserAgent,
                    'ip' => $currentIp
                ]
            ]);
        }

        if (!config('admin.allow_concurrent_sessions', false)) {
            $sessionId = Session::getId();
            $storedSessionId = cache()->get("user_session_{$user->id}");

            /**
             * SECURITY FIX: Handle concurrent sessions intelligently.
             * Only reject if there's a stored session AND it's different AND it's still active.
             */
            if ($storedSessionId && $storedSessionId !== $sessionId) {
                /**
                 * Check if the stored session is still active in the database.
                 */
                $storedSession = DB::table('sessions')
                    ->where('id', $storedSessionId)
                    ->where('user_id', $user->id)
                    ->where('last_activity', '>', now()->subMinutes(config('session.lifetime', 120))->timestamp)
                    ->first();

                if ($storedSession) {
                    /**
                     * Get IP and User-Agent from both sessions.
                     */
                    $storedIp = null;
                    $storedUserAgent = null;

                    try {
                        /**
                         * Try to decode session payload.
                         */
                        $storedSessionData = unserialize(base64_decode($storedSession->payload));
                        $storedIp = $storedSessionData['login_ip'] ?? null;
                        $storedUserAgent = $storedSessionData['login_user_agent'] ?? null;
                    } catch (\Exception $e) {
                        Log::warning('Failed to decode stored session payload', [
                            'user_id' => $user->id,
                            'stored_session' => $storedSessionId,
                            'error' => $e->getMessage()
                        ]);
                    }

                    $currentIpAddress = $request->ip();
                    $currentUserAgent = $request->userAgent();

                    /**
                     * SECURITY: Check if sessions are from same device (IP + User-Agent match).
                     * If we can't decode the stored session, assume same device to avoid false positives.
                     */
                    $sameDevice = ($storedIp === null && $storedUserAgent === null) ||
                                  (($storedIp === $currentIpAddress) && ($storedUserAgent === $currentUserAgent));

                    if ($sameDevice) {
                        /**
                         * Same device - likely user refreshed or cleared cookies.
                         * Invalidate old session and accept new one.
                         */
                        Log::info('Invalidating old session from same device', [
                            'user_id' => $user->id,
                            'old_session' => $storedSessionId,
                            'new_session' => $sessionId,
                            'ip' => $currentIpAddress
                        ]);

                        /**
                         * Delete old session from database.
                         */
                        DB::table('sessions')->where('id', $storedSessionId)->delete();
                    } else {
                        /**
                         * Different device - potential session hijacking.
                         */
                        Log::warning('Concurrent session from different device detected', [
                            'user_id' => $user->id,
                            'stored_session' => $storedSessionId,
                            'stored_ip' => $storedIp,
                            'current_session' => $sessionId,
                            'current_ip' => $currentIpAddress
                        ]);

                        /**
                         * Log security event.
                         */
                        app(\App\Services\SecurityLogger::class)->logSuspiciousActivity(
                            $user,
                            'concurrent_session_different_device',
                            'Concurrent session detected from different IP address',
                            [
                                'stored_ip' => $storedIp,
                                'current_ip' => $currentIpAddress,
                                'stored_session' => $storedSessionId,
                                'current_session' => $sessionId
                            ]
                        );

                        return response()->json([
                            'success' => false,
                            'message' => 'Se ha detectado otra sesiÃ³n activa desde un dispositivo diferente. Por seguridad, debes cerrar la otra sesiÃ³n primero.',
                            'force_logout' => true,
                            'security_alert' => true,
                            'other_session_ip' => $storedIp ? substr($storedIp, 0, -5) . 'xxxxx' : 'desconocida'
                        ], 409);
                    }
                } else {
                    /**
                     * Stored session is expired/invalid, update to current session.
                     */
                    Log::info('Updating expired session ID in cache', [
                        'user_id' => $user->id,
                        'old_session' => $storedSessionId,
                        'new_session' => $sessionId
                    ]);
                }
            }

            cache()->put("user_session_{$user->id}", $sessionId, now()->addHours(8));
        }

        Session::put('last_activity', now()->timestamp);
        $user->update([
            'last_active_at' => now()
        ]);

        Log::info('Admin heartbeat received', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'ip_address' => $currentIp,
            'timestamp' => $request->input('timestamp')
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Heartbeat recibido',
            'server_time' => now()->timestamp,
            'session_expires_at' => Session::get('last_activity') + config('session.lifetime') * 60,
            'user_status' => $user->status
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle logout inactivity.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function logoutInactivity(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => true,
                'message' => 'SesiÃ³n ya cerrada'
            ]);
        }

        $validated = $request->validate([
            'reason' => 'required|string|in:inactivity_timeout,manual_logout',
            'timestamp' => 'required|integer'
        ]);

        AdminAuditLog::logAction([
            'action' => 'logout_inactivity',
            'model_type' => 'User',
            'model_id' => $user->id,
            'severity' => 'low',
            'description' => "Usuario {$user->name} cerrÃ³ sesiÃ³n por inactividad",
            'metadata' => [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'reason' => $validated['reason'],
                'client_timestamp' => $validated['timestamp'],
                'server_timestamp' => now()->timestamp,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'session_duration' => Session::get('last_activity') 
                    ? (now()->timestamp - Session::get('last_activity')) 
                    : null
            ]
        ]);

        Log::info('Admin logout by inactivity', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'reason' => $validated['reason'],
            'ip_address' => $request->ip()
        ]);

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'SesiÃ³n cerrada por inactividad'
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Get config.

    
    
    
     *

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function getConfig(): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['admin', 'moderator'])) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado'
            ], 403);
        }
        $config = [
            'inactivity_timeout' => config('admin.inactivity_timeout', 15 * 60 * 1000),
            'warning_time' => config('admin.inactivity_warning_time', 3 * 60 * 1000),
            'heartbeat_interval' => config('admin.heartbeat_interval', 2 * 60 * 1000),
            'enabled' => config('admin.inactivity_detection_enabled', true)
        ];

        return response()->json([
            'success' => true,
            'config' => $config
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle update config.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return JsonResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function updateConfig(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Solo administradores pueden cambiar esta configuraciÃ³n'
            ], 403);
        }

        $validated = $request->validate([
            'inactivity_timeout' => 'nullable|integer|min:60000|max:3600000',
            'warning_time' => 'nullable|integer|min:30000|max:600000',
            'heartbeat_interval' => 'nullable|integer|min:30000|max:600000',
            'enabled' => 'nullable|boolean'
        ]);

        AdminAuditLog::logAction([
            'action' => 'update_inactivity_config',
            'model_type' => 'SystemConfig',
            'model_id' => null,
            'severity' => 'medium',
            'description' => "Usuario {$user->name} actualizÃ³ configuraciÃ³n de inactividad",
            'metadata' => [
                'user_id' => $user->id,
                'changes' => $validated,
                'ip_address' => $request->ip()
            ]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'ConfiguraciÃ³n actualizada correctamente',
            'config' => $validated
        ]);
    }
}
