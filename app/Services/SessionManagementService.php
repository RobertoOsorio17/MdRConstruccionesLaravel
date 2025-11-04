<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Service for managing user sessions and enforcing session limits
 */
class SessionManagementService
{
    /**
     * Get the maximum number of concurrent sessions allowed for a user based on their role
     *
     * @param User $user
     * @return int
     */
    public function getSessionLimit(User $user): int
    {
        $limits = config('session.concurrent_sessions', [
            'admin' => 1,
            'editor' => 2,
            'moderator' => 2,
            'user' => 3,
        ]);

        return $limits[$user->role] ?? $limits['user'];
    }

    /**
     * Terminate previous sessions for a user, keeping only the most recent ones
     * based on their role's session limit
     *
     * @param User $user
     * @param string $currentSessionId The current session ID to keep
     * @return int Number of sessions terminated
     */
    public function terminatePreviousSessions(User $user, string $currentSessionId): int
    {
        $limit = $this->getSessionLimit($user);

        // Get all active sessions for this user, excluding the current one
        $sessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->orderBy('last_activity', 'desc')
            ->get();

        // Exclude impersonation sessions from termination
        $impersonationSessionIds = DB::table('impersonation_sessions')
            ->where('impersonator_id', $user->id)
            ->whereNull('ended_at')
            ->pluck('session_id')
            ->toArray();

        $sessionsToKeep = $limit - 1; // -1 because current session counts
        $sessionsToTerminate = [];

        foreach ($sessions as $index => $session) {
            // Skip impersonation sessions
            if (in_array($session->id, $impersonationSessionIds)) {
                continue;
            }

            // If we've exceeded the limit, mark for termination
            if ($index >= $sessionsToKeep) {
                $sessionsToTerminate[] = $session->id;
            }
        }

        if (empty($sessionsToTerminate)) {
            return 0;
        }

        // Delete the sessions
        $deleted = DB::table('sessions')
            ->whereIn('id', $sessionsToTerminate)
            ->delete();

        // Log the termination
        Log::info('Sessions terminated due to limit', [
            'user_id' => $user->id,
            'role' => $user->role,
            'limit' => $limit,
            'terminated_count' => $deleted,
            'current_session_id' => $currentSessionId,
        ]);

        // Log security event
        SecurityLogger::logSecurityEvent(
            'sessions_terminated',
            "User exceeded session limit. {$deleted} sessions terminated.",
            $user,
            [
                'terminated_count' => $deleted,
                'session_limit' => $limit,
            ]
        );

        return $deleted;
    }

    /**
     * Check if a session still exists in the database
     *
     * @param string $sessionId
     * @param int|null $userId
     * @return bool
     */
    public function sessionExists(string $sessionId, ?int $userId = null): bool
    {
        $query = DB::table('sessions')->where('id', $sessionId);

        if ($userId !== null) {
            $query->where('user_id', $userId);
        }

        return $query->exists();
    }

    /**
     * Get all active sessions for a user
     *
     * @param User $user
     * @return \Illuminate\Support\Collection
     */
    public function getActiveSessions(User $user)
    {
        return DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($session) {
                $payload = unserialize(base64_decode($session->payload));
                
                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'last_activity' => $session->last_activity,
                    'created_at' => $payload['created_at'] ?? null,
                    'initial_ip' => $payload['initial_ip'] ?? null,
                ];
            });
    }

    /**
     * Terminate a specific session
     *
     * @param string $sessionId
     * @param User $user
     * @param string $reason
     * @return bool
     */
    public function terminateSession(string $sessionId, User $user, string $reason = 'manual'): bool
    {
        $deleted = DB::table('sessions')
            ->where('id', $sessionId)
            ->where('user_id', $user->id)
            ->delete();

        if ($deleted) {
            Log::info('Session terminated', [
                'user_id' => $user->id,
                'session_id' => $sessionId,
                'reason' => $reason,
            ]);

            SecurityLogger::logSecurityEvent(
                'session_terminated',
                "Session terminated: {$reason}",
                $user,
                [
                    'session_id' => $sessionId,
                    'reason' => $reason,
                ]
            );
        }

        return (bool) $deleted;
    }

    /**
     * Terminate all sessions for a user except the current one
     *
     * @param User $user
     * @param string $currentSessionId
     * @return int Number of sessions terminated
     */
    public function terminateAllOtherSessions(User $user, string $currentSessionId): int
    {
        // Exclude impersonation sessions
        $impersonationSessionIds = DB::table('impersonation_sessions')
            ->where('impersonator_id', $user->id)
            ->whereNull('ended_at')
            ->pluck('session_id')
            ->toArray();

        $deleted = DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->whereNotIn('id', $impersonationSessionIds)
            ->delete();

        if ($deleted > 0) {
            Log::info('All other sessions terminated', [
                'user_id' => $user->id,
                'terminated_count' => $deleted,
            ]);

            SecurityLogger::logSecurityEvent(
                'all_sessions_terminated',
                "User terminated all other sessions ({$deleted} sessions)",
                $user,
                [
                    'terminated_count' => $deleted,
                ]
            );
        }

        return $deleted;
    }

    /**
     * Get session count for a user
     *
     * @param User $user
     * @return int
     */
    public function getSessionCount(User $user): int
    {
        return DB::table('sessions')
            ->where('user_id', $user->id)
            ->count();
    }

    /**
     * Check if user has exceeded their session limit
     *
     * @param User $user
     * @return bool
     */
    public function hasExceededLimit(User $user): bool
    {
        $count = $this->getSessionCount($user);
        $limit = $this->getSessionLimit($user);

        return $count > $limit;
    }

    /**
     * Store session metadata
     *
     * @param string $sessionId
     * @param array $metadata
     * @return void
     */
    public function storeSessionMetadata(string $sessionId, array $metadata): void
    {
        $payload = DB::table('sessions')
            ->where('id', $sessionId)
            ->value('payload');

        if ($payload) {
            $data = unserialize(base64_decode($payload));
            $data = array_merge($data, $metadata);
            
            DB::table('sessions')
                ->where('id', $sessionId)
                ->update([
                    'payload' => base64_encode(serialize($data)),
                ]);
        }
    }

    /**
     * Get session metadata
     *
     * @param string $sessionId
     * @return array|null
     */
    public function getSessionMetadata(string $sessionId): ?array
    {
        $payload = DB::table('sessions')
            ->where('id', $sessionId)
            ->value('payload');

        if (!$payload) {
            return null;
        }

        return unserialize(base64_decode($payload));
    }
}

