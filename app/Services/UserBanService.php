<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserBan;
use App\Models\TrustedDevice;
use App\Models\IpBan;
use App\Models\AdminAuditLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * User Ban Service
 * 
 * Handles all business logic related to user bans including creation, modification,
 * removal, and history tracking. Manages IP bans, trusted device revocation, and audit logging.
 * 
 * @package App\Services
 */
class UserBanService
{
    /**
     * Calculate ban expiration timestamp from duration string.
     * 
     * Converts a duration string (e.g., '1_day', '1_week', 'permanent') into a Carbon
     * timestamp representing when the ban should expire. Returns null for permanent bans.
     *
     * @param string|null $duration Duration string or null for permanent ban.
     * @param string|null $customExpiration Custom expiration date for 'custom' duration.
     * @return Carbon|null Expiration timestamp or null for permanent bans.
     * 
     * @example
     * $service = new UserBanService();
     * $expiresAt = $service->calculateBanExpiration('1_week'); // Returns Carbon 1 week from now
     * $expiresAt = $service->calculateBanExpiration('permanent'); // Returns null
     */
    public function calculateBanExpiration(?string $duration, ?string $customExpiration = null): ?Carbon
    {
        if (!$duration || $duration === 'permanent') {
            return null;
        }

        if ($duration === 'custom' && $customExpiration) {
            return Carbon::parse($customExpiration);
        }

        return match($duration) {
            '1_hour' => now()->addHour(),
            '1_day' => now()->addDay(),
            '1_week' => now()->addWeek(),
            '1_month' => now()->addMonth(),
            '3_months' => now()->addMonths(3),
            '6_months' => now()->addMonths(6),
            '1_year' => now()->addYear(),
            default => null,
        };
    }

    /**
     * Create a new ban for the specified user.
     * 
     * Creates a ban record, revokes trusted devices, optionally bans the user's IP address,
     * revokes API tokens, and logs the action to the admin audit log.
     *
     * @param User $user The user to ban.
     * @param array<string, mixed> $banData Ban configuration including reason, duration, IP ban flag, etc.
     * @param User $admin The administrator issuing the ban.
     * @return UserBan The created ban record.
     * 
     * @throws \Exception If ban creation fails.
     * 
     * @example
     * $service = new UserBanService();
     * $ban = $service->banUser($user, [
     *     'reason' => 'Spam',
     *     'duration' => '1_week',
     *     'ip_ban' => true,
     *     'admin_notes' => 'Multiple spam reports'
     * ], $admin);
     */
    public function banUser(User $user, array $banData, User $admin): UserBan
    {
        Log::info('Creating user ban', [
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'ban_data' => $banData
        ]);

        $expiresAt = $this->calculateBanExpiration(
            $banData['duration'] ?? null,
            $banData['custom_expires_at'] ?? $banData['expires_at'] ?? null
        );

        // ✅ VALIDATION: If ban is irrevocable, it must be permanent
        $isIrrevocable = $banData['is_irrevocable'] ?? false;
        if ($isIrrevocable && $expiresAt !== null) {
            throw new \Exception('Los baneos irrevocables deben ser permanentes.');
        }

        // ✅ VALIDATION: Irrevocable bans require admin notes
        if ($isIrrevocable && empty($banData['admin_notes'])) {
            throw new \Exception('Los baneos irrevocables requieren notas internas obligatorias.');
        }

        $ban = UserBan::create([
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'reason' => $banData['reason'],
            'admin_notes' => $banData['admin_notes'] ?? null,
            'ip_ban' => $banData['ip_ban'] ?? false,
            'is_irrevocable' => $isIrrevocable,
            'banned_at' => now(),
            'expires_at' => $expiresAt,
            'is_active' => true,
        ]);

        // Revoke trusted devices to prevent bypass
        $this->revokeTrustedDevices($user);

        // Handle IP ban if requested
        if (($banData['ip_ban'] ?? false) && $user->last_login_ip) {
            $this->createIpBan($user, $banData['reason'], $expiresAt, $admin);
        }

        // Revoke API tokens
        $this->revokeApiTokens($user);

        // Log to admin audit
        $this->logBanAction($user, $ban, $admin, $banData);

        Log::info('User banned successfully', [
            'ban_id' => $ban->id,
            'user_id' => $user->id,
            'expires_at' => $expiresAt
        ]);

        return $ban;
    }

