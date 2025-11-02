<?php

namespace App\Services;

use App\Models\ImpersonationSession;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\UnauthorizedException;

class ImpersonationService
{
    /**
     * Begin impersonating a target user.
     *
     * @param User $actor The administrator initiating the impersonation
     * @param User $target The user to be impersonated
     * @return void
     * @throws UnauthorizedException
     */
    public function begin(User $actor, User $target): void
    {
        // Validate authorization
        $this->assertAuthorized($actor, $target);

        // Store original session data
        $originalGuard = Auth::getDefaultDriver();

        // Generate cryptographic token
        $sessionToken = $this->generateToken($actor->id, $target->id);
        $sessionTokenHash = hash('sha256', $sessionToken);

        // Create database record for session tracking
        $dbSession = ImpersonationSession::create([
            'impersonator_id' => $actor->id,
            'target_id' => $target->id,
            'session_token_hash' => $sessionTokenHash,
            'started_at' => Carbon::now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Store impersonation context in session
        Session::put('impersonation', [
            'impersonator_id' => $actor->id,
            'target_id' => $target->id,
            'started_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addMinutes(config('impersonation.timeout_minutes', 30)),
            'session_token' => $sessionToken,
            'session_token_hash' => $sessionTokenHash,
            'db_session_id' => $dbSession->id,
            'original_session_guard' => $originalGuard,
        ]);

        // Switch to target user using the same guard
        Auth::guard($originalGuard)->loginUsingId($target->id);

        // Regenerate session ID and CSRF token to prevent session fixation
        Session::regenerate();
        Session::regenerateToken();
    }

    /**
     * Terminate the current impersonation session and restore the original user.
     *
     * @param Request $request
     * @return void
     */
    public function terminate(Request $request): void
    {
        $context = $this->context();

        if (!$context) {
            return;
        }

        $impersonatorId = $context['impersonator_id'];
        $originalGuard = $context['original_session_guard'] ?? Auth::getDefaultDriver();
        $dbSessionId = $context['db_session_id'] ?? null;

        // Mark database session as ended
        if ($dbSessionId) {
            $dbSession = ImpersonationSession::find($dbSessionId);
            if ($dbSession && $dbSession->isActive()) {
                $dbSession->end($this->hasExpired() ? 'expired' : 'manual');
            }
        }

        // Log back in as the original administrator using the correct guard
        Auth::guard($originalGuard)->loginUsingId($impersonatorId);

        // Clear impersonation data from session
        Session::forget('impersonation');

        // Regenerate session ID to prevent session fixation
        Session::regenerate();

        // Regenerate CSRF token for security
        Session::regenerateToken();
    }

    /**
     * Get the current impersonation context.
     *
     * @return array|null
     */
    public function context(): ?array
    {
        return Session::get('impersonation');
    }

    /**
     * Check if an impersonation session is currently active.
     *
     * Note: This returns true even if the session has expired.
     * The middleware should check hasExpired() separately and call terminate() if needed.
     *
     * @return bool True if there is an impersonation context in the session.
     */
    public function isActive(): bool
    {
        return Session::has('impersonation');
    }

    /**
     * Assert that the actor is authorized to impersonate the target user.
     *
     * @param User $actor
     * @param User $target
     * @return void
     * @throws UnauthorizedException
     */
    public function assertAuthorized(User $actor, User $target): void
    {
        // Cannot impersonate yourself
        if ($actor->id === $target->id) {
            throw new UnauthorizedException('You cannot impersonate yourself.');
        }

        // Check if target has a blocked role (cannot impersonate other admins)
        $blockedRoles = config('impersonation.blocked_roles', []);
        foreach ($blockedRoles as $role) {
            if ($target->hasRole($role)) {
                throw new UnauthorizedException('No puedes impersonar a otros administradores. Solo se pueden impersonar usuarios con rol de usuario o editor.');
            }
        }

        // Check if target is banned/suspended
        if ($target->isBanned()) {
            $banInfo = $target->currentBan();
            $banType = $banInfo && $banInfo->is_permanent ? 'permanentemente' : 'temporalmente';
            throw new UnauthorizedException("No puedes impersonar a usuarios suspendidos. Este usuario está {$banType} suspendido. Debes levantar la suspensión antes de poder impersonarlo.");
        }

        // Check if actor has 2FA enabled (if required)
        if (config('impersonation.require_2fa', true)) {
            if (!$actor->two_factor_secret) {
                throw new UnauthorizedException('You must enable Two-Factor Authentication before impersonating users.');
            }
        }

        // Check concurrent session limit (global)
        $activeSessions = $this->countActiveSessions();
        $maxSessions = config('impersonation.max_concurrent_sessions', 5);
        if ($activeSessions >= $maxSessions) {
            throw new UnauthorizedException("Maximum concurrent impersonation sessions ({$maxSessions}) reached. Please wait for existing sessions to expire or terminate them manually.");
        }

        // ✅ SECURITY: Check concurrent session limit per user
        $activeSessionsPerUser = $this->countActiveSessionsByUser($actor->id);
        $maxSessionsPerUser = config('impersonation.max_sessions_per_user', 2);
        if ($activeSessionsPerUser >= $maxSessionsPerUser) {
            throw new UnauthorizedException("You have reached the maximum number of concurrent impersonation sessions ({$maxSessionsPerUser}). Please terminate an existing session before starting a new one.");
        }
    }

    /**
     * Generate a cryptographic token for the impersonation session.
     *
     * @param int $actorId
     * @param int $targetId
     * @return string
     */
    protected function generateToken(int $actorId, int $targetId): string
    {
        $data = implode('|', [
            $actorId,
            $targetId,
            Carbon::now()->timestamp,
            bin2hex(random_bytes(16)),
        ]);

        return hash_hmac('sha256', $data, config('app.key'));
    }

    /**
     * Count the number of currently active impersonation sessions.
     *
     * @return int
     */
    protected function countActiveSessions(): int
    {
        return ImpersonationSession::active()->count();
    }

    /**
     * Count the number of currently active impersonation sessions for a specific user.
     *
     * ✅ SECURITY: Limit concurrent sessions per user to prevent abuse
     *
     * @param int $userId The impersonator user ID
     * @return int
     */
    protected function countActiveSessionsByUser(int $userId): int
    {
        return ImpersonationSession::active()
            ->where('impersonator_id', $userId)
            ->count();
    }

    /**
     * Get all currently active impersonation sessions.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getActiveSessions()
    {
        return ImpersonationSession::active()
            ->with(['impersonator:id,name,email', 'target:id,name,email'])
            ->orderBy('started_at', 'desc')
            ->get();
    }

    /**
     * Terminate a specific impersonation session by ID.
     * This is useful for administrators to force-end sessions.
     *
     * @param int $sessionId
     * @param string $reason
     * @return bool
     */
    public function terminateSessionById(int $sessionId, string $reason = 'admin_terminated'): bool
    {
        $session = ImpersonationSession::find($sessionId);

        if (!$session || !$session->isActive()) {
            return false;
        }

        $session->end($reason);
        return true;
    }

    /**
     * Check if the current session has expired and needs to be terminated.
     *
     * @return bool
     */
    public function hasExpired(): bool
    {
        $context = $this->context();

        if (!$context) {
            return false;
        }

        return Carbon::parse($context['expires_at'])->isPast();
    }

    /**
     * Get sanitized context data safe for frontend consumption.
     *
     * @return array|null
     */
    public function getSanitizedContext(): ?array
    {
        $context = $this->context();

        if (!$context) {
            return null;
        }

        // Get impersonator and target user details
        $impersonator = User::find($context['impersonator_id']);
        $target = User::find($context['target_id']);

        // If either user was deleted, clear the session and return null
        if (!$impersonator || !$target) {
            Session::forget('impersonation');
            return null;
        }

        return [
            'isActive' => $this->isActive(),
            'impersonator' => [
                'id' => $impersonator->id,
                'name' => $impersonator->name,
                'email' => $impersonator->email,
            ],
            'target' => [
                'id' => $target->id,
                'name' => $target->name,
                'email' => $target->email,
            ],
            'started_at' => $context['started_at'],
            'expires_at' => $context['expires_at'],
            'session_token_hash' => substr($context['session_token'], 0, 8),
        ];
    }
}

