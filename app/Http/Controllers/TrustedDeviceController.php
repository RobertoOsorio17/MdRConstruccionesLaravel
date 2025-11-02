<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Manages the trusted device roster attached to an account, enabling revocation and password-protected actions.
 *
 * Features:
 * - List, revoke one, or revoke all trusted devices.
 * - Password confirmation for sensitive actions.
 * - Recovery code regeneration helper for 2FA workflows.
 */
class TrustedDeviceController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Display a listing of the resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function index(Request $request)
    {
        $devices = $request->user()
            ->trustedDevices()
            ->orderBy('last_used_at', 'desc')
            ->get()
            ->map(function ($device) {
                return [
                    'id' => $device->id,
                    'device_name' => $this->parseUserAgent($device->device_name),
                    'ip_address' => $device->ip_address,
                    'last_used_at' => $device->last_used_at->diffForHumans(),
                    'last_used_full' => $device->last_used_at->format('d/m/Y H:i:s'),
                    'expires_at' => $device->expires_at->format('d/m/Y'),
                    'is_current' => $device->ip_address === request()->ip(),
                    'is_expired' => $device->isExpired(),
                ];
            });

        return response()->json(['devices' => $devices]);
    }

    
    
    
    
    /**

    
    
    
     * Remove the specified resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param mixed $id The id.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function destroy(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        if (!Hash::check($request->password, $request->user()->password)) {
            return response()->json([
                'errors' => ['password' => 'La contraseña es incorrecta.']
            ], 422);
        }

        $device = $request->user()
            ->trustedDevices()
            ->findOrFail($id);

        \Log::info('Trusted device revoked', [
            'user_id' => $request->user()->id,
            'device_id' => $device->id,
            'device_name' => $device->device_name,
            'ip' => $request->ip()
        ]);

        $device->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dispositivo revocado exitosamente'
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle destroy all.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function destroyAll(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        if (!Hash::check($request->password, $request->user()->password)) {
            return response()->json([
                'errors' => ['password' => 'La contraseña es incorrecta.']
            ], 422);
        }

        $count = $request->user()->trustedDevices()->count();

        \Log::info('All trusted devices revoked', [
            'user_id' => $request->user()->id,
            'count' => $count,
            'ip' => $request->ip()
        ]);

        $request->user()->trustedDevices()->delete();

        // Clear cookie
        cookie()->queue(cookie()->forget('trusted_device_token'));

        return response()->json([
            'success' => true,
            'message' => "Se revocaron {$count} dispositivo(s) exitosamente"
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle regenerate recovery codes.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function regenerateRecoveryCodes(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        if (!Hash::check($request->password, $request->user()->password)) {
            return response()->json([
                'errors' => ['password' => 'La contraseña es incorrecta.']
            ], 422);
        }

        $user = $request->user();

        // Generate new recovery codes
        $recoveryCodes = collect(range(1, 8))->map(function () {
            return Str::random(10) . '-' . Str::random(10);
        })->toArray();

        $user->forceFill([
            'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes)),
        ])->save();

        \Log::info('Recovery codes regenerated', [
            'user_id' => $user->id,
            'ip' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'recovery_codes' => $recoveryCodes,
            'message' => 'Códigos de recuperación regenerados exitosamente'
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle parse user agent.

    
    
    
     *

    
    
    
     * @param mixed $userAgent The userAgent.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function parseUserAgent($userAgent)
    {
        // Simple parsing - you can use a library like jenssegers/agent for better parsing
        $browser = 'Navegador Desconocido';
        $os = 'Sistema Desconocido';

        // Detect browser
        if (str_contains($userAgent, 'Chrome')) $browser = 'Chrome';
        elseif (str_contains($userAgent, 'Firefox')) $browser = 'Firefox';
        elseif (str_contains($userAgent, 'Safari')) $browser = 'Safari';
        elseif (str_contains($userAgent, 'Edge')) $browser = 'Edge';
        elseif (str_contains($userAgent, 'Opera')) $browser = 'Opera';

        // Detect OS
        if (str_contains($userAgent, 'Windows')) $os = 'Windows';
        elseif (str_contains($userAgent, 'Mac')) $os = 'macOS';
        elseif (str_contains($userAgent, 'Linux')) $os = 'Linux';
        elseif (str_contains($userAgent, 'Android')) $os = 'Android';
        elseif (str_contains($userAgent, 'iOS')) $os = 'iOS';

        return "{$browser} en {$os}";
    }
}
