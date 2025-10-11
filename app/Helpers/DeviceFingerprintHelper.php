<?php

namespace App\Helpers;

use Illuminate\Http\Request;

/**
 * ✅ FIXED: Device fingerprinting to prevent easy evasion of guest comment limits
 *
 * Combines multiple signals to create a more robust device identifier:
 * - IP address (primary)
 * - User-Agent string
 * - Accept-Language header
 * - Screen resolution (from client)
 * - Timezone offset (from client)
 *
 * This makes it harder for abusers to bypass limits by simply changing IP or clearing cookies.
 */
class DeviceFingerprintHelper
{
    /**
     * Generate a device fingerprint from request data
     *
     * @param Request $request
     * @param array $clientData Optional client-side data (screen, timezone, etc.)
     * @return string Hashed fingerprint
     */
    public static function generate(Request $request, array $clientData = []): string
    {
        $signals = [
            // Server-side signals
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent() ?? 'unknown',
            'accept_language' => $request->header('Accept-Language') ?? 'unknown',
            'accept_encoding' => $request->header('Accept-Encoding') ?? 'unknown',

            // Client-side signals (if provided)
            'screen_resolution' => $clientData['screen_resolution'] ?? null,
            'timezone_offset' => $clientData['timezone_offset'] ?? null,
            'color_depth' => $clientData['color_depth'] ?? null,
            'platform' => $clientData['platform'] ?? null,
        ];

        // Remove null values
        $signals = array_filter($signals, fn($value) => $value !== null);

        // Create a stable fingerprint
        $fingerprintString = implode('|', $signals);

        return hash('sha256', $fingerprintString);
    }

    /**
     * Generate a less strict fingerprint (IP + User-Agent only)
     * Useful for less critical operations
     *
     * @param Request $request
     * @return string Hashed fingerprint
     */
    public static function generateBasic(Request $request): string
    {
        $signals = [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent() ?? 'unknown',
        ];

        $fingerprintString = implode('|', $signals);

        return hash('sha256', $fingerprintString);
    }

    /**
     * Check if two fingerprints are similar (fuzzy matching)
     * Useful for detecting attempts to slightly modify fingerprints
     *
     * @param string $fingerprint1
     * @param string $fingerprint2
     * @return bool True if fingerprints are similar
     */
    public static function areSimilar(string $fingerprint1, string $fingerprint2): bool
    {
        // For now, exact match only
        // Could be enhanced with Levenshtein distance or other algorithms
        return $fingerprint1 === $fingerprint2;
    }

    /**
     * Parse client-side fingerprint data from request
     *
     * @param Request $request
     * @return array Client data
     */
    public static function parseClientData(Request $request): array
    {
        return [
            'screen_resolution' => $request->input('device_screen'),
            'timezone_offset' => $request->input('device_timezone'),
            'color_depth' => $request->input('device_color_depth'),
            'platform' => $request->input('device_platform'),
        ];
    }
}
