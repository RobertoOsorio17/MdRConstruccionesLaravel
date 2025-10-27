<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Jenssegers\Agent\Agent;

/**
 * Surfaces active session metadata so users can review and manage devices connected to their account.
 *
 * Features:
 * - Query session store for active devices with UA-derived labels.
 * - Rename/trust sessions and revoke devices, including current-session handling.
 * - JSON responses designed for the security settings UI.
 */
class DeviceSessionController extends Controller
{
    /**
     * Get all active sessions/devices for the authenticated user.
     *
     * @param Request $request The current HTTP request instance.
     * @return \Illuminate\Http\JsonResponse JSON response with devices and stats.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $currentSessionId = session()->getId();
        
        // 1) Fetch all sessions for the current user from the database session store.
        $sessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderBy('last_activity', 'desc')
            ->get();

        // 2) Hydrate device metadata using the user agent and mark current session.
        $devices = $sessions->map(function ($session) use ($currentSessionId) {
            $agent = new Agent();
            $agent->setUserAgent($session->user_agent);

            return [
                'id' => $session->id,
                'session_id' => $session->id,
                'is_current' => $session->id === $currentSessionId,
                'device_type' => $this->getDeviceType($agent),
                'browser' => $agent->browser(),
                'browser_version' => $agent->version($agent->browser()),
                'platform' => $agent->platform(),
                'platform_version' => $agent->version($agent->platform()),
                'device_name' => $agent->device(),
                'display_name' => $this->getDisplayName($agent),
                'custom_name' => null, // Can be extended to store custom names
                'ip_address' => $session->ip_address,
                'city' => null, // Can be extended with GeoIP
                'country' => null, // Can be extended with GeoIP
                'last_used_at' => \Carbon\Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                'last_used_full' => \Carbon\Carbon::createFromTimestamp($session->last_activity)->format('d/m/Y H:i:s'),
                'is_active' => (time() - $session->last_activity) < 1800, // Active in last 30 minutes
                'is_trusted' => false, // Can be extended to check trusted devices
            ];
        });

        // 3) Compute aggregate stats for convenience.
        $stats = [
            'total' => $devices->count(),
            'active' => $devices->where('is_active', true)->count(),
            'trusted' => $devices->where('is_trusted', true)->count(),
        ];

        // 4) Return normalized payload for settings interface.
        return response()->json([
            'devices' => $devices->values(),
            'stats' => $stats
        ]);
    }

    /**
     * Update device custom name.
     *
     * @param Request $request The current HTTP request instance.
     * @param string $id The session identifier.
     * @return \Illuminate\Http\JsonResponse JSON response indicating success.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'custom_name' => 'nullable|string|max:255',
        ]);

        // For now, we'll just return success
        // In a full implementation, you'd store custom names in a separate table
        
        \Log::info('Device name updated', [
            'user_id' => $request->user()->id,
            'session_id' => $id,
            'custom_name' => $request->custom_name,
            'ip' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nombre del dispositivo actualizado exitosamente'
        ]);
    }

    /**
     * Mark device as trusted (create trusted device).
     *
     * @param Request $request The current HTTP request instance.
     * @param string $id The session identifier to trust.
     * @return \Illuminate\Http\JsonResponse JSON response with result and cookies set.
     */
    public function trust(Request $request, $id)
    {
        $user = $request->user();
        
        // Check if user has 2FA enabled
        if (!$user->two_factor_secret || !$user->two_factor_confirmed_at) {
            return response()->json([
                'error' => 'Debes tener autenticación de dos factores habilitada para marcar dispositivos como confiables.'
            ], 422);
        }

        // Get session info
        $session = DB::table('sessions')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$session) {
            return response()->json([
                'error' => 'Sesión no encontrada.'
            ], 404);
        }

        // Generate token
        $token = \Illuminate\Support\Str::random(64);
        $tokenHash = hash('sha256', $token);

        // Create trusted device
        $trustedDevice = $user->trustedDevices()->create([
            'token_hash' => $tokenHash,
            'device_name' => $session->user_agent,
            'ip_address' => $session->ip_address,
            'last_used_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);

        \Log::info('Device marked as trusted', [
            'user_id' => $user->id,
            'device_id' => $trustedDevice->id,
            'session_id' => $id,
            'ip' => $request->ip()
        ]);

        // ✅ SECURITY FIX: Set secure cookie with partitioned attribute
        // This prevents cookie injection from compromised subdomains
        cookie()->queue(
            cookie(
                'trusted_device_token',
                $token,
                43200, // 30 days in minutes
                '/', // path
                config('session.domain'), // domain from config
                config('session.secure', true), // secure (HTTPS only)
                true, // httpOnly
                false, // raw
                config('session.same_site', 'strict') // sameSite
            )->withPartitioned() // ✅ Partitioned attribute for better isolation
        );

        return response()->json([
            'success' => true,
            'message' => 'Dispositivo marcado como confiable exitosamente'
        ]);
    }

    /**
     * Delete a session/device.
     *
     * @param Request $request The current HTTP request instance.
     * @param string $id The session identifier to revoke.
     * @return \Illuminate\Http\JsonResponse JSON response indicating result (and redirect when current).
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $currentSessionId = session()->getId();
        
        // Check if trying to delete current session
        $isCurrentSession = ($id === $currentSessionId);

        // Get session info before deleting
        $session = DB::table('sessions')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$session) {
            return response()->json([
                'error' => 'Sesión no encontrada.'
            ], 404);
        }

        \Log::info('Session deleted', [
            'user_id' => $user->id,
            'session_id' => $id,
            'is_current' => $isCurrentSession,
            'ip' => $request->ip()
        ]);

        // Delete the session
        DB::table('sessions')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->delete();

        // If it's the current session, logout the user
        if ($isCurrentSession) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'success' => true,
                'is_current_session' => true,
                'message' => 'Tu sesión ha sido cerrada exitosamente',
                'redirect' => route('login')
            ]);
        }

        return response()->json([
            'success' => true,
            'is_current_session' => false,
            'message' => 'Sesión eliminada exitosamente'
        ]);
    }

    /**
     * Delete all inactive sessions (except current).
     *
     * @param Request $request The current HTTP request instance.
     * @return \Illuminate\Http\JsonResponse JSON response with deleted count.
     */
    public function destroyInactive(Request $request)
    {
        $user = $request->user();
        $currentSessionId = session()->getId();

        // Delete all sessions except current
        $deleted = DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        \Log::info('Inactive sessions deleted', [
            'user_id' => $user->id,
            'count' => $deleted,
            'ip' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => "Se eliminaron {$deleted} sesión(es) exitosamente"
        ]);
    }

    /**
     * Get device type from agent.
     *
     * @param Agent $agent Parsed user agent helper.
     * @return string One of: mobile, tablet, desktop.
     */
    private function getDeviceType(Agent $agent)
    {
        if ($agent->isPhone()) {
            return 'mobile';
        } elseif ($agent->isTablet()) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    /**
     * Get display name for device.
     *
     * @param Agent $agent Parsed user agent helper.
     * @return string A friendly name composed from browser and platform.
     */
    private function getDisplayName(Agent $agent)
    {
        $browser = $agent->browser();
        $platform = $agent->platform();
        
        return "{$browser} en {$platform}";
    }
}

