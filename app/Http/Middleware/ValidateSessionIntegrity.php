<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Validates session integrity by checking critical authentication data.
 *
 * This middleware protects against session hijacking and tampering by:
 * - Validating only CRITICAL session data (user_id, roles, permissions)
 * - Allowing dynamic changes to non-critical data (activity tracking, 2FA setup, etc.)
 * - Detecting unauthorized changes to authentication state
 * - Providing detailed logging for security auditing
 *
 * Design Philosophy:
 * - Only validate what matters for security (authentication & authorization)
 * - Allow legitimate session changes (feature flags, UI state, tracking data)
 * - Fail gracefully with clear error messages
 * - Be configurable for different environments
 */
class ValidateSessionIntegrity
{
    private const SIGNATURE_KEY = '_session_integrity_signature';
    private const LAST_VALIDATION_KEY = '_last_integrity_check';

    /**
     * Critical session keys that must not change during a session.
     * Changes to these keys indicate potential session hijacking or tampering.
     */
    private const CRITICAL_KEYS = [
        'login_web_59ba36addc2b2f9401580f014c7f58ea4e30989d', // Laravel auth session key
        'password_hash_web', // Password hash for "remember me"
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip validation if disabled in config
        if (!config('session.validate_integrity', true)) {
            return $next($request);
        }

        $session = $request->session();

        // Only validate for authenticated users with started sessions
        if (!$session || !$session->isStarted() || !$request->user()) {
            return $next($request);
        }

        // Validate session integrity BEFORE processing request
        $this->validateSessionIntegrity($request, $session);

        // Process the request
        $response = $next($request);

        // Update signature AFTER processing request (to capture legitimate changes)
        $this->updateSessionSignature($session);

        return $response;
    }

    /**
     * Validate that critical session data hasn't been tampered with.
     */
    private function validateSessionIntegrity(Request $request, $session): void
    {
        $currentSignature = $session->get(self::SIGNATURE_KEY);

        // Skip validation on first request (no signature yet)
        if ($currentSignature === null) {
            return;
        }

        $criticalData = $this->extractCriticalData($session->all());
        $expectedSignature = $this->calculateSignature($criticalData);

        // If signatures don't match, critical data was tampered with
        if (!hash_equals($expectedSignature, $currentSignature)) {
            $this->handleIntegrityViolation($request, $session, $criticalData);
        }

        // Update last validation timestamp
        $session->put(self::LAST_VALIDATION_KEY, now()->timestamp);
    }

    /**
     * Extract only critical session data that should never change.
     */
    private function extractCriticalData(array $sessionData): array
    {
        $critical = [];

        foreach (self::CRITICAL_KEYS as $key) {
            if (array_key_exists($key, $sessionData)) {
                $critical[$key] = $sessionData[$key];
            }
        }

        return $critical;
    }

    /**
     * Calculate HMAC signature of critical data.
     */
    private function calculateSignature(array $data): string
    {
        // Sort keys for consistent hashing
        ksort($data);

        try {
            $encoded = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            $encoded = serialize($data);
        }

        return hash_hmac('sha256', $encoded, config('app.key'));
    }

    /**
     * Update session signature with current critical data.
     */
    private function updateSessionSignature($session): void
    {
        $criticalData = $this->extractCriticalData($session->all());
        $signature = $this->calculateSignature($criticalData);
        $session->put(self::SIGNATURE_KEY, $signature);
    }

    /**
     * Handle detected integrity violation.
     */
    private function handleIntegrityViolation(Request $request, $session, array $criticalData): void
    {
        $user = $request->user();

        Log::error('Session integrity violation detected', [
            'event' => 'session_integrity_violation',
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'session_id' => $session->getId(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'route' => $request->route()?->getName(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'critical_keys_present' => array_keys($criticalData),
            'timestamp' => now()->toISOString(),
        ]);

        // Log security event
        if (class_exists(\App\Services\SecurityLogger::class)) {
            \App\Services\SecurityLogger::logSecurityViolation(
                'session_integrity_violation',
                'Critical session data was modified, indicating potential session hijacking',
                $user,
                [
                    'session_id' => $session->getId(),
                    'ip' => $request->ip(),
                    'route' => $request->route()?->getName(),
                ]
            );
        }

        // Invalidate the compromised session
        $session->invalidate();
        $session->regenerateToken();

        // Force logout
        if ($user) {
            auth()->logout();
        }

        abort(419, 'Session integrity check failed. Please log in again.');
    }
}
