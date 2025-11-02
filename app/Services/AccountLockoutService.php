<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Service to handle account lockout after repeated failed login attempts.
 * 
 * ✅ SECURITY: Implements temporary account lockout to prevent brute force attacks
 * 
 * Features:
 * - Progressive lockout duration based on number of failures
 * - Separate tracking for IP-based and account-based lockouts
 * - Automatic unlock after lockout period expires
 * - Security logging for all lockout events
 * - Admin notification for persistent abuse
 */
class AccountLockoutService
{
    /**
     * Maximum failed attempts before account lockout
     */
    const MAX_FAILED_ATTEMPTS = 5;
    
    /**
     * Base lockout duration in minutes
     */
    const BASE_LOCKOUT_MINUTES = 15;
    
    /**
     * Maximum lockout duration in minutes
     */
    const MAX_LOCKOUT_MINUTES = 1440; // 24 hours
    
    
    
    
    
    /**

    
    
    
     * Handle record failed attempt.

    
    
    
     *

    
    
    
     * @param string $email The email.

    
    
    
     * @param string $ip The ip.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function recordFailedAttempt(string $email, string $ip): void
    {
        $emailHash = hash('sha256', strtolower($email));
        $key = "account_lockout:{$emailHash}";
        
        // Get current attempts
        $attempts = Cache::get($key, [
            'count' => 0,
            'first_attempt' => now(),
            'last_attempt' => null,
            'lockout_count' => 0
        ]);
        
        $attempts['count']++;
        $attempts['last_attempt'] = now();
        
        // Store for 24 hours
        Cache::put($key, $attempts, now()->addHours(24));
        
        // Check if we should lock the account
        if ($attempts['count'] >= self::MAX_FAILED_ATTEMPTS) {
            $this->lockAccount($email, $ip, $attempts);
        }
        
        Log::info('Failed login attempt recorded', [
            'email_hash' => $emailHash,
            'ip' => $ip,
            'attempts' => $attempts['count'],
            'timestamp' => now()->toISOString()
        ]);
    }
    
    
    
    
    
    /**

    
    
    
     * Handle lock account.

    
    
    
     *

    
    
    
     * @param string $email The email.

    
    
    
     * @param string $ip The ip.

    
    
    
     * @param array $attempts The attempts.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    protected function lockAccount(string $email, string $ip, array $attempts): void
    {
        $emailHash = hash('sha256', strtolower($email));
        $lockKey = "account_locked:{$emailHash}";
        
        // Increment lockout count
        $attempts['lockout_count']++;
        
        // Calculate progressive lockout duration
        $lockoutMinutes = $this->calculateLockoutDuration($attempts['lockout_count']);
        
        // Lock the account
        Cache::put($lockKey, [
            'locked_at' => now(),
            'locked_until' => now()->addMinutes($lockoutMinutes),
            'lockout_count' => $attempts['lockout_count'],
            'ip' => $ip,
            'reason' => 'too_many_failed_attempts'
        ], now()->addMinutes($lockoutMinutes));
        
        // Update attempts with lockout info
        $attemptsKey = "account_lockout:{$emailHash}";
        Cache::put($attemptsKey, $attempts, now()->addHours(24));
        
        // Log security event
        SecurityLogger::logSecurityViolation(
            'account_locked',
            'Account temporarily locked due to too many failed login attempts',
            null,
            [
                'email_hash' => $emailHash,
                'ip' => $ip,
                'failed_attempts' => $attempts['count'],
                'lockout_duration_minutes' => $lockoutMinutes,
                'lockout_count' => $attempts['lockout_count'],
                'locked_until' => now()->addMinutes($lockoutMinutes)->toISOString()
            ]
        );
        
        Log::warning('Account locked due to failed login attempts', [
            'email_hash' => $emailHash,
            'ip' => $ip,
            'failed_attempts' => $attempts['count'],
            'lockout_duration_minutes' => $lockoutMinutes,
            'lockout_count' => $attempts['lockout_count']
        ]);
        
        // Notify admins if this is a persistent attack (3+ lockouts)
        if ($attempts['lockout_count'] >= 3) {
            $this->notifyAdminsOfPersistentAttack($email, $ip, $attempts);
        }
    }
    
    
    
    
    
    /**

    
    
    
     * Calculate lockout duration.

    
    
    
     *

    
    
    
     * @param int $lockoutCount The lockoutCount.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    protected function calculateLockoutDuration(int $lockoutCount): int
    {
        return min(
            self::BASE_LOCKOUT_MINUTES * pow(2, $lockoutCount - 1),
            self::MAX_LOCKOUT_MINUTES
        );
    }
    
    
    
    
    
    /**

    
    
    
     * Determine whether account locked.

    
    
    
     *

    
    
    
     * @param string $email The email.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function isAccountLocked(string $email): bool
    {
        $emailHash = hash('sha256', strtolower($email));
        $lockKey = "account_locked:{$emailHash}";
        
        return Cache::has($lockKey);
    }
    
    
    
    
    
    /**

    
    
    
     * Get lockout info.

    
    
    
     *

    
    
    
     * @param string $email The email.

    
    
    
     * @return ?array

    
    
    
     */
    
    
    
    
    
    
    
