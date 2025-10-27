<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\User;
use App\Services\ImpersonationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\UnauthorizedException;
use Inertia\Inertia;

class UserImpersonationController extends Controller
{
    /**
     * The impersonation service instance.
     *
     * @var ImpersonationService
     */
    protected $impersonationService;

    /**
     * Create a new controller instance.
     *
     * @param ImpersonationService $impersonationService
     */
    public function __construct(ImpersonationService $impersonationService)
    {
        $this->impersonationService = $impersonationService;
    }

    /**
     * Start impersonating a user.
     *
     * @param User $user
     * @param Request $request
     * @return RedirectResponse
     */
    public function store(User $user, Request $request): RedirectResponse
    {
        try {
            // Check authorization using policy
            if (!Gate::allows('impersonate-user', $user)) {
                throw new UnauthorizedException('You are not authorized to impersonate this user.');
            }

            $admin = Auth::user();

            // Begin impersonation
            $this->impersonationService->begin($admin, $user);

            // Log the action in admin audit log
            AdminAuditLog::create([
                'user_id' => $admin->id,
                'action' => 'impersonation.start',
                'description' => "Started impersonating user: {$user->name} ({$user->email})",
                'severity' => 'critical',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'metadata' => [
                    'target_id' => $user->id,
                    'target_email' => $user->email,
                    'target_name' => $user->name,
                    'session_token_hash' => substr($this->impersonationService->context()['session_token'], 0, 8),
                ],
            ]);

            // Redirect to user's dashboard
            return redirect()->route('dashboard')
                ->with('success', "You are now viewing the application as {$user->name}.");

        } catch (UnauthorizedException $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'An error occurred while trying to impersonate this user. Please try again.');
        }
    }

    /**
     * Stop impersonating and return to admin account.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function destroy(Request $request): RedirectResponse
    {
        $context = $this->impersonationService->context();

        if (!$context) {
            return redirect()->route('admin.dashboard')
                ->with('warning', 'No active impersonation session found.');
        }

        // Get details before terminating
        $targetUser = User::find($context['target_id']);
        $impersonatorId = $context['impersonator_id'];
        $startedAt = \Carbon\Carbon::parse($context['started_at']);
        $durationSeconds = now()->diffInSeconds($startedAt);

        // Prepare fallback values in case user was deleted
        $targetName = $targetUser ? $targetUser->name : 'Deleted User';
        $targetEmail = $targetUser ? $targetUser->email : 'unknown@deleted.user';
        $targetId = $targetUser ? $targetUser->id : $context['target_id'];

        // Terminate impersonation
        $this->impersonationService->terminate($request);

        // Log the action
        AdminAuditLog::create([
            'user_id' => $impersonatorId,
            'action' => 'impersonation.stop',
            'description' => "Stopped impersonating user: {$targetName} ({$targetEmail})",
            'severity' => 'info',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'target_id' => $targetId,
                'target_email' => $targetEmail,
                'target_name' => $targetName,
                'duration_seconds' => $durationSeconds,
                'session_token_hash' => substr($context['session_token'], 0, 8),
                'user_was_deleted' => !$targetUser,
            ],
        ]);

        return redirect()->route('admin.dashboard')
            ->with('success', 'You have returned to your administrator account.');
    }

    /**
     * Heartbeat endpoint to extend impersonation session.
     * This can be called periodically from the frontend to keep the session alive.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function heartbeat(Request $request)
    {
        if (!$this->impersonationService->isActive()) {
            return response()->json([
                'active' => false,
                'message' => 'No active impersonation session.',
            ], 404);
        }

        $context = $this->impersonationService->context();

        return response()->json([
            'active' => true,
            'expires_at' => $context['expires_at'],
            'time_remaining_seconds' => now()->diffInSeconds(\Carbon\Carbon::parse($context['expires_at'])),
        ]);
    }

    /**
     * List all active impersonation sessions.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $sessions = $this->impersonationService->getActiveSessions();

        return inertia('Admin/ImpersonationSessions', [
            'sessions' => $sessions->map(function ($session) {
                return [
                    'id' => $session->id,
                    'impersonator' => [
                        'id' => $session->impersonator->id,
                        'name' => $session->impersonator->name,
                        'email' => $session->impersonator->email,
                    ],
                    'target' => [
                        'id' => $session->target->id,
                        'name' => $session->target->name,
                        'email' => $session->target->email,
                    ],
                    'started_at' => $session->started_at->toISOString(),
                    'started_at_human' => $session->started_at->diffForHumans(),
                    'duration_minutes' => $session->started_at->diffInMinutes(now()),
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                ];
            }),
        ]);
    }

    /**
     * Get active sessions as JSON (API endpoint).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiIndex()
    {
        $sessions = $this->impersonationService->getActiveSessions();

        return response()->json([
            'success' => true,
            'sessions' => $sessions->map(function ($session) {
                return [
                    'id' => $session->id,
                    'impersonator' => [
                        'id' => $session->impersonator->id,
                        'name' => $session->impersonator->name,
                        'email' => $session->impersonator->email,
                    ],
                    'target' => [
                        'id' => $session->target->id,
                        'name' => $session->target->name,
                        'email' => $session->target->email,
                    ],
                    'started_at' => $session->started_at->toISOString(),
                    'duration_minutes' => $session->started_at->diffInMinutes(now()),
                    'ip_address' => $session->ip_address,
                ];
            }),
            'total' => $sessions->count(),
        ]);
    }

    /**
     * Force terminate a specific impersonation session.
     *
     * @param int $sessionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function forceTerminate(int $sessionId)
    {
        $success = $this->impersonationService->terminateSessionById($sessionId, 'admin_terminated');

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Session not found or already terminated.',
            ], 404);
        }

        // Log the action
        AdminAuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'impersonation.force_terminate',
            'description' => "Force terminated impersonation session #{$sessionId}",
            'severity' => 'warning',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => [
                'session_id' => $sessionId,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Impersonation session terminated successfully.',
        ]);
    }
}

