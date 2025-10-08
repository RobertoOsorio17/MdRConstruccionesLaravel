<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserDevice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Jenssegers\Agent\Agent;

/**
 * Tracks devices interacting with user accounts, supporting trust decisions and session insights.
 * Generates deterministic device identifiers and exposes helpers for managing trusted hardware.
 */
class DeviceTrackingService
{
    /**
     * Track or update device information for a user.
     */
    public function trackDevice(User $user, Request $request): UserDevice
    {
        $deviceId = $this->generateDeviceId($request);
        $deviceInfo = $this->extractDeviceInfo($request);

        $device = UserDevice::updateOrCreate(
            [
                'user_id' => $user->id,
                'device_id' => $deviceId,
            ],
            array_merge($deviceInfo, [
                'last_used_at' => now(),
            ])
        );

        return $device;
    }

    /**
     * Generate a unique device identifier.
     */
    protected function generateDeviceId(Request $request): string
    {
        $agent = new Agent();
        $agent->setUserAgent($request->userAgent());

        $components = [
            $agent->browser(),
            $agent->version($agent->browser()),
            $agent->platform(),
            $agent->version($agent->platform()),
            $request->ip(),
        ];

        return hash('sha256', implode('|', $components));
    }

    /**
     * Extract device information from request.
     */
    protected function extractDeviceInfo(Request $request): array
    {
        $agent = new Agent();
        $agent->setUserAgent($request->userAgent());

        return [
            'device_type' => $this->getDeviceType($agent),
            'browser' => $agent->browser(),
            'browser_version' => $agent->version($agent->browser()),
            'platform' => $agent->platform(),
            'platform_version' => $agent->version($agent->platform()),
            'ip_address' => $request->ip(),
            'country' => $this->getCountryFromIp($request->ip()),
            'city' => $this->getCityFromIp($request->ip()),
        ];
    }

    /**
     * Determine device type.
     */
    protected function getDeviceType(Agent $agent): string
    {
        if ($agent->isPhone()) {
            return 'mobile';
        }

        if ($agent->isTablet()) {
            return 'tablet';
        }

        if ($agent->isDesktop()) {
            return 'desktop';
        }

        return 'unknown';
    }

    /**
     * Get country from IP address.
     * In production, use a service like MaxMind GeoIP2 or ip-api.com
     */
    protected function getCountryFromIp(string $ip): ?string
    {
        // For localhost/development
        if (in_array($ip, ['127.0.0.1', '::1', 'localhost'])) {
            return 'Local';
        }

        // TODO: Implement actual geolocation service
        // Example: Use MaxMind GeoIP2 or ip-api.com
        return null;
    }

    /**
     * Get city from IP address.
     * In production, use a service like MaxMind GeoIP2 or ip-api.com
     */
    protected function getCityFromIp(string $ip): ?string
    {
        // For localhost/development
        if (in_array($ip, ['127.0.0.1', '::1', 'localhost'])) {
            return 'Local';
        }

        // TODO: Implement actual geolocation service
        return null;
    }

    /**
     * Check if device is new for the user.
     */
    public function isNewDevice(User $user, Request $request): bool
    {
        $deviceId = $this->generateDeviceId($request);

        return !UserDevice::where('user_id', $user->id)
            ->where('device_id', $deviceId)
            ->exists();
    }

    /**
     * Get all devices for a user.
     */
    public function getUserDevices(User $user)
    {
        return UserDevice::where('user_id', $user->id)
            ->orderBy('last_used_at', 'desc')
            ->get();
    }

    /**
     * Remove old inactive devices.
     */
    public function removeInactiveDevices(User $user, int $days = 90): int
    {
        return UserDevice::where('user_id', $user->id)
            ->where('last_used_at', '<', now()->subDays($days))
            ->where('is_trusted', false)
            ->delete();
    }

    /**
     * Trust a device.
     */
    public function trustDevice(UserDevice $device): void
    {
        $device->markAsTrusted();
    }

    /**
     * Untrust a device.
     */
    public function untrustDevice(UserDevice $device): void
    {
        $device->markAsUntrusted();
    }

    /**
     * Remove a device.
     */
    public function removeDevice(UserDevice $device): void
    {
        $device->delete();
    }

    /**
     * Get active devices count.
     */
    public function getActiveDevicesCount(User $user): int
    {
        return UserDevice::where('user_id', $user->id)
            ->active()
            ->count();
    }

    /**
     * Get trusted devices count.
     */
    public function getTrustedDevicesCount(User $user): int
    {
        return UserDevice::where('user_id', $user->id)
            ->trusted()
            ->count();
    }
}

