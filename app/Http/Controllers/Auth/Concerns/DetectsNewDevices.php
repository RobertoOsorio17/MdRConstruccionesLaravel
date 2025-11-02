<?php

namespace App\Http\Controllers\Auth\Concerns;

use App\Models\User;
use App\Notifications\NewDeviceLoginNotification;
use App\Services\SecurityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

trait DetectsNewDevices
{
    
    
    
    
    /**

    
    
    
     * Handle detect new device.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    protected function detectNewDevice(Request $request, User $user): bool
    {
        $fingerprint = hash('sha256', $request->userAgent() . '|' . $request->ip());

        $knownDevice = DB::table('user_devices')
            ->where('user_id', $user->id)
            ->where('fingerprint', $fingerprint)
            ->exists();

        if (!$knownDevice) {
            // Parse user agent
            $deviceInfo = $this->parseUserAgent($request->userAgent());

            // Register new device
            DB::table('user_devices')->insert([
                'user_id' => $user->id,
                'fingerprint' => $fingerprint,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'device_name' => $deviceInfo['device'],
                'browser' => $deviceInfo['browser'],
                'platform' => $deviceInfo['platform'],
                'first_seen' => now(),
                'last_seen' => now(),
            ]);

            // Notify user
            $user->notify(new NewDeviceLoginNotification([
                'ip' => $request->ip(),
                'device' => $deviceInfo['device'] . ' - ' . $deviceInfo['browser'],
                'location' => $this->getLocationFromIp($request->ip()),
            ]));

            // Log security event
            SecurityLogger::logSuspiciousActivity(
                'new_device_login',
                $user,
                [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'device' => $deviceInfo['device'],
                    'browser' => $deviceInfo['browser'],
                    'platform' => $deviceInfo['platform'],
                ]
            );

            return true;
        }

        // Update last_seen for known device
        DB::table('user_devices')
            ->where('user_id', $user->id)
            ->where('fingerprint', $fingerprint)
            ->update(['last_seen' => now()]);

        return false;
    }

    
    
    
    
    /**

    
    
    
     * Handle parse user agent.

    
    
    
     *

    
    
    
     * @param ?string $userAgent The userAgent.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    protected function parseUserAgent(?string $userAgent): array
    {
        if (empty($userAgent)) {
            return [
                'device' => 'Unknown Device',
                'browser' => 'Unknown Browser',
                'platform' => 'Unknown Platform',
            ];
        }

        // Detect platform
        $platform = 'Unknown';
        if (preg_match('/Windows NT (\d+\.\d+)/', $userAgent, $matches)) {
            $platform = 'Windows ' . $this->getWindowsVersion($matches[1]);
        } elseif (preg_match('/Mac OS X (\d+[_\d]*)/', $userAgent)) {
            $platform = 'macOS';
        } elseif (preg_match('/Linux/', $userAgent)) {
            $platform = 'Linux';
        } elseif (preg_match('/Android (\d+)/', $userAgent, $matches)) {
            $platform = 'Android ' . $matches[1];
        } elseif (preg_match('/iPhone OS (\d+[_\d]*)/', $userAgent, $matches)) {
            $platform = 'iOS ' . str_replace('_', '.', $matches[1]);
        }

        // Detect browser
        $browser = 'Unknown';
        if (preg_match('/Edg\/(\d+)/', $userAgent, $matches)) {
            $browser = 'Edge ' . $matches[1];
        } elseif (preg_match('/Chrome\/(\d+)/', $userAgent, $matches)) {
            $browser = 'Chrome ' . $matches[1];
        } elseif (preg_match('/Firefox\/(\d+)/', $userAgent, $matches)) {
            $browser = 'Firefox ' . $matches[1];
        } elseif (preg_match('/Safari\/(\d+)/', $userAgent, $matches)) {
            if (!preg_match('/Chrome/', $userAgent)) {
                $browser = 'Safari';
            }
        }

        // Detect device type
        $device = 'Desktop';
        if (preg_match('/Mobile|Android|iPhone/', $userAgent)) {
            $device = 'Mobile';
        } elseif (preg_match('/Tablet|iPad/', $userAgent)) {
            $device = 'Tablet';
        }

        return [
            'device' => $device,
            'browser' => $browser,
            'platform' => $platform,
        ];
    }

    
    
    
    
    /**

    
    
    
     * Get windows version.

    
    
    
     *

    
    
    
     * @param string $ntVersion The ntVersion.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    protected function getWindowsVersion(string $ntVersion): string
    {
        $versions = [
            '10.0' => '10/11',
            '6.3' => '8.1',
            '6.2' => '8',
            '6.1' => '7',
            '6.0' => 'Vista',
        ];

        return $versions[$ntVersion] ?? $ntVersion;
    }

    
    
    
    
    /**

    
    
    
     * Get location from ip.

    
    
    
     *

    
    
    
     * @param string $ip The ip.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    protected function getLocationFromIp(string $ip): string
    {
        // For localhost/private IPs
        if (in_array($ip, ['127.0.0.1', '::1']) || preg_match('/^192\.168\./', $ip) || preg_match('/^10\./', $ip)) {
            return 'Local Network';
        }

        // In production, integrate with GeoIP service:
        // $location = geoip($ip);
        // return $location->city . ', ' . $location->country;

        return 'Unknown Location';
    }
}

