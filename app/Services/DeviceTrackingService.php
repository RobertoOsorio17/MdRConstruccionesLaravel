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
     *
     * Creates or updates a device record for the given user based on the current request.
     * Uses a deterministic device ID to identify the same device across sessions.
     *
     * @param User $user The user whose device is being tracked
     * @param Request $request The current HTTP request containing device information
     * @return UserDevice The created or updated device record
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
     *
     * Creates a deterministic SHA-256 hash based on browser, platform, and IP address.
     * The same device will always generate the same ID, allowing device recognition.
     *
     * @param Request $request The current HTTP request
     * @return string A SHA-256 hash representing the device
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
     *
     * Parses the user agent and request data to extract detailed device information
     * including browser, platform, IP address, and geolocation data.
     *
     * @param Request $request The current HTTP request
     * @return array Associative array with device details (device_type, browser, platform, etc.)
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
     *
     * Classifies the device as mobile, tablet, desktop, or unknown based on user agent.
     *
     * @param Agent $agent The Jenssegers Agent instance
     * @return string One of: 'mobile', 'tablet', 'desktop', 'unknown'
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
     * Uses ip-api.com free service with caching (45 requests/minute limit)
     * For production with high traffic, consider MaxMind GeoIP2 or similar paid service
     */
    protected function getCountryFromIp(string $ip): ?string
    {
        // For localhost/development
        if (in_array($ip, ['127.0.0.1', '::1', 'localhost'])) {
            return 'Local';
        }

        // ✅ IMPLEMENTED: Basic geolocation using ip-api.com with caching
        $geoData = $this->getGeoDataFromIp($ip);
        return $geoData['country'] ?? null;
    }

    /**
     * Get city from IP address.
     * Uses ip-api.com free service with caching (45 requests/minute limit)
     * For production with high traffic, consider MaxMind GeoIP2 or similar paid service
     */
    protected function getCityFromIp(string $ip): ?string
    {
        // For localhost/development
        if (in_array($ip, ['127.0.0.1', '::1', 'localhost'])) {
            return 'Local';
        }

        // ✅ IMPLEMENTED: Basic geolocation using ip-api.com with caching
        $geoData = $this->getGeoDataFromIp($ip);
        return $geoData['city'] ?? null;
    }

    /**
     * Get geolocation data from IP using ip-api.com with caching
     * Cache for 24 hours to avoid hitting rate limits
     *
     * @param string $ip
     * @return array
     */
    protected function getGeoDataFromIp(string $ip): array
    {
        $cacheKey = 'geo_ip_' . $ip;

        // Try to get from cache first
        // ✅ FIX: Only cache successful lookups, not failures
        $cached = \Cache::get($cacheKey);
        if ($cached !== null) {
            return $cached;
        }

        try {
            // ✅ SECURITY FIX: Use HTTPS instead of HTTP to prevent MITM attacks
            $response = \Http::timeout(3)->get("https://ip-api.com/json/{$ip}", [
                'fields' => 'status,country,city,lat,lon'
            ]);

            if ($response->successful() && $response->json('status') === 'success') {
                $geoData = [
                    'country' => $response->json('country'),
                    'city' => $response->json('city'),
                    'latitude' => $response->json('lat'),
                    'longitude' => $response->json('lon'),
                ];

                // ✅ FIX: Cache successful lookups for 24 hours
                \Cache::put($cacheKey, $geoData, 86400);

                return $geoData;
            }
        } catch (\Exception $e) {
            \Log::warning('Geolocation lookup failed', [
                'ip' => $ip,
                'error' => $e->getMessage()
            ]);
        }

        // ✅ FIX: Return empty array on failure (don't cache failures)
        return [];
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