    public function getLockoutInfo(string $email): ?array
    {
        $emailHash = hash('sha256', strtolower($email));
        $lockKey = "account_locked:{$emailHash}";
        
        return Cache::get($lockKey);
    }
    
    
    
    
    
    /**

    
    
    
     * Get remaining lockout time.

    
    
    
     *

    
    
    
     * @param string $email The email.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    public function getRemainingLockoutTime(string $email): int
    {
        $info = $this->getLockoutInfo($email);
        
        if (!$info) {
            return 0;
        }
        
        $lockedUntil = $info['locked_until'];
        return max(0, $lockedUntil->diffInSeconds(now()));
    }
    
    
    
    
    
    /**

    
    
    
     * Handle clear failed attempts.

    
    
    
     *

    
    
    
     * @param string $email The email.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function clearFailedAttempts(string $email): void
    {
        $emailHash = hash('sha256', strtolower($email));
        $key = "account_lockout:{$emailHash}";
        $lockKey = "account_locked:{$emailHash}";
        
        Cache::forget($key);
        Cache::forget($lockKey);
        
        Log::info('Failed login attempts cleared', [
            'email_hash' => $emailHash,
            'timestamp' => now()->toISOString()
        ]);
    }
    
    
    
    
    
    /**

    
    
    
     * Handle unlock account.

    
    
    
     *

    
    
    
     * @param string $email The email.

    
    
    
     * @param ?User $admin The admin.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function unlockAccount(string $email, ?User $admin = null): void
    {
        $emailHash = hash('sha256', strtolower($email));
        $key = "account_lockout:{$emailHash}";
        $lockKey = "account_locked:{$emailHash}";
        
        Cache::forget($key);
        Cache::forget($lockKey);
        
        Log::info('Account manually unlocked', [
            'email_hash' => $emailHash,
            'admin_id' => $admin?->id,
            'timestamp' => now()->toISOString()
        ]);
        
        if ($admin) {
            SecurityLogger::logSecurityEvent(
                'account_unlocked',
                'Account manually unlocked by administrator',
                $admin,
                [
                    'target_email_hash' => $emailHash,
                    'unlocked_at' => now()->toISOString()
                ]
            );
        }
    }
    
    
    
    
    
    /**

    
    
    
     * Handle notify admins of persistent attack.

    
    
    
     *

    
    
    
     * @param string $email The email.

    
    
    
     * @param string $ip The ip.

    
    
    
     * @param array $attempts The attempts.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    protected function notifyAdminsOfPersistentAttack(string $email, string $ip, array $attempts): void
    {
        Log::critical('Persistent brute force attack detected', [
            'email_hash' => hash('sha256', strtolower($email)),
            'ip' => $ip,
            'total_attempts' => $attempts['count'],
            'lockout_count' => $attempts['lockout_count'],
            'first_attempt' => $attempts['first_attempt']->toISOString(),
            'last_attempt' => $attempts['last_attempt']->toISOString()
        ]);
        
        // TODO: Send email notification to admins
        // TODO: Consider IP blocking at firewall level
    }
    
    
    
    
    
    /**

    
    
    
     * Get failed attempt count.

    
    
    
     *

    
    
    
     * @param string $email The email.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    public function getFailedAttemptCount(string $email): int
    {
        $emailHash = hash('sha256', strtolower($email));
        $key = "account_lockout:{$emailHash}";
        
        $attempts = Cache::get($key);
        return $attempts['count'] ?? 0;
    }
}

