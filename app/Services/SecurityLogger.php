<?php

namespace App\Services;

use App\Models\User;
use App\Models\AdminAuditLog;
use Illuminate\Support\Facades\Log;

/**
 * Centralized Security Event Logging Service
 * 
 * Provides comprehensive logging for security-critical events
 * including authorization failures, suspicious activities, and security violations.
 */
class SecurityLogger
{
    /**
     * Log an authorization failure
     *
     * @param string $action The action that was attempted
     * @param mixed $resource The resource that was accessed
     * @param User $user The user who attempted the action
     * @return void
     */
    public static function logAuthorizationFailure(string $action, $resource, User $user): void
    {
        $resourceType = is_object($resource) ? get_class($resource) : gettype($resource);
        $resourceId = is_object($resource) && isset($resource->id) ? $resource->id : null;

        // ✅ SECURITY FIX: Use email hash instead of plain email (GDPR/LOPD compliance)
        Log::warning('Authorization failed', [
            'event' => 'authorization_failed',
            'user_id' => $user->id,
            'user_email_hash' => hash('sha256', strtolower($user->email)),
            'user_role' => $user->role,
            'action' => $action,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'timestamp' => now()->toISOString(),
        ]);

        // Also log to admin audit log for high-severity events
        if ($user->hasRole('admin') || $user->hasRole('editor')) {
            AdminAuditLog::create([
                'user_id' => $user->id,
                'action' => 'authorization_failed',
                'description' => "User ID {$user->id} failed authorization for action: {$action} on {$resourceType}",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'metadata' => [
                    'action' => $action,
                    'resource_type' => $resourceType,
                    'resource_id' => $resourceId,
                    'severity' => 'high',
                ],
            ]);
        }
    }

    /**
     * Log a suspicious activity
     *
     * @param string $activity Description of the suspicious activity
     * @param User|null $user The user involved (null for anonymous)
     * @param array $context Additional context
     * @return void
     */
    public static function logSuspiciousActivity(string $activity, ?User $user = null, array $context = []): void
    {
        $logData = [
            'event' => 'suspicious_activity',
            'activity' => $activity,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'timestamp' => now()->toISOString(),
        ];

        if ($user) {
            $logData['user_id'] = $user->id;
            // ✅ SECURITY FIX: Use email hash instead of plain email
            $logData['user_email_hash'] = hash('sha256', strtolower($user->email));
            $logData['user_role'] = $user->role;
        }

        $logData = array_merge($logData, $context);

        Log::warning('Suspicious activity detected', $logData);

        // Create admin audit log entry
        AdminAuditLog::create([
            'user_id' => $user?->id,
            'action' => 'suspicious_activity',
            'description' => $activity,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => array_merge(['severity' => 'medium'], $context),
        ]);
    }

    /**
     * Log a security violation
     *
     * @param string $violation Type of violation
     * @param string $description Detailed description
     * @param User|null $user The user involved
     * @param array $context Additional context
     * @return void
     */
    public static function logSecurityViolation(string $violation, string $description, ?User $user = null, array $context = []): void
    {
        $logData = [
            'event' => 'security_violation',
            'violation_type' => $violation,
            'description' => $description,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'timestamp' => now()->toISOString(),
        ];

        if ($user) {
            $logData['user_id'] = $user->id;
            // ✅ SECURITY FIX: Use email hash instead of plain email
            $logData['user_email_hash'] = hash('sha256', strtolower($user->email));
            $logData['user_role'] = $user->role;
        }

        $logData = array_merge($logData, $context);

        Log::error('Security violation detected', $logData);

        // Create admin audit log entry
        AdminAuditLog::create([
            'user_id' => $user?->id,
            'action' => 'security_violation',
            'description' => "{$violation}: {$description}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => array_merge(['severity' => 'critical', 'violation_type' => $violation], $context),
        ]);
    }