    /**
     * Modify an existing ban for the specified user.
     * 
     * Updates the active ban record with new parameters, handles IP ban changes,
     * and logs the modification to the admin audit log.
     *
     * @param User $user The user whose ban is being modified.
     * @param array<string, mixed> $banData Updated ban configuration.
     * @param User $admin The administrator modifying the ban.
     * @return UserBan The updated ban record.
     * 
     * @throws \Exception If no active ban exists or update fails.
     * 
     * @example
     * $service = new UserBanService();
     * $ban = $service->modifyBan($user, [
     *     'reason' => 'Updated reason',
     *     'duration' => '1_month',
     *     'ip_ban' => false
     * ], $admin);
     */
    public function modifyBan(User $user, array $banData, User $admin): UserBan
    {
        Log::info('Modifying user ban', [
            'user_id' => $user->id,
            'modified_by' => $admin->id,
            'ban_data' => $banData
        ]);

        $ban = UserBan::where('user_id', $user->id)
            ->where('is_active', true)
            ->firstOrFail();

        $oldIpBan = $ban->ip_ban;
        $expiresAt = $this->calculateBanExpiration(
            $banData['duration'] ?? null,
            $banData['custom_expires_at'] ?? $banData['expires_at'] ?? null
        );

        $ban->update([
            'reason' => $banData['reason'],
            'expires_at' => $expiresAt,
            'admin_notes' => $banData['admin_notes'] ?? null,
            'ip_ban' => $banData['ip_ban'] ?? false,
        ]);

        // Handle IP ban changes
        $this->handleIpBanChanges($user, $oldIpBan, $banData['ip_ban'] ?? false, $banData['reason'], $expiresAt, $admin);

        // Log modification
        $this->logBanModification($user, $ban, $admin, $banData, $expiresAt);

        Log::info('Ban modified successfully', [
            'ban_id' => $ban->id,
            'user_id' => $user->id,
            'new_expires_at' => $expiresAt
        ]);

        return $ban;
    }

    /**
     * Remove the active ban from the specified user.
     * 
     * Deactivates the ban record, removes associated IP bans, revokes trusted devices,
     * and logs the action to the admin audit log.
     *
     * @param User $user The user to unban.
     * @param User $admin The administrator removing the ban.
     * @return bool True if the ban was successfully removed.
     * 
     * @example
     * $service = new UserBanService();
     * $success = $service->unbanUser($user, $admin);
     */
    public function unbanUser(User $user, User $admin): bool
    {
        $activeBan = $user->bans()->active()->first();

        if (!$activeBan) {
            return false;
        }

        // Deactivate the ban
        $user->bans()->active()->update(['is_active' => false]);

        // Remove IP ban if it was enabled
        if ($activeBan->ip_ban && $user->last_login_ip) {
            IpBan::where('ip_address', $user->last_login_ip)
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        // Clear trusted devices
        $this->revokeTrustedDevices($user);

        // Log the action
        AdminAuditLog::logAction([
            'action' => 'ban.remove',
            'severity' => 'medium',
            'model_type' => User::class,
            'model_id' => $user->id,
            'description' => 'User unbanned by administrator',
            'request_data' => [
                'user_email' => $user->email,
                'user_name' => $user->name,
                'had_ip_ban' => $activeBan->ip_ban,
            ],
        ]);

        return true;
    }

    /**
     * Get the complete ban history for a user.
     * 
     * Retrieves all ban records (active and inactive) with related administrator information.
     *
     * @param User $user The user whose ban history is requested.
     * @return \Illuminate\Support\Collection Collection of formatted ban records.
     */
    public function getBanHistory(User $user)
    {
        return $user->bans()
            ->with('bannedBy:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($ban) {
                return [
                    'id' => $ban->id,
                    'reason' => $ban->reason,
                    'banned_at' => $ban->banned_at,
                    'expires_at' => $ban->expires_at,
                    'is_active' => $ban->is_active,
                    'is_permanent' => $ban->isPermanent(),
                    'remaining_time' => $ban->getRemainingTime(),
                    'banned_by' => $ban->bannedBy->name ?? 'System',
                ];
            });
    }