    /**
     * Log a failed login attempt
     *
     * @param string $email The email used in the attempt
     * @param string $reason Reason for failure
     * @return void
     */
    public static function logFailedLogin(string $email, string $reason = 'invalid_credentials'): void
    {
        // ✅ SECURITY FIX: Use email hash instead of plain email
        Log::warning('Failed login attempt', [
            'event' => 'failed_login',
            'email_hash' => hash('sha256', strtolower($email)),
            'reason' => $reason,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Log a successful login
     * ✅ SECURITY FIX: Added comprehensive login logging
     */
    public static function logSuccessfulLogin(User $user, array $context = []): void
    {
        Log::info('Successful login', [
            'event' => 'successful_login',
            'user_id' => $user->id,
            'user_email_hash' => hash('sha256', strtolower($user->email)),
            'user_role' => $user->role,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ] + $context);

        // Create audit log entry
        AdminAuditLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'description' => 'User logged in successfully',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => array_merge(['severity' => 'info'], $context),
        ]);
    }

    /**
     * Log a password change
     * ✅ SECURITY FIX: Added password change logging
     */
    public static function logPasswordChange(User $user, array $context = []): void
    {
        Log::info('Password changed', [
            'event' => 'password_changed',
            'user_id' => $user->id,
            'user_email_hash' => hash('sha256', strtolower($user->email)),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ] + $context);

        // Create audit log entry
        AdminAuditLog::create([
            'user_id' => $user->id,
            'action' => 'password_changed',
            'description' => 'User changed their password',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => array_merge(['severity' => 'medium'], $context),
        ]);
    }

    /**
     * Log 2FA events (enable, disable, verify)
     * ✅ SECURITY FIX: Added 2FA event logging
     */
    public static function log2FAEvent(string $action, User $user, array $context = []): void
    {
        Log::info('2FA event', [
            'event' => '2fa_' . $action,
            'action' => $action,
            'user_id' => $user->id,
            'user_email_hash' => hash('sha256', strtolower($user->email)),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ] + $context);

        // Create audit log entry
        AdminAuditLog::create([
            'user_id' => $user->id,
            'action' => '2fa_' . $action,
            'description' => "User {$action} two-factor authentication",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => array_merge(['severity' => 'high'], $context),
        ]);
    }

    /**
     * Log role/permission changes
     * ✅ SECURITY FIX: Added role change logging
     */
    public static function logRoleChange(User $targetUser, string $oldRole, string $newRole, ?User $admin = null, array $context = []): void
    {
        Log::warning('Role changed', [
            'event' => 'role_changed',
            'target_user_id' => $targetUser->id,
            'target_user_email_hash' => hash('sha256', strtolower($targetUser->email)),
            'old_role' => $oldRole,
            'new_role' => $newRole,
            'admin_id' => $admin?->id,
            'admin_email_hash' => $admin ? hash('sha256', strtolower($admin->email)) : null,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ] + $context);

        // Create audit log entry
        AdminAuditLog::create([
            'user_id' => $admin?->id ?? $targetUser->id,
            'action' => 'role_changed',
            'description' => "User role changed from {$oldRole} to {$newRole}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => array_merge([
                'severity' => 'critical',
                'target_user_id' => $targetUser->id,
                'old_role' => $oldRole,
                'new_role' => $newRole,
            ], $context),
        ]);
    }

    /**
     * Log logout events
     * ✅ SECURITY FIX: Added logout logging
     */
    public static function logLogout(User $user, string $reason = 'user_initiated', array $context = []): void
    {
        Log::info('User logout', [
            'event' => 'logout',
            'user_id' => $user->id,
            'user_email_hash' => hash('sha256', strtolower($user->email)),
            'reason' => $reason,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ] + $context);

        // Only create audit log for non-standard logouts
        if ($reason !== 'user_initiated') {
            AdminAuditLog::create([
                'user_id' => $user->id,
                'action' => 'logout',
                'description' => "User logged out: {$reason}",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'metadata' => array_merge(['severity' => 'info', 'reason' => $reason], $context),
            ]);
        }
    }

    /**
     * Log a bulk operation
     *
     * @param string $operation Type of bulk operation
     * @param int $affectedCount Number of items affected
     * @param User $user The user performing the operation
     * @param array $context Additional context
     * @return void
     */
    public static function logBulkOperation(string $operation, int $affectedCount, User $user, array $context = []): void
    {
        // ✅ SECURITY FIX: Use email hash instead of plain email
        Log::info('Bulk operation performed', [
            'event' => 'bulk_operation',
            'operation' => $operation,
            'affected_count' => $affectedCount,
            'user_id' => $user->id,
            'user_email_hash' => hash('sha256', strtolower($user->email)),
            'user_role' => $user->role,
            'ip' => request()->ip(),
            'timestamp' => now()->toISOString(),
        ] + $context);

        // Log to admin audit for significant operations
        if ($affectedCount > 10 || $user->hasRole('admin')) {
            AdminAuditLog::create([
                'user_id' => $user->id,
                'action' => 'bulk_operation',
                'description' => "Bulk {$operation} performed on {$affectedCount} items",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'metadata' => array_merge([
                    'operation' => $operation,
                    'affected_count' => $affectedCount,
                ], $context),
            ]);
        }
    }

    /**
     * Log a file access
     *
     * @param string $filePath Path to the file
     * @param string $action Action performed (view, download, delete)
     * @param User $user The user accessing the file
     * @return void
     */
    public static function logFileAccess(string $filePath, string $action, User $user): void
    {
        // ✅ SECURITY FIX: Use email hash instead of plain email
        Log::info('File access', [
            'event' => 'file_access',
            'file_path' => $filePath,
            'action' => $action,
            'user_id' => $user->id,
            'user_email_hash' => hash('sha256', strtolower($user->email)),
            'ip' => request()->ip(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Log a privilege escalation attempt
     *
     * @param User $user The user attempting escalation
     * @param string $attemptedRole The role they tried to assign
     * @param array $context Additional context
     * @return void
     */
    public static function logPrivilegeEscalationAttempt(User $user, string $attemptedRole, array $context = []): void
    {
        // ✅ SECURITY FIX: Use email hash instead of plain email
        Log::critical('Privilege escalation attempt detected', [
            'event' => 'privilege_escalation_attempt',
            'user_id' => $user->id,
            'user_email_hash' => hash('sha256', strtolower($user->email)),
            'current_role' => $user->role,
            'attempted_role' => $attemptedRole,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ] + $context);

        AdminAuditLog::create([
            'user_id' => $user->id,
            'action' => 'privilege_escalation_attempt',
            'description' => "User {$user->email} attempted to escalate privileges to {$attemptedRole}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => array_merge([
                'severity' => 'critical',
                'current_role' => $user->role,
                'attempted_role' => $attemptedRole,
            ], $context),
        ]);
    }
}