    /**
     * Revoke all trusted devices for a user.
     *
     * @param User $user The user whose trusted devices should be revoked.
     * @return void
     */
    private function revokeTrustedDevices(User $user): void
    {
        TrustedDevice::where('user_id', $user->id)->delete();
    }

    /**
     * Create an IP ban for the user's last login IP.
     *
     * @param User $user The user whose IP should be banned.
     * @param string $reason The reason for the IP ban.
     * @param Carbon|null $expiresAt When the IP ban should expire.
     * @param User $admin The administrator issuing the IP ban.
     * @return void
     */
    private function createIpBan(User $user, string $reason, ?Carbon $expiresAt, User $admin): void
    {
        IpBan::banIp(
            $user->last_login_ip,
            "IP banned due to user ban: {$reason}",
            'manual',
            $expiresAt ? now()->diffInDays($expiresAt) : null,
            $admin->id
        );
    }

    /**
     * Revoke all API tokens for a user.
     *
     * @param User $user The user whose tokens should be revoked.
     * @return void
     */
    private function revokeApiTokens(User $user): void
    {
        try {
            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to revoke API tokens', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Log ban action to admin audit log.
     *
     * @param User $user The banned user.
     * @param UserBan $ban The ban record.
     * @param User $admin The administrator who issued the ban.
     * @param array<string, mixed> $banData The ban configuration data.
     * @return void
     */
    private function logBanAction(User $user, UserBan $ban, User $admin, array $banData): void
    {
        AdminAuditLog::logAction([
            'action' => 'ban.user',
            'severity' => 'high',
            'model_type' => User::class,
            'model_id' => $user->id,
            'description' => 'User banned by administrator',
            'request_data' => [
                'user_email' => $user->email,
                'user_name' => $user->name,
                'reason' => $banData['reason'],
                'duration' => $banData['duration'] ?? 'permanent',
                'expires_at' => $ban->expires_at?->toDateTimeString(),
                'ip_ban' => $banData['ip_ban'] ?? false,
                'ip_address' => $user->last_login_ip,
            ],
        ]);
    }

    /**
     * Handle IP ban changes when modifying a ban.
     *
     * @param User $user The user whose ban is being modified.
     * @param bool $oldIpBan Previous IP ban status.
     * @param bool $newIpBan New IP ban status.
     * @param string $reason Ban reason.
     * @param Carbon|null $expiresAt Ban expiration.
     * @param User $admin The administrator modifying the ban.
     * @return void
     */
    private function handleIpBanChanges(User $user, bool $oldIpBan, bool $newIpBan, string $reason, ?Carbon $expiresAt, User $admin): void
    {
        if ($newIpBan && !$oldIpBan && $user->last_login_ip) {
            // IP ban was just enabled
            $this->createIpBan($user, $reason, $expiresAt, $admin);
        } elseif (!$newIpBan && $oldIpBan && $user->last_login_ip) {
            // IP ban was just disabled
            IpBan::where('ip_address', $user->last_login_ip)
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }
    }

    /**
     * Log ban modification to admin audit log.
     *
     * @param User $user The user whose ban was modified.
     * @param UserBan $ban The modified ban record.
     * @param User $admin The administrator who modified the ban.
     * @param array<string, mixed> $banData The updated ban configuration.
     * @param Carbon|null $expiresAt New expiration timestamp.
     * @return void
     */
    private function logBanModification(User $user, UserBan $ban, User $admin, array $banData, ?Carbon $expiresAt): void
    {
        AdminAuditLog::logAction([
            'action' => 'ban.modify',
            'severity' => 'medium',
            'model_type' => User::class,
            'model_id' => $user->id,
            'description' => 'User ban modified by administrator',
            'request_data' => [
                'user_email' => $user->email,
                'user_name' => $user->name,
                'reason' => $banData['reason'],
                'duration' => $banData['duration'] ?? 'permanent',
                'expires_at' => $expiresAt?->toDateTimeString(),
                'ip_ban' => $banData['ip_ban'] ?? false,
            ],
        ]);
    }
}

